let currentNewsPage = 1;
// Mapping dropdown indicators to TradingView codes
const indicatorMap = {
  "SMA": "MASimple@tv-basicstudies",
  "EMA": "MAExp@tv-basicstudies",
  "MACD": "MACD@tv-basicstudies",
  "ADX": "ADX@tv-basicstudies",
  "RSI": "RSI@tv-basicstudies",
  "Stochastic Oscillator": "StochasticRSI@tv-basicstudies",
  "CCI": "CCI@tv-basicstudies",
  "Bollinger Bands": "BollingerBands@tv-basicstudies",
  "ATR": "ATR@tv-basicstudies",
  "OBV": "OBV@tv-basicstudies",
  "Chaikin Money Flow": "CMF@tv-basicstudies"
};

let selectedIndicators = []; // Will store applied indicators

const newsPerPage = 10; // Number of news items to load per request
let portfolioData = []; // Store user trades


function toggleChat() {
  const chat = document.getElementById('chatWindow');
  chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
}

function sendMessage() {
  const input = document.getElementById('userInput');
  const chatBody = document.getElementById('chatBody');
  const typingIndicator = document.getElementById('typingIndicator');

  const message = input.value.trim();
  if (message === '') return;

  const userMsg = document.createElement('p');
  userMsg.innerHTML = `<strong>You:</strong> ${message}`;
  chatBody.appendChild(userMsg);
  input.value = '';
  chatBody.scrollTop = chatBody.scrollHeight;

  typingIndicator.style.display = 'block';

  setTimeout(() => {
    typingIndicator.style.display = 'none';
    const botMsg = document.createElement('p');
    botMsg.innerHTML = `<strong>Bot:</strong> Sorry, I'm currently unable to respond.`;
    chatBody.appendChild(botMsg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }, 1500);
}
document.getElementById('userInput').addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevents default behavior like adding a new line
    sendMessage();
  }
});

async function loadPortfolio() {
  const table = document.getElementById('portfolioTable');
  const totalBalanceElem = document.getElementById('totalBalance');
  const totalPnLElem = document.getElementById('totalPnL');

  let totalBalance = 0;
  let totalPnL = 0;

  table.innerHTML = "";

  for (let i = 0; i < portfolioData.length; i++) {
    const item = portfolioData[i];

    try {
      // Fetch live price for the stock
      const res = await fetch(`https://api.twelvedata.com/price?symbol=${item.symbol}&apikey=1901c3f6f2a547989034900aa84a2aa6`);
      const priceData = await res.json();

      const livePrice = parseFloat(priceData.price);
      const profitLoss = (livePrice - item.priceAtTransaction) * item.quantity;

      totalBalance += livePrice * item.quantity;
      totalPnL += profitLoss;

      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-700 transition';

      row.innerHTML = `
              <td class="p-3">${i + 1}</td>
              <td class="p-3 text-blue-400">${item.symbol}</td>
              <td class="p-3">${item.name}</td>
              <td class="p-3">${item.orderType}</td>
              <td class="p-3">${item.orderMode}</td>
              <td class="p-3">${item.quantity}</td>
              <td class="p-3">$${item.priceAtTransaction.toFixed(2)}</td>
              <td class="p-3 text-green-400">$${livePrice.toFixed(2)}</td>
              <td class="p-3 text-${profitLoss >= 0 ? 'green' : 'red'}-400">$${profitLoss.toFixed(2)}</td>
              <td class="p-3">${item.datetime}</td>
            `;

      table.appendChild(row);
    } catch (err) {
      console.error(`Error fetching live price for ${item.symbol}:`, err);
    }
  }

  totalBalanceElem.textContent = `$${totalBalance.toFixed(2)}`;
  totalPnLElem.textContent = `$${totalPnL.toFixed(2)}`;
  totalPnLElem.className = totalPnL >= 0 ? 'text-green-400' : 'text-red-400';
}

function recordTrade() {
  const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
  const quantity = parseFloat(document.getElementById('qtyInput').value);
  const price = parseFloat(document.getElementById('priceInput').value);
  const orderType = document.getElementById('orderTypeInput').value;
  const now = new Date().toLocaleString();

  if (!symbol || !quantity || !price) return alert('Please fill all fields');

  // Simulate live price via small fluctuation
  const livePrice = price * (Math.random() * 0.1 + 0.95);

  portfolioData.push({
    symbol,
    name: symbol, // optional name
    quantity,
    priceAtTransaction: price,
    livePrice,
    orderType,
    orderMode: "Market",
    datetime: now
  });

  loadPortfolio(); // Refresh table
}

// Update the loadTopStories function
async function loadTopStories(page = 1, limit = 10) {
  try {
    const response = await fetch(`http://localhost:5000/api/news?page=${page}&limit=${limit}`);
    const stories = await response.json();

    const storiesContainer = document.getElementById('storiesContent');

    if (page === 1) {
      storiesContainer.innerHTML = '';
    }

    stories.forEach(story => {
      const timeAgo = formatTimeAgo(new Date(story.publishedAt));
      const ticker = story.ticker || 'GEN';

      const storyEl = document.createElement('div');
      storyEl.className = 'story-card p-4 mb-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition cursor-pointer';
      storyEl.innerHTML = `
        <div class="flex flex-col sm:flex-row gap-4">
          <img src="${story.imageUrl || 'https://via.placeholder.com/150'}"
              alt="news image"
              class="w-full sm:w-48 h-32 object-cover rounded-lg mb-2 sm:mb-0">
          <div class="flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs text-gray-400">${timeAgo}</span>
                <span class="text-xs font-semibold bg-blue-500 px-2 py-1 rounded">${ticker}</span>
              </div>
              <h3 class="text-lg font-semibold mb-2">${story.title}</h3>
              <p class="text-sm text-gray-300 mb-2">${story.description || ''}</p>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-400">${story.source}</span>
              <a href="${story.url}" target="_blank" class="text-xs text-blue-400 hover:underline">Read more</a>
            </div>
          </div>
        </div>
      `;
      storiesContainer.appendChild(storyEl);
    });

    // Hide load more button if we've reached the end
    if (stories.length < limit) {
      document.getElementById('loadMoreStoriesBtn').style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading stories:', error);
  }
}
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;

  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;

  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;

  return `${Math.floor(seconds)} second${seconds === 1 ? '' : 's'} ago`;
}

function extractTicker(title) {
  const tickerPattern = /[A-Z]{2,5}/g;
  const matches = title.match(tickerPattern);
  return matches ? matches[0] : null;
}

// Update showSection function
function showSection(sectionId) {
  // Hide default widget when any section is opened
  document.getElementById("default-widget").style.display = "none";

  // Hide all sections first
  document.querySelectorAll('#charting, #portfolio, #screener, #technical, #stories')
    .forEach(section => section.classList.add('hidden'));

  // Show the selected section
  document.getElementById(sectionId).classList.remove('hidden');


  if (sectionId === 'portfolio') loadPortfolio();
  if (sectionId === 'charting') loadTradingViewWidget();
  if (sectionId === 'stories') loadTopStories();
}

document.getElementById('loadMoreStoriesBtn').addEventListener('click', () => {
  currentNewsPage++;
  loadTopStories(currentNewsPage);
});
async function placeOrderFromChart() {
  const symbol = document.getElementById('chartSymbolInput').value.trim().toUpperCase();
  const quantity = parseFloat(document.getElementById('chartQtyInput').value);
  const orderType = document.getElementById('chartOrderTypeInput').value;
  const now = new Date().toLocaleString();

  if (!symbol || !quantity) return alert('Please enter symbol and quantity');

  try {
    const res = await fetch(`https://api.twelvedata.com/price?symbol=${symbol}&apikey=1901c3f6f2a547989034900aa84a2aa6`);
    const data = await res.json();

    if (!data.price) {
      alert('Could not fetch live price. Check symbol.');
      return;
    }

    const price = parseFloat(data.price);

    portfolioData.push({
      symbol,
      name: symbol,
      quantity,
      priceAtTransaction: price,
      livePrice: price,
      orderType,
      orderMode: "Market",
      datetime: now
    });

    alert(`${orderType} Order placed for ${symbol} at $${price.toFixed(2)}`);
    loadPortfolio(); // Refresh portfolio
  } catch (err) {
    console.error("Error placing order:", err);
    alert('Error placing order');
  }
}

// Profile Dropdown Toggle
document.getElementById('profileDropdownBtn').addEventListener('click', () => {
  const menu = document.getElementById('profileDropdownMenu');
  menu.classList.toggle('show'); // animate using CSS
  menu.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
  const btn = document.getElementById('profileDropdownBtn');
  const menu = document.getElementById('profileDropdownMenu');
  if (!btn.contains(event.target) && !menu.contains(event.target)) {
    menu.classList.add('hidden');
    menu.classList.remove('show');
  }
});
// Open & close modal
function openCompanySelector() {
  document.getElementById('companyModal').classList.remove('hidden');
}
function closeCompanySelector() {
  document.getElementById('companyModal').classList.add('hidden');
}

// Full company list
const companies = [
  { name: "Apple", symbol: "AAPL" },
  { name: "Amazon", symbol: "AMZN" },
  { name: "Alphabet (Google)", symbol: "GOOGL" },
  { name: "Microsoft", symbol: "MSFT" },
  { name: "Tesla", symbol: "TSLA" },
  { name: "Meta Platforms", symbol: "META" },
  { name: "NVIDIA", symbol: "NVDA" },
  { name: "Adobe", symbol: "ADBE" },
  { name: "Netflix", symbol: "NFLX" },
  { name: "Salesforce", symbol: "CRM" },
  { name: "Intel", symbol: "INTC" },
  { name: "AMD", symbol: "AMD" },
  { name: "Johnson & Johnson", symbol: "JNJ" },
  { name: "Pfizer", symbol: "PFE" },
  { name: "Disney", symbol: "DIS" },
  { name: "Alibaba", symbol: "BABA" },
  { name: "Uber", symbol: "UBER" },
  { name: "PayPal", symbol: "PYPL" },
  { name: "Shopify", symbol: "SHOP" },
  { name: "Palantir", symbol: "PLTR" },
  { name: "Reliance Industries", symbol: "RELIANCE.NS" },
  { name: "TCS", symbol: "TCS.NS" },
  { name: "Infosys", symbol: "INFY.NS" },
  { name: "ITC", symbol: "ITC.NS" },
  { name: "HDFC Bank", symbol: "HDFCBANK.NS" },
  { name: "ICICI Bank", symbol: "ICICIBANK.NS" },
  { name: "State Bank of India", symbol: "SBIN.NS" },
  { name: "Bajaj Finance", symbol: "BAJFINANCE.NS" },
  { name: "HCL Technologies", symbol: "HCLTECH.NS" },
  { name: "Larsen & Toubro", symbol: "LT.NS" },
  { name: "Coal India", symbol: "COALINDIA.NS" },
  { name: "Sun Pharma", symbol: "SUNPHARMA.NS" },
  { name: "Divi's Labs", symbol: "DIVISLAB.NS" },
  { name: "Maruti Suzuki", symbol: "MARUTI.NS" },
  { name: "Tata Motors", symbol: "TATAMOTORS.NS" },
  { name: "IRCTC", symbol: "IRCTC.NS" }
];

const companyListDiv = document.getElementById('companyList');
const searchInput = document.getElementById('companySearchInput');

function renderCompanyList(filter = '') {
  companyListDiv.innerHTML = '';
  companies
    .filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.symbol.toLowerCase().includes(filter.toLowerCase()))
    .forEach(c => {
      const div = document.createElement('div');
      div.className = "company-option";
      div.textContent = `${c.name} (${c.symbol})`;
      div.onclick = () => selectCompany(c.symbol, c.name);
      companyListDiv.appendChild(div);
    });
}
searchInput.addEventListener('input', (e) => renderCompanyList(e.target.value));

let selectedSymbol = "AAPL";

function selectCompany(symbol, name) {
  selectedSymbol = symbol;
  document.getElementById('selectCompanyBtn').innerText = `${name} (${symbol})`; // Change button text
  loadTradingViewChart(symbol); // Immediately load chart
  closeCompanySelector(); // Close modal
}

// Directly load chart
function loadTradingViewChart(symbol) {
  document.getElementById('tradingview_advanced_chart').innerHTML = "";
  new TradingView.widget({
    "container_id": "tradingview_advanced_chart",
    "width": "100%",
    "height": 600,
    "symbol": symbol,
    "interval": "D",
    "timezone": "Etc/UTC",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "toolbar_bg": "#1f2937",
    "enable_publishing": false,
    "allow_symbol_change": true,
    "withdateranges": true,
    "hide_side_toolbar": false,
    "studies": [],
    "support_host": "https://www.tradingview.com",
    "details": true,
    "hotlist": true,
    "calendar": true
  });
}

// Initial render
renderCompanyList();

function applyIndicator() {
  const selected = document.getElementById('indicatorSelect').value;
  if (!selected || selected === "Select Indicator") return;

  const study = indicatorMap[selected];
  if (study && !selectedIndicators.includes(study)) {
    selectedIndicators.push(study);  // Add new study
    loadTradingViewChart(selectedSymbol);  // Reload chart with all studies
  }
}

// Toggle the Period dropdown
document.getElementById('periodDropdownBtn').addEventListener('click', () => {
  const menu = document.getElementById('periodDropdownMenu');
  menu.classList.toggle('hidden');
});

// Close Period dropdown on outside click
document.addEventListener('click', (event) => {
  const btn = document.getElementById('periodDropdownBtn');
  const menu = document.getElementById('periodDropdownMenu');
  if (!btn.contains(event.target) && !menu.contains(event.target)) {
    menu.classList.add('hidden');
  }
});

// Store selected forecast period and company
let selectedTicker = "AAPL";     // Default company
let forecastPeriod = 30;         // Default forecast period (in days)

// Set forecast period from dropdown
function setForecastPeriod(days) {
  forecastPeriod = parseInt(days);
  document.getElementById("periodDropdownBtn").textContent = `${days} Days`;
  document.getElementById("periodDropdownMenu").classList.add("hidden");
}

// Open company selection modal
function openCompanySelector() {
  document.getElementById("companyModal").classList.remove("hidden");
}

// Close company selection modal
function closeCompanySelector() {
  document.getElementById("companyModal").classList.add("hidden");
}

// Called when a company is selected in modal
function selectCompany(ticker) {
  selectedTicker = ticker;
  document.getElementById("selectedCompany").textContent = ticker;
  closeCompanySelector();
}

// Called when "Apply" button is clicked
async function fetchForecast() {
  if (!selectedTicker || !forecastPeriod) {
    alert("Please select a company and forecast period.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/forecast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker: selectedTicker,
        period: forecastPeriod
      })
    });

    if (!response.ok) {
      alert("Failed to fetch forecast.");
      return;
    }

    const data = await response.json();
    drawForecastChart(data);
  } catch (error) {
    console.error("Error fetching forecast:", error);
    alert("Something went wrong while fetching forecast.");
  }
}


// Draw Plotly Forecast Chart
function drawForecastChart(forecastData) {
  const labels = forecastData.map(item => item.ds);
  const values = forecastData.map(item => item.yhat);

  const trace = {
    x: labels,
    y: values,
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Forecasted Price',
    line: {
      color: 'skyblue'
    },
    marker: {
      color: 'lightblue'
    }
  };

  const layout = {
    title: {
      text: `${selectedTicker} - ${forecastPeriod} Day Forecast`,
      font: {
        color: 'white'
      }
    },
    plot_bgcolor: '#1F2937',
    paper_bgcolor: '#1F2937',
    font: {
      color: 'white'
    },
    xaxis: {
      title: 'Date'
    },
    yaxis: {
      title: 'Forecasted Price'
    }
  };

  Plotly.newPlot('forecastChart', [trace], layout, { responsive: true });
}

// Automatically fetch forecast on page load with default values
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("selectedCompany").textContent = selectedTicker;
  document.getElementById("periodDropdownBtn").textContent = `${forecastPeriod} Days`;
  fetchForecast();
});