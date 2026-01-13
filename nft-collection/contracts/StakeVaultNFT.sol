// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract StakeVaultNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 100;
    uint256 public constant MINT_PRICE = 0.01 ether;
    uint256 public constant MAX_PER_WALLET = 5;
    
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;
    bool public mintingEnabled = false;
    
    mapping(address => uint256) public mintedPerWallet;

    event NFTMinted(address indexed minter, uint256 tokenId);
    event MintingToggled(bool enabled);
    event BaseURIUpdated(string newBaseURI);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    // Mint function
    function mint(uint256 quantity) external payable {
        require(mintingEnabled, "Minting is not enabled");
        require(quantity > 0 && quantity <= MAX_PER_WALLET, "Invalid quantity");
        require(_tokenIdCounter + quantity <= MAX_SUPPLY, "Would exceed max supply");
        require(mintedPerWallet[msg.sender] + quantity <= MAX_PER_WALLET, "Exceeds max per wallet");
        require(msg.value >= MINT_PRICE * quantity, "Insufficient payment");

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;
            _safeMint(msg.sender, tokenId);
            emit NFTMinted(msg.sender, tokenId);
        }

        mintedPerWallet[msg.sender] += quantity;

        // Refund excess payment
        if (msg.value > MINT_PRICE * quantity) {
            payable(msg.sender).transfer(msg.value - MINT_PRICE * quantity);
        }
    }

    // Owner mint (free)
    function ownerMint(address to, uint256 quantity) external onlyOwner {
        require(_tokenIdCounter + quantity <= MAX_SUPPLY, "Would exceed max supply");

        for (uint256 i = 0; i < quantity; i++) {
            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;
            _safeMint(to, tokenId);
            emit NFTMinted(to, tokenId);
        }
    }

    // Toggle minting
    function toggleMinting() external onlyOwner {
        mintingEnabled = !mintingEnabled;
        emit MintingToggled(mintingEnabled);
    }

    // Set base URI
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    // Withdraw funds
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
        emit Withdrawn(owner(), balance);
    }

    // View functions
    function totalMinted() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - _tokenIdCounter;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        require(tokenId > 0 && tokenId <= _tokenIdCounter, "Token does not exist");
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
