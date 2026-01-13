// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Reward Token
contract VaultToken is ERC20, Ownable {
    constructor() ERC20("Vault Token", "VAULT") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10**18); // 1 million tokens
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

// NFT Staking Contract
contract NFTStaking is Ownable, ReentrancyGuard {
    IERC721 public nftContract;
    IERC20 public rewardToken;
    
    uint256 public rewardPerDay = 10 * 10**18; // 10 VAULT per day per NFT
    
    struct StakeInfo {
        address owner;
        uint256 stakedAt;
        uint256 claimedRewards;
    }
    
    // tokenId => StakeInfo
    mapping(uint256 => StakeInfo) public stakes;
    
    // owner => staked token IDs
    mapping(address => uint256[]) public stakedTokens;
    
    event NFTStaked(address indexed owner, uint256 tokenId, uint256 timestamp);
    event NFTUnstaked(address indexed owner, uint256 tokenId, uint256 rewards);
    event RewardsClaimed(address indexed owner, uint256 amount);
    event RewardRateUpdated(uint256 newRate);

    constructor(address _nftContract, address _rewardToken) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
        rewardToken = IERC20(_rewardToken);
    }

    // Stake NFT
    function stake(uint256 tokenId) external nonReentrant {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(stakes[tokenId].owner == address(0), "Already staked");
        
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        
        stakes[tokenId] = StakeInfo({
            owner: msg.sender,
            stakedAt: block.timestamp,
            claimedRewards: 0
        });
        
        stakedTokens[msg.sender].push(tokenId);
        
        emit NFTStaked(msg.sender, tokenId, block.timestamp);
    }

    // Stake multiple NFTs
    function stakeMultiple(uint256[] calldata tokenIds) external nonReentrant {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
            require(stakes[tokenId].owner == address(0), "Already staked");
            
            nftContract.transferFrom(msg.sender, address(this), tokenId);
            
            stakes[tokenId] = StakeInfo({
                owner: msg.sender,
                stakedAt: block.timestamp,
                claimedRewards: 0
            });
            
            stakedTokens[msg.sender].push(tokenId);
            
            emit NFTStaked(msg.sender, tokenId, block.timestamp);
        }
    }

    // Unstake NFT
    function unstake(uint256 tokenId) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[tokenId];
        require(stakeInfo.owner == msg.sender, "Not the staker");
        
        uint256 rewards = calculateRewards(tokenId);
        
        // Transfer NFT back
        nftContract.transferFrom(address(this), msg.sender, tokenId);
        
        // Transfer rewards
        if (rewards > 0) {
            rewardToken.transfer(msg.sender, rewards);
        }
        
        // Remove from staked tokens array
        _removeFromStakedTokens(msg.sender, tokenId);
        
        // Clear stake info
        delete stakes[tokenId];
        
        emit NFTUnstaked(msg.sender, tokenId, rewards);
    }

    // Claim rewards without unstaking
    function claimRewards(uint256 tokenId) external nonReentrant {
        StakeInfo storage stakeInfo = stakes[tokenId];
        require(stakeInfo.owner == msg.sender, "Not the staker");
        
        uint256 rewards = calculateRewards(tokenId);
        require(rewards > 0, "No rewards to claim");
        
        stakeInfo.claimedRewards += rewards;
        stakeInfo.stakedAt = block.timestamp;
        
        rewardToken.transfer(msg.sender, rewards);
        
        emit RewardsClaimed(msg.sender, rewards);
    }

    // Claim all rewards
    function claimAllRewards() external nonReentrant {
        uint256[] memory tokens = stakedTokens[msg.sender];
        uint256 totalRewards = 0;
        
        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 tokenId = tokens[i];
            uint256 rewards = calculateRewards(tokenId);
            
            if (rewards > 0) {
                stakes[tokenId].claimedRewards += rewards;
                stakes[tokenId].stakedAt = block.timestamp;
                totalRewards += rewards;
            }
        }
        
        require(totalRewards > 0, "No rewards to claim");
        rewardToken.transfer(msg.sender, totalRewards);
        
        emit RewardsClaimed(msg.sender, totalRewards);
    }

    // Calculate rewards for a token
    function calculateRewards(uint256 tokenId) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[tokenId];
        if (stakeInfo.owner == address(0)) return 0;
        
        uint256 stakedDuration = block.timestamp - stakeInfo.stakedAt;
        uint256 rewards = (stakedDuration * rewardPerDay) / 1 days;
        
        return rewards;
    }

    // Get total pending rewards for a user
    function getTotalPendingRewards(address user) external view returns (uint256) {
        uint256[] memory tokens = stakedTokens[user];
        uint256 total = 0;
        
        for (uint256 i = 0; i < tokens.length; i++) {
            total += calculateRewards(tokens[i]);
        }
        
        return total;
    }

    // Get user's staked tokens
    function getStakedTokens(address user) external view returns (uint256[] memory) {
        return stakedTokens[user];
    }

    // Get staked count
    function getStakedCount(address user) external view returns (uint256) {
        return stakedTokens[user].length;
    }

    // Owner functions
    function setRewardRate(uint256 newRate) external onlyOwner {
        rewardPerDay = newRate;
        emit RewardRateUpdated(newRate);
    }

    function depositRewards(uint256 amount) external onlyOwner {
        rewardToken.transferFrom(msg.sender, address(this), amount);
    }

    function withdrawRewards(uint256 amount) external onlyOwner {
        rewardToken.transfer(msg.sender, amount);
    }

    // Internal functions
    function _removeFromStakedTokens(address user, uint256 tokenId) internal {
        uint256[] storage tokens = stakedTokens[user];
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokens[i] == tokenId) {
                tokens[i] = tokens[tokens.length - 1];
                tokens.pop();
                break;
            }
        }
    }
}
