// ===== StakeVault - WalletConnect Web3Modal =====
import { createWeb3Modal, defaultConfig } from 'https://esm.sh/@web3modal/ethers@5.1.11';

// Your WalletConnect Project ID
const projectId = 'bd3be74b534af2c489b1367f49dca9ce';

// Chains
const mainnet = {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com'
};

const metadata = {
    name: 'StakeVault',
    description: 'NFT Staking Platform',
    url: 'https://cryptostaking.website',
    icons: ['https://cryptostaking.website/favicon.ico']
};

// Create Web3Modal
const modal = createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [mainnet],
    projectId,
    enableAnalytics: false,
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#8b5cf6'
    }
});

// State
let walletAddress = null;

// DOM
const connectBtn = document.getElementById('connectWallet');
const walletNftsGrid = document.getElementById('walletNfts');
const stakedNftsGrid = document.getElementById('stakedNfts');
const walletCount = document.getElementById('walletCount');
const stakedCount = document.getElementById('stakedCount');
const toastContainer = document.getElementById('toastContainer');

// Utils
function showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${msg}</span>`;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

function shortenAddress(addr) {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
}

window.scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

// Listen for connection
modal.subscribeProvider(({ address, isConnected }) => {
    if (isConnected && address) {
        walletAddress = address;
        connectBtn.querySelector('.btn-text').textContent = shortenAddress(address);
        connectBtn.classList.add('connected');
        showToast(`Connected: ${shortenAddress(address)}`, 'success');

        walletNftsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✅</div>
                <p>Wallet Connected!</p>
                <small>${shortenAddress(address)}</small>
            </div>
        `;
    } else {
        walletAddress = null;
        connectBtn.querySelector('.btn-text').textContent = 'Connect Wallet';
        connectBtn.classList.remove('connected');
        walletNftsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔗</div>
                <p>Connect your wallet to view NFTs</p>
            </div>
        `;
    }
});

// Connect button click
connectBtn.addEventListener('click', () => {
    if (walletAddress) {
        modal.disconnect();
    } else {
        modal.open();
    }
});

// FAQ
document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
        const wasActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!wasActive) item.classList.add('active');
    });
});

// Counters
document.querySelectorAll('[data-count]').forEach(counter => {
    const target = parseInt(counter.dataset.count);
    let current = 0;
    const step = target / 100;
    const update = () => {
        current += step;
        if (current < target) {
            counter.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(update);
        } else {
            counter.textContent = target.toLocaleString();
        }
    };
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) { update(); observer.disconnect(); }
    });
    observer.observe(counter);
});

// Navbar
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    navbar.style.padding = window.scrollY > 50 ? '12px 0' : '16px 0';
    navbar.style.background = window.scrollY > 50 ? 'rgba(10, 10, 15, 0.95)' : 'rgba(10, 10, 15, 0.8)';
});

// Init
stakedNftsGrid.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><p>No NFTs staked yet</p></div>`;
stakedCount.textContent = '0 NFTs';
walletCount.textContent = '0 NFTs';

console.log('🚀 StakeVault with WalletConnect loaded!');
