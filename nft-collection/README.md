# StakeVault NFT Collection

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd nft-collection
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your:
# - PRIVATE_KEY (wallet private key)
# - ETHERSCAN_API_KEY (for verification)
```

### 3. Compile contracts
```bash
npm run compile
```

### 4. Deploy to Sepolia (testnet)
```bash
npm run deploy:sepolia
```

### 5. Deploy to Mainnet
```bash
npm run deploy:mainnet
```

## 📁 Project Structure

```
nft-collection/
├── contracts/
│   ├── StakeVaultNFT.sol    # ERC-721 NFT contract
│   └── NFTStaking.sol       # Staking + VAULT token
├── scripts/
│   └── deploy.js            # Deployment script
├── metadata/
│   └── *.json               # NFT metadata files
├── hardhat.config.js
└── package.json
```

## 📋 Contracts

### StakeVaultNFT (ERC-721)
- Max supply: 100 NFTs
- Mint price: 0.01 ETH
- Max 5 per wallet
- Owner can toggle minting
- Owner can mint for free

### VaultToken (ERC-20)
- Initial supply: 1,000,000 VAULT
- Used as staking rewards

### NFTStaking
- Stake NFTs to earn VAULT tokens
- 10 VAULT per day per NFT
- Claim rewards anytime
- Unstake anytime

## 🖼️ NFT Metadata

1. Generate/upload images to IPFS (Pinata.cloud)
2. Update metadata JSON files with IPFS CID
3. Upload metadata folder to IPFS
4. Update BASE_URI in .env
5. Call `setBaseURI()` on NFT contract

## ⚠️ Before Mainnet

- [ ] Test on Sepolia first
- [ ] Verify contracts on Etherscan
- [ ] Audit smart contracts
- [ ] Upload all 100 NFT images
- [ ] Create all 100 metadata files
- [ ] Test staking functionality
