// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@account-abstraction/contracts/core/BaseAccount.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title Impact Account (ERC-4337)
 * @dev Smart account implementation for Eco Touch users
 * @notice ERC-4337 compatible account with social recovery and multi-sig features
 */
contract ImpactAccount is BaseAccount, Initializable, UUPSUpgradeable {
    using ECDSA for bytes32;

    // State variables
    address public owner;
    IEntryPoint private immutable _entryPoint;

    // Social recovery
    mapping(address => bool) public guardians;
    uint256 public guardianCount;
    uint256 public constant MAX_GUARDIANS = 5;
    uint256 public recoveryThreshold; // Number of guardians needed for recovery

    // Multi-signature for high-value transactions
    uint256 public multiSigThreshold; // Amount threshold for multi-sig
    mapping(bytes32 => mapping(address => bool)) public multiSigApprovals;
    mapping(bytes32 => uint256) public multiSigApprovalCount;

    // Transaction limits and spending controls
    uint256 public dailySpendingLimit;
    uint256 public monthlySpendingLimit;
    mapping(uint256 => uint256) public dailySpending; // day => amount
    mapping(uint256 => uint256) public monthlySpending; // month => amount

    // Emergency pause
    bool public paused;
    address public pauseGuardian;

    // Events
    event GuardianAdded(address indexed guardian);
    event GuardianRemoved(address indexed guardian);
    event RecoveryInitiated(address indexed newOwner, uint256 timestamp);
    event AccountPaused(address indexed by);
    event AccountUnpaused(address indexed by);
    event SpendingLimitUpdated(uint256 dailyLimit, uint256 monthlyLimit);
    event MultiSigExecuted(bytes32 indexed txHash, address indexed to, uint256 value);

    // Custom errors
    error NotAuthorized();
    error InvalidGuardian();
    error RecoveryInProgress();
    error AccountPaused();
    error SpendingLimitExceeded();
    error MultiSigRequired();
    error InvalidSignature();

    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    /**
     * @dev Initialize the account
     * @param _owner Initial owner address
     */
    function initialize(address _owner) public initializer {
        owner = _owner;
        recoveryThreshold = 3;
        multiSigThreshold = 1 ether; // 1 MATIC threshold
        dailySpendingLimit = 10 ether; // 10 MATIC per day
        monthlySpendingLimit = 100 ether; // 100 MATIC per month
        pauseGuardian = _owner;
    }

    /**
     * @dev Execute a transaction (called by EntryPoint)
     */
    function execute(
        address dest,
        uint256 value,
        bytes calldata func
    ) external override {
        _requireFromEntryPoint();
        if (paused) revert AccountPaused();

        // Check spending limits
        _checkSpendingLimits(value);

        // Check if multi-sig is required
        if (value >= multiSigThreshold) {
            revert MultiSigRequired();
        }

        _call(dest, value, func);
    }

    /**
     * @dev Execute batch transactions
     */
    function executeBatch(
        address[] calldata dest,
        uint256[] calldata value,
        bytes[] calldata func
    ) external {
        _requireFromEntryPoint();
        if (paused) revert AccountPaused();

        require(dest.length == value.length && value.length == func.length, "Invalid batch");

        uint256 totalValue = 0;
        for (uint256 i = 0; i < value.length; i++) {
            totalValue += value[i];
        }

        // Check spending limits for total
        _checkSpendingLimits(totalValue);

        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], value[i], func[i]);
        }
    }

    /**
     * @dev Validate user operation signature
     */
    function _validateSignature(
        UserOperation calldata userOp,
        bytes32 userOpHash
    ) internal virtual override returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        if (owner != hash.recover(userOp.signature)) {
            return SIG_VALIDATION_FAILED;
        }
        return 0;
    }

    /**
     * @dev Get EntryPoint address
     */
    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    // Guardian and Recovery Functions

    /**
     * @dev Add a guardian for social recovery
     */
    function addGuardian(address guardian) external onlyOwner {
        require(guardian != address(0) && guardian != owner, "Invalid guardian");
        require(!guardians[guardian], "Already a guardian");
        require(guardianCount < MAX_GUARDIANS, "Max guardians reached");

        guardians[guardian] = true;
        guardianCount++;

        emit GuardianAdded(guardian);
    }

    /**
     * @dev Remove a guardian
     */
    function removeGuardian(address guardian) external onlyOwner {
        require(guardians[guardian], "Not a guardian");

        guardians[guardian] = false;
        guardianCount--;

        emit GuardianRemoved(guardian);
    }

    /**
     * @dev Initiate social recovery
     */
    function initiateRecovery(address newOwner) external {
        require(guardians[msg.sender], "Not a guardian");
        // In production, implement timelock for recovery
        emit RecoveryInitiated(newOwner, block.timestamp);
    }

    // Multi-signature Functions

    /**
     * @dev Propose a multi-sig transaction
     */
    function proposeMultiSig(
        address to,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (bytes32) {
        bytes32 txHash = keccak256(abi.encode(to, value, data, block.timestamp));

        // Owner automatically approves
        multiSigApprovals[txHash][msg.sender] = true;
        multiSigApprovalCount[txHash] = 1;

        return txHash;
    }

    /**
     * @dev Approve a multi-sig transaction
     */
    function approveMultiSig(bytes32 txHash) external {
        require(guardians[msg.sender] || msg.sender == owner, "Not authorized");

        if (multiSigApprovals[txHash][msg.sender]) return;

        multiSigApprovals[txHash][msg.sender] = true;
        multiSigApprovalCount[txHash]++;
    }

    /**
     * @dev Execute a multi-sig transaction
     */
    function executeMultiSig(
        address to,
        uint256 value,
        bytes calldata data,
        bytes32 txHash
    ) external onlyOwner {
        require(multiSigApprovalCount[txHash] >= recoveryThreshold, "Insufficient approvals");
        require(!paused, "Account paused");

        _checkSpendingLimits(value);
        _call(to, value, data);

        emit MultiSigExecuted(txHash, to, value);
    }

    // Spending Control Functions

    /**
     * @dev Update spending limits
     */
    function updateSpendingLimits(
        uint256 _dailyLimit,
        uint256 _monthlyLimit
    ) external onlyOwner {
        dailySpendingLimit = _dailyLimit;
        monthlySpendingLimit = _monthlyLimit;

        emit SpendingLimitUpdated(_dailyLimit, _monthlyLimit);
    }

    /**
     * @dev Check spending limits
     */
    function _checkSpendingLimits(uint256 amount) internal {
        uint256 today = block.timestamp / 1 days;
        uint256 thisMonth = block.timestamp / (30 days);

        if (dailySpending[today] + amount > dailySpendingLimit) {
            revert SpendingLimitExceeded();
        }

        if (monthlySpending[thisMonth] + amount > monthlySpendingLimit) {
            revert SpendingLimitExceeded();
        }

        dailySpending[today] += amount;
        monthlySpending[thisMonth] += amount;
    }

    // Emergency Functions

    /**
     * @dev Pause account (emergency stop)
     */
    function pause() external {
        require(msg.sender == owner || msg.sender == pauseGuardian, "Not authorized");
        paused = true;
        emit AccountPaused(msg.sender);
    }

    /**
     * @dev Unpause account
     */
    function unpause() external onlyOwner {
        paused = false;
        emit AccountUnpaused(msg.sender);
    }

    // Utility Functions

    /**
     * @dev Get account balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Receive ether
     */
    receive() external payable {}

    /**
     * @dev Fallback function
     */
    fallback() external payable {}

    /**
     * @dev Internal call function
     */
    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /**
     * @dev UUPS upgrade authorization
     */
    function _authorizeUpgrade(address) internal override onlyOwner {}

    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotAuthorized();
        _;
    }
}
