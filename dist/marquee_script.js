async function fetchCryptoData() {
    const cryptos = [
        { id: 'bitcoin', className: 'pricechangeBTC' },
        { id: 'ethereum', className: 'pricechangeETH' },
        { id: 'tether', className: 'pricechangeUSDT' },
        { id: 'binancecoin', className: 'pricechangeBNB' },
        { id: 'solana', className: 'pricechangeSOL' },
        { id: 'dogecoin', className: 'pricechangeDOGE' }
    ];

    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&page=1&per_page=30&sparkline=true');
        const data = await response.json();
        
        cryptos.forEach(crypto => {
            const coinData = data.find(d => d.id === crypto.id);
            
            if (coinData) {
                // Extract the 24-hour percentage change in USD
                const priceChange = coinData.price_change_percentage_24h;

                // Select all elements with the specified class name
                const priceChangeElements = document.getElementsByClassName(crypto.className);

                // Loop through each element and update its content
                Array.from(priceChangeElements).forEach(element => {
                    element.textContent = ` ${priceChange.toFixed(2)}%`;
                    if (priceChange > 0) {
                        element.classList.add('pricechange-positive');
                        element.classList.remove('pricechange-negative');
                    } else {
                        element.classList.add('pricechange-negative');
                        element.classList.remove('pricechange-positive');
                    }
                });
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchCryptoData();
