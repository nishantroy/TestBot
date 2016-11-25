# TestBot

Listens to all messages:

- "Weather [location]": Returns the current weather at [location]
- Stock:
  - "Stock [symbol]": Returns the current price for [symbol]
  - "Stock history [symbol] [date]": Returns the closing price for every day since the given date for [symbol]
  - "Stock track [symbol] [threshold]": Keeps track of [symbol] and tells you when it's price is below [threshold]
  - "Stock check": Checks the prices of all the stocks you asked it to track, and tells you if any are below their threshold.
- Otherwise, it will greet the user and echo his/her message.
