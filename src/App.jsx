import React, { useState, useEffect } from "react";
import { 
  FaEye, FaEyeSlash, FaUniversity, FaPlus, FaArrowLeft, FaArrowUp, FaArrowDown, FaCommentAlt 
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

// --- MURAL DO PROFESSOR ---
function MuralProfessor() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  useEffect(() => {
    if (!usuario?.id) return;

    const carregarSalasDoProfessor = async () => {
      setCarregando(true);
      try {
        // Buscando as salas associadas ao ID do professor
        const resSalas = await fetch(`http://localhost:3001/db_salas?professorId=${usuario.id}`);
        const salas = await resSalas.json();
        setLista(salas);
      } catch (err) {
        console.error("Erro ao carregar salas do professor:", err);
      } finally {
        setCarregando(false);
      }
    };

    carregarSalasDoProfessor();
  }, [usuario?.id]);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", position: "relative" }}>
      <header style={styles.muralHeader}>
        <h2 style={styles.muralTitle}>PAINEL DO PROFESSOR - {usuario?.faculdadeNome}</h2>
        <button 
          onClick={() => { localStorage.clear(); navigate("/login"); }} 
          style={styles.logoutButton}
        >
          Sair
        </button>
      </header>

      {/* Botão flutuante direciona para a tela de criação */}
      <button 
        onClick={() => navigate("/professor/criar-materia")} 
        style={styles.addButton} 
        title="Criar Nova Matéria"
      >
        <FaPlus />
      </button>

      <div style={styles.gridContainer}>
        {carregando ? (
          <p>Carregando...</p>
        ) : lista.length === 0 ? (
          <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#666" }}>
            Você ainda não possui matérias criadas. Clique no "+" para começar.
          </p>
        ) : (
          lista.map(sala => (
            <div 
              key={sala.id} 
              style={styles.muralCard} 
              onClick={() => navigate(`/professor/materia/${sala.id}`)}
            >
              <div style={{...styles.muralCardHeader, backgroundColor: sala.cor || "#2A52A8"}}>
                <h3 style={{color: "white", margin: 0}}>{sala.nome}</h3>
              </div>
              <div style={{padding: "15px", color: "#666", display: "flex", justifyContent: "space-between"}}>
                <span>Turma ativa</span>
                <strong>Nota: {sala.notaGeral || "N/A"}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// --- CRIAÇÃO DE MATÉRIA (PROFESSOR) ---
function CriarMateria() {
  const [nome, setNome] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [isSemanal, setIsSemanal] = useState(false);
  const [quinzena, setQuinzena] = useState("");
  const [erro, setErro] = useState("");

  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  const handleSalvarMateria = async (e) => {
    e.preventDefault();
    setErro("");

    if (!nome || !dataInicio || !dataFim) {
      return setErro("Por favor, preencha todos os campos obrigatórios.");
    }

    if (isSemanal && !quinzena) {
      return setErro("Por favor, selecione qual é a quinzena (A ou B).");
    }

    const novaSala = {
      nome,
      professor: usuario?.email.split("@")[0] || "Professor", // Nome gerado a partir do e-mail
      professorId: usuario?.id,
      dataInicio,
      dataFim,
      semanal: isSemanal,
      quinzena: isSemanal ? quinzena : null,
      cor: "#022e61", // Cor padrão para as matérias criadas
      notaGeral: 5.0  // Começa com nota máxima padrão
    };

    try {
      const response = await fetch("http://localhost:3001/db_salas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaSala),
      });

      if (response.ok) {
        alert("Matéria criada com sucesso!");
        navigate("/professor/mural");
      } else {
        setErro("Erro ao salvar a matéria no servidor.");
      }
    } catch (err) {
      setErro("Erro de conexão com o servidor local.");
    }
  };

  return (
    <div style={{ backgroundColor: "#f1f3f4", minHeight: "100vh" }}>
      <header style={{ ...styles.muralHeader, backgroundColor: "#022e61", justifyContent: 'center' }}>
        <button 
          onClick={() => navigate("/professor/mural")} 
          style={{ ...styles.backBtn, position: 'absolute', left: '20px', color: 'white', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <FaArrowLeft /> Voltar
        </button>
        <h2 style={{ ...styles.muralTitle, color: 'white' }}>Criar Nova Matéria</h2>
      </header>

      <div style={{ padding: '30px', maxWidth: '500px', margin: '40px auto' }}>
        <div style={{ ...styles.container, maxWidth: '100%', textAlign: 'left' }}>
          <form onSubmit={handleSalvarMateria}>
            
            <label style={styles.formLabel}>Nome da Matéria *</label>
            <input 
              type="text" 
              placeholder="Ex: Estrutura de Dados II" 
              style={styles.input} 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
            />

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.formLabel}>Data de Início *</label>
                <input 
                  type="date" 
                  style={styles.input} 
                  value={dataInicio} 
                  onChange={(e) => setDataInicio(e.target.value)} 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.formLabel}>Data de Fim *</label>
                <input 
                  type="date" 
                  style={styles.input} 
                  value={dataFim} 
                  onChange={(e) => setDataFim(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                id="semanal" 
                checked={isSemanal} 
                onChange={(e) => {
                  setIsSemanal(e.target.checked);
                  if(!e.target.checked) setQuinzena(""); // Limpa se desmarcar
                }}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="semanal" style={{ ...styles.formLabel, margin: 0, cursor: 'pointer' }}>
                A matéria é semanal?
              </label>
            </div>

            {isSemanal && (
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', border: '1px dashed #ccc' }}>
                <label style={styles.formLabel}>Selecione a Quinzena:</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="quinzena" 
                      value="A" 
                      checked={quinzena === "A"} 
                      onChange={(e) => setQuinzena(e.target.value)} 
                    />
                    Quinzena A
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="quinzena" 
                      value="B" 
                      checked={quinzena === "B"} 
                      onChange={(e) => setQuinzena(e.target.value)} 
                    />
                    Quinzena B
                  </label>
                </div>
              </div>
            )}

            {erro && <p style={{ ...styles.erroTexto, textAlign: 'center', marginBottom: '10px' }}>{erro}</p>}

            <button type="submit" style={styles.button}>Salvar Matéria</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- DETALHES DA MATÉRIA (VISÃO DO PROFESSOR) ---
function MateriaDetalhesProfessor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [materia, setMateria] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [duvidas, setDuvidas] = useState([]);
  const [avaliacoesDetalhadas, setAvaliacoesDetalhadas] = useState([]);
  
  const [guiaAtiva, setGuiaAtiva] = useState("Comentarios");

  // Carrega dados da matéria e as aulas
  useEffect(() => {
    fetch(`http://localhost:3001/db_salas/${id}`).then(res => res.json()).then(setMateria);
    
    // Busca todas as aulas dessa matéria
    fetch(`http://localhost:3001/db_aulas?materiaId=${id}`)
      .then(res => res.json())
      .then(async (dadosAulas) => {
        // Para cada aula, vamos buscar as avaliações e calcular a média
        const aulasComMedia = await Promise.all(dadosAulas.map(async (aula) => {
          const resAv = await fetch(`http://localhost:3001/db_avaliacoes?aulaId=${aula.id}`);
          const avaliacoes = await resAv.json();
          
          if (avaliacoes.length === 0) return { ...aula, media: "Sem notas" };
          
          const soma = avaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
          const mediaCalculada = (soma / avaliacoes.length).toFixed(1);
          return { ...aula, media: `${mediaCalculada} ★ (${avaliacoes.length})` };
        }));
        
        setAulas(aulasComMedia);
      });
  }, [id]);

  // Carrega feedbacks específicos quando uma aula é clicada
  useEffect(() => {
    if (aulaSelecionada) {
      // Busca dúvidas anônimas organizadas por votos
      fetch(`http://localhost:3001/db_duvidas?aulaId=${aulaSelecionada.id}`)
        .then(res => res.json())
        .then(dados => setDuvidas(dados.sort((a, b) => b.votos - a.votos)));

      // Busca todas as avaliações para o professor ver a distribuição de notas
      fetch(`http://localhost:3001/db_avaliacoes?aulaId=${aulaSelecionada.id}`)
        .then(res => res.json())
        .then(setAvaliacoesDetalhadas);
    }
  }, [aulaSelecionada]);

  if (!materia) return <p>Carregando dados da matéria...</p>;

  return (
    <div style={{ backgroundColor: "#f1f3f4", minHeight: "100vh" }}>
      <header style={{ ...styles.muralHeader, backgroundColor: materia.cor || "#022e61", position: 'relative', justifyContent: 'center' }}>
        <button 
          onClick={() => aulaSelecionada ? setAulaSelecionada(null) : navigate("/professor/mural")} 
          style={{ ...styles.backBtn, position: 'absolute', left: '20px', color: 'white', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <FaArrowLeft /> Voltar
        </button>
        <h2 style={{ ...styles.muralTitle, color: 'white' }}>{materia.nome} (Mural do Professor)</h2>
      </header>

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {!aulaSelecionada ? (
          <div style={styles.forumContainer}>
            <h3 style={{ color: "#333", marginBottom: "15px" }}>Métricas de Avaliação por Aula</h3>
            {aulas.map(aula => (
              <div 
                key={aula.id} 
                style={{ ...styles.aulaCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} 
                onClick={() => setAulaSelecionada(aula)}
              >
                <div>
                  <strong>{aula.titulo}</strong>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>{aula.data}</p>
                </div>
                <div style={{ backgroundColor: "#fbbc04", color: "#333", padding: "5px 10px", borderRadius: "15px", fontWeight: "bold", fontSize: "14px" }}>
                  Média: {aula.media}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.forumContainer}>
            <h3 style={{ textAlign: 'center', color: '#333' }}>{aulaSelecionada.titulo}</h3>
            
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
                Dúvidas e Comentários ({duvidas.length})
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
                Notas Recebidas ({avaliacoesDetalhadas.length})
              </div>
            </div>

            {/* CONTEÚDO DA GUIA: COMENTÁRIOS */}
            {guiaAtiva === "Comentarios" && (
              <div style={{ marginTop: '20px' }}>
                {duvidas.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>Nenhum comentário enviado para esta aula.</p>
                ) : (
                  duvidas.map(d => (
                    <div key={d.id} style={styles.duvidaCard}>
                      <div style={styles.votosContainer}>
                        <FaArrowUp style={{ color: "#1967d2" }} />
                        <span>{d.votos}</span>
                        <FaArrowDown style={{ color: "#ccc" }} />
                      </div>
                      <p style={{ margin: 0, color: "#333" }}>{d.texto}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CONTEÚDO DA GUIA: AVALIAÇÃO */}
            {guiaAtiva === "Avaliacao" && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#5f6368', marginBottom: '15px' }}>Distribuição de Notas dos Alunos:</h4>
                {avaliacoesDetalhadas.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>Nenhuma avaliação recebida ainda.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {avaliacoesDetalhadas.map((av, index) => (
                      <div key={index} style={{ padding: '10px 15px', backgroundColor: '#fff', borderRadius: '5px', border: '1px solid #dadce0', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#555' }}>Aluno Anônimo #{index + 1}</span>
                        <span style={{ color: '#fbbc04', fontWeight: 'bold' }}>{"★".repeat(av.nota)}{"☆".repeat(5 - av.nota)} ({av.nota}/5)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- NOTA GERAL DO PROFESSOR (DASHBOARD) ---
function NotaGeralProfessor() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [metricas, setMetricas] = useState({ mediaGlobal: 0, totalAvaliacoes: 0, materiasDetalhadas: [] });
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  useEffect(() => {
    if (!usuario?.id) return;

    const calcularMetricasGlobais = async () => {
      setCarregando(true);
      try {
        // 1. Busca todas as matérias do professor
        const resSalas = await fetch(`http://localhost:3001/db_salas?professorId=${usuario.id}`);
        const salas = await resSalas.json();

        let somaNotasGlobal = 0;
        let totalAvaliacoesGlobal = 0;
        const listaMateriasMetricas = [];

        // 2. Passa de matéria em matéria buscando as aulas e notas
        for (const sala of salas) {
          const resAulas = await fetch(`http://localhost:3001/db_aulas?materiaId=${sala.id}`);
          const aulas = await resAulas.json();

          let somaNotasMateria = 0;
          let totalAvaliacoesMateria = 0;

          // Busca as avaliações de cada aula daquela matéria específica
          for (const aula of aulas) {
            const resAv = await fetch(`http://localhost:3001/db_avaliacoes?aulaId=${aula.id}`);
            const avaliacoes = await resAv.json();

            totalAvaliacoesMateria += avaliacoes.length;
            somaNotasMateria += avaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
          }

          const mediaMateria = totalAvaliacoesMateria > 0 ? (somaNotasMateria / totalAvaliacoesMateria).toFixed(2) : "Sem notas";

          // Acumula para os indicadores macro globais
          somaNotasGlobal += somaNotasMateria;
          totalAvaliacoesGlobal += totalAvaliacoesMateria;

          listaMateriasMetricas.push({
            id: sala.id,
            nome: sala.nome,
            cor: sala.cor || "#022e61",
            media: mediaMateria,
            votos: totalAvaliacoesMateria
          });
        }

        const mediaGlobalCalculada = totalAvaliacoesGlobal > 0 ? (somaNotasGlobal / totalAvaliacoesGlobal).toFixed(2) : "0.0";

        setMetricas({
          mediaGlobal: mediaGlobalCalculada,
          totalAvaliacoes: totalAvaliacoesGlobal,
          materiasDetalhadas: listaMateriasMetricas
        });

      } catch (err) {
        console.error("Erro ao calcular métricas globais do professor:", err);
      } finally {
        setCarregando(false);
      }
    };

    calcularMetricasGlobais();
  }, [usuario?.id]);

  return (
    <div style={{ backgroundColor: "#f1f3f4", minHeight: "100vh" }}>
      <header style={{ ...styles.muralHeader, backgroundColor: "#022e61", justifyContent: 'center' }}>
        <button 
          onClick={() => navigate("/professor/mural")} 
          style={{ ...styles.backBtn, position: 'absolute', left: '20px', color: 'white', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <FaArrowLeft /> Painel
        </button>
        <h2 style={{ ...styles.muralTitle, color: 'white' }}>Desempenho Geral Corporativo</h2>
      </header>

      <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
        {carregando ? (
          <p style={{ textAlign: 'center' }}>Analisando avaliações e compilando notas...</p>
        ) : (
          <div>
            {/* SCORE CARD MACRO */}
            <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", textAlign: "center", marginBottom: "30px", border: "1px solid #dadce0" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#5f6368", fontSize: "16px", uppercase: "true" }}>Sua Média Global</h3>
              <h1 style={{ fontSize: "64px", margin: "0", color: "#1967d2", fontWeight: "bold" }}>
                {metricas.mediaGlobal} <span style={{ fontSize: "28px", color: "#fbbc04" }}>★</span>
              </h1>
              <p style={{ color: "#70757a", margin: "10px 0 0 0", fontSize: "14px" }}>
                Com base em <strong>{metricas.totalAvaliacoes}</strong> avaliações individuais dadas por alunos.
              </p>
            </div>

            {/* LISTAGEM DETALHADA POR MATÉRIA */}
            <div style={{ ...styles.container, maxWidth: "100%", textAlign: "left", padding: "20px" }}>
              <h4 style={{ margin: "0 0 15px 0", color: "#333", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Pontuação detalhada por Matéria</h4>
              
              {metricas.materiasDetalhadas.length === 0 ? (
                <p style={{ color: "#666" }}>Você não possui disciplinas para gerar relatórios.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {metricas.materiasDetalhadas.map(m => (
                    <div 
                      key={m.id} 
                      onClick={() => navigate(`/professor/materia/${m.id}`)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "6px", border: `1px solid #dadce0`, borderLeft: `6px solid ${m.cor}`, cursor: "pointer" }}
                    >
                      <strong style={{ color: "#333" }}>{m.nome}</strong>
                      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <span style={{ fontSize: "12px", color: "#70757a" }}>{m.votos} avaliações</span>
                        <span style={{ backgroundColor: "#1967d2", color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "13px", fontWeight: "bold" }}>
                          {m.media} {typeof m.media === "string" && m.media.includes("Sem") ? "" : "★"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- PAINEL DO COORDENADOR (VISÃO MACRO INSTITUCIONAL) ---
function PainelCoordenador() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [professores, setProfessores] = useState([]);
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  useEffect(() => {
    const carregarEcalcularProfessores = async () => {
      setCarregando(true);
      try {
        // 1. Em um cenário real, buscaríamos os professores da API institucional. 
        // Para o json-server, vamos mapear os professores a partir das salas criadas.
        const resSalas = await fetch(`http://localhost:3001/db_salas`);
        const todasSalas = await resSalas.json();

        // Agrupa salas por professor para descobrir quem são os professores ativos
        const mapaProfessores = {};

        todasSalas.forEach(sala => {
          if (sala.professorId) {
            if (!mapaProfessores[sala.professorId]) {
              mapaProfessores[sala.professorId] = {
                id: sala.professorId,
                nome: sala.professor || "Professor",
                salasIds: []
              };
            }
            mapaProfessores[sala.professorId].salasIds.push(sala.id);
          }
        });

        const listaProfessoresMetricas = [];

        // 2. Calcula a média global de cada professor com base em suas aulas e avaliações
        for (const idProf in mapaProfessores) {
          const prof = mapaProfessores[idProf];
          let somaNotasGlobal = 0;
          let totalAvaliacoesGlobal = 0;

          for (const salaId of prof.salasIds) {
            const resAulas = await fetch(`http://localhost:3001/db_aulas?materiaId=${salaId}`);
            const aulas = await resAulas.json();

            for (const aula of aulas) {
              const resAv = await fetch(`http://localhost:3001/db_avaliacoes?aulaId=${aula.id}`);
              const avaliacoes = await resAv.json();

              totalAvaliacoesGlobal += avaliacoes.length;
              somaNotasGlobal += avaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
            }
          }

          const mediaGlobal = totalAvaliacoesGlobal > 0 ? (somaNotasGlobal / totalAvaliacoesGlobal).toFixed(2) : "Sem notas";

          listaProfessoresMetricas.push({
            id: prof.id,
            nome: prof.nome,
            media: mediaGlobal,
            totalAulasAvaliadas: totalAvaliacoesGlobal,
            totalMaterias: prof.salasIds.length
          });
        }

        // Ordena os professores por maior nota (Ranking de Desempenho)
        listaProfessoresMetricas.sort((a, b) => {
          if (a.media === "Sem notas") return 1;
          if (b.media === "Sem notas") return -1;
          return parseFloat(b.media) - parseFloat(a.media);
        });

        setProfessores(listaProfessoresMetricas);

      } catch (err) {
        console.error("Erro ao processar painel do coordenador:", err);
      } finally {
        setCarregando(false);
      }
    };

    carregarEcalcularProfessores();
  }, []);

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <header style={styles.muralHeader}>
        <h2 style={styles.muralTitle}>PAINEL DA COORDENAÇÃO - {usuario?.faculdadeNome}</h2>
        <button 
          onClick={() => { localStorage.clear(); navigate("/login"); }} 
          style={styles.logoutButton}
        >
          Sair
        </button>
      </header>

      <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto' }}>
        <h3 style={{ color: "#333", marginBottom: "5px" }}>Indicadores de Corpo Docente</h3>
        <p style={{ color: "#70757a", fontSize: "14px", marginBottom: "25px" }}>
          Abaixo estão listados todos os professores ativos e suas respectivas médias consolidadas de satisfação.
        </p>

        {carregando ? (
          <p style={{ textAlign: "center", color: "#666" }}>Consolidando dados pedagógicos institucionais...</p>
        ) : professores.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>Nenhum professor ou matéria cadastrada no sistema.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {professores.map((prof, index) => (
              <div 
                key={prof.id}
                onClick={() => navigate(`/coordenador/professor/${prof.id}`)}
                style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  padding: "20px", 
                  backgroundColor: "white", 
                  borderRadius: "8px", 
                  border: "1px solid #dadce0", 
                  boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
                  cursor: "pointer",
                  transition: "transform 0.2s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: index === 0 ? "#fbbc04" : "#5f6368", width: "30px" }}>
                    #{index + 1}
                  </div>
                  <div>
                    <strong style={{ fontSize: "16px", color: "#333" }}>{prof.nome}</strong>
                    <div style={{ fontSize: "13px", color: "#70757a", marginTop: "4px" }}>
                      {prof.totalMaterias} {prof.totalMaterias === 1 ? "matéria vinculada" : "matérias vinculadas"} • {prof.totalAulasAvaliadas} avaliações coletadas
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "14px", color: "#5f6368", fontWeight: "500" }}>Média Geral:</span>
                  <span style={{ 
                    backgroundColor: prof.media === "Sem notas" ? "#e8eaed" : parseFloat(prof.media) >= 4 ? "#1e7e34" : "#d93025", 
                    color: prof.media === "Sem notas" ? "#333" : "white", 
                    padding: "6px 14px", 
                    borderRadius: "20px", 
                    fontSize: "14px", 
                    fontWeight: "bold" 
                  }}>
                    {prof.media} {prof.media !== "Sem notas" && "★"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- DETALHES DO PROFESSOR (VISÃO DO COORDENADOR) ---
function ProfessorDetalhesCoordenador() {
  const { professorId } = useParams();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [nomeProfessor, setNomeProfessor] = useState("");
  const [materias, setMaterias] = useState([]);

  useEffect(() => {
    const carregarDadosDoProfessor = async () => {
      setCarregando(true);
      try {
        // 1. Busca todas as salas/matérias vinculadas a esse professorId
        const resSalas = await fetch(`http://localhost:3001/db_salas?professorId=${professorId}`);
        const salas = await resSalas.json();

        if (salas.length > 0) {
          setNomeProfessor(salas[0].professor || "Professor");
        }

        const listaMateriasComNotas = [];

        // 2. Calcula a média de cada matéria individualmente
        for (const sala of salas) {
          const resAulas = await fetch(`http://localhost:3001/db_aulas?materiaId=${sala.id}`);
          const aulas = await resAulas.json();

          let somaNotasMateria = 0;
          let totalAvaliacoesMateria = 0;

          for (const aula of aulas) {
            const resAv = await fetch(`http://localhost:3001/db_avaliacoes?aulaId=${aula.id}`);
            const avaliacoes = await resAv.json();

            totalAvaliacoesMateria += avaliacoes.length;
            somaNotasMateria += avaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
          }

          const mediaMateria = totalAvaliacoesMateria > 0 ? (somaNotasMateria / totalAvaliacoesMateria).toFixed(2) : "Sem notas";

          listaMateriasComNotas.push({
            id: sala.id,
            nome: sala.nome,
            cor: sala.cor || "#022e61",
            media: mediaMateria,
            totalAvaliacoes: totalAvaliacoesMateria
          });
        }

        setMaterias(listaMateriasComNotas);

      } catch (err) {
        console.error("Erro ao carregar detalhes do professor para coordenação:", err);
      } finally {
        setCarregando(false);
      }
    };

    carregarDadosDoProfessor();
  }, [professorId]);

  return (
    <div style={{ backgroundColor: "#f1f3f4", minHeight: "100vh" }}>
      <header style={{ ...styles.muralHeader, backgroundColor: "#23272b", justifyContent: 'center' }}>
        <button 
          onClick={() => navigate("/coordenador/mural")} 
          style={{ ...styles.backBtn, position: 'absolute', left: '20px', color: 'white', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <FaArrowLeft /> Voltar
        </button>
        <h2 style={{ ...styles.muralTitle, color: 'white' }}>Auditoria Docente</h2>
      </header>

      <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
        {carregando ? (
          <p style={{ textAlign: "center" }}>Coletando histórico de disciplinas...</p>
        ) : (
          <div>
            <div style={{ backgroundColor: "white", padding: "20px 25px", borderRadius: "8px", border: "1px solid #dadce0", marginBottom: "25px" }}>
              <span style={{ fontSize: "12px", color: "#70757a", fontWeight: "bold", textTransform: "uppercase" }}>Análise de Desempenho</span>
              <h2 style={{ margin: "5px 0 0 0", color: "#333" }}>Prof. {nomeProfessor}</h2>
            </div>

            <h3 style={{ color: "#5f6368", fontSize: "16px", marginBottom: "15px" }}>Grade de Matérias Ministradas</h3>

            {materias.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666", backgroundColor: "#fff", padding: "20px", borderRadius: "8px" }}>
                Este professor não possui matérias registradas neste semestre.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                {materias.map(m => (
                  <div 
                    key={m.id}
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      padding: "20px", 
                      backgroundColor: "white", 
                      borderRadius: "8px", 
                      border: "1px solid #dadce0",
                      borderLeft: `6px solid ${m.cor}`
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "16px", color: "#333" }}>{m.nome}</strong>
                      <div style={{ fontSize: "13px", color: "#70757a", marginTop: "4px" }}>
                        {m.totalAvaliacoes} avaliações coletadas dos alunos nesta disciplina
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ block: "true", fontSize: "12px", color: "#70757a" }}>Média da Matéria:</span>
                        <strong style={{ display: "block", fontSize: "18px", color: m.media === "Sem notas" ? "#666" : "#1967d2" }}>
                          {m.media} {m.media !== "Sem notas" && "★"}
                        </strong>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/professor/materia/${m.id}`)}
                        style={{ 
                          backgroundColor: "#f8f9fa", 
                          border: "1px solid #dadce0", 
                          padding: "8px 12px", 
                          borderRadius: "5px", 
                          cursor: "pointer", 
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "#333"
                        }}
                      >
                        Auditar Aulas
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- TELA DE DETALHES ---
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
  const [meuComentarioAvaliacao, setMeuComentarioAvaliacao] = useState("");
  const [jaAvaliou, setJaAvaliou] = useState(false);
  const [avaliacoesDaAula, setAvaliacoesDaAula] = useState([]);

  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  useEffect(() => {
    fetch(`http://localhost:3001/db_salas/${id}`).then(res => res.json()).then(setMateria);
    fetch(`http://localhost:3001/db_aulas?materiaId=${id}`).then(res => res.json()).then(setAulas);
  }, [id]);

  useEffect(() => {
    if (aulaSelecionada) {
      // 1. Busca dúvidas abertas (ilimitadas)
      fetch(`http://localhost:3001/db_duvidas?aulaId=${aulaSelecionada.id}`)
        .then(res => res.json())
        .then(dados => setDuvidas(dados.sort((a, b) => b.votos - a.votos)));

      // 2. Busca todas as avaliações com comentários desta aula
      fetch(`http://localhost:3001/db_avaliacoes?aulaId=${aulaSelecionada.id}`)
        .then(res => res.json())
        .then(dados => {
          setAvaliacoesDaAula(dados.sort((a, b) => b.votos - a.votos));
          
          // Verifica se o usuário logado já fez a avaliação dele nesta aula
          const avaliacaoDoUsuario = dados.find(av => av.userId === usuario.id);
          if (avaliacaoDoUsuario) {
            setMinhaNota(avaliacaoDoUsuario.nota);
            setMeuComentarioAvaliacao(avaliacaoDoUsuario.comentario || "");
            setJaAvaliou(true);
          } else {
            setMinhaNota(0);
            setMeuComentarioAvaliacao("");
            setJaAvaliou(false);
          }
        });
    }
  }, [aulaSelecionada, usuario.id]);

  // --- SITEMA DE VOTOS GLOBAL (SEJA PARA DÚVIDAS OU AVALIAÇÕES) ---
  const handleVotoGlobal = async (item, tipo, endpoint) => {
    const jaVotou = item.usuariosVotaram?.find(v => v.userId === usuario.id);
    if (jaVotou) return alert("Você já computou seu voto aqui!");

    const novosVotos = tipo === "up" ? item.votos + 1 : item.votos - 1;
    const novosUsuariosVotaram = [...(item.usuariosVotaram || []), { userId: usuario.id, tipo }];

    try {
      await fetch(`http://localhost:3001/${endpoint}/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votos: novosVotos, usuariosVotaram: novosUsuariosVotaram })
      });
      
      if (endpoint === "db_duvidas") {
        setDuvidas(prev => prev.map(d => d.id === item.id ? { ...d, votos: novosVotos, usuariosVotaram: novosUsuariosVotaram } : d).sort((a, b) => b.votos - a.votos));
      } else {
        setAvaliacoesDaAula(prev => prev.map(a => a.id === item.id ? { ...a, votos: novosVotos, usuariosVotaram: novosUsuariosVotaram } : d).sort((a, b) => b.votos - a.votos));
      }
    } catch (err) { console.error("Erro ao computar voto:", err); }
  };

  // --- ADICIONAR DÚVIDA (ILIMITADO) ---
  const handleCriarDuvida = async () => {
    if (!novaDuvida.trim()) return;
    const novoItem = { aulaId: aulaSelecionada.id, texto: novaDuvida.trim(), votos: 0, usuariosVotaram: [] };
    try {
      const res = await fetch("http://localhost:3001/db_duvidas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoItem)
      });
      if (res.ok) {
        const dado = await res.json();
        setDuvidas(prev => [dado, ...prev]);
        setNovaDuvida("");
      }
    } catch (err) { console.error(err); }
  };

  // --- SALVAR AVALIAÇÃO + COMENTÁRIO (MÁXIMO 1 POR ALUNO) ---
  const handlePostarAvaliacaoUnica = async () => {
    if (minhaNota === 0) return alert("Por favor, selecione pelo menos 1 estrela para avaliar.");
    if (!meuComentarioAvaliacao.trim()) return alert("Deixe um breve comentário justificando sua avaliação.");

    const payload = {
      aulaId: aulaSelecionada.id,
      userId: usuario.id,
      nota: minhaNota,
      comentario: meuComentarioAvaliacao.trim(),
      votos: 0,
      usuariosVotaram: []
    };

    try {
      const res = await fetch("http://localhost:3001/db_avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const novaAvSalva = await res.json();
        setAvaliacoesDaAula(prev => [novaAvSalva, ...prev].sort((a, b) => b.votos - a.votos));
        setJaAvaliou(true);
        alert("Avaliação registrada com sucesso!");
      }
    } catch (err) { console.error("Erro ao postar avaliação:", err); }
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
                <FaCommentAlt style={{ marginRight: '8px' }} /> Dúvidas / Fórum ({duvidas.length})
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
                Avaliações de Feedback ({avaliacoesDaAula.length})
              </div>
            </div>

            {/* ABA: COMENTÁRIOS E DÚVIDAS (ILIMITADO) */}
            {guiaAtiva === "Comentarios" && (
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <input style={styles.input} placeholder="Fazer uma pergunta ou dúvida anônima..." value={novaDuvida} onChange={e => setNovaDuvida(e.target.value)} />
                  <button onClick={handleCriarDuvida} style={{ ...styles.button, width: '100px', marginTop: 0 }}>Enviar</button>
                </div>
                {duvidas.map(d => (
                  <div key={d.id} style={styles.duvidaCard}>
                    <div style={styles.votosContainer}>
                       <FaArrowUp onClick={() => handleVotoGlobal(d, "up", "db_duvidas")} style={{ color: d.usuariosVotaram?.find(v => v.userId === usuario.id)?.tipo === "up" ? "#1967d2" : "#ccc", cursor: "pointer" }} />
                       <span>{d.votos}</span>
                       <FaArrowDown onClick={() => handleVotoGlobal(d, "down", "db_duvidas")} style={{ color: d.usuariosVotaram?.find(v => v.userId === usuario.id)?.tipo === "down" ? "#d93025" : "#ccc", cursor: "pointer" }} />
                    </div>
                    <p style={{ margin: 0 }}>{d.texto}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ABA: AVALIAÇÃO + COMENTÁRIO ÚNICO */}
            {guiaAtiva === "Avaliacao" && (
              <div style={{ marginTop: '20px' }}>
                {!jaAvaliou ? (
                  <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dadce0', marginBottom: '30px', textAlign: 'center' }}>
                    <h4>Como você avalia a aula de hoje?</h4>
                    <div style={{ fontSize: '35px', margin: '10px 0' }}>
                      {[1, 2, 3, 4, 5].map((estrela) => (
                        <span key={estrela} onClick={() => setMinhaNota(estrela)} style={{ cursor: 'pointer', color: estrella <= minhaNota ? "#fbbc04" : "#e8eaed" }}>
                          ★
                        </span>
                      ))}
                    </div>
                    <textarea 
                      style={{ ...styles.input, height: '80px', resize: 'none', fontFamily: 'inherit' }}
                      placeholder="Deixe seu feedback/comentário sobre a aula (Obrigatório)..."
                      value={meuComentarioAvaliacao}
                      onChange={e => setMeuComentarioAvaliacao(e.target.value)}
                    />
                    <button onClick={handlePostarAvaliacaoUnica} style={{ ...styles.button, marginTop: '10px' }}>Postar Avaliação OBRIGATÓRIA</button>
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#1e7e34', fontWeight: 'bold', backgroundColor: '#e2f0d9', padding: '12px', borderRadius: '5px' }}>
                    Você já enviou sua avaliação e feedback para esta aula!
                  </p>
                )}

                {/* VISUALIZAÇÃO DOS FEEDBACKS DOS ALUNOS COM VOTOS */}
                <h4 style={{ color: '#5f6368', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Feedbacks dos Alunos:</h4>
                {avaliacoesDaAula.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666' }}>Nenhuma avaliação enviada ainda.</p>
                ) : (
                  avaliacoesDaAula.map(av => (
                    <div key={av.id} style={styles.duvidaCard}>
                      <div style={styles.votosContainer}>
                         <FaArrowUp onClick={() => handleVotoGlobal(av, "up", "db_avaliacoes")} style={{ color: av.usuariosVotaram?.find(v => v.userId === usuario.id)?.tipo === "up" ? "#1967d2" : "#ccc", cursor: "pointer" }} />
                         <span>{av.votos}</span>
                         <FaArrowDown onClick={() => handleVotoGlobal(av, "down", "db_avaliacoes")} style={{ color: av.usuariosVotaram?.find(v => v.userId === usuario.id)?.tipo === "down" ? "#d93025" : "#ccc", cursor: "pointer" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#fbbc04', fontSize: '14px', fontWeight: 'bold', marginBottom: '3px' }}>
                          {"★".repeat(av.nota)}{"☆".repeat(5 - av.nota)}
                        </div>
                        <p style={{ margin: 0, color: '#333', fontSize: '14px' }}>{av.comentario}</p>
                      </div>
                    </div>
                  ))
                )}
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
        <Route path="/professor/mural" element={<MuralProfessor />} />
        <Route path="/professor/criar-materia" element={<CriarMateria />} />
        <Route path="/professor/materia/:id" element={<MateriaDetalhesProfessor />} />
        <Route path="/professor/nota-geral" element={<NotaGeralProfessor />} />
        <Route path="/coordenador/mural" element={<PainelCoordenador />} />
        <Route path="/coordenador/professor/:professorId" element={<ProfessorDetalhesCoordenador />} />
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
  },
  formLabel: {
    display: "block",
    fontSize: "14px",
    color: "#5f6368",
    fontWeight: "bold",
    marginTop: "10px",
    marginBottom: "2px"
  },
  forumContainer: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #dadce0"
  },
  aulaCard: {
    padding: "15px",
    borderBottom: "1px solid #eee",
    backgroundColor: "#fff",
    borderRadius: "6px",
    marginBottom: "10px",
    transition: "background 0.2s"
  },
  tabContainer: {
    display: "flex",
    borderBottom: "1px solid #dadce0",
    marginTop: "15px"
  },
  tabItem: {
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center"
  },
  duvidaCard: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    borderBottom: "1px solid #eee"
  },
  votosContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "bold"
  },
};