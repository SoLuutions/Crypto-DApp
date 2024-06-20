async function fetchCryptoData() {
    const cryptos = [
        { id: 'bitcoin', className: 'pricechangeBTC' },
        { id: 'ethereum', className: 'pricechangeETH' },
        { id: 'tether', className: 'pricechangeUSDT' },
        { id: 'binancecoin', className: 'pricechangeBNB' },
        { id: 'solana', className: 'pricechangeSOL' },
        { id: 'dogecoin', className: 'pricechangeDOGE' }
    ];

    for (let crypto of cryptos) {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${crypto.id}`);
            const data = await response.json();
            
            // Extract the 1-hour percentage change in USD
            const priceChange = data.market_data.price_change_percentage_1h_in_currency.usd;
            
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
        } catch (error) {
            console.error(`Error fetching data for ${crypto.id}:`, error);
        }
    }
}

fetchCryptoData();