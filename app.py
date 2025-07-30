from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf

app = Flask(__name__)
CORS(app)

TICKERS = [
    "AAPL", "AMZN", "GOOGL", "MSFT", "TSLA", "META", "NVDA", "ADBE",
    "NFLX", "CRM", "INTC", "AMD", "JNJ", "PFE", "DIS", "BABA", "UBER",
    "PYPL", "SHOP", "PLTR", "RELIANCE.NS", "TCS.NS", "INFY.NS", "ITC.NS",
    "HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "BAJFINANCE.NS", "HCLTECH.NS",
    "LT.NS", "COALINDIA.NS", "SUNPHARMA.NS", "DIVISLAB.NS",
    "MARUTI.NS", "TATAMOTORS.NS", "IRCTC.NS"
]
@app.route('/api/quote')
def get_quote():
    from flask import request
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({"error": "Missing symbol"}), 400
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        price = info.get("regularMarketPrice")
        if price is None:
            raise Exception("Price not available")
        return jsonify({
            "symbol": symbol,
            "price": price
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/api/screener')
def screener():
    try:
        sector_filter = request.args.get('sector', '').lower()
        change_filter = request.args.get('change', '').lower()
        sort_key = request.args.get('sort', '')

        tickers_data = yf.Tickers(" ".join(TICKERS))
        results = []

        for symbol in TICKERS:
            t = tickers_data.tickers.get(symbol)
            if not t: continue

            info = t.info
            price = info.get("regularMarketPrice", 0)
            prev_close = info.get("regularMarketPreviousClose", 0)
            change_percent = 0
            if prev_close:
                change_percent = round(((price - prev_close) / prev_close) * 100, 2)

            sector = info.get("sector", "").lower()

            if sector_filter and sector != sector_filter:
                continue
            if change_filter == 'gainers' and change_percent < 0:
                continue
            if change_filter == 'losers' and change_percent >= 0:
                continue

            results.append({
                "ticker": symbol,
                "price": price,
                "change_percent": change_percent,
                "signal": "Buy" if change_percent > 0 else "Sell",
                "volume": info.get("volume", "--"),
                "market_cap": info.get("marketCap", "--"),
                "pe": info.get("trailingPE", "--"),
                "eps": info.get("trailingEps", "--"),
                "sector": info.get("sector", "Unknown")
            })

        # Sorting
        if sort_key == 'priceAsc':
            results.sort(key=lambda x: x['price'])
        elif sort_key == 'priceDesc':
            results.sort(key=lambda x: -x['price'])
        elif sort_key == 'volume':
            results.sort(key=lambda x: x.get('volume') or 0, reverse=True)
        elif sort_key == 'change':
            results.sort(key=lambda x: x['change_percent'], reverse=True)

        return jsonify(results)

    except Exception as e:
        print("🔥 SERVER ERROR:", e)
        return jsonify({"error": str(e)}), 500

            
        # Sort by ticker
        results.sort(key=lambda x: x['ticker'])

        print("✅ Screener response length:", len(results))
        return jsonify(results)

    except Exception as e:
        print("🔥 SERVER ERROR:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
