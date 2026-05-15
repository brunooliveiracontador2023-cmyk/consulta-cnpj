import { useState } from "react";

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
        throw new Error(json?.detalhes || "Erro ao consultar CNPJ.");
      }

      setDados(json);
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  }

  const est = dados?.estabelecimento;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img src="/bruno.jpg" style={styles.foto} />

        <h1>Consulta de CNPJ</h1>
        <p>Consulte informações empresariais de forma rápida e segura.</p>

        <div style={styles.busca}>
          <input
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            placeholder="Digite o CNPJ"
            style={styles.input}
          />

          <button onClick={consultarCNPJ} style={styles.botao}>
            {loading ? "Consultando..." : "Consultar"}
          </button>
        </div>

        {erro && <p style={styles.erro}>{erro}</p>}

        {dados && (
          <div style={styles.resultado}>
            <h2>{dados.razao_social}</h2>

            <p><strong>Nome Fantasia:</strong> {est?.nome_fantasia || "Não informado"}</p>
            <p><strong>Situação:</strong> {est?.situacao_cadastral || "Não informado"}</p>
            <p><strong>Município:</strong> {est?.cidade?.nome || "Não informado"}</p>
            <p><strong>UF:</strong> {est?.estado?.sigla || "Não informado"}</p>
            <p><strong>Telefone:</strong> {est?.telefone1 || "Não informado"}</p>
            <p><strong>E-mail:</strong> {est?.email || "Não informado"}</p>
            <p><strong>CNAE Principal:</strong> {est?.atividade_principal?.descricao || "Não informado"}</p>
            <p><strong>Porte:</strong> {dados.porte?.descricao || "Não informado"}</p>
            <p><strong>Natureza Jurídica:</strong> {dados.natureza_juridica?.descricao || "Não informado"}</p>
            <p><strong>Capital Social:</strong> R$ {dados.capital_social || "Não informado"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage: "url('/zycont.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial",
    padding: 20,
  },
  card: {
    background: "#0f172a",
    color: "white",
    padding: 40,
    borderRadius: 25,
    maxWidth: 750,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
  },
  foto: {
    width: 140,
    height: 140,
    borderRadius: "50%",
    objectFit: "cover",
    border: "5px solid #d4af37",
  },
  busca: {
    display: "flex",
    gap: 12,
    marginTop: 25,
  },
  input: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    border: "none",
    fontSize: 16,
  },
  botao: {
    padding: "15px 25px",
    borderRadius: 12,
    border: "none",
    background: "#d4af37",
    color: "#111",
    fontWeight: "bold",
    cursor: "pointer",
  },
  erro: {
    background: "#991b1b",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  resultado: {
    marginTop: 25,
    background: "#1e293b",
    padding: 25,
    borderRadius: 15,
    textAlign: "left",
    lineHeight: 1.7,
  },
};