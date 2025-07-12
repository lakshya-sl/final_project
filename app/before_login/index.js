 document.querySelectorAll('nav a').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        window.scrollTo({
          top: targetSection.offsetTop,
          behavior: 'smooth'
        });
      });
    });
    
   
    document.querySelectorAll('.feature-card').forEach((card, index) => {
      card.style.transitionDelay = `${index * 0.1}s`;
    });
    
    
    function resizeVideo() {
      const video = document.querySelector('.video-bg');
      const aspectRatio = 16/9;
      
      if (window.innerWidth / window.innerHeight > aspectRatio) {
        video.style.width = '100%';
        video.style.height = 'auto';
      } else {
        video.style.width = 'auto';
        video.style.height = '100%';
      }
    }
    
    function toggleChat() {
      const chat = document.getElementById('chatWindow');
      const video = chat.querySelector('.chat-bg-video');

      const isVisible = chat.style.display === 'flex';

      chat.style.display = isVisible ? 'none' : 'flex';

      if (video) {
        if (isVisible) {
          video.pause();
        } else {
          video.play();
        }
      }
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
     document.getElementById('userInput').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          event.preventDefault(); // Prevents default behavior like adding a new line
          sendMessage();
        }
      });
    window.addEventListener('load', resizeVideo);
    window.addEventListener('resize', resizeVideo);