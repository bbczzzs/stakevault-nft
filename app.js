// ===== StakeVault - Direct MetaMask/Wallet Connection =====

// State
let walletAddress = null;
let provider = null;
let signer = null;

// DOM Elements
const connectBtn = document.getElementById('connectWallet');
const walletNftsGrid = document.getElementById('walletNfts');
const stakedNftsGrid = document.getElementById('stakedNfts');
const walletCount = document.getElementById('walletCount');
const stakedCount = document.getElementById('stakedCount');
const toastContainer = document.getElementById('toastContainer');

// Toast notification
function showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${msg}</span>`;
    toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 4000);
}

// Shorten address
function shortenAddress(addr) {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
}

// Scroll to section
function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}
window.scrollToSection = scrollToSection;

// Connect Wallet
async function connectWallet() {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
        showToast('Please install MetaMask!', 'error');
        window.open('https://metamask.io/download/', '_blank');
        return;
    }

    try {
        showToast('Connecting wallet...', 'info');

        // Request accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (accounts.length === 0) {
            showToast('No accounts found', 'error');
            return;
        }

        walletAddress = accounts[0];
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();

        // Update UI
        connectBtn.querySelector('.btn-text').textContent = shortenAddress(walletAddress);
        connectBtn.classList.add('connected');

        showToast(`Connected: ${shortenAddress(walletAddress)}`, 'success');

        // Update NFT panel
        walletNftsGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✅</div>
                <p>Wallet Connected!</p>
                <small>${shortenAddress(walletAddress)}</small>
            </div>
        `;

        // Get network
        const network = await provider.getNetwork();
        console.log('Connected to:', network.name);

    } catch (error) {
        console.error('Connection error:', error);
        if (error.code === 4001) {
            showToast('Connection rejected', 'error');
        } else {
            showToast('Connection failed: ' + error.message, 'error');
        }
    }
}

// Disconnect Wallet
function disconnectWallet() {
    walletAddress = null;
    provider = null;
    signer = null;

    connectBtn.querySelector('.btn-text').textContent = 'Connect Wallet';
    connectBtn.classList.remove('connected');

    walletNftsGrid.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🔗</div>
            <p>Connect your wallet to view NFTs</p>
        </div>
    `;

    showToast('Wallet disconnected', 'info');
}

// Handle wallet button click
connectBtn.addEventListener('click', () => {
    if (walletAddress) {
        disconnectWallet();
    } else {
        connectWallet();
    }
});

// Listen for account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            walletAddress = accounts[0];
            connectBtn.querySelector('.btn-text').textContent = shortenAddress(walletAddress);
            showToast('Account changed', 'info');
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}

// FAQ
document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question').addEventListener('click', () => {
        const wasActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!wasActive) item.classList.add('active');
    });
});

// Counter Animation
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

// Navbar Scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    navbar.style.padding = window.scrollY > 50 ? '12px 0' : '16px 0';
    navbar.style.background = window.scrollY > 50 ? 'rgba(10, 10, 15, 0.95)' : 'rgba(10, 10, 15, 0.8)';
});

// Init
stakedNftsGrid.innerHTML = `<div class="empty-state"><div class="empty-icon">📦</div><p>No NFTs staked yet</p></div>`;
stakedCount.textContent = '0 NFTs';
walletCount.textContent = '0 NFTs';

console.log('🚀 StakeVault loaded!');
