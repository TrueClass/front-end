import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaSignOutAlt, FaUniversity, FaChalkboardTeacher, FaBook, FaArrowLeft, FaArrowUp, FaArrowDown, FaCommentAlt } from "react-icons/fa";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
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
    <div style={styles.bodySelecao}>
      <div style={styles.container}>
        <img src="/true_class.png" alt="TrueClass Logo" style={{ width: "200px", marginBottom: "20px" }} />
        <h2 style={{ color: "#333", marginBottom: "10px", fontSize: "22px" }}>Bem-vindo ao TrueClass</h2>
        <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>Selecione sua instituição para acessar o portal</p>
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
        <button onClick={handleAvancar} style={styles.button}>Avançar para o Login</button>
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
    } catch (error) { setErroLogin("Erro ao conectar com o servidor"); }
  };

  return (
    <div style={styles.bodyLogin}>
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
  const navigate = useNavigate();

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
      const response = await fetch("http://localhost:3001/db_users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, tipo: "aluno" }),
      });
      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        navigate("/login");
      }
    } catch (e) { setErroEmail("Erro ao conectar com o servidor."); }
  };

  return (
    <div style={styles.bodyLogin}>
      <img src={logo_fho} alt="Logo FHO" style={styles.logo_fho} />
      <h1 style={styles.mainTitle}>TRUECLASS</h1>
      <div style={styles.container}>
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Criar Conta</h2>
        <input type="text" placeholder="E-mail Institucional" style={styles.input} value={email} onChange={(e) => { setEmail(e.target.value); setErroEmail(""); }} />
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
            <>{!senhasIguais && <p style={styles.erroTexto}>● As senhas não coincidem</p>}
              {senhasIguais && <p style={styles.sucessoTexto}>● As senhas são idênticas!</p>}</>
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
  const [professores, setProfessores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState("Classes");
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [resSalas, resProfs] = await Promise.all([
          fetch("http://localhost:3001/db_salas"),
          fetch("http://localhost:3001/db_professores")
        ]);
        setMaterias(await resSalas.json());
        setProfessores(await resProfs.json());
        setCarregando(false);
      } catch (err) { setCarregando(false); }
    };
    buscarDados();
  }, []);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <div style={{ ...styles.sidebar, left: menuAberto ? "0" : "-250px" }}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoContainer}><img src="/true_class.png" alt="Logo" style={{ width: "160px" }} /></div>
          <button onClick={() => setMenuAberto(false)} style={styles.closeBtnAbsolute}>✕</button>
        </div>
        <nav style={styles.sidebarNav}>
          <div onClick={() => { setAbaAtiva("Classes"); setMenuAberto(false); }}
               style={{ ...styles.navItem, backgroundColor: abaAtiva === "Classes" ? "#e8f0fe" : "transparent", color: abaAtiva === "Classes" ? "#1967d2" : "#5f6368" }}>
            <FaBook style={{ marginRight: '15px' }} /> Classes
          </div>
          {usuario?.tipo === "aluno" && (
            <div onClick={() => { setAbaAtiva("Professores"); setMenuAberto(false); }}
                 style={{ ...styles.navItem, backgroundColor: abaAtiva === "Professores" ? "#e8f0fe" : "transparent", color: abaAtiva === "Professores" ? "#1967d2" : "#5f6368" }}>
              <FaChalkboardTeacher style={{ marginRight: '15px' }} /> Professores
            </div>
          )}
        </nav>
      </div>

      <header style={{ ...styles.muralHeader, position: 'relative', justifyContent: 'center' }}>
        <span onClick={() => setMenuAberto(true)} style={{ fontSize: '24px', cursor: 'pointer', position: 'absolute', left: '20px', color: '#5f6368' }}>☰</span>
        <h2 style={styles.muralTitle}>TRUE CLASS</h2>
        <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={styles.logoutButton}>Sair</button>
      </header>

      <div style={styles.gridContainer}>
        {carregando ? <p>Carregando...</p> : abaAtiva === "Classes" ? materias.map(m => (
          <div key={m.id} style={styles.muralCard} onClick={() => navigate(`/materia/${m.id}`)}>
            <div style={{ ...styles.muralCardHeader, backgroundColor: m.cor }}><h3 style={{ color: "white" }}>{m.nome}</h3></div>
            <div style={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ccc' }}>Ver Aulas</div>
          </div>
        )) : professores.map(p => (
          <div key={p.id} style={styles.muralCard}>
            <div style={{ ...styles.muralCardHeader, backgroundColor: p.cor }}><h3 style={{ color: "white" }}>{p.nome}</h3></div>
            <div style={{ height: '100px', textAlign: 'center', padding: '10px' }}>{p.email}</div>
          </div>
        ))}
      </div>
      {menuAberto && <div onClick={() => setMenuAberto(false)} style={styles.overlay}></div>}
    </div>
  );
}

// --- TELA DE DETALHES
function MateriaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [materia, setMateria] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [duvidas, setDuvidas] = useState([]);
  const [novaDuvida, setNovaDuvida] = useState("");
  
  const [guiaAtiva, setGuiaAtiva] = useState("Comentarios");
  const [minhaNota, setMinhaNota] = useState(0);

  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  useEffect(() => {
    fetch(`http://localhost:3001/db_salas/${id}`).then(res => res.json()).then(setMateria);
    fetch(`http://localhost:3001/db_aulas?materiaId=${id}`).then(res => res.json()).then(setAulas);
  }, [id]);

  useEffect(() => {
    if (aulaSelecionada) {
      fetch(`http://localhost:3001/db_duvidas?aulaId=${aulaSelecionada.id}`)
        .then(res => res.json())
        .then(dados => setDuvidas(dados.sort((a, b) => b.votos - a.votos)));

      fetch(`http://localhost:3001/db_avaliacoes?aulaId=${aulaSelecionada.id}&userId=${usuario.id}`)
        .then(res => res.json())
        .then(dados => {
          if (dados.length > 0) setMinhaNota(dados[0].nota);
          else setMinhaNota(0);
        });
    }
  }, [aulaSelecionada, usuario.id]);

  const handleSalvarNota = async (nota) => {
    const res = await fetch(`http://localhost:3001/db_avaliacoes?aulaId=${aulaSelecionada.id}&userId=${usuario.id}`);
    const existente = await res.json();

    if (existente.length > 0) {
      await fetch(`http://localhost:3001/db_avaliacoes/${existente[0].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nota })
      });
    } else {
      await fetch("http://localhost:3001/db_avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aulaId: aulaSelecionada.id, userId: usuario.id, nota })
      });
    }
    setMinhaNota(nota);
  };

  if (!materia) return <p>Carregando...</p>;

  return (
    <div style={{ backgroundColor: "#f1f3f4", minHeight: "100vh" }}>
      <header style={{ ...styles.muralHeader, backgroundColor: materia.cor, position: 'relative', justifyContent: 'center' }}>
        <button onClick={() => aulaSelecionada ? setAulaSelecionada(null) : navigate("/mural")} style={{ ...styles.backBtn, position: 'absolute', left: '20px' }}>
          <FaArrowLeft /> Voltar
        </button>
        <h2 style={{ ...styles.muralTitle, color: 'white' }}>{materia.nome}</h2>
      </header>

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {!aulaSelecionada ? (
          <div style={styles.forumContainer}>
            <h3>Cronograma de Aulas</h3>
            {aulas.map(aula => (
              <div key={aula.id} style={styles.aulaCard} onClick={() => setAulaSelecionada(aula)}>
                <strong>{aula.titulo}</strong>
                <p style={{ fontSize: '12px', color: '#666' }}>{aula.data}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.forumContainer}>
            {}
            <div style={styles.tabContainer}>
              <div 
                onClick={() => setGuiaAtiva("Comentarios")}
                style={{ ...styles.tabItem, color: guiaAtiva === "Comentarios" ? materia.cor : "#5f6368", borderBottom: guiaAtiva === "Comentarios" ? `3px solid ${materia.cor}` : "none" }}
              >
                Comentários
              </div>
              <div 
                onClick={() => setGuiaAtiva("Avaliacao")}
                style={{ ...styles.tabItem, color: guiaAtiva === "Avaliacao" ? materia.cor : "#5f6368", borderBottom: guiaAtiva === "Avaliacao" ? `3px solid ${materia.cor}` : "none" }}
              >
                Avaliação
              </div>
            </div>

            {/* CONTEÚDO DA GUIA: COMENTÁRIOS */}
            {guiaAtiva === "Comentarios" && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input style={styles.input} placeholder="Dúvida anônima..." value={novaDuvida} onChange={e => setNovaDuvida(e.target.value)} />
                  <button onClick={() => {/* lógica de postar */}} style={{ ...styles.button, width: '100px', marginTop: 0 }}>Postar</button>
                </div>
                {duvidas.map(d => (
                  <div key={d.id} style={styles.duvidaCard}>
                    <div style={styles.votosContainer}>
                       <FaArrowUp onClick={() => handleVoto(d, "up")} style={{ color: d.usuariosVotaram?.find(v => v.userId === usuario.id)?.tipo === "up" ? "#1967d2" : "#ccc" }} />
                       <span>{d.votos}</span>
                       <FaArrowDown onClick={() => handleVoto(d, "down")} style={{ color: d.usuariosVotaram?.find(v => v.userId === usuario.id)?.tipo === "down" ? "#d93025" : "#ccc" }} />
                    </div>
                    <p>{d.texto}</p>
                  </div>
                ))}
              </div>
            )}

            {/* CONTEÚDO DA GUIA: AVALIAÇÃO */}
            {guiaAtiva === "Avaliacao" && (
              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <h4>Como você avalia a aula de hoje?</h4>
                <div style={{ fontSize: '40px', margin: '20px 0' }}>
                  {[1, 2, 3, 4, 5].map((estrela) => (
                    <span 
                      key={estrela} 
                      onClick={() => handleSalvarNota(estrela)}
                      style={{ cursor: 'pointer', color: estrela <= minhaNota ? "#fbbc04" : "#e8eaed", transition: '0.2s' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p style={{ color: '#70757a' }}>
                  {minhaNota > 0 ? `Sua nota: ${minhaNota} estrelas` : "Você ainda não avaliou esta aula."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- APP ---
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelecaoFacul />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/mural" element={<Mural />} />
        <Route path="/materia/:id" element={<MateriaDetalhes />} />
      </Routes>
    </Router>
  );
}

// --- ESTILOS ---
const styles = {
  bodyLogin: { 
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
    height: "100vh", 
    display: "flex", 
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
    height: "auto" 
  },
  mainTitle: { 
    color: "white", 
    fontSize: "60px", 
    fontWeight: "bold", 
    letterSpacing: "2px", 
    marginBottom: "40px", 
    marginTop: "0", 
    textAlign: "center" 
  },
  container: { 
    background: "white", 
    padding: "30px", 
    borderRadius: "10px", 
    width: "90%", 
    maxWidth: "400px", 
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)", 
    textAlign: "center", 
    boxSizing: "border-box" 
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
    backgroundColor: "#fff", 
    color: "#333" 
  },
  passwordWrapper: { 
    position: "relative", 
    width: "100%", 
    boxSizing: "border-box" 
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
    alignItems: "center", 
    height: "65px", 
    backgroundColor: "white", 
    borderBottom: "1px solid #ddd", 
    width: '100%' 
  },
  muralTitle: { 
    fontSize: '20px', 
    color: '#5f6368', 
    margin: 0, 
    fontWeight: '400', 
    textAlign: 'center' 
  },
  logoutButton: { 
    padding: "8px 16px", 
    backgroundColor: "#dc3545", 
    color: "white", 
    border: "none", 
    borderRadius: "5px", 
    cursor: "pointer", 
    fontWeight: "bold", 
    position: 'absolute', 
    right: '20px' 
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
    cursor: "pointer", 
    overflow: "hidden" 
  },
  muralCardHeader: { 
    padding: "15px", 
    height: "80px" 
  },
  sidebar: { 
    position: "fixed", 
    top: 0, 
    width: "250px", 
    height: "100%", 
    backgroundColor: "white", 
    transition: "0.3s", 
    zIndex: 1000, 
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)' 
  },
  sidebarHeader: { 
    padding: "30px 20px", 
    borderBottom: "1px solid #eee", 
    textAlign: 'center', 
    position: 'relative' 
  },
  closeBtnAbsolute: { 
    position: "absolute", 
    right: "15px", 
    top: "15px", 
    background: "none", 
    border: "none", 
    fontSize: "20px", 
    cursor: "pointer" 
  },
  navItem: { 
    padding: "15px", 
    cursor: "pointer", 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px' 
  },
  overlay: { 
    position: "fixed", 
    top: 0, 
    left: 0, 
    width: "100%", 
    height: "100%", 
    backgroundColor: "rgba(0,0,0,0.4)", 
    zIndex: 999 
  },
  aulaCard: { 
    padding: '15px', 
    background: 'white', 
    border: '1px solid #ddd', 
    borderRadius: '8px', 
    marginBottom: '10px', 
    cursor: 'pointer' 
  },
  forumContainer: { 
    background: 'white', 
    padding: '25px', 
    borderRadius: '8px', 
    border: '1px solid #ddd' 
  },
  duvidaCard: { 
    display: 'flex', 
    gap: '20px', 
    padding: '15px', 
    borderBottom: '1px solid #eee' 
  },
  votosContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '5px', 
    background: '#f8f9fa', 
    padding: '10px', 
    borderRadius: '5px', 
    minWidth: '40px' 
  },
  backBtn: { 
    background: 'rgba(255,255,255,0.3)', 
    border: 'none', color: 'white', 
    padding: '8px 12px', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '5px' 
  },
  logoContainer: { 
    width: '100%', 
    display: 'flex', 
    justifyContent: 'center' 
  },
  tabContainer: {
    display: "flex",
    borderBottom: "1px solid #ddd",
    marginBottom: "10px",
    gap: "30px"
  },
  tabItem: {
    padding: "10px 5px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "500",
    transition: "0.3s",
    marginBottom: "-1px"
  },
};