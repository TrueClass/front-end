import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { styles } from "../../styles";
import { LOCAL_API } from "../../constants";

export default function MateriaDetalhesProfessor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [materia, setMateria] = useState(null);
  const [aulas, setAulas] = useState([]);
  const [aulaSelecionada, setAulaSelecionada] = useState(null);
  const [duvidas, setDuvidas] = useState([]);
  const [avaliacoesDetalhadas, setAvaliacoesDetalhadas] = useState([]);

  const [guiaAtiva, setGuiaAtiva] = useState("Comentarios");

  useEffect(() => {
    fetch(`${LOCAL_API}/db_salas/${id}`).then(res => res.json()).then(setMateria);

    fetch(`${LOCAL_API}/db_aulas?materiaId=${id}`)
      .then(res => res.json())
      .then(async (dadosAulas) => {
        const aulasComMedia = await Promise.all(dadosAulas.map(async (aula) => {
          const resAv = await fetch(`${LOCAL_API}/db_avaliacoes?aulaId=${aula.id}`);
          const avaliacoes = await resAv.json();

          if (avaliacoes.length === 0) return { ...aula, media: "Sem notas" };

          const soma = avaliacoes.reduce((acc, curr) => acc + curr.nota, 0);
          const mediaCalculada = (soma / avaliacoes.length).toFixed(1);
          return { ...aula, media: `${mediaCalculada} ★ (${avaliacoes.length})` };
        }));

        setAulas(aulasComMedia);
      });
  }, [id]);

  useEffect(() => {
    if (aulaSelecionada) {
      fetch(`${LOCAL_API}/db_duvidas?aulaId=${aulaSelecionada.id}`)
        .then(res => res.json())
        .then(dados => setDuvidas(dados.sort((a, b) => b.votos - a.votos)));

      fetch(`${LOCAL_API}/db_avaliacoes?aulaId=${aulaSelecionada.id}`)
        .then(res => res.json())
        .then(setAvaliacoesDetalhadas);
    }
  }, [aulaSelecionada]);

  if (!materia) return <p>Carregando dados da matéria...</p>;

  return (
    <div style={{ backgroundColor: "#f1f3f4", minHeight: "100vh" }}>
      <header style={{ ...styles.muralHeader, backgroundColor: materia.cor || "#022e61", position: 'relative', justifyContent: 'center' }}>
        <button
          onClick={() => aulaSelecionada ? setAulaSelecionada(null) : navigate("/mural")}
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
