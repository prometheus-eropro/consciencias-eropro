// log.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { tipo, usuario, detalhes } = req.body;

  try {
    await axios.post('https://script.google.com/macros/s/AKfycbz2Nz9MdsM-0g5CQWwIglNjyu4oq9Cx1Sc4-VSje4tamQNzxJP7hy61hr2YvugLXs0H/exec', {
      tipo,
      usuario,
      detalhes
    });

    return res.status(200).json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao registrar log!', error);
    return res.status(500).json({ error: 'Erro ao registrar log.' });
  }
}
