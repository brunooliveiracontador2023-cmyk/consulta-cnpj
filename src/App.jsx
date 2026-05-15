import { useState } from "react";

export default function App() {
  const [cnpj, setCnpj] = useState("");
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function consultarCNPJ() {
    try {
      setErro("");
      setDados(null);
      setLoading(true);

      const numeros = cnpj.replace(/\D/g, "");

      if (numeros.length !== 14) {
        throw new Error("Digite um CNPJ válido.");
      }

      const resposta = await fetch(
        `https://publica.cnpj.ws/cnpj/${numeros}`
      );

      if (resposta.status === 404) {
        throw new Error("CNPJ não encontrado.");
      }

      if (resposta.status === 429) {
        throw new Error(
          "Limite de consultas atingido. Tente novamente mais tarde."
        );
      }

      if (!resposta.ok) {
        throw new Error("Erro ao consultar CNPJ.");
      }

      const json = await resposta.json();

      setDados(json);
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  function texto(valor) {
    return valor || "Não informado";
  }

  function simNao(valor) {
    if (valor === true) return "Sim";
    if (valor === false) return "Não";
    return "Não informado";
  }

  function tipoEmpresa(cnae) {
    if (!cnae) return "Não identificado";

    const inicio = Number(String(cnae).substring(0, 2));

    if (inicio >= 45 && inicio <= 47) {
      return "Comércio";
    }

    if (inicio >= 5 && inicio <= 33) {
      return "Indústria";
    }

    if (inicio >= 49 && inicio <= 99) {
      return "Serviço";
    }

    return "Não identificado";
  }

  const est = dados?.estabelecimento;

  const cnaePrincipal = est?.atividade_principal;

  const secundarios = est?.atividades_secundarias || [];

  const ies = est?.inscricoes_estaduais || [];

  return (
    <div style={styles.page}>
      <h1 style={styles.titulo}>
        Consulta de CNPJ
      </h1>

      <div style={styles.busca}>
        <input
          type="text"
          placeholder="Digite o CNPJ"
          value={cnpj}
          onChange={(e) => setCnpj(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={consultarCNPJ}
          style={styles.botao}
        >
          Consultar
        </button>
      </div>

      {loading && (
        <p style={styles.loading}>
          Consultando...
        </p>
      )}

      {erro && (
        <p style={styles.erro}>
          {erro}
        </p>
      )}

      {dados && (
        <div style={styles.card}>
          <h2 style={styles.razao}>
            {texto(dados.razao_social)}
          </h2>

          <div style={styles.grid}>
            <Info
              titulo="Nome Fantasia"
              valor={texto(est?.nome_fantasia)}
            />

            <Info
              titulo="Situação Cadastral"
              valor={texto(est?.situacao_cadastral)}
            />

            <Info
              titulo="Tipo da Empresa"
              valor={tipoEmpresa(cnaePrincipal?.id)}
            />

            <Info
              titulo="Porte"
              valor={texto(dados.porte?.descricao)}
            />

            <Info
              titulo="Natureza Jurídica"
              valor={texto(
                dados.natureza_juridica?.descricao
              )}
            />

            <Info
              titulo="Capital Social"
              valor={`R$ ${texto(
                dados.capital_social
              )}`}
            />

            <Info
              titulo="Simples Nacional"
              valor={
                dados.simples
                  ? simNao(dados.simples.simples)
                  : "Não informado pela API"
              }
            />

            <Info
              titulo="SIMEI"
              valor={
                dados.simples
                  ? simNao(dados.simples.simei)
                  : "Não informado pela API"
              }
            />

            <Info
              titulo="Cidade"
              valor={texto(est?.cidade?.nome)}
            />

            <Info
              titulo="UF"
              valor={texto(est?.estado?.sigla)}
            />

            <Info
              titulo="Telefone"
              valor={texto(est?.telefone1)}
            />

            <Info
              titulo="E-mail"
              valor={texto(est?.email)}
            />
          </div>

          <div style={styles.bloco}>
            <h3>Endereço</h3>

            <p>
              {texto(est?.tipo_logradouro)}{" "}
              {texto(est?.logradouro)},{" "}
              {texto(est?.numero)}
            </p>

            <p>
              Bairro: {texto(est?.bairro)}
            </p>

            <p>
              CEP: {texto(est?.cep)}
            </p>
          </div>

          <div style={styles.bloco}>
            <h3>CNAE Principal</h3>

            <p>
              <strong>
                {texto(cnaePrincipal?.id)}
              </strong>{" "}
              -{" "}
              {texto(
                cnaePrincipal?.descricao
              )}
            </p>
          </div>

          <div style={styles.bloco}>
            <h3>CNAEs Secundários</h3>

            {secundarios.length > 0 ? (
              secundarios.map((item) => (
                <p key={item.id}>
                  <strong>{item.id}</strong>{" "}
                  - {item.descricao}
                </p>
              ))
            ) : (
              <p>
                Não possui CNAEs secundários.
              </p>
            )}
          </div>

          <div style={styles.bloco}>
            <h3>Inscrições Estaduais</h3>

            {ies.length > 0 ? (
              ies.map((ie, index) => (
                <p key={index}>
                  <strong>IE:</strong>{" "}
                  {texto(
                    ie.inscricao_estadual
                  )}{" "}
                  |{" "}
                  <strong>UF:</strong>{" "}
                  {texto(
                    ie.estado?.sigla
                  )}{" "}
                  |{" "}
                  <strong>Situação:</strong>{" "}
                  {ie.ativo
                    ? "Ativa"
                    : "Inativa"}
                </p>
              ))
            ) : (
              <p>
                Não foram encontradas
                inscrições estaduais.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ titulo, valor }) {
  return (
    <div style={styles.info}>
      <strong>{titulo}</strong>

      <span>{valor}</span>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f172a, #1e3a8a)",
    color: "white",
    padding: 40,
    fontFamily: "Arial",
  },

  titulo: {
    fontSize: 42,
    textAlign: "center",
    marginBottom: 30,
  },

  busca: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginBottom: 30,
    flexWrap: "wrap",
  },

  input: {
    padding: 14,
    width: 360,
    borderRadius: 10,
    border: "none",
    fontSize: 16,
  },

  botao: {
    padding: "14px 24px",
    borderRadius: 10,
    border: "none",
    background: "#06b6d4",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 16,
  },

  loading: {
    textAlign: "center",
    fontSize: 18,
  },

  erro: {
    color: "#fecaca",
    background: "#991b1b",
    padding: 14,
    borderRadius: 10,
    textAlign: "center",
    maxWidth: 600,
    margin: "0 auto",
  },

  card: {
    background:
      "rgba(30, 41, 59, 0.95)",
    padding: 30,
    borderRadius: 18,
    maxWidth: 1100,
    margin: "0 auto",
    lineHeight: 1.7,
    boxShadow:
      "0 0 30px rgba(0,0,0,0.35)",
  },

  razao: {
    textAlign: "center",
    marginBottom: 25,
    fontSize: 28,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 15,
    marginBottom: 25,
  },

  info: {
    background: "#0f172a",
    padding: 15,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  bloco: {
    background: "#0f172a",
    padding: 20,
    borderRadius: 14,
    marginTop: 18,
  },
};