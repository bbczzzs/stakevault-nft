const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

    // Deploy NFT Contract
    console.log("\n1. Deploying StakeVaultNFT...");
    const StakeVaultNFT = await hre.ethers.getContractFactory("StakeVaultNFT");
    const nft = await StakeVaultNFT.deploy(
        "StakeVault Collection",  // name
        "SVNFT",                  // symbol
        process.env.BASE_URI || "ipfs://YOUR_CID_HERE/"  // baseURI
    );
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();
    console.log("✅ StakeVaultNFT deployed to:", nftAddress);

    // Deploy Vault Token (reward token)
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

    // Transfer reward tokens to staking contract
    console.log("\n4. Funding staking contract with rewards...");
    const rewardAmount = hre.ethers.parseEther("500000"); // 500k tokens
    await token.transfer(stakingAddress, rewardAmount);
    console.log("✅ Transferred 500,000 VAULT tokens to staking contract");

    // Enable minting
    console.log("\n5. Enabling NFT minting...");
    await nft.toggleMinting();
    console.log("✅ Minting enabled");

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log("NFT Contract:     ", nftAddress);
    console.log("Token Contract:   ", tokenAddress);
    console.log("Staking Contract: ", stakingAddress);
    console.log("=".repeat(50));
    console.log("\nNEXT STEPS:");
    console.log("1. Verify contracts on Etherscan");
    console.log("2. Upload NFT images to IPFS");
    console.log("3. Update BASE_URI with IPFS CID");
    console.log("4. Update frontend with contract addresses");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
