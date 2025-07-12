export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ mensagem: 'Método não permitido' });

  const { email, senha } = req.body;

  const urlPlanilha = 'https://opensheet.elk.sh/12XCdxrGCujD6AIfgOTBF0uz0_mCuocsvnUSvvfVpj70/Acessos';

  try {
    const dados = await fetch(urlPlanilha).then(r => r.json());

    const usuario = dados.find(d =>
      (d.email_ou_celular === email || d.email_ou_celular.replace(/\D/g, '') === email.replace(/\D/g, '')) &&
      d.senha === senha && d.ativo.toLowerCase() === "sim"
    );

    if (usuario) {
      return res.status(200).json({ mensagem: 'Acesso liberado!', autorizado: true });
    } else {
      return res.status(401).json({ mensagem: 'Acesso negado!', autorizado: false });
    }

  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro interno ao validar login' });
  }
}
