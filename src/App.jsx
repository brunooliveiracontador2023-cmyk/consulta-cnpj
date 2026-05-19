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
      const [respostaBrasil, respostaCnpjWs] = await Promise.allSettled([
        fetch(`https://brasilapi.com.br/api/cnpj/v1/${numeros}`),
        fetch(`https://publica.cnpj.ws/cnpj/${numeros}`),
      ]);

      if (respostaBrasil.status !== "fulfilled" || !respostaBrasil.value.ok) {
        throw new Error("Não foi possível consultar a situação cadastral desse CNPJ.");
      }

      const brasil = await respostaBrasil.value.json();
      const cnpjWs =
        respostaCnpjWs.status === "fulfilled" && respostaCnpjWs.value.ok
          ? await respostaCnpjWs.value.json()
          : null;

      setDados({ brasil, cnpjWs });
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

  const brasil = dados?.brasil;
  const est = dados?.cnpjWs?.estabelecimento;
  const cnaePrincipal = brasil?.cnae_fiscal
    ? { id: brasil.cnae_fiscal, descricao: brasil.cnae_fiscal_descricao }
    : est?.atividade_principal;
  const secundarios =
    brasil?.cnaes_secundarios?.map((item) => ({
      id: item.codigo,
      descricao: item.descricao,
    })) ||
    est?.atividades_secundarias ||
    [];
  const inscricoes = est?.inscricoes_estaduais || [];
  const situacaoCadastral = brasil?.descricao_situacao_cadastral || est?.situacao_cadastral;
  const dataSituacaoCadastral = brasil?.data_situacao_cadastral || est?.data_situacao_cadastral;
  const situacaoFontePublica = dataSituacaoCadastral
    ? `${texto(situacaoCadastral)} desde ${dataSituacaoCadastral}`
    : texto(situacaoCadastral);
  const cnpjConsultado = brasil?.cnpj || est?.cnpj || cnpj.replace(/\D/g, "");
  const receitaFederalUrl = `https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp?cnpj=${cnpjConsultado}`;

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
            <h2>{texto(brasil?.razao_social || dados?.cnpjWs?.razao_social)}</h2>
            <p className="source-note">
              A situação abaixo vem de bases públicas que podem ter defasagem. A conferência oficial deve ser feita no comprovante da Receita Federal.
            </p>
            <a className="official-link" href={receitaFederalUrl} target="_blank" rel="noreferrer">
              Conferir na Receita Federal
            </a>
          </div>

          <div className="info-grid">
            <Info titulo="Nome Fantasia" valor={texto(brasil?.nome_fantasia || est?.nome_fantasia)} />
            <Info titulo="Situação (base pública)" valor={situacaoFontePublica} />
            <Info titulo="Tipo da Empresa" valor={tipoEmpresa(cnaePrincipal?.id)} />
            <Info titulo="Porte" valor={texto(brasil?.descricao_porte || dados?.cnpjWs?.porte?.descricao)} />
            <Info titulo="Natureza Jurídica" valor={texto(brasil?.natureza_juridica || dados?.cnpjWs?.natureza_juridica?.descricao)} />
            <Info titulo="Capital Social" valor={`R$ ${texto(brasil?.capital_social || dados?.cnpjWs?.capital_social)}`} />
            <Info titulo="Município" valor={texto(brasil?.municipio || est?.cidade?.nome)} />
            <Info titulo="UF" valor={texto(brasil?.uf || est?.estado?.sigla)} />
            <Info titulo="Telefone" valor={texto(brasil?.ddd_telefone_1 || est?.telefone1)} />
            <Info titulo="E-mail" valor={texto(brasil?.email || est?.email)} />
          </div>

          <ResultBlock titulo="Endereço">
            <p>
              {texto(brasil?.descricao_tipo_de_logradouro || est?.tipo_logradouro)} {texto(brasil?.logradouro || est?.logradouro)}, {texto(brasil?.numero || est?.numero)}
            </p>
            <p>
              Bairro: {texto(brasil?.bairro || est?.bairro)} | CEP: {texto(brasil?.cep || est?.cep)}
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
