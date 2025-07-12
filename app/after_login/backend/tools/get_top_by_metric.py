import yfinance as yf
from datetime import datetime, timedelta

symbols = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "ADBE",
    "NFLX", "CRM", "INTC", "AMD", "JNJ", "PFE", "DIS", "BABA", "UBER",
    "PYPL", "SHOP", "PLTR", "RELIANCE.NS", "TCS.NS", "INFY.NS", "ITC.NS", "HDFCBANK.NS",
    "ICICIBANK.NS", "SBIN.NS", "BAJFINANCE.NS", "HCLTECH.NS",
    "LT.NS", "COALINDIA.NS", "SUNPHARMA.NS", "DIVISLAB.NS",
    "MARUTI.NS", "TATAMOTORS.NS", "IRCTC.NS"
]

# 🔧 Main metric extractor
def get_top_by_metric(metric: str = "return", period_days: int = 7, top_n: int = 5, reverse: bool = True) -> str:
    result = []
    metric = metric.lower()
    end_date = datetime.now()
    start_date = end_date - timedelta(days=period_days + 1)

    for sym in symbols:
        try:
            stock = yf.Ticker(sym)
            info = stock.info
            if not info or "shortName" not in info:
                print(f"⚠️ No info found for: {sym}")
                continue

            if metric == "return":
                hist = stock.history(start=start_date.strftime("%Y-%m-%d"), end=end_date.strftime("%Y-%m-%d"))
                if hist.empty or len(hist) < 2:
                    continue
                old_price = hist["Close"].iloc[0]
                new_price = hist["Close"].iloc[-1]
                value = ((new_price - old_price) / old_price) * 100
                result.append({"symbol": sym, "value": round(value, 2)})

            elif metric == "roe":
                value = info.get("returnOnEquity")
                if value is not None:
                    result.append({"symbol": sym, "value": round(value * 100, 2)})

            elif metric == "eps":
                value = info.get("trailingEps")
                if value is not None:
                    result.append({"symbol": sym, "value": round(value, 2)})

            elif metric == "pe_ratio":
                value = info.get("trailingPE")
                if value is not None:
                    result.append({"symbol": sym, "value": round(value, 2)})

            else:
                return f"❌ Metric '{metric}' not supported."

        except Exception:
            continue

    if not result:
        return f"⚠️ No data found for metric '{metric}'."

    sorted_result = sorted(result, key=lambda x: x["value"], reverse=reverse)

    label_map = {
        "return": f"{period_days}-day Return (%)",
        "roe": "Return on Equity (%)",
        "eps": "Earnings per Share (EPS)",
        "pe_ratio": "P/E Ratio",
        "dividend_yield": "Dividend Yield (%)"
    }
    response = f"<b>📊 Top {top_n} stocks by {label_map.get(metric, metric)}:</b><br>"
    for i, item in enumerate(sorted_result[:top_n], start=1):
        response += f"{i}. {item['symbol']} – {item['value']}%<br>"


    return response


# ✅ LangChain-compatible input parser
def get_top_by_metric_wrapper(user_input: str) -> str:
    """
    Maps natural language + keyword input to get_top_by_metric().
    Input example: 'metric=roe, top_n=3, reverse=true'
    """
    metric = "return"
    period_days = 7
    top_n = 5
    reverse = True

    try:
        cleaned = user_input.replace(" ", "").lower()

        # 🔁 Fuzzy keyword mapping
        if "profit" in cleaned or "profitable" in cleaned:
            metric = "roe"
        elif "eps" in cleaned or "earning" in cleaned:
            metric = "eps"
        elif "pe" in cleaned:
            metric = "pe_ratio"
        elif "return" in cleaned:
            metric = "return"

        # Override with key=value if present
        for part in cleaned.split(","):
            if "metric=" in part:
                metric = part.split("=")[1]
            elif "top_n=" in part:
                top_n = int(part.split("=")[1])
            elif "reverse=" in part:
                reverse = part.split("=")[1] == "true"
            elif "period_days=" in part:
                period_days = int(part.split("=")[1])

        return get_top_by_metric(metric=metric, period_days=period_days, top_n=top_n, reverse=reverse)

    except Exception as e:
        return f"❌ Error parsing input: {e}"


# ✅ Direct CLI testing
if __name__ == "__main__":
    print("\n🔹 Top 5 stocks by 7-day return")
    print(get_top_by_metric(metric="return", period_days=7, top_n=5))

    print("\n🔹 Top 5 stocks by ROE")
    print(get_top_by_metric(metric="roe", top_n=5))

    print("\n🔹 Top 5 stocks by EPS")
    print(get_top_by_metric(metric="eps", top_n=5))

    print("\n🔹 Top 5 stocks with best dividend yield")
    print(get_top_by_metric(metric="dividend_yield", top_n=5))

    print("\n🔹 Top 5 stocks with lowest P/E ratio")
    print(get_top_by_metric(metric="pe_ratio", top_n=5, reverse=False))



# import yfinance as yf
# from datetime import datetime, timedelta

# symbols = [
#     "AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "ADBE",
#     "NFLX", "CRM", "INTC", "AMD", "JNJ", "PFE", "DIS", "BABA", "UBER",
#     "PYPL", "SHOP", "PLTR",  "RELIANCE.NS", "TCS.NS", "INFY.NS", "ITC.NS", "HDFCBANK.NS",
#     "ICICIBANK.NS", "SBIN.NS", "BAJFINANCE.NS", "HCLTECH.NS",
#     "LT.NS", "COALINDIA.NS", "SUNPHARMA.NS", "DIVISLAB.NS",
#     "MARUTI.NS", "TATAMOTORS.NS", "IRCTC.NS"
# ]

# # 🔧 Main metric extractor
# def get_top_by_metric(metric: str = "return", period_days: int = 7, top_n: int = 5, reverse: bool = True) -> str:
#     result = []
#     metric = metric.lower()
#     end_date = datetime.now()
#     start_date = end_date - timedelta(days=period_days + 1)

#     for sym in symbols:
#         try:
#             stock = yf.Ticker(sym)
#             info = stock.info
#             if not info or "shortName" not in info:
#                 print(f"⚠️ No info found for: {sym}")
#                 continue

#             if metric == "return":
#                 hist = stock.history(start=start_date.strftime("%Y-%m-%d"), end=end_date.strftime("%Y-%m-%d"))
#                 if hist.empty or len(hist) < 2:
#                     continue
#                 old_price = hist["Close"].iloc[0]
#                 new_price = hist["Close"].iloc[-1]
#                 value = ((new_price - old_price) / old_price) * 100
#                 result.append({"symbol": sym, "value": round(value, 2)})

#             elif metric == "roe":
#                 value = info.get("returnOnEquity")
#                 if value is not None:
#                     result.append({"symbol": sym, "value": round(value * 100, 2)})

#             elif metric == "eps":
#                 value = info.get("trailingEps")
#                 if value is not None:
#                     result.append({"symbol": sym, "value": round(value, 2)})

#             elif metric == "pe_ratio":
#                 value = info.get("trailingPE")
#                 if value is not None:
#                     result.append({"symbol": sym, "value": round(value, 2)})

#             else:
#                 return f"❌ Metric '{metric}' not supported."

#         except Exception:
#             continue

#     if not result:
#         return f"⚠️ No data found for metric '{metric}'."

#     sorted_result = sorted(result, key=lambda x: x["value"], reverse=reverse)

#     label_map = {
#         "return": f"{period_days}-day Return (%)",
#         "roe": "Return on Equity (%)",
#         "eps": "Earnings per Share (EPS)",
#         "pe_ratio": "P/E Ratio",
#         "dividend_yield": "Dividend Yield (%)"
#     }

#     response = f"📊 Top {top_n} stocks by {label_map.get(metric, metric)}:<br>"
#     for i, item in enumerate(sorted_result[:top_n], start=1):
#         response += f"{i}. {item['symbol']} – {item['value']}%<br>"

#     return response


# # ✅ LangChain-compatible input parser
# def get_top_by_metric_wrapper(user_input: str) -> str:
#     """
#     Maps natural language + keyword input to get_top_by_metric().
#     Input example: 'metric=roe, top_n=3, reverse=true'
#     """
#     metric = "return"
#     period_days = 7
#     top_n = 5
#     reverse = True

#     try:
#         cleaned = user_input.replace(" ", "").lower()

#         # 🔁 Fuzzy keyword mapping
#         if "profit" in cleaned or "profitable" in cleaned:
#             metric = "roe"
#         elif "eps" in cleaned or "earning" in cleaned:
#             metric = "eps"
#         elif "pe" in cleaned:
#             metric = "pe_ratio"
#         elif "return" in cleaned:
#             metric = "return"

#         # Override with key=value if present
#         for part in cleaned.split(","):
#             if "metric=" in part:
#                 metric = part.split("=")[1]
#             elif "top_n=" in part:
#                 top_n = int(part.split("=")[1])
#             elif "reverse=" in part:
#                 reverse = part.split("=")[1] == "true"
#             elif "period_days=" in part:
#                 period_days = int(part.split("=")[1])

#         return get_top_by_metric(metric=metric, period_days=period_days, top_n=top_n, reverse=reverse)

#     except Exception as e:
#         return f"❌ Error parsing input: {e}"


# # ✅ Direct CLI testing
# if __name__ == "__main__":
#     print("\n🔹 Top 5 stocks by 7-day return")
#     print(get_top_by_metric(metric="return", period_days=7, top_n=5))

#     print("\n🔹 Top 5 stocks by ROE")
#     print(get_top_by_metric(metric="roe", top_n=5))

#     print("\n🔹 Top 5 stocks by EPS")
#     print(get_top_by_metric(metric="eps", top_n=5))

#     print("\n🔹 Top 5 stocks with best dividend yield")
#     print(get_top_by_metric(metric="dividend_yield", top_n=5))

#     print("\n🔹 Top 5 stocks with lowest P/E ratio")
#     print(get_top_by_metric(metric="pe_ratio", top_n=5, reverse=False))
