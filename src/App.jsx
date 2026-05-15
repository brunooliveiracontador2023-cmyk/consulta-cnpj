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
            <h2>{texto(dados.razao_social)}</h2>

            <div style={styles.grid}>
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

            <div style={styles.bloco}>
              <h3>Endereço</h3>
              <p>
                {texto(est?.tipo_logradouro)} {texto(est?.logradouro)},{" "}
                {texto(est?.numero)}
              </p>
              <p>
                Bairro: {texto(est?.bairro)} | CEP: {texto(est?.cep)}
              </p>
            </div>

            <div style={styles.bloco}>
              <h3>CNAE Principal</h3>
              <p>
                <strong>{texto(cnaePrincipal?.id)}</strong> -{" "}
                {texto(cnaePrincipal?.descricao)}
              </p>
            </div>

            <div style={styles.bloco}>
              <h3>CNAEs Secundários</h3>
              {secundarios.length > 0 ? (
                secundarios.map((item) => (
                  <p key={item.id}>
                    <strong>{item.id}</strong> - {item.descricao}
                  </p>
                ))
              ) : (
                <p>Não possui CNAEs secundários informados.</p>
              )}
            </div>

            <div style={styles.bloco}>
              <h3>Inscrições Estaduais</h3>
              {inscricoes.length > 0 ? (
                inscricoes.map((ie, index) => (
                  <p key={index}>
                    <strong>IE:</strong> {texto(ie.inscricao_estadual)} |{" "}
                    <strong>UF:</strong> {texto(ie.estado?.sigla)} |{" "}
                    <strong>Situação:</strong> {ie.ativo ? "Ativa" : "Inativa"}
                  </p>
                ))
              ) : (
                <p>Não foram encontradas inscrições estaduais.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ titulo, valor }) {
  return (
    <div style={styles.info}>
      <span>{titulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage: "url('/zycont.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    padding: 30,
    fontFamily: "Arial",
  },
  card: {
    maxWidth: 1100,
    margin: "0 auto",
    background: "rgba(15, 23, 42, 0.94)",
    color: "white",
    padding: 35,
    borderRadius: 25,
    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
    textAlign: "center",
  },
  foto: {
    width: 130,
    height: 130,
    borderRadius: "50%",
    objectFit: "cover",
    border: "5px solid #d4af37",
  },
  busca: {
    display: "flex",
    gap: 12,
    marginTop: 25,
    marginBottom: 25,
  },
  input: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    border: "none",
    fontSize: 16,
  },
  botao: {
    padding: "15px 28px",
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
  },
  resultado: {
    marginTop: 25,
    background: "rgba(30, 41, 59, 0.95)",
    padding: 25,
    borderRadius: 18,
    textAlign: "left",
    lineHeight: 1.7,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 12,
  },
  info: {
    background: "#0f172a",
    padding: 15,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  bloco: {
    background: "#0f172a",
    padding: 18,
    borderRadius: 14,
    marginTop: 18,
  },
};