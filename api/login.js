export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { emailOuCelular, senha } = req.body; // CORRETO: mesmo nome que está no front e no ReqBin

  const urlPlanilha = 'https://opensheet.elk.sh/12XCdxrGCujD6AIfgOTBF0uz0_mCuocsvnUSvvfVpj70/Acessos';

  try {
    const dados = await fetch(urlPlanilha).then(r => r.json());

    const usuario = dados.find(d =>
      (d.email_ou_celular === emailOuCelular || d.email_ou_celular.replace(/\D/g, '') === emailOuCelular.replace(/\D/g, '')) &&
      d.senha === senha && d.ativo.toLowerCase() === "sim"
    );

    if (usuario) {
      res.status(200).json({ autorizado: true, email: usuario.email_ou_celular });
    } else {
      res.status(200).json({ autorizado: false });
    }

  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao validar login' });
  }
}
