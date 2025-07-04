// validar-login.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { emailOuCelular, senha } = req.body;

  try {
    const response = await axios.get('https://script.google.com/macros/s/AKfycbzxonxz2OZ-FudBx5_8IaONK3ggg19zQZ7kI5kthpnvcbs4ZpK-bdPSOyP6qMG02HjNAA/exec');
    const usuarios = response.data.acessos_consciencias_site;

    const usuario = usuarios.find(u =>
      (u.email_ou_celular === emailOuCelular || u.email === emailOuCelular) &&
      u.senha === senha &&
      u.ativo.toLowerCase() === 'sim'
    );

    if (!usuario) return res.status(200).json({ acesso: false });

    return res.status(200).json({ acesso: true });
  } catch (error) {
    console.error('Erro ao acessar API!', error);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

