import React, { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { styles } from "../../styles";
import { LOCAL_API } from "../../constants";
import { useUser } from "../../UserContext";

export default function NotaGeralProfessor() {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [metricas, setMetricas] = useState({ mediaGlobal: 0, totalAvaliacoes: 0, materiasDetalhadas: [] });
  const { user: usuario } = useUser();

  useEffect(() => {
    if (!usuario?.id) return;

    const calcularMetricasGlobais = async () => {
      setCarregando(true);
      try {
        const resSalas = await fetch(`${LOCAL_API}/db_salas?professorId=${usuario.id}`);
        const salas = await resSalas.json();

        let somaNotasGlobal = 0;
        let totalAvaliacoesGlobal = 0;
        const listaMateriasMetricas = [];

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
          onClick={() => navigate("/mural")}
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
            <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", textAlign: "center", marginBottom: "30px", border: "1px solid #dadce0" }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#5f6368", fontSize: "16px" }}>Sua Média Global</h3>
              <h1 style={{ fontSize: "64px", margin: "0", color: "#1967d2", fontWeight: "bold" }}>
                {metricas.mediaGlobal} <span style={{ fontSize: "28px", color: "#fbbc04" }}>★</span>
              </h1>
              <p style={{ color: "#70757a", margin: "10px 0 0 0", fontSize: "14px" }}>
                Com base em <strong>{metricas.totalAvaliacoes}</strong> avaliações individuais dadas por alunos.
              </p>
            </div>

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
