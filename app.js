// ===== StakeVault - Reown AppKit Integration =====
import { createAppKit } from 'https://cdn.jsdelivr.net/npm/@reown/appkit@1.6.8/+esm';
import { EthersAdapter } from 'https://cdn.jsdelivr.net/npm/@reown/appkit-adapter-ethers@1.6.8/+esm';
import { mainnet, polygon, arbitrum, base, sepolia } from 'https://cdn.jsdelivr.net/npm/@reown/appkit/networks/+esm';

const projectId = 'bd3be74b534af2c489b1367f49dca9ce';

const metadata = {
    name: 'StakeVault',
    description: 'NFT Staking Platform',
    url: window.location.origin,
    icons: ['https://cryptostaking.website/favicon.ico']
};

const ethersAdapter = new EthersAdapter();

const modal = createAppKit({
    adapters: [ethersAdapter],
    networks: [mainnet, polygon, arbitrum, base, sepolia],
    metadata,
    projectId,
    themeMode: 'dark',
    themeVariables: {
        '--w3m-accent': '#8b5cf6',
        '--w3m-border-radius-master': '12px'
    },
    features: {
        analytics: false,
        email: true,
        socials: ['google', 'x', 'discord', 'github']
    }
});

// State
const state = { walletAddress: null, isConnected: false };

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

// Reown Events
modal.subscribeProviders(state => {
    if (state.eip155) {
        console.log('Provider connected:', state);
    }
});

modal.subscribeAccount(account => {
    if (account.address) {
        state.walletAddress = account.address;
        state.isConnected = true;
        showToast(`Connected: ${shortenAddress(account.address)}`, 'success');
        if (elements.connectBtn) {
            elements.connectBtn.querySelector('.btn-text').textContent = shortenAddress(account.address);
            elements.connectBtn.classList.add('connected');
        }
        elements.walletNftsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎨</div>
                <p>Wallet connected!</p>
                <small>${shortenAddress(account.address)}</small>
            </div>
        `;
    } else {
        state.isConnected = false;
        if (elements.connectBtn) {
            elements.connectBtn.querySelector('.btn-text').textContent = 'Connect Wallet';
            elements.connectBtn.classList.remove('connected');
        }
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
    console.log('🚀 StakeVault with Reown AppKit loaded!');
});
