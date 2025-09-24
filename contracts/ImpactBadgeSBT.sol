// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Impact Badge Soul Bound Token (ERC-5192)
 * @dev Non-transferable NFT badges for completed impact missions
 * @notice This contract implements ERC-5192 Soul Bound Tokens for Impact Autopilot
 */
contract ImpactBadgeSBT is ERC721, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;

    // Token metadata structure
    struct BadgeMetadata {
        address recipient;
        string missionType; // "carbon_offset", "donation", "petition"
        string level; // "bronze", "silver", "gold", "platinum"
        uint256 impact; // Impact score (0-100)
        uint256 earnedAt; // Timestamp when earned
        string ipfsHash; // IPFS hash for off-chain metadata
    }

    // Mapping from token ID to metadata
    mapping(uint256 => BadgeMetadata) private _badgeMetadata;

    // Mapping to track if token is locked (ERC-5192 compliance)
    mapping(uint256 => bool) private _locked;

    // Events
    event BadgeMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        string missionType,
        string level,
        uint256 impact
    );

    event BadgeLocked(uint256 indexed tokenId);
    event BadgeBurned(uint256 indexed tokenId, address indexed owner);

    // Custom errors
    error TokenLocked();
    error TokenNotLocked();
    error InvalidRecipient();
    error InvalidImpactScore();
    error UnauthorizedAccess();

    constructor() ERC721("Impact Autopilot Badge", "IMPACT") {}

    /**
     * @dev Mint a new impact badge
     * @param recipient Address to receive the badge
     * @param missionType Type of mission completed
     * @param impact Impact score (0-100)
     * @param ipfsHash IPFS hash for metadata
     */
    function mintBadge(
        address recipient,
        string memory missionType,
        uint256 impact,
        string memory ipfsHash
    ) external onlyOwner returns (uint256) {
        if (recipient == address(0)) revert InvalidRecipient();
        if (impact > 100) revert InvalidImpactScore();

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        // Determine badge level based on impact
        string memory level = _getBadgeLevel(impact);

        // Create metadata
        _badgeMetadata[tokenId] = BadgeMetadata({
            recipient: recipient,
            missionType: missionType,
            level: level,
            impact: impact,
            earnedAt: block.timestamp,
            ipfsHash: ipfsHash
        });

        // Mint the token
        _mint(recipient, tokenId);

        // Lock the token (ERC-5192 compliance)
        _locked[tokenId] = true;

        emit BadgeMinted(tokenId, recipient, missionType, level, impact);
        emit BadgeLocked(tokenId);

        return tokenId;
    }

    /**
     * @dev Burn a badge (admin only)
     * @param tokenId Token ID to burn
     */
    function burnBadge(uint256 tokenId) external onlyOwner {
        address owner = ownerOf(tokenId);
        _burn(tokenId);

        // Clean up metadata
        delete _badgeMetadata[tokenId];
        delete _locked[tokenId];

        emit BadgeBurned(tokenId, owner);
    }

    /**
     * @dev Get badge metadata
     * @param tokenId Token ID
     */
    function getBadgeMetadata(uint256 tokenId)
        external
        view
        returns (BadgeMetadata memory)
    {
        require(_exists(tokenId), "Token does not exist");
        return _badgeMetadata[tokenId];
    }

    /**
     * @dev Get badge level for impact score
     * @param impact Impact score
     */
    function _getBadgeLevel(uint256 impact) internal pure returns (string memory) {
        if (impact >= 90) return "platinum";
        if (impact >= 75) return "gold";
        if (impact >= 50) return "silver";
        return "bronze";
    }

    /**
     * @dev Check if token is locked (ERC-5192)
     * @param tokenId Token ID
     */
    function locked(uint256 tokenId) external view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _locked[tokenId];
    }

    /**
     * @dev Get token URI for metadata
     * @param tokenId Token ID
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(_exists(tokenId), "Token does not exist");

        BadgeMetadata memory metadata = _badgeMetadata[tokenId];

        // Create on-chain metadata
        string memory json = string(
            abi.encodePacked(
                '{"name": "Impact Badge - ',
                metadata.missionType,
                '", "description": "Soul Bound Token for completing ',
                metadata.missionType,
                ' mission with ',
                metadata.impact.toString(),
                ' impact score", "image": "ipfs://',
                metadata.ipfsHash,
                '", "attributes": [',
                '{"trait_type": "Mission Type", "value": "',
                metadata.missionType,
                '"}, {"trait_type": "Level", "value": "',
                metadata.level,
                '"}, {"trait_type": "Impact Score", "value": ',
                metadata.impact.toString(),
                '}, {"trait_type": "Earned At", "value": ',
                metadata.earnedAt.toString(),
                '}]}'
            )
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                _base64Encode(bytes(json))
            )
        );
    }

    /**
     * @dev Batch mint badges (for admin operations)
     * @param recipients Array of recipient addresses
     * @param missionTypes Array of mission types
     * @param impacts Array of impact scores
     * @param ipfsHashes Array of IPFS hashes
     */
    function batchMintBadges(
        address[] memory recipients,
        string[] memory missionTypes,
        uint256[] memory impacts,
        string[] memory ipfsHashes
    ) external onlyOwner returns (uint256[] memory) {
        require(
            recipients.length == missionTypes.length &&
            missionTypes.length == impacts.length &&
            impacts.length == ipfsHashes.length,
            "Array lengths must match"
        );

        uint256[] memory tokenIds = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = this.mintBadge(
                recipients[i],
                missionTypes[i],
                impacts[i],
                ipfsHashes[i]
            );
        }

        return tokenIds;
    }

    /**
     * @dev Get total supply of badges
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Get badges owned by an address
     * @param owner Address to query
     */
    function getBadgesOfOwner(address owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);

        uint256 tokenCount = 0;
        uint256 totalTokens = _tokenIdCounter.current();

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (_exists(i) && ownerOf(i) == owner) {
                tokenIds[tokenCount] = i;
                tokenCount++;
            }
        }

        return tokenIds;
    }

    /**
     * @dev Override transfer functions to prevent transfers (ERC-5192)
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        revert TokenLocked();
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        revert TokenLocked();
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override {
        revert TokenLocked();
    }

    // Internal functions

    /**
     * @dev Base64 encoding function
     * @param data Data to encode
     */
    function _base64Encode(bytes memory data)
        internal
        pure
        returns (string memory)
    {
        if (data.length == 0) return "";

        // Base64 encoding implementation
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        string memory result = new string(encodedLen + 32);

        assembly {
            mstore(result, encodedLen)

            let dataPtr := add(data, 32)
            let endPtr := add(dataPtr, mload(data))
            let resultPtr := add(result, 32)

            for {} lt(dataPtr, endPtr) {} {
                let input := mload(dataPtr)

                mstore8(resultPtr, mload(add(table, and(shr(18, input), 63))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(table, and(shr(12, input), 63))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(table, and(shr(6, input), 63))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(table, and(input, 63))))
                resultPtr := add(resultPtr, 1)

                dataPtr := add(dataPtr, 3)
            }

            switch mod(mload(data), 3)
            case 1 {
                mstore8(sub(resultPtr, 2), 61)
                mstore8(sub(resultPtr, 1), 61)
            }
            case 2 {
                mstore8(sub(resultPtr, 1), 61)
            }
        }

        return result;
    }

    /**
     * @dev Check if token exists
     * @param tokenId Token ID
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
