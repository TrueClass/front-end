import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { getProfessorClasses } from "../../api/professors";
import Skeleton from "../../components/Skeleton";
import { clickable } from "../../utils";

export default function NotaGeralProfessor() {
  const navigate = useNavigate();
  const { user: usuario } = useUser();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!usuario?.id || !usuario?.institutionId) return;
    const carregar = async () => {
      setCarregando(true);
      try {
        setDados(await getProfessorClasses(usuario.institutionId, usuario.id));
      } catch (err) {
        console.error("Erro ao carregar métricas do professor:", err);
        setErro("Não foi possível carregar suas métricas.");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [usuario?.id, usuario?.institutionId]);

  const classes = dados?.classes || [];
  const totalAvaliacoes = classes.reduce((acc, c) => acc + c.rating_count, 0);
  const mediaGlobal = dados?.professor?.rating;

  return (
    <div className="page">
      <div className="page__content page__content--stack">
        {carregando ? (
          <Skeleton variant="block" count={2} />
        ) : erro ? (
          <p className="state-message state-message--error">{erro}</p>
        ) : (
          <>
            <div className="panel score-hero">
              <h3 className="score-hero__label">Sua média geral</h3>
              <h1 className="score-hero__value">
                {mediaGlobal != null ? mediaGlobal.toFixed(2) : "—"} <span className="score-hero__star">★</span>
              </h1>
              <p className="score-hero__caption">
                Com base em <strong>{totalAvaliacoes}</strong> avaliações individuais dadas por alunos.
              </p>
            </div>

            <div className="panel">
              <h3 className="section-title">Pontuação detalhada por turma</h3>
              {classes.length === 0 ? (
                <p className="state-message">Você não possui turmas para gerar relatórios.</p>
              ) : (
                <div className="class-summary">
                  {classes.map(c => (
                    <div
                      key={c.id}
                      {...clickable(() => navigate(`/materia/${c.id}`, { state: { subject: c.subject, className: c["class"] } }))}
                      className="class-summary__item"
                    >
                      <div>
                        <strong className="class-summary__name">{c.subject}</strong>
                        <div className="class-summary__group">{c["class"]}</div>
                      </div>
                      <div className="class-summary__stats">
                        <span className="class-summary__count">{c.rating_count} avaliações</span>
                        <span className="score-pill">{c.avg_rating != null ? `${c.avg_rating.toFixed(2)} ★` : "Sem notas"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
