


function toggleChat() {
  const chat = document.getElementById('chatWindow');
  chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const chatBody = document.getElementById('chatBody');
  const typingIndicator = document.getElementById('typingIndicator');

  const message = input.value.trim();
  if (message === '') return;

  // Show user's message
  const userMsg = document.createElement('div');
  userMsg.classList.add('chat-message', 'user');
  userMsg.textContent = message;
  chatBody.appendChild(userMsg);
  input.value = '';
  chatBody.scrollTop = chatBody.scrollHeight;

  // Show typing
  typingIndicator.style.display = 'block';

  try {
    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message })
    });

    const data = await response.json();
    console.log("Bot response:", data);

    const botMsg = document.createElement('div');
    botMsg.classList.add('chat-message', 'bot');

    let formatted = data.response
      .replace(/\n/g, "\n")
      .replace(/\*\*(.*?)\*\*/g, "$1"); // Optional markdown bold cleanup

    botMsg.textContent = formatted;
    chatBody.appendChild(botMsg);
    chatBody.scrollTop = chatBody.scrollHeight;
  } catch (err) {
    console.error("Fetch error:", err);
    const errorMsg = document.createElement('div');
    errorMsg.classList.add('chat-message', 'bot');
    errorMsg.textContent = "Something went wrong.";
    chatBody.appendChild(errorMsg);
  } finally {
    typingIndicator.style.display = 'none';
  }
}


// Send on Enter key press
document.getElementById('userInput').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

async function loadPortfolio() {
  try {
    const res = await fetch('https://api.twelvedata.com/time_series?symbol=AAPL&interval=1day&outputsize=30&apikey=1901c3f6f2a547989034900aa84a2aa6');
    const data = await res.json();

    const table = document.getElementById('portfolioTable');
    const totalBalanceElem = document.getElementById('totalBalance');
    const totalPnLElem = document.getElementById('totalPnL');

    let totalBalance = 0;
    let totalPnL = 0;

    table.innerHTML = "";

    data.forEach((item, index) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-700 transition';

      const profitLoss = (item.livePrice - item.priceAtTransaction) * item.quantity;
      totalBalance += item.livePrice * item.quantity;
      totalPnL += profitLoss;

      row.innerHTML = `
        <td class="p-3">${index + 1}</td>
        <td class="p-3 text-blue-400">${item.symbol}</td>
        <td class="p-3">${item.name}</td>
        <td class="p-3">${item.orderType}</td>
        <td class="p-3">${item.orderMode}</td>
        <td class="p-3">${item.quantity}</td>
        <td class="p-3">$${item.priceAtTransaction.toFixed(2)}</td>
        <td class="p-3 text-green-400">$${item.livePrice.toFixed(2)}</td>
        <td class="p-3 text-${profitLoss >= 0 ? 'green' : 'red'}-400">$${profitLoss.toFixed(2)}</td>
        <td class="p-3">${item.datetime}</td>
      `;

      table.appendChild(row);
    });

    totalBalanceElem.textContent = `$${totalBalance.toFixed(2)}`;
    totalPnLElem.textContent = `$${totalPnL.toFixed(2)}`;
    totalPnLElem.className = totalPnL >= 0 ? 'text-green-400' : 'text-red-400';
  } catch (err) {
    console.error('Error loading portfolio data:', err);
  }
}

function showSection(sectionId) {
  const sections = ['charting', 'portfolio', 'screener', 'technical', 'stories'];
  sections.forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');

  if (sectionId === 'portfolio') loadPortfolio();
  if (sectionId === 'charting') loadTradingViewWidget();
}
