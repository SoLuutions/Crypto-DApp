document.addEventListener('DOMContentLoaded', function() {
    const apiUrl = 'https://api.coingecko.com/api/v3/search/trending';
    const statementBody = document.getElementById('statement-body');
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    const popupOverlay = document.getElementById('popup-overlay');
    const graphModal = document.getElementById('graph-modal');
    const graphModalImg = document.getElementById('graph-modal-img');
    const closeGraphModal = document.querySelector('.close-graph-modal');
    const installButton = document.getElementById('installButton');

    if (installButton) {
        installButton.addEventListener('click', function() {
            showInstallPrompt();
        });
    }

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const coins = data.coins.slice(0, 5).map(coin => coin.item);
            coins.forEach(coin => {
                const newRow = document.createElement('tr');
                const roundedPrice = Math.round(coin.data.price * 1000000) / 1000000;
                const roundedChange = Math.round(coin.data.price_change_percentage_24h.usd * 1000) / 1000;
                let changeClass;
                if (roundedChange > 1.5) {
                    changeClass = 'green';
                } else if (roundedChange >= -1.5 && roundedChange <= 1.5) {
                    changeClass = 'yellow';
                } else {
                    changeClass = 'red';
                }
                newRow.innerHTML = `
                    <td data-label="Name">${coin.name} (${coin.id})</td>
                    <td data-label="Price">$${roundedPrice}</td>
                    <td data-label="Price Change 24h" class="${changeClass}">${roundedChange}%</td>
                    <td data-label="Market Cap">${coin.data.market_cap} </td>
                    <td data-label="Total Volume">${coin.data.total_volume}</td>
                `;
                newRow.addEventListener('click', function() {
                    const coinDetailUrl = `https://api.coingecko.com/api/v3/coins/${coin.id}`;
                    fetch(coinDetailUrl)
                        .then(response => response.json())
                        .then(detailData => {
                            const roundedDetailPrice = Math.round(detailData.market_data.current_price.usd * 1000000) / 1000000;
                            const roundedAth = Math.round(detailData.market_data.ath.usd * 1000000) / 1000000;
                            const roundedAtl = Math.round(detailData.market_data.atl.usd * 1000000) / 1000000;
                            const athDate = new Date(detailData.market_data.ath_date.usd).toLocaleDateString();
                            const atlDate = new Date(detailData.market_data.atl_date.usd).toLocaleDateString();
                            const detailChange24h = detailData.market_data.price_change_percentage_24h.toFixed(2);
                            const detailChange7d = detailData.market_data.price_change_percentage_7d.toFixed(2);
                            const detailChange30d = detailData.market_data.price_change_percentage_30d.toFixed(2);
                            const detailChange1y = detailData.market_data.price_change_percentage_1y.toFixed(2);
                            const getChangeClass = (change) => {
                                if (change > 1.5) return 'green';
                                if (change >= -1.5 && change <= 1.5) return 'yellow';
                                return 'red';
                            };
                            popupContent.innerHTML = `
                                <table>
                                    <tr class="no-highlight">
                                        <td colspan="2" style="text-align: center;">
                                            <img src="${detailData.image.large}" alt="${detailData.name}" style="width: 90px; height: auto;" />
                                            <br><h2>${detailData.name} (${detailData.symbol.toUpperCase()})</h2>
                                        </td>
                                    </tr>
                                    <tr class="no-highlight">
                                        <td>Current Price:</td>
                                        <td><b>$${roundedDetailPrice}</b></td>
                                    </tr>
                                    <tr class="no-highlight">
                                        <td>Rank:</td>
                                        <td><b>${detailData.market_cap_rank}</b></td>
                                    </tr>
                                    <tr class="no-highlight">
                                        <td>All-Time High:</td>
                                        <td><b>$${roundedAth}</b> (on ${athDate})</td>
                                    </tr>
                                    <tr class="no-highlight">
                                        <td>All-Time Low:</td>
                                        <td><b>$${roundedAtl}</b> (on ${atlDate})</td>
                                    </tr>
                                    <tr class="no-highlight">
                                        <td>24h Price Change:</td>
                                        <td class="${getChangeClass(detailChange24h)}"><b>${detailChange24h}%</b></td>
                                    </tr>
                                    <tr class="no-highlight">
                                        <td>7d Price Change:</td>
                                        <td class="${getChangeClass(detailChange7d)}"><b>${detailChange7d}%</b></td>
                                    </tr>
                                    <tr class="no-highlight">
                                        <td>30d Price Change:</td>
                                        <td class="${getChangeClass(detailChange30d)}"><b>${detailChange30d}%</b></td>
                                    </tr>
                                    <tr class="no-highlight">
                                        <td>1y Price Change:</td>
                                        <td class="${getChangeClass(detailChange1y)}"><b>${detailChange1y}%</b></td>
                                    </tr>                                    
                                    <tr class="no-highlight">
                                        <td>Market Cap:</td>
                                        <td><b>$${detailData.market_data.market_cap.usd.toLocaleString()}</b></td>
                                    </tr>
                                    <tr class="no-highlight">
                                        <td>Total Volume:</td>
                                        <td><b>$${detailData.market_data.total_volume.usd.toLocaleString()}</b></td>
                                    </tr>
                                    <tr class="no-highlight">
                                        <td>Max Supply:</td>
                                        <td><b>${detailData.market_data.max_supply}</b></td>
                                    </tr> 
                                    <tr class="no-highlight">
                                        <td>Circulating Supply:</td>
                                        <td><b>${detailData.market_data.circulating_supply.toFixed(2)}</b></td>
                                    </tr>                                    
                                    <tr class="no-highlight">
                                        <td>Official Website:</td>
                                        <td><a href="${detailData.links.homepage[0]}" target="_blank">${detailData.links.homepage[0]}</a></td>
                                    </tr>
                                    <tr class="no-highlight">
                                        <td>X(Twitter):</td>
                                        <td><a href="https://x.com/${detailData.links.twitter_screen_name}" target="_blank">@${detailData.links.twitter_screen_name}</a></td>
                                    </tr>
                                    <tr>
                                     <tr>
                                        <td colspan="2">
                                            <img id="sparkline-img" src="${coin.data.sparkline}" alt="Sparkline" style="width: 100%; height: auto; cursor: pointer;" />
                                        </td>
                                    </tr>
                                </table>
                            `;
                            popupOverlay.style.display = 'block';
                            const sparklineImg = document.getElementById('sparkline-img');
                            sparklineImg.addEventListener('click', function() {
                                graphModal.style.display = 'block';
                                graphModalImg.src = sparklineImg.src;
                            });
                        })
                        .catch(error => console.error('Error fetching detailed data:', error));
                });
                statementBody.appendChild(newRow);
            });
        })
        .catch(error => console.error('Error fetching data:', error));

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

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('Service Worker registered:', registration);
            })
            .catch(function(error) {
                console.log('Service Worker registration failed:', error);
            });
    });
}
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', function(event) {
        event.preventDefault();
        deferredPrompt = event;
        installButton.style.display = 'block';
    });

    function showInstallPrompt() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(function(choiceResult) {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
            });
        }
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
});
