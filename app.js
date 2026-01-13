// ===== StakeVault - Web3Modal Integration =====
import { createWeb3Modal, defaultConfig } from 'https://cdn.jsdelivr.net/npm/@web3modal/ethers@5.1.11/+esm';

const projectId = 'bd3be74b534af2c489b1367f49dca9ce';

const mainnet = { chainId: 1, name: 'Ethereum', currency: 'ETH', explorerUrl: 'https://etherscan.io', rpcUrl: 'https://eth.llamarpc.com' };
const polygon = { chainId: 137, name: 'Polygon', currency: 'MATIC', explorerUrl: 'https://polygonscan.com', rpcUrl: 'https://polygon.llamarpc.com' };
const arbitrum = { chainId: 42161, name: 'Arbitrum', currency: 'ETH', explorerUrl: 'https://arbiscan.io', rpcUrl: 'https://arb1.arbitrum.io/rpc' };
const base = { chainId: 8453, name: 'Base', currency: 'ETH', explorerUrl: 'https://basescan.org', rpcUrl: 'https://mainnet.base.org' };
const sepolia = { chainId: 11155111, name: 'Sepolia', currency: 'ETH', explorerUrl: 'https://sepolia.etherscan.io', rpcUrl: 'https://rpc.sepolia.org' };

const metadata = {
    name: 'StakeVault',
    description: 'NFT Staking Platform',
    url: window.location.origin,
    icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const ethersConfig = defaultConfig({ metadata, enableEIP6963: true, enableInjected: true, enableCoinbase: true });

const modal = createWeb3Modal({
    ethersConfig,
    chains: [mainnet, polygon, arbitrum, base, sepolia],
    projectId,
    enableAnalytics: false,
    themeMode: 'dark',
    themeVariables: { '--w3m-accent': '#8b5cf6', '--w3m-border-radius-master': '12px' }
});

// State
const state = { walletAddress: null, chainId: null, isConnected: false };

// DOM
const elements = {
    walletNftsGrid: document.getElementById('walletNfts'),
    stakedNftsGrid: document.getElementById('stakedNfts'),
    walletCount: document.getElementById('walletCount'),
    stakedCount: document.getElementById('stakedCount'),
    toastContainer: document.getElementById('toastContainer'),
    faqItems: document.querySelectorAll('.faq-item'),
    connectBtn: document.getElementById('connectWallet')
};

// Utils
window.scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

function showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${msg}</span>`;
    elements.toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

function shortenAddress(addr) { return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''; }

// Web3Modal Events
modal.subscribeProvider(({ address, chainId, isConnected }) => {
    state.walletAddress = address;
    state.chainId = chainId;
    state.isConnected = isConnected;

    if (isConnected && address) {
        showToast(`Connected: ${shortenAddress(address)}`, 'success');
        elements.connectBtn.querySelector('.btn-text').textContent = shortenAddress(address);
        elements.connectBtn.classList.add('connected');
        elements.walletNftsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎨</div>
                <p>Wallet connected!</p>
                <small>${shortenAddress(address)}</small>
            </div>
        `;
    } else {
        elements.connectBtn.querySelector('.btn-text').textContent = 'Connect Wallet';
        elements.connectBtn.classList.remove('connected');
        elements.walletNftsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔗</div>
                <p>Connect your wallet to view NFTs</p>
            </div>
        `;
    }
});

// Open modal function
window.openWeb3Modal = () => modal.open();

// FAQ
function initFaq() {
    elements.faqItems.forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            const wasActive = item.classList.contains('active');
            elements.faqItems.forEach(i => i.classList.remove('active'));
            if (!wasActive) item.classList.add('active');
        });
    });
}

// Counter Animation
function animateCounters() {
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
}

// Navbar Scroll
function initNavScroll() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.style.padding = window.scrollY > 50 ? '12px 0' : '16px 0';
        navbar.style.background = window.scrollY > 50 ? 'rgba(10, 10, 15, 0.95)' : 'rgba(10, 10, 15, 0.8)';
    });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    initFaq();
    animateCounters();
    initNavScroll();
    elements.stakedNftsGrid.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><p>No NFTs staked yet</p></div>`;
    elements.stakedCount.textContent = '0 NFTs';
    elements.walletCount.textContent = '0 NFTs';
});
