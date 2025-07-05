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
