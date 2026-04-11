import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaSignOutAlt, FaUniversity } from "react-icons/fa";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import logo_fho from "./assets/logo-fho.png";
import "./App.css";

// --- TELA INICIAL: SELEÇÃO DE INSTITUIÇÃO ---
function SelecaoFacul() {
  const [faculdades, setFaculdades] = useState([]);
  const [selecionada, setSelecionada] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/db_facul")
      .then((res) => res.json())
      .then((dados) => setFaculdades(dados))
      .catch((err) => console.error("Erro ao buscar faculdades:", err));
  }, []);

  const handleAvancar = () => {
    if (selecionada) {
      localStorage.setItem("faculdadeEscolhida", selecionada);
      navigate("/login");
    } else {
      alert("Por favor, selecione uma instituição para continuar.");
    }
  };

  return (
    // AQUI: Aplicado o fundo escuro exclusivo da Seleção
    <div style={styles.bodySelecao}>
      <div style={styles.container}>
        <img 
          src="/true_class.png" 
          alt="TrueClass Logo" 
          style={{ width: "200px", marginBottom: "20px" }} 
        />
        <h2 style={{ color: "#333", marginBottom: "10px", fontSize: "22px" }}>
          Bem-vindo ao TrueClass
        </h2>
        <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
          Selecione sua instituição para acessar o portal
        </p>
        
        <div style={{ position: "relative", width: "100%" }}>
          <select 
            style={{ ...styles.input, appearance: "none", paddingRight: "30px" }} 
            value={selecionada} 
            onChange={(e) => setSelecionada(e.target.value)}
          >
            <option value="">Escolha uma faculdade...</option>
            {faculdades.map((f) => (
              <option key={f.id} value={f.nome}>{f.nome}</option>
            ))}
          </select>
          <FaUniversity style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
        </div>

        <button onClick={handleAvancar} style={styles.button}>
          Avançar para o Login
        </button>
      </div>
    </div>
  );
}

// --- TELA DE LOGIN ---
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [erroLogin, setErroLogin] = useState("");
  const navigate = useNavigate();

  const handleEntrar = async () => {
    setErroLogin("");
    if (!email || !password) {
      setErroLogin("Preencha todos os campos");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/db_users?email=${email.trim()}`);
      const usuarios = await response.json();

      if (usuarios.length === 0) {
        setErroLogin("Usuário não cadastrado");
        return;
      }

      const usuarioEncontrado = usuarios[0];
      if (usuarioEncontrado.password !== password) {
        setErroLogin("Senha incorreta");
        return;
      }

      localStorage.setItem("usuarioLogado", JSON.stringify(usuarioEncontrado));
      navigate("/mural");
    } catch (error) {
      setErroLogin("Erro ao conectar com o servidor");
    }
  };

  return (
    <div style={styles.body}>
      <img src={logo_fho} alt="Logo FHO" style={styles.logo_fho} />
      <h1 style={styles.mainTitle}>TRUECLASS</h1>
      <div style={styles.container}>
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Login</h2>
        <input 
          type="text" placeholder="E-mail" style={styles.input}
          value={email} onChange={(e) => { setEmail(e.target.value); setErroLogin(""); }}
        />
        <div style={styles.passwordWrapper}>
          <input 
            type={showPass ? "text" : "password"} placeholder="Senha" style={styles.input}
            value={password} onChange={(e) => { setPassword(e.target.value); setErroLogin(""); }}
          />
          <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeButton}>
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div style={{ minHeight: "20px", marginBottom: "10px" }}>
          {erroLogin && <p style={styles.erroTexto}>● {erroLogin}</p>}
        </div>
        <p style={styles.footerText}>
          Não possui cadastro? <Link to="/cadastro" style={styles.signupLink}>Cadastrar</Link>
        </p>
        <button onClick={handleEntrar} style={styles.button}>Login</button>
        <p style={{ marginTop: "15px" }}>
          <Link to="/" style={{ color: "#888", fontSize: "12px", textDecoration: "none" }}>← Trocar Instituição</Link>
        </p>
      </div>
    </div>
  );
}

// --- TELA DE CADASTRO ---
function Cadastro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [erroEmail, setErroEmail] = useState("");

  const temNumero = /[0-9]/.test(password);
  const temMaiuscula = /[A-Z]/.test(password);
  const temEspecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const temDezCaracteres = password.length >= 10;
  const senhaForteTotal = temNumero && temMaiuscula && temEspecial && temDezCaracteres;
  const senhasIguais = password === confirmPassword && confirmPassword !== "";

  const handleFinalizarCadastro = async () => {
    setErroEmail("");
    if (!email.toLowerCase().endsWith("@alunos.fho.edu.br")) {
      setErroEmail("Use seu e-mail @alunos.fho.edu.br");
      return;
    }
    if (!senhaForteTotal || !senhasIguais) return; 

    try {
      const checkResponse = await fetch(`http://localhost:3001/db_users?email=${email.trim()}`);
      const usuariosExistentes = await checkResponse.json();

      if (usuariosExistentes.length > 0) {
        setErroEmail("Este e-mail já está cadastrado!");
        return;
      }

      const response = await fetch("http://localhost:3001/db_users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }), // Corrigido aqui
      });

      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        setEmail(""); setPassword(""); setConfirmPassword("");
      }
    } catch (e) {
      setErroEmail("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div style={styles.body}>
      <img src={logo_fho} alt="Logo FHO" style={styles.logo_fho} />
      <h1 style={styles.mainTitle}>TRUECLASS</h1>
      <div style={styles.container}>
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Criar Conta</h2>
        <input 
          type="text" placeholder="E-mail Institucional" style={styles.input}
          value={email} onChange={(e) => { setEmail(e.target.value); setErroEmail(""); }} 
        />
        {erroEmail && <p style={styles.erroTexto}>● {erroEmail}</p>}
        <div style={styles.passwordWrapper}>
          <input type={showPass ? "text" : "password"} placeholder="Criar Senha" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeButton}>{showPass ? <FaEyeSlash /> : <FaEye />}</button>
        </div>
        <div style={styles.passwordWrapper}>
          <input type={showConfirmPass ? "text" : "password"} placeholder="Confirmar Senha" style={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeButton}>{showConfirmPass ? <FaEyeSlash /> : <FaEye />}</button>
        </div>
        <div style={styles.erroContainer}>
          {!temNumero && <p style={styles.erroTexto}>● Falta um número</p>}
          {!temMaiuscula && <p style={styles.erroTexto}>● Falta uma letra maiúscula</p>}
          {!temEspecial && <p style={styles.erroTexto}>● Falta um caractere especial</p>}
          {!temDezCaracteres && <p style={styles.erroTexto}>● Falta no mínimo 10 caracteres</p>}
          {senhaForteTotal && confirmPassword !== "" && (
            <>
              {!senhasIguais && <p style={styles.erroTexto}>● As senhas não coincidem</p>}
              {senhasIguais && <p style={styles.sucessoTexto}>● As senhas são idênticas!</p>}
            </>
          )}
        </div>
        <button onClick={handleFinalizarCadastro} style={styles.button}>Finalizar Cadastro</button>
        <p style={styles.footerText}><Link to="/login" style={styles.signupLink}>Voltar para o Login</Link></p>
      </div>
    </div>
  );
}

// --- TELA DE MURAL ---
function Mural() {
  const [materias, setMaterias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const buscarSalasDoBanco = async () => {
      try {
        const response = await fetch("http://localhost:3001/db_salas");
        const dados = await response.json();
        setMaterias(dados);
        setCarregando(false);
      } catch (error) {
        console.error("Erro ao buscar salas:", error);
        setCarregando(false);
      }
    };
    buscarSalasDoBanco();
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // Limpa tudo ao sair
    navigate("/login");
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <header style={styles.muralHeader}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <span style={{ fontSize: '24px', cursor: 'pointer', color: '#5f6368' }}>☰</span>
        </div>
        <h2 style={styles.muralTitle}>TRUE CLASS</h2>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flex: 1 }}>
          <button onClick={handleLogout} style={styles.logoutButton}>
             <FaSignOutAlt style={{ marginRight: '8px' }} /> Sair
          </button>
        </div>
      </header>
      <div style={styles.gridContainer}>
        {carregando ? (
          <p style={{ textAlign: 'center', width: '100%' }}>Carregando salas...</p>
        ) : materias.length > 0 ? (
          materias.map((m) => (
            <div key={m.id} style={styles.muralCard}>
              <div style={{ ...styles.muralCardHeader, backgroundColor: m.cor }}>
                <h3 style={{ margin: 0, textDecoration: 'underline', color: 'white' }}>{m.nome}</h3>
                <p style={{ margin: '5px 0 0', fontSize: '13px', color: 'white' }}>{m.professor}</p>
              </div>
              <div style={{ height: '140px' }}></div>
              <div style={styles.muralCardFooter}><span>📁</span></div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', width: '100%' }}>Nenhuma sala encontrada no banco.</p>
        )}
      </div>
    </div>
  );
}

// --- ROTEAMENTO ---
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelecaoFacul />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/mural" element={<Mural />} />
      </Routes>
    </Router>
  );
}

const styles = {
  body: { 
    margin: 0, 
    padding: 0, 
    fontFamily: "Arial, sans-serif", 
    background: "linear-gradient(to bottom, #42576F, #337ab7)", 
    height: "100vh", 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center", 
    position: "relative" 
  },
  bodySelecao: { 
    margin: 0, 
    padding: 0, 
    fontFamily: "Arial, sans-serif", 
    backgroundColor: "#162c42", 
    height: "100vh", display: "flex", 
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center", 
    position: "relative" 
  },
  logo_fho: { 
    position: "absolute", 
    top: "10px", 
    left: "10px", 
    width: "100px", 
    height: "auto" },
  mainTitle: { 
    color: "white", 
    fontSize: "60px", 
    fontWeight: "bold", 
    letterSpacing: "2px", 
    marginBottom: "40px", 
    marginTop: "0" 
  },
  container: { 
    background: "white", 
    padding: "30px", 
    borderRadius: "10px", 
    width: "90%", 
    maxWidth: "400px", 
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)", 
    textAlign: "center" 
  },
  input: { 
    width: "100%", 
    padding: "12px", 
    margin: "10px 0", 
    boxSizing: "border-box", 
    border: "1px solid #ccc", 
    borderRadius: "5px", 
    outline: "none", 
    fontSize: "14px", 
    backgroundColor: "#ffffff", // Garante o fundo branco
    color: "#333333",
  },
  passwordWrapper: { 
    position: "relative", 
    width: "100%" 
  },
  eyeButton: { 
    position: "absolute", 
    right: "10px", 
    top: "50%", 
    transform: "translateY(-50%)", 
    background: "none", 
    border: "none", 
    cursor: "pointer", 
    fontSize: "18px", 
    color: "#888", 
    display: "flex", 
    alignItems: "center" 
  },
  button: { 
    width: "100%", 
    padding: "12px", 
    background: "#337ab7", 
    border: "none", 
    color: "white", 
    fontSize: "16px", 
    fontWeight: "bold", 
    borderRadius: "5px", 
    cursor: "pointer", 
    marginTop: "15px" 
  },
  footerText: { 
    fontSize: "14px", 
    color: "#444", 
    marginTop: "10px", 
    marginBottom: "10px" 
  },
  signupLink: { 
    color: "#337ab7", 
    textDecoration: "none", 
    fontWeight: "bold" 
  },
  erroContainer: { 
    marginTop: "10px", 
    textAlign: "left", 
    paddingLeft: "5px", 
    marginBottom: "10px" 
  },
  erroTexto: { 
    color: "#dc3545", 
    fontSize: "13px", 
    margin: "2px 0", 
    fontWeight: "bold" 
  },
  sucessoTexto: { 
    color: "#28a745", 
    fontSize: "13px", 
    margin: "2px 0", 
    fontWeight: "bold" 
  },
  muralHeader: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "0 20px", 
    height: "65px", 
    backgroundColor: "white", 
    borderBottom: "1px solid #ddd" 
  },
  muralTitle: { 
    fontSize: '20px', 
    color: '#5f6368', 
    fontWeight: '400', 
    margin: 0, 
    lineHeight: '65px', 
    textAlign: 'center' 
  },
  logoutButton: { 
    display: "flex", 
    alignItems: "center", 
    padding: "8px 16px", 
    backgroundColor: "#dc3545", 
    color: "white", 
    border: "none", 
    borderRadius: "5px", 
    cursor: "pointer", 
    fontWeight: "bold", 
    fontSize: "14px" 
  },
  gridContainer: { 
    display: "grid", 
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
    gap: "20px", 
    padding: "30px" 
  },
  muralCard: { 
    backgroundColor: "white", 
    borderRadius: "8px", 
    border: "1px solid #dadce0", 
    overflow: "hidden", 
    cursor: "pointer" 
  },
  muralCardHeader: { 
    padding: "15px", 
    height: "100px" 
  },
  muralCardFooter: { 
    borderTop: "1px solid #ddd", 
    padding: "10px", 
    display: "flex", 
    justifyContent: "flex-end", 
    gap: "15px" 
  },
};