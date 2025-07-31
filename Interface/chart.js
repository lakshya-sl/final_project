function showSection(sectionId) {
  const sections = ['charting', 'portfolio', 'screener', 'technical', 'stories'];
  sections.forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');
}

function populateCompanySelect() {
  const companies = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "ADBE",
    "NFLX", "CRM", "INTC", "AMD", "JNJ", "PFE", "DIS", "BABA", "UBER",
    "PYPL", "SHOP", "PLTR", "RELIANCE.NS", "TCS.NS", "INFY.NS", "ITC.NS", "HDFCBANK.NS",
    "ICICIBANK.NS", "SBIN.NS", "BAJFINANCE.NS", "HCLTECH.NS", "LT.NS", "COALINDIA.NS",
    "SUNPHARMA.NS", "DIVISLAB.NS", "MARUTI.NS", "TATAMOTORS.NS", "IRCTC.NS"
  ];

  const select = document.getElementById("companySelect");
  companies.forEach(symbol => {
    const option = document.createElement("option");
    option.value = symbol;
    option.textContent = symbol;
    select.appendChild(option);
  });
}

function applyIndicator() {
  const selectedSymbol = document.getElementById("companySelect").value;
  const formattedSymbol = selectedSymbol.includes(".NS")
    ? `NSE:${selectedSymbol.replace(".NS", "")}`
    : `NASDAQ:${selectedSymbol}`;

  // Get up to 3 selected indicators
  const selectedOptions = Array.from(document.getElementById("indicatorSelect").selectedOptions);
  const selectedStudies = selectedOptions.slice(0, 3).map(opt => {
    switch (opt.value) {
      case "SMA": return "MASimple@tv-basicstudies";
      case "EMA": return "Moving Average Exponential@tv-basicstudies";
      case "MACD": return "MACD@tv-basicstudies";
      case "ADX": return "ADX@tv-basicstudies";
      case "RSI": return "RSI@tv-basicstudies";
      case "StochasticRSI": return "Stochastic RSI@tv-basicstudies";
      case "CCI": return "CCI@tv-basicstudies";
      case "BollingerBands": return "BollingerBands@tv-basicstudies";
      case "ATR": return "ATR@tv-basicstudies";
      case "OBV": return "OBV@tv-basicstudies";
      default: return null;
    }
  }).filter(Boolean);

  const container = document.getElementById("tradingview_advanced_chart");
  container.innerHTML = "";

  new TradingView.widget({
    container_id: "tradingview_advanced_chart",
    symbol: formattedSymbol,
    interval: "D",
    timezone: "Etc/UTC",
    theme: "dark",
    style: 1,
    locale: "en",
    width: "100%",
    height: 600,

    hide_top_toolbar: true,
    hide_legend: false,
    hide_side_toolbar: true,
    withdateranges: true,

    disabled_features: [
      "header_symbol_search",
      "header_compare",
      "header_undo_redo",
      "header_screenshot",
      "header_interval_dialog_button",
      "header_settings",
      "header_fullscreen_button",
      "header_indicators",
      "timeframes_toolbar",
      "control_bar",
      "left_toolbar",
      "show_interval_dialog_on_key_press",
      "main_series_scale_menu",
      "chart_property_page_timezone_sessions"
    ],

    allow_symbol_change: false,
    enable_publishing: false,
    studies: selectedStudies,

    overrides: {
      "mainSeriesProperties.priceLine.visible": true,
      "mainSeriesProperties.priceLine.color": "#FFD700",
      "mainSeriesProperties.priceLine.width": 1,
      "mainSeriesProperties.style": 1,
      "paneProperties.background": "#111",
      "scalesProperties.lineColor": "#888",
    },
  });
}

function openForecastMenu() {
  alert("📈 Forecast feature coming soon!");
}

window.onload = () => {
  populateCompanySelect();
  document.getElementById("companySelect").value = "AAPL"; // Set default
  applyIndicator(); // Show Apple chart
};

let selectedCompany = null;

function openCompanySelector() {
  document.getElementById("companyModal").classList.remove("hidden");
  const list = document.getElementById("companyList");
  list.innerHTML = ""; // Clear before repopulating
  companies.forEach(company => {
    const btn = document.createElement("div");
    btn.className = "company-option";
    btn.textContent = company;
    btn.onclick = () => {
      selectedCompany = company;
      document.getElementById("selectedCompanyLabel").textContent = `Selected: ${company}`;
      loadTradingViewWidgetForSymbol(company);
      closeCompanySelector();
    };
    list.appendChild(btn);
  });

  // Add search filter
  document.getElementById("companySearchInput").addEventListener("input", e => {
    const filter = e.target.value.toLowerCase();
    document.querySelectorAll("#companyList .company-option").forEach(opt => {
      opt.style.display = opt.textContent.toLowerCase().includes(filter) ? "block" : "none";
    });
  });
}

function closeCompanySelector() {
  document.getElementById("companyModal").classList.add("hidden");
  document.getElementById("companySearchInput").value = "";
}
