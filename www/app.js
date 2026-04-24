// DOM Elements
const cryptoList = document.getElementById('cryptoList');
const widgetList = document.getElementById('widgetList');
const searchInput = document.getElementById('searchInput');
const tabAll = document.getElementById('tabAll');
const tabFav = document.getElementById('tabFav');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettings = document.getElementById('closeSettings');
const settingsModal = document.getElementById('settingsModal');
const widgetView = document.getElementById('widgetView');

// New Settings Elements
const themeToggleCheckbox = document.getElementById('themeToggleCheckbox');
const widgetToggleCheckbox = document.getElementById('widgetToggleCheckbox');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const rateAppBtn = document.getElementById('rateAppBtn');


// App State
let coinsData = [];
let currentTab = 'all'; // 'all' or 'fav'
let favorites = JSON.parse(localStorage.getItem('cryptoFavs')) || [];
let widgetEnabled = true;

// 1. Fetch Data from Binance
async function fetchCryptoData() {
    try {
        // Fetching 24hr ticker data from Binance API
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();
        
        // Filter only USDT pairs for a cleaner list and sort by volume
        coinsData = data
            .filter(coin => coin.symbol.endsWith('USDT'))
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 100); // Take top 100 to save memory on mobile

        renderApp();
    } catch (error) {
        console.error("Error fetching Binance data:", error);
        cryptoList.innerHTML = `<p style="text-align:center; padding:20px;">Failed to load data. Check internet connection.</p>`;
    }
}

// 2. Render Functions
function renderApp() {
    renderMainList();
    if (widgetEnabled) renderWidget();
}

function renderMainList() {
    const searchTerm = searchInput.value.toLowerCase();
    
    // Filter by tab and search term
    const filteredCoins = coinsData.filter(coin => {
        const matchesSearch = coin.symbol.toLowerCase().includes(searchTerm);
        const isFav = favorites.includes(coin.symbol);
        
        if (currentTab === 'fav') return matchesSearch && isFav;
        return matchesSearch;
    });

    cryptoList.innerHTML = filteredCoins.map(coin => createCoinElement(coin)).join('');
}

function renderWidget() {
    // Widget shows top 5 user favorites, or top 5 default coins if no favs
    const displayCoins = favorites.length > 0 
        ? coinsData.filter(c => favorites.includes(c.symbol)).slice(0, 5)
        : coinsData.slice(0, 5);
    
    widgetList.innerHTML = displayCoins.map(coin => createCoinElement(coin, true)).join('');
}

// 3. HTML Template for a Coin
function createCoinElement(coin, isWidget = false) {
    const price = parseFloat(coin.lastPrice).toFixed(2);
    const change = parseFloat(coin.priceChangePercent).toFixed(2);
    const changeClass = change >= 0 ? 'up' : 'down';
    const sign = change >= 0 ? '+' : '';
    const isFav = favorites.includes(coin.symbol);
    
    // Format symbol (e.g., BTCUSDT to BTC)
    const shortSymbol = coin.symbol.replace('USDT', '');

    return `
        <div class="crypto-item">
            <div class="coin-info">
                ${!isWidget ? `<button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite('${coin.symbol}')">
                    <i class='bx ${isFav ? 'bxs-heart' : 'bx-heart'}'></i>
                </button>` : ''}
                <div class="coin-details">
                    <h4>${shortSymbol}</h4>
                    <p>USDT</p>
                </div>
            </div>
            <div class="price-info">
                <div class="price">$${price}</div>
                <div class="change ${changeClass}">${sign}${change}%</div>
            </div>
        </div>
    `;
}

// 4. Interactions & Logic
window.toggleFavorite = function(symbol) {
    if (favorites.includes(symbol)) {
        favorites = favorites.filter(fav => fav !== symbol);
    } else {
        favorites.push(symbol);
    }
    localStorage.setItem('cryptoFavs', JSON.stringify(favorites));
    renderApp();
}

// Tabs
tabAll.addEventListener('click', () => {
    currentTab = 'all';
    tabAll.classList.add('active');
    tabFav.classList.remove('active');
    renderMainList();
});

tabFav.addEventListener('click', () => {
    currentTab = 'fav';
    tabFav.classList.add('active');
    tabAll.classList.remove('active');
    renderMainList();
});

// Search
searchInput.addEventListener('input', renderMainList);

// Settings Modal
settingsBtn.addEventListener('click', () => settingsModal.classList.add('active'));
closeSettings.addEventListener('click', () => settingsModal.classList.remove('active'));

// Theme Toggle Logic
let isDark = true;
themeToggleCheckbox.addEventListener('change', (e) => {
    isDark = e.target.checked;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
});

// Widget Toggle logic
widgetToggleCheckbox.addEventListener('change', (e) => {
    widgetEnabled = e.target.checked;
    if (widgetEnabled) {
        widgetView.classList.remove('hidden');
        renderWidget();
    } else {
        widgetView.classList.add('hidden');
    }
});

// Google Login Alert (Note: Real auth requires backend like Firebase)
googleLoginBtn.addEventListener('click', () => {
    alert("Google Sign-In API connected! (Requires Firebase implementation)");
});

// Rate App Play Store Link
rateAppBtn.addEventListener('click', () => {
    alert("Redirecting to Google Play Store...");
});


// Double tap on widget to open full app
let lastTap = 0;
widgetView.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
        // Double tap detected! Hide widget view, show main app
        widgetView.classList.add('hidden');
        widgetToggle.checked = false; 
        widgetEnabled = false;
        e.preventDefault();
    }
    lastTap = currentTime;
});

// For desktop testing double click
widgetView.addEventListener('dblclick', () => {
    widgetView.classList.add('hidden');
    widgetToggle.checked = false;
    widgetEnabled = false;
});

// Initial Load & Live Update Loop
fetchCryptoData();
// Update prices every 10 seconds
setInterval(fetchCryptoData, 10000); 
