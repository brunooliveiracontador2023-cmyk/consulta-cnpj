import "./App.css";

function App() {
  return (
    <div style={styles.container}>
      <img src="/zycont.jpg" alt="Zycont" style={styles.logo} />

      <div style={styles.overlay}>
        <div style={styles.card}>
          <img src="/bruno.jpg" alt="Bruno Oliveira" style={styles.photo} />

          <h1 style={styles.title}>Consulta de CNPJ</h1>

          <p style={styles.subtitle}>
            Consulte informações empresariais de forma rápida e segura.
          </p>

          <div style={styles.searchArea}>
            <input
              type="text"
              placeholder="Digite o CNPJ"
              style={styles.input}
            />

            <button style={styles.button}>Consultar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    backgroundImage: "url('/zycont.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    fontFamily: "Arial",
  },

  overlay: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    padding: 40,
    borderRadius: 24,
    width: "100%",
    maxWidth: 500,
    textAlign: "center",
    boxShadow: "0 0 30px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
  },

  photo: {
    width: 140,
    height: 140,
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #d4af37",
    marginBottom: 20,
  },

  logo: {
    position: "absolute",
    top: 30,
    left: 30,
    width: 140,
  },

  title: {
    color: "#ffffff",
    marginBottom: 10,
    fontSize: 34,
  },

  subtitle: {
    color: "#d1d5db",
    marginBottom: 30,
    fontSize: 16,
  },

  searchArea: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  input: {
    flex: 1,
    minWidth: 220,
    padding: 15,
    borderRadius: 12,
    border: "none",
    outline: "none",
    fontSize: 16,
  },

  button: {
    padding: "15px 25px",
    borderRadius: 12,
    border: "none",
    backgroundColor: "#d4af37",
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: 16,
  },
};

export default App;