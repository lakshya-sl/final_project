import yfinance as yf
import pandas as pd
import time

# 🌍 Global Stocks (U.S.)
GLOBAL_STOCKS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "ADBE",
    "NFLX", "CRM", "INTC", "AMD", "JNJ", "PFE", "DIS", "BABA", "UBER",
    "PYPL", "SHOP", "PLTR"
]

# 🇮🇳 Reliable Indian Stocks (handpicked)
INDIAN_STOCKS = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "ITC.NS", "HDFCBANK.NS",
    "ICICIBANK.NS", "SBIN.NS", "BAJFINANCE.NS", "HCLTECH.NS",
    "LT.NS", "COALINDIA.NS", "SUNPHARMA.NS", "DIVISLAB.NS",
    "MARUTI.NS", "TATAMOTORS.NS", "IRCTC.NS"
]

# Combine both
STOCK_LIST = GLOBAL_STOCKS + INDIAN_STOCKS

def get_low_risk_stock(input_str: str = "5") -> str:
    try:
        top_n = int("".join([c for c in input_str if c.isdigit()])) or 5
    except:
        top_n = 5

    result = []
    for ticker in STOCK_LIST:
        try:
            info = yf.Ticker(ticker).info
            beta = info.get("beta")
            roe = info.get("returnOnEquity")
            eps = info.get("trailingEps")

            if beta is not None and beta < 1 and roe and roe > 0.1 and eps and eps > 0:
                result.append({
                    "Ticker": ticker,
                    "Beta": round(beta, 2),
                    "ROE": round(roe * 100, 2),
                    "EPS": round(eps, 2)
                })

            time.sleep(0.2)
        except Exception as e:
            print(f"⚠️ Skipping {ticker}: {e}")
            continue

    if not result:
        return "⚠️ Could not find any low-risk stocks."

    df = pd.DataFrame(result).sort_values(by="Beta")
    response = "🛡️ **Top Low-Risk Stocks (Beta < 1, ROE > 10%, EPS > 0):**\n\n"
    for _, row in df.head(top_n).iterrows():
        response += (
            f"🔹 {row['Ticker']} → Beta: {row['Beta']} | "
            f"ROE: {row['ROE']}% | EPS: {row['EPS']}\n"
        )

    return response.strip()
