const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const response = await axios.get('https://script.google.com/macros/s/AKfycbzfn4lH6YudDbDNmFmDp6tT-OF8L3ZOpTwCtAhAdNf5VW9fCKeNedPt13Nxe_fbG6b-Vg/exec');

    const consciencias = response.data.conscias;

    res.status(200).json({ consciencias });
  } catch (error) {
    console.error('Erro ao acessar API:', error);
    res.status(500).json({ error: 'Erro no servidor.' });
  }
};
