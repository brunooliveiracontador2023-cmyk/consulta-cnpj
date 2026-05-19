import { useState } from "react";
import "./App.css";

export default function App() {
  const [cnpj, setCnpj] = useState("");
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function consultarCNPJ() {
    setErro("");
    setDados(null);

    const numeros = cnpj.replace(/\D/g, "");

    if (numeros.length !== 14) {
      setErro("Digite um CNPJ válido com 14 números.");
      return;
    }

    setLoading(true);

    try {
      const resposta = await fetch(`https://publica.cnpj.ws/cnpj/${numeros}`);
      const json = await resposta.json();

      if (!resposta.ok) {
        throw new Error("Erro ao consultar CNPJ.");
      }

      setDados(json);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  function texto(valor) {
    return valor || "Não informado";
  }

  function tipoEmpresa(cnae) {
    const inicio = Number(String(cnae || "").substring(0, 2));

    if (inicio >= 45 && inicio <= 47) return "Comércio";
    if (inicio >= 5 && inicio <= 33) return "Indústria";
    if (inicio >= 49 && inicio <= 99) return "Serviço";

    return "Não identificado";
  }

  const est = dados?.estabelecimento;
  const cnaePrincipal = est?.atividade_principal;
  const secundarios = est?.atividades_secundarias || [];
  const inscricoes = est?.inscricoes_estaduais || [];

  return (
    <main className="page-shell">
      <section className="hero-panel" aria-label="Consulta de CNPJ ZYCONT">
        <div className="brand-copy">
          <p className="eyebrow">ZYCONT Contabilidade Inteligente</p>
          <h1>Consulta de CNPJ</h1>
          <p className="subtitle">
            Consulte dados cadastrais, endereço, CNAEs e inscrições estaduais com uma apresentação clara para análise empresarial.
          </p>

          <div className="search-panel">
            <label htmlFor="cnpj" className="input-label">CNPJ</label>
            <div className="search-row">
              <input
                id="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="Digite o CNPJ"
                inputMode="numeric"
              />

              <button onClick={consultarCNPJ} disabled={loading}>
                {loading ? "Consultando..." : "Consultar"}
              </button>
            </div>
          </div>

          {erro && <p className="error-message">{erro}</p>}
        </div>

        <aside className="profile-card" aria-label="Responsável pela consulta">
          <img src="/bruno.jpg" alt="Bruno, consultor da ZYCONT" />
          <div>
            <strong>Atendimento ZYCONT</strong>
            <span>Contabilidade estratégica para decisões mais seguras.</span>
          </div>
        </aside>
      </section>

      {dados && (
        <section className="results-panel">
          <div className="results-heading">
            <p className="eyebrow">Resultado da consulta</p>
            <h2>{texto(dados.razao_social)}</h2>
          </div>

          <div className="info-grid">
            <Info titulo="Nome Fantasia" valor={texto(est?.nome_fantasia)} />
            <Info titulo="Situação" valor={texto(est?.situacao_cadastral)} />
            <Info titulo="Tipo da Empresa" valor={tipoEmpresa(cnaePrincipal?.id)} />
            <Info titulo="Porte" valor={texto(dados.porte?.descricao)} />
            <Info titulo="Natureza Jurídica" valor={texto(dados.natureza_juridica?.descricao)} />
            <Info titulo="Capital Social" valor={`R$ ${texto(dados.capital_social)}`} />
            <Info titulo="Município" valor={texto(est?.cidade?.nome)} />
            <Info titulo="UF" valor={texto(est?.estado?.sigla)} />
            <Info titulo="Telefone" valor={texto(est?.telefone1)} />
            <Info titulo="E-mail" valor={texto(est?.email)} />
            <Info titulo="Simples Nacional" valor="Não informado pela API pública" />
            <Info titulo="SIMEI" valor="Não informado pela API pública" />
          </div>

          <ResultBlock titulo="Endereço">
            <p>
              {texto(est?.tipo_logradouro)} {texto(est?.logradouro)}, {texto(est?.numero)}
            </p>
            <p>
              Bairro: {texto(est?.bairro)} | CEP: {texto(est?.cep)}
            </p>
          </ResultBlock>

          <ResultBlock titulo="CNAE Principal">
            <p>
              <strong>{texto(cnaePrincipal?.id)}</strong> - {texto(cnaePrincipal?.descricao)}
            </p>
          </ResultBlock>

          <ResultBlock titulo="CNAEs Secundários">
            {secundarios.length > 0 ? (
              secundarios.map((item) => (
                <p key={item.id}>
                  <strong>{item.id}</strong> - {item.descricao}
                </p>
              ))
            ) : (
              <p>Não possui CNAEs secundários informados.</p>
            )}
          </ResultBlock>

          <ResultBlock titulo="Inscrições Estaduais">
            {inscricoes.length > 0 ? (
              inscricoes.map((ie, index) => (
                <p key={index}>
                  <strong>IE:</strong> {texto(ie.inscricao_estadual)} | <strong>UF:</strong> {texto(ie.estado?.sigla)} | <strong>Situação:</strong> {ie.ativo ? "Ativa" : "Inativa"}
                </p>
              ))
            ) : (
              <p>Não foram encontradas inscrições estaduais.</p>
            )}
          </ResultBlock>
        </section>
      )}
    </main>
  );
}

function Info({ titulo, valor }) {
  return (
    <div className="info-card">
      <span>{titulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

function ResultBlock({ titulo, children }) {
  return (
    <div className="result-block">
      <h3>{titulo}</h3>
      {children}
    </div>
  );
}
