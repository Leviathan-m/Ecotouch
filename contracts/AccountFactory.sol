// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "./ImpactAccount.sol";

/**
 * @title Impact Account Factory (ERC-4337)
 * @dev Factory contract for creating ERC-4337 smart accounts for Eco Touch users
 * @notice Creates and manages user smart accounts with gasless transactions
 */
contract AccountFactory is Ownable {
    IEntryPoint public immutable entryPoint;

    // Mapping to track deployed accounts
    mapping(address => bool) public isAccountDeployed;

    // Events
    event AccountCreated(
        address indexed account,
        address indexed owner,
        uint256 salt
    );

    event AccountCreationFailed(
        address indexed owner,
        uint256 salt,
        string reason
    );

    constructor(IEntryPoint _entryPoint) {
        entryPoint = _entryPoint;
    }

    /**
     * @dev Create a new account for the given owner
     * @param owner Address that will own the account
     * @param salt Random salt for account address generation
     */
    function createAccount(
        address owner,
        uint256 salt
    ) external returns (ImpactAccount) {
        if (owner == address(0)) revert InvalidOwner();

        bytes memory bytecode = getAccountBytecode(owner, address(entryPoint));

        address accountAddress = Create2.computeAddress(
            bytes32(salt),
            keccak256(bytecode)
        );

        if (accountAddress.code.length > 0) {
            return ImpactAccount(payable(accountAddress));
        }

        address deployedAddress = Create2.deploy(0, bytes32(salt), bytecode);

        ImpactAccount account = ImpactAccount(payable(deployedAddress));
        isAccountDeployed[deployedAddress] = true;

        emit AccountCreated(deployedAddress, owner, salt);

        return account;
    }

    /**
     * @dev Get the address of an account without deploying it
     * @param owner Address that will own the account
     * @param salt Random salt for account address generation
     */
    function getAccountAddress(
        address owner,
        uint256 salt
    ) external view returns (address) {
        bytes memory bytecode = getAccountBytecode(owner, address(entryPoint));
        return Create2.computeAddress(bytes32(salt), keccak256(bytecode));
    }

    /**
     * @dev Get the bytecode for account creation
     * @param owner Address that will own the account
     * @param entryPointAddress EntryPoint contract address
     */
    function getAccountBytecode(
        address owner,
        address entryPointAddress
    ) public pure returns (bytes memory) {
        return abi.encodePacked(
            type(ImpactAccount).creationCode,
            abi.encode(owner, entryPointAddress)
        );
    }

    /**
     * @dev Batch create accounts for multiple users
     * @param owners Array of owner addresses
     * @param salts Array of salts for address generation
     */
    function batchCreateAccounts(
        address[] memory owners,
        uint256[] memory salts
    ) external onlyOwner returns (address[] memory) {
        require(owners.length == salts.length, "Array lengths must match");

        address[] memory accounts = new address[](owners.length);

        for (uint256 i = 0; i < owners.length; i++) {
            try this.createAccount(owners[i], salts[i]) returns (ImpactAccount account) {
                accounts[i] = address(account);
            } catch Error(string memory reason) {
                emit AccountCreationFailed(owners[i], salts[i], reason);
                accounts[i] = address(0);
            }
        }

        return accounts;
    }

    /**
     * @dev Check if an account is deployed and owned by this factory
     * @param account Address of the account to check
     */
    function isValidAccount(address account) external view returns (bool) {
        return isAccountDeployed[account] && account.code.length > 0;
    }

    /**
     * @dev Get total number of deployed accounts
     */
    function getDeployedAccountCount() external view returns (uint256) {
        // This is an estimation - in practice you'd track this in a mapping
        return 0; // TODO: Implement proper counting
    }

    // Custom errors
    error InvalidOwner();
    error AccountAlreadyExists();
}
