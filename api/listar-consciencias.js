export default async function handler(req, res) {
  const { emailOuCelular } = req.body;

  if (!emailOuCelular) {
    return res.status(400).json({ error: 'O campo emailOuCelular é obrigatório.' });
  }

  try {
    // Dados fixos da tabela (baseados no que você me enviou)
    const acessos = [
      {
        emailOuCelular: 'teste@email.com',
        senha: 'teste123',
        ativo: 'sim',
        data_ativacao: '21/06/2025',
        nome_cliente: 'João da Silva',
        data_exclusao: '',
        consciencias: []
      },
      {
        emailOuCelular: '279999900000',
        senha: 'segredo01',
        ativo: 'sim',
        data_ativacao: '21/06/2025',
        nome_cliente: 'Cliente Celular',
        data_exclusao: '',
        consciencias: []
      },
      {
        emailOuCelular: 'exemplo@dom.com',
        senha: 'abc123',
        ativo: 'não',
        data_ativacao: '20/06/2025',
        nome_cliente: 'Bloqueado Exemplo',
        data_exclusao: '',
        consciencias: []
      },
      {
        emailOuCelular: 'edgar@totalcont.net',
        senha: 'eromaster',
        ativo: 'sim',
        data_ativacao: '23/06/2025',
        nome_cliente: 'edgar',
        data_exclusao: '',
        consciencias: ['Raízes EROPRO', 'Agron ERORO']
      }
    ];

    // Procurar o usuário
    const usuario = acessos.find((acesso) => acesso.emailOuCelular === emailOuCelular);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.status(200).json({ consciencias: usuario.consciencias });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno ao listar consciências' });
  }
}
