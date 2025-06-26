let consciencias = [];
let visitanteId = localStorage.getItem('visitanteId') || Math.random().toString(36).substring(2);
localStorage.setItem('visitanteId', visitanteId);

async function loadConsciencias() {
  try {
    const res = await fetch('/api/consciencias');
    const consList = await res.json();
    consciencias = consList;
    renderCards();
  } catch (e) {
    console.error("Erro ao carregar ConsciêncIAs:", e);
  }
}

function renderCards() {
  const container = document.getElementById('cards-projetos');
  container.innerHTML = "";
  consciencias.forEach(cons => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h2>${cons.title}</h2>
      <div class='resumo'>${cons.description}</div>
      <button class='testar-btn' data-conscia='${cons.id}'>Testar Agora</button>
      <div class='formulario' style='display:none; margin-top: 10px;'>
        <input type='text' placeholder='Nome (opcional)' class='nome-input'><br><br>
        <input type='text' placeholder='E-mail ou WhatsApp' class='contato-input'><br><br>
        <button class='enviar-interesse-btn'>Enviar e Iniciar Chat</button>
        <div class='msg-interesse' style='color:green; margin-top:5px;'></div>
      </div>
      <div class='chatbox' style='display:none; margin-top: 10px;'>
        <div class='chatlog' style='max-height:150px; overflow-y:auto; border:1px solid #ccc; padding:10px; margin-bottom:5px;'></div>
        <input type='text' class='chatInput' placeholder='Digite sua pergunta...' style='width:70%; padding:5px;'>
        <button class='sendChat'>Enviar</button>
        <button class='closeChat'>Fechar</button>
      </div>
    `;
    container.appendChild(card);
  });
  setupButtons();
}

function setupButtons() {
  document.querySelectorAll('.testar-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.style.display = 'none';
      btn.nextElementSibling.style.display = 'block';
    });
  });

  document.querySelectorAll('.enviar-interesse-btn').forEach((btn, idx) => {
    btn.addEventListener('click', async () => {
      const form = btn.parentElement;
      const nome = form.querySelector('.nome-input').value;
      const contato = form.querySelector('.contato-input').value;
      if (!contato) {
        alert('Por favor, informe um contato.');
        return;
      }
      try {
        const res = await fetch('/api/interesse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, contato })
        });
        if (res.ok) {
          form.querySelector('.msg-interesse').innerText = 'Contato registrado. Teste liberado!';
          form.style.display = 'none';
          form.nextElementSibling.style.display = 'block';
        }
      } catch (err) {
        console.error(err);
      }
    });
  });

  document.querySelectorAll('.sendChat').forEach((btn, idx) => {
    btn.addEventListener('click', async () => {
      const chatbox = btn.parentElement;
      const chatlog = chatbox.querySelector('.chatlog');
      const input = chatbox.querySelector('.chatInput');
      const pergunta = input.value.trim();
      if (!pergunta) return;

      if (localStorage.getItem('testeRealizado-' + consciencias[idx].id)) {
        alert('O teste gratuito para esta ConsciêncIA já foi utilizado neste dispositivo. Para continuar, solicite acesso.');
        return;
      }

      localStorage.setItem('testeRealizado-' + consciencias[idx].id, 'true');

      const userLine = document.createElement('div');
      userLine.className = 'user';
      userLine.textContent = "Você: " + pergunta;
      chatlog.appendChild(userLine);

      input.value = '';

      try {
        const consciaId = consciencias[idx].id;
        const res = await fetch('/api/gpt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pergunta, consciaId, visitanteId })
        });
        const data = await res.json();

        const botLine = document.createElement('div');
        botLine.className = 'bot';
        botLine.textContent = `${consciaId}: ${data.resposta}`;
        chatlog.appendChild(botLine);
        chatlog.scrollTop = chatlog.scrollHeight;
      } catch (err) {
        console.error("Erro ao consultar GPT:", err);
      }
    });
  });

  document.querySelectorAll('.closeChat').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.parentElement.style.display = 'none';
    });
  });
}

window.onload = loadConsciencias;
