import React, { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { styles } from "../../styles";
import { LOCAL_API } from "../../constants";

export default function ProfessorDetalhesCoordenador() {
  const { professorId } = useParams();
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [nomeProfessor, setNomeProfessor] = useState("");
  const [materias, setMaterias] = useState([]);

  useEffect(() => {
    const carregarDadosDoProfessor = async () => {
      setCarregando(true);
      try {
        const resSalas = await fetch(`${LOCAL_API}/db_salas?professorId=${professorId}`);
        const salas = await resSalas.json();

        if (salas.length > 0) {
          setNomeProfessor(salas[0].professor || "Professor");
        }

        const listaMateriasComNotas = [];

        for (const sala of salas) {
          const resAulas = await fetch(`${LOCAL_API}/db_aulas?materiaId=${sala.id}`);
          const aulas = await resAulas.json();

          let somaNotasMateria = 0;
          let totalAvaliacoesMateria = 0;

          for (const aula of aulas) {
            const resAv = await fetch(`${LOCAL_API}/db_avaliacoes?aulaId=${aula.id}`);
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
          onClick={() => navigate("/mural")}
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
                        <span style={{ fontSize: "12px", color: "#70757a" }}>Média da Matéria:</span>
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
