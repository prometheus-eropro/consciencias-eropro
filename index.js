// pages/index.js

import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-blue-300 p-6">
      <Head>
        <title>PROMETHEUS EROPRO</title>
      </Head>

      <header className="text-center mb-8">
        <img src="/logo.png" alt="Logo Prometheus EROPRO" className="w-40 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Tecnologia com ConsciêncIA gera resultado.</h1>
      </header>

      <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg text-center">
        <p className="mb-4">Bem-vindo à PROMETHEUS EROPRO!</p>
        <Link href="/login">
          <a className="bg-green-400 text-gray-800 font-bold py-2 px-4 rounded hover:bg-green-600 hover:text-white transition">
            Entrar na área restrita
          </a>
        </Link>
      </div>
    </div>
  );
}

// pages/login.js

import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [emailOuCelular, setEmailOuCelular] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const router = useRouter();

  async function logar() {
    if (!emailOuCelular || !senha) {
      setErro('Preencha todos os campos!');
      return;
    }

    try {
      const resposta = await fetch('/api/validar-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOuCelular, senha })
      });

      const dados = await resposta.json();

      if (dados.acesso) {
        sessionStorage.setItem('emailOuCelular', emailOuCelular);
        router.push('/area-assinante');
      } else {
        setErro('Acesso negado! Verifique seus dados.');
      }
    } catch (error) {
      setErro('Erro ao conectar com o servidor.');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6 text-white">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6 text-center">Área de Acesso</h2>

        <input
          type="text"
          placeholder="Email ou celular"
          value={emailOuCelular}
          onChange={e => setEmailOuCelular(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="w-full p-2 mb-4 rounded text-black"
        />

        <button
          onClick={logar}
          className="w-full bg-green-400 text-gray-800 font-bold py-2 px-4 rounded hover:bg-green-600 hover:text-white transition"
        >
          Entrar
        </button>

        {erro && <div className="text-red-500 mt-4 text-center">{erro}</div>}
      </div>
    </div>
  );
}

// pages/area-assinante.js

export default function AreaAssinante() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo à Área do Assinante!</h1>
      <p className="mb-4">Você está logado com sucesso.</p>
    </div>
  );
}

// pages/api/validar-login.js

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { emailOuCelular, senha } = req.body;

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbzxonxz2OZ-FudBx5_8IaONK3ggg19zQZ7kI5kthpnvcbs4ZpK-bdPSOyP6qMG02HjNAA/exec');
    const data = await response.json();

    const usuarios = data.acessos_consciencias_site;

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
