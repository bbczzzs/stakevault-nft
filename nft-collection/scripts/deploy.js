const hre = require("hardhat");

// YOUR WALLET ADDRESS - NFTs will be minted here
const MINT_TO_ADDRESS = "0x63EB57F3cf7Ed238e7cd81c32f30F8A2703D29c1";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // Deploy NFT Contract
    console.log("\n1. Deploying StakeVaultNFT...");
    const StakeVaultNFT = await hre.ethers.getContractFactory("StakeVaultNFT");
    const nft = await StakeVaultNFT.deploy(
        "StakeVault Collection",
        "SVNFT",
        process.env.BASE_URI || "ipfs://YOUR_CID_HERE/"
    );
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log("✅ StakeVaultNFT deployed to:", nftAddress);

    // Deploy Vault Token
    console.log("\n2. Deploying VaultToken...");
    const VaultToken = await hre.ethers.getContractFactory("VaultToken");
    const token = await VaultToken.deploy();
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✅ VaultToken deployed to:", tokenAddress);

    // Deploy Staking Contract
    console.log("\n3. Deploying NFTStaking...");
    const NFTStaking = await hre.ethers.getContractFactory("NFTStaking");
    const staking = await NFTStaking.deploy(nftAddress, tokenAddress);
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    console.log("✅ NFTStaking deployed to:", stakingAddress);

    // Fund staking contract
    console.log("\n4. Funding staking contract...");
    const rewardAmount = hre.ethers.parseEther("500000");
    await token.transfer(stakingAddress, rewardAmount);
    console.log("✅ Transferred 500,000 VAULT tokens");

    // Enable minting
    console.log("\n5. Enabling minting...");
    await nft.toggleMinting();
    console.log("✅ Minting enabled");

    // MINT 10 NFTs TO YOUR WALLET!
    console.log("\n6. Minting 10 NFTs to your wallet...");
    await nft.ownerMint(MINT_TO_ADDRESS, 10);
    console.log("✅ Minted 10 NFTs to:", MINT_TO_ADDRESS);

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log("NFT Contract:     ", nftAddress);
    console.log("Token Contract:   ", tokenAddress);
    console.log("Staking Contract: ", stakingAddress);
    console.log("NFTs Minted To:   ", MINT_TO_ADDRESS);
    console.log("=".repeat(50));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
