import yfinance as yf

def get_trending_stocks(_: str = ""):
    symbols = [
        # Indian Stocks
        'HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'AXISBANK.NS', 'KOTAKBANK.NS',
        'BAJFINANCE.NS', 'BAJAJFINSV.NS', 'IDFCFIRSTB.NS', 'PNB.NS', 'BANKBARODA.NS',
        'TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS', 'TECHM.NS',
        'LTIM.NS', 'PERSISTENT.NS', 'COFORGE.NS', 'RELIANCE.NS', 'ONGC.NS',
        'NTPC.NS', 'POWERGRID.NS', 'TATAPOWER.NS', 'ADANIGREEN.NS', 'ADANITRANS.NS',
        'IOC.NS', 'BPCL.NS', 'TATAMOTORS.NS', 'MARUTI.NS', 'EICHERMOT.NS',
        'M&M.NS', 'BAJAJ-AUTO.NS', 'TVSMOTOR.NS', 'ASHOKLEY.NS', 'SUNPHARMA.NS',
        'DRREDDY.NS', 'CIPLA.NS', 'DIVISLAB.NS', 'AUROPHARMA.NS', 'LUPIN.NS',
        'TORNTPHARM.NS', 'HINDUNILVR.NS', 'ITC.NS', 'NESTLEIND.NS', 'BRITANNIA.NS',
        'DABUR.NS', 'MARICO.NS', 'COLPAL.NS', 'TATASTEEL.NS', 'JSWSTEEL.NS',
        'HINDALCO.NS', 'COALINDIA.NS', 'NMDC.NS', 'VEDL.NS', 'ULTRACEMCO.NS',
        'SHREECEM.NS', 'AMBUJACEM.NS', 'ACC.NS', 'LT.NS', 'GRASIM.NS',
        'BHARTIARTL.NS', 'IDEA.NS', 'ZOMATO.NS', 'PAYTM.NS', 'NYKAA.NS',
        'DMART.NS', 'IRCTC.NS',
        # U.S. Stocks
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'NFLX',
        'ADBE', 'INTC', 'AMD', 'CRM', 'PYPL', 'UBER', 'SHOP', 'SNOW',
        'PLTR', 'BABA', 'JNJ', 'PFE', 'DIS'
    ]

    result = []
    for sym in symbols:
        try:
            stock = yf.Ticker(sym)
            info = stock.info
            name = info.get("shortName", sym)
            price = info.get("regularMarketPrice", None)
            change = info.get("regularMarketChangePercent", None)

            if price is not None and change is not None:
                result.append({
                    "symbol": sym,
                    "name": name,
                    "price": price,
                    "change": change
                })
        except Exception:
            continue

    # Separate Indian and US
    indian = [s for s in result if ".NS" in s["symbol"]]
    us = [s for s in result if ".NS" not in s["symbol"]]

    # Sort and get top stocks
    top_indian = sorted(indian, key=lambda x: x["change"], reverse=True)[:3]
    top_us = sorted(us, key=lambda x: x["change"], reverse=True)[:2]

    # Prepare output as plain text
    output = "📊 Trending Stocks Today:\n\n"

    output += "🇮🇳 Top 3 Indian Stocks:\n"
    for i, stock in enumerate(top_indian, start=1):
        emoji = "📈" if stock["change"] > 0 else "📉"
        output += f"{i}. {emoji} {stock['name']} – ₹{stock['price']} ({round(stock['change'], 2)}%)\n"

    output += "\n🇺🇸 Top 2 U.S. Stocks:\n"
    for i, stock in enumerate(top_us, start=1):
        emoji = "📈" if stock["change"] > 0 else "📉"
        output += f"{i}. {emoji} {stock['name']} – ${stock['price']} ({round(stock['change'], 2)}%)\n"

    return output.strip()


if __name__ == "__main__":
    print(get_trending_stocks())
