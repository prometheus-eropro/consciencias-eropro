document.addEventListener('DOMContentLoaded', async () => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const cards = document.querySelectorAll('.card a');

  cards.forEach(botao => {
    const link = botao.getAttribute('href');
    const id = link.split('chat-')[1].split('.html')[0]; // Ex: raizes_eropro

    const nomeBase = id.split('_eropro')[0]; // Ex: raizes

    if (!usuario || !usuario.cons || !usuario.cons.includes(nomeBase)) {
      botao.addEventListener('click', e => {
        e.preventDefault();
        alert(
          '❌ Você ainda não tem acesso a esta ConsciêncIA.\\n\\n' +
          'Entre em contato:\\n' +
          '📧 Email: assistentes.prometheus@gmail.com\\n' +
          '📱 WhatsApp: (28) 99969-2303\\n' +
          '📷 Instagram: @edgar_rocha_oliveira'
        );
      });
      botao.style.background = '#ccc';
      botao.style.color = '#666';
      botao.style.cursor = 'not-allowed';
      botao.textContent = 'Bloqueado';
    }
  });
});
