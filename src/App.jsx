import React, { useState, useEffect } from "react";
import { 
  FaEye, FaEyeSlash, FaUniversity, FaPlus, FaArrowLeft, FaArrowUp, FaArrowDown 
} from "react-icons/fa";
import { 
  BrowserRouter as Router, Routes, Route, Link, 
  useNavigate, useParams 
} from "react-router-dom";
import "./App.css";

const API_BASE = "https://api.joaobonin.com.br";

// --- TELA DE LOGIN ---
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [erroLogin, setErroLogin] = useState("");
  const [faculdades, setFaculdades] = useState([]);
  const [faculdadeSelecionada, setFaculdadeSelecionada] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/institution/`)
      .then((res) => res.json())
      .then((dados) => {
        if (dados && dados.institutions) setFaculdades(dados.institutions);
      })
      .catch((err) => console.error("Erro ao buscar instituições:", err));
  }, []);

  const handleEntrar = async () => {
    setErroLogin("");
    if (!faculdadeSelecionada) return setErroLogin("Selecione uma instituição");

    try {
      const response = await fetch(`${API_BASE}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (response.ok) {
        const instObj = faculdades.find(f => f.name === faculdadeSelecionada);
        localStorage.setItem("usuarioLogado", JSON.stringify({
          id: "1", // ID necessário para o Mural buscar no db.json
          email: email.trim(),
          institutionId: instObj?.id,
          faculdadeNome: faculdadeSelecionada
        }));
        navigate("/mural");
      } else {
        setErroLogin("E-mail ou senha incorretos");
      }
    } catch (error) {
      setErroLogin("Servidor indisponível.");
    }
  };

  return (
    <div style={styles.bodyLogin}>
      <div style={styles.container}>
        <img src="/true_class.png" alt="Logo TrueClass" style={styles.logoInternal} />
      
        <div style={{ position: "relative", width: "100%", marginBottom: "10px" }}>
          <select
            style={{ ...styles.input, appearance: "none", paddingRight: "35px" }}
            value={faculdadeSelecionada}
            onChange={(e) => setFaculdadeSelecionada(e.target.value)}
          >
            <option value="">Selecione sua instituição...</option>
            {faculdades.map((f) => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
          <FaUniversity style={styles.iconSelect} />
        </div>

        <input type="text" placeholder="E-mail" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        
        <div style={styles.passwordWrapper}>
          <input type={showPass ? "text" : "password"} placeholder="Senha" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeButton}>
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {erroLogin && <p style={styles.erroTexto}>{erroLogin}</p>}
        <button onClick={handleEntrar} style={styles.button}>Acessar Portal</button>
        
        <p style={styles.footerText}>
          Não tem uma conta? <Link to="/cadastro" style={styles.signupLink}>Cadastre-se</Link>
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
  const [faculdades, setFaculdades] = useState([]);
  const [idFaculdade, setIdFaculdade] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/institution/`).then(res => res.json()).then(d => setFaculdades(d.institutions || []));
  }, []);

  const handleFinalizarCadastro = async () => {
    if (password !== confirmPassword) return setErro("As senhas não coincidem");
    if (!idFaculdade) return setErro("Selecione uma instituição");

    try {
      const response = await fetch(`${API_BASE}/institution/${idFaculdade}/student/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (response.status === 201) {
        alert("Cadastro realizado!");
        navigate("/login");
      } else {
        setErro("Erro ao cadastrar.");
      }
    } catch (e) { setErro("Erro de conexão."); }
  };

  return (
    <div style={styles.bodyLogin}>
      <div style={styles.container}>
        <img src="/true_class.png" alt="Logo TrueClass" style={styles.logoInternal} />
              
        <div style={{ position: "relative", width: "100%", marginBottom: "10px" }}>
          <select 
            style={{ ...styles.input, appearance: "none", paddingRight: "35px" }} 
            value={idFaculdade} 
            onChange={(e) => setIdFaculdade(e.target.value)}
          >
             <option value="">Selecione sua Instituição</option>
             {faculdades.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <FaUniversity style={styles.iconSelect} />
        </div>

        <input type="text" placeholder="E-mail Institucional" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Sua Senha" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirme a Senha" style={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        
        {erro && <p style={styles.erroTexto}>{erro}</p>}
        
        <button onClick={handleFinalizarCadastro} style={styles.button}>Finalizar Cadastro</button>
        <p style={styles.footerText}><Link to="/login" style={styles.signupLink}>Voltar para o Login</Link></p>
      </div>
    </div>
  );
}

// --- MURAL ---
function Mural() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [novaMateria, setNovaMateria] = useState("");
  
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  useEffect(() => {
    if (!usuario?.id) return;

    const carregarMinhasSalas = async () => {
      setCarregando(true);
      try {
        const resInscricoes = await fetch(`http://localhost:3001/db_inscricoes?userId=${usuario.id}`);
        const inscricoes = await resInscricoes.json();
        
        const idsDasSalas = inscricoes.map(i => i.salaId);

        const resSalas = await fetch(`http://localhost:3001/db_salas`);
        const todasSalas = await resSalas.json();

        const salasDoAluno = todasSalas.filter(s => idsDasSalas.includes(s.id));
        
        setLista(salasDoAluno);
      } catch (err) {
        console.error("Erro ao carregar salas:", err);
      } finally {
        setCarregando(false);
      }
    };

    carregarMinhasSalas();
  }, [usuario?.id]);

  const handleAddMateria = () => {
    console.log("Adicionando:", novaMateria);
    setShowModal(false);
    setNovaMateria("");
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", position: "relative" }}>
      <header style={styles.muralHeader}>
        <h2 style={styles.muralTitle}>TRUE CLASS - {usuario?.faculdadeNome}</h2>
        <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={styles.logoutButton}>
          Sair
        </button>
      </header>

      <button onClick={() => setShowModal(true)} style={styles.addButton} title="Adicionar Matéria">
        <FaPlus />
      </button>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: "15px", color: "#333" }}>Nova Matéria</h3>
            <input 
              type="text" 
              placeholder="Digite o código da matéria" 
              style={styles.input}
              value={novaMateria}
              onChange={(e) => setNovaMateria(e.target.value)}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button onClick={handleAddMateria} style={styles.button}>Adicionar</button>
              <button onClick={() => setShowModal(false)} style={{ ...styles.button, backgroundColor: "#6c757d" }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.gridContainer}>
        {carregando ? <p>Carregando...</p> : lista.map(sala => (
          <div key={sala.id} style={styles.muralCard} onClick={() => navigate(`/materia/${sala.id}`)}>
            <div style={{...styles.muralCardHeader, backgroundColor: sala.cor || "#42576F"}}>
                <h3 style={{color: "white"}}>{sala.nome}</h3>
            </div>
            <div style={{padding: "15px", color: "#666"}}>Professor: {sala.professor}</div>
          </div>
        ))}
      </div>
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
            {/* SELETOR DE GUIAS */}
            <div style={styles.tabContainer}>
              <div 
                onClick={() => setGuiaAtiva("Comentarios")}
                style={{ 
                  ...styles.tabItem, 
                  color: guiaAtiva === "Comentarios" ? materia.cor : "#5f6368", 
                  borderBottom: guiaAtiva === "Comentarios" ? `3px solid ${materia.cor}` : "3px solid transparent",
                  fontWeight: guiaAtiva === "Comentarios" ? "bold" : "500"
                }}
              >
                <FaCommentAlt style={{ marginRight: '8px' }} /> Comentários
              </div>
              <div 
                onClick={() => setGuiaAtiva("Avaliacao")}
                style={{ 
                  ...styles.tabItem, 
                  color: guiaAtiva === "Avaliacao" ? materia.cor : "#5f6368", 
                  borderBottom: guiaAtiva === "Avaliacao" ? `3px solid ${materia.cor}` : "3px solid transparent",
                  fontWeight: guiaAtiva === "Avaliacao" ? "bold" : "500"
                }}
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
        <Route path="/" element={<Login />} />
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
    background: "linear-gradient(to top, #022e61, rgb(42, 82, 168))",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
  },
  logoInternal: {
    width: "150px",
    marginBottom: "20px"
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
  iconSelect: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#888",
    pointerEvents: "none"
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
  erroTexto: {
    color: "#dc3545",
    fontSize: "13px",
    margin: "2px 0",
    fontWeight: "bold"
  },
  muralHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "65px",
    backgroundColor: "white",
    borderBottom: "1px solid #ddd",
    width: '100%',
    position: 'relative'
  },
  muralTitle: {
    fontSize: '20px',
    color: '#5f6368',
    margin: 0,
    fontWeight: '400',
    textAlign: 'center',
    flex: 1
  },
  logoutButton: {
    position: 'absolute',
    right: '20px',
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  addButton: {
    position: "fixed",
    bottom: "40px",
    right: "40px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#022e61",
    color: "white",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    zIndex: 900,
    transition: "transform 0.2s",
    outline: "none"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modalContent: {
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "400px",
    textAlign: "center"
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
  }
};