document.addEventListener('DOMContentLoaded', function() {
    const apiUrl1 = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&page=1&per_page=100&sparkline=true';
    const apiUrl2 = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&page=2&per_page=100&sparkline=true';
    const statementBody = document.getElementById('statement-body');
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    const popupOverlay = document.getElementById('popup-overlay');
    const graphModal = document.getElementById('graph-modal');
    const graphModalImg = document.getElementById('graph-modal-img');
    const closeGraphModal = document.querySelector('.close-graph-modal');
    const categorySelect = document.getElementById('category-select');

    let allCoins = [];
    let topByMarketCap = [];
    let topGainers = [];
    let topLosers = [];
    let newListings = [];
    let coinDetailsCache = {};
    let lastApiCallTime = 0;
    const API_CALL_LIMIT = 20;
    const API_CALL_INTERVAL = 60000; // 1 minute in milliseconds

    Promise.all([fetch(apiUrl1), fetch(apiUrl2)])
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(data => {
            allCoins = [...data[0], ...data[1]];
            topByMarketCap = allCoins.sort((a, b) => b.market_cap - a.market_cap).slice(0, 5);
            topGainers = allCoins.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
            topLosers = allCoins.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);
            newListings = allCoins.sort((a, b) => new Date(b.atl_date) - new Date(a.atl_date)).slice(0, 5);

            displayCoins(topByMarketCap);
        })
        .catch(error => console.error('Error fetching data:', error));

    categorySelect.addEventListener('change', function() {
        switch(this.value) {
            case 'market-cap':
                displayCoins(topByMarketCap);
                break;
            case 'gainers':
                displayCoins(topGainers);
                break;
            case 'losers':
                displayCoins(topLosers);
                break;
            case 'new-listings':
                displayCoins(newListings);
                break;
        }
    });

function displayCoins(coins) {
    statementBody.innerHTML = '';
    coins.forEach(coin => {
        const newRow = document.createElement('tr');
        const roundedPrice = Math.round(coin.current_price * 1000000) / 1000000;
        const roundedChange = Math.round(coin.price_change_percentage_24h * 1000) / 1000;
        let changeClass = getChangeClass(roundedChange);

        const originalPrice = roundedPrice / (1 + (coin.price_change_percentage_24h / 100));
        const moneyChange = roundedPrice - originalPrice;
        const moneyChangeRounded = Math.round(moneyChange * 1000000) / 1000000;

        newRow.innerHTML = `
            <td data-label="Name">${coin.name} (${coin.symbol.toUpperCase()})</td>
            <td data-label="Price">$${roundedPrice}</td>
            <td data-label="Price Change 24h" class="${changeClass}">
                ${roundedChange}% ($${moneyChangeRounded.toLocaleString()})
            </td>
            <td data-label="Market Cap">$${coin.market_cap.toLocaleString()}</td>
            <td data-label="Total Volume">$${coin.total_volume.toLocaleString()}</td>
        `;

        newRow.addEventListener('click', function() {
            showCoinDetails(coin.id);
        });

        statementBody.appendChild(newRow);
    });
}

    async function showCoinDetails(coinId) {
        popupOverlay.style.display = 'block';
        popupContent.innerHTML = 'Loading...';

        try {
            const coinDetails = await getCoinDetails(coinId);
            updatePopupContent(coinDetails);
        } catch (error) {
            console.error('Error fetching coin details:', error);
            popupContent.innerHTML = 'Error loading coin details. Please try again.';
        }
    }

    async function getCoinDetails(coinId) {
        if (coinDetailsCache[coinId]) {
            return coinDetailsCache[coinId];
        }

        await checkAndDelayApiCall();

        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
        const data = await response.json();

        coinDetailsCache[coinId] = data;
        return data;
    }

    async function checkAndDelayApiCall() {
        const now = Date.now();
        if (now - lastApiCallTime < API_CALL_INTERVAL && Object.keys(coinDetailsCache).length >= API_CALL_LIMIT) {
            const delay = API_CALL_INTERVAL - (now - lastApiCallTime);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        lastApiCallTime = Date.now();
    }

function updatePopupContent(coinDetails) {
    const getChangeClass = (change) => {
        if (change > 1.5) return 'green';
        if (change >= -1.5 && change <= 1.5) return 'yellow';
        return 'red';
    };

    const originalPrice24h = coinDetails.market_data.current_price.usd / (1 + (coinDetails.market_data.price_change_percentage_24h / 100));
    const moneyChange24h = coinDetails.market_data.current_price.usd - originalPrice24h;
    const moneyChange24hRounded = moneyChange24h.toFixed(5);

    const originalPrice7d = coinDetails.market_data.current_price.usd / (1 + (coinDetails.market_data.price_change_percentage_7d / 100));
    const moneyChange7d = coinDetails.market_data.current_price.usd - originalPrice7d;
    const moneyChange7dRounded = moneyChange7d.toFixed(5);

    const originalPrice30d = coinDetails.market_data.current_price.usd / (1 + (coinDetails.market_data.price_change_percentage_30d / 100));
    const moneyChange30d = coinDetails.market_data.current_price.usd - originalPrice30d;
    const moneyChange30dRounded = moneyChange30d.toFixed(5);

    const originalPrice1y = coinDetails.market_data.current_price.usd / (1 + (coinDetails.market_data.price_change_percentage_1y / 100));
    const moneyChange1y = coinDetails.market_data.current_price.usd - originalPrice1y;
    const moneyChange1yRounded = moneyChange1y.toFixed(5);

    popupContent.innerHTML = `
        <table>
            <tr class="no-highlight">
                <td colspan="2" style="text-align: center;">
                    <img src="${coinDetails.image.large}" alt="${coinDetails.name}" style="width: 90px; height: auto;" />
                    <h2>${coinDetails.name} (${coinDetails.symbol.toUpperCase()})</h2>
                </td>
            </tr>
            <tr class="no-highlight">
                <td>Current Price:</td>
                <td><b>$${coinDetails.market_data.current_price.usd}</b></td>
            </tr>
            <tr class="no-highlight">
                <td>Rank:</td>
                <td><b>${coinDetails.market_cap_rank}</b></td>
            </tr>
            <tr class="no-highlight">
                <td>All-Time High:</td>
                <td><b>$${coinDetails.market_data.ath.usd}</b> (on ${new Date(coinDetails.market_data.ath_date.usd).toLocaleDateString()})</td>
            </tr>
            <tr class="no-highlight">
                <td>All-Time Low:</td>
                <td><b>$${coinDetails.market_data.atl.usd}</b> (on ${new Date(coinDetails.market_data.atl_date.usd).toLocaleDateString()})</td>
            </tr>
            <tr class="no-highlight">
                <td>24h Price Change:</td>
                <td class="${getChangeClass(coinDetails.market_data.price_change_percentage_24h)}">
                    <b>${coinDetails.market_data.price_change_percentage_24h.toFixed(2)}%</b> 
                    ($${moneyChange24hRounded})
                </td>
            </tr>
            <tr class="no-highlight">
                <td>7d Price Change:</td>
                <td class="${getChangeClass(coinDetails.market_data.price_change_percentage_7d)}">
                    <b>${coinDetails.market_data.price_change_percentage_7d.toFixed(2)}%</b> 
                    ($${moneyChange7dRounded})
                </td>
            </tr>
            <tr class="no-highlight">
                <td>30d Price Change:</td>
                <td class="${getChangeClass(coinDetails.market_data.price_change_percentage_30d)}">
                    <b>${coinDetails.market_data.price_change_percentage_30d.toFixed(2)}%</b> 
                    ($${moneyChange30dRounded})
                </td>
            </tr>
            <tr class="no-highlight">
                <td>1y Price Change:</td>
                <td class="${getChangeClass(coinDetails.market_data.price_change_percentage_1y)}">
                    <b>${coinDetails.market_data.price_change_percentage_1y.toFixed(2)}%</b> 
                    ($${moneyChange1yRounded})
                </td>
            </tr>
            <tr class="no-highlight">
                <td>Market Cap:</td>
                <td><b>$${coinDetails.market_data.market_cap.usd.toLocaleString()}</b></td>
            </tr>
            <tr class="no-highlight">
                <td>Total Volume:</td>
                <td><b>$${coinDetails.market_data.total_volume.usd.toLocaleString()}</b></td>
            </tr>
            <tr class="no-highlight">
                <td>Max Supply:</td>
                <td><b>${coinDetails.market_data.max_supply ? coinDetails.market_data.max_supply.toLocaleString() : 'N/A'}</b></td>
            </tr> 
            <tr class="no-highlight">
                <td>Circulating Supply:</td>
                <td><b>${coinDetails.market_data.circulating_supply.toFixed(2)}</b></td>
            </tr>
            <tr class="no-highlight">
                <td>Official Website:</td>
                <td><a href="${coinDetails.links.homepage[0]}" target="_blank">${coinDetails.links.homepage[0]}</a></td>
            </tr>
            <tr class="no-highlight">
                <td>X(Twitter):</td>
                <td><a href="https://x.com/${coinDetails.links.twitter_screen_name}" target="_blank">@${coinDetails.links.twitter_screen_name}</a></td>
            </tr>
        </table>
    `;
}

    function getChangeClass(change) {
        if (change > 1.5) return 'green';
        if (change >= -1.5 && change <= 1.5) return 'yellow';
        return 'red';
    }

    document.getElementById('popup-close-btn').addEventListener('click', function() {
        popupOverlay.style.display = 'none';
    });

    popupOverlay.addEventListener('click', function(event) {
        if (event.target === popupOverlay) {
            popupOverlay.style.display = 'none';
        }
    });

    closeGraphModal.addEventListener('click', function() {
        graphModal.style.display = 'none';
    });

    graphModal.addEventListener('click', function(event) {
        if (event.target === graphModal) {
            graphModal.style.display = 'none';
        }
    });
});
