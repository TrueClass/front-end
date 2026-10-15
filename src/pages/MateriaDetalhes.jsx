import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getClassItems } from "../api/classes";
import Skeleton from "../components/Skeleton";
import { clickable, cx, todayLocal } from "../utils";

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric"
  });
}

const ERROS = {
  403: "Você não tem acesso a esta turma.",
  404: "Turma não encontrada.",
};

export default function MateriaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user: usuario } = useUser();
  const isProfessor = usuario?.role === "professor";
  const isStudent = usuario?.role === "student";

  const [info, setInfo] = useState(null);
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const subject = info?.subject || state?.subject || "Turma";
  const professorName = info?.professor_name || state?.professorName;
  const className = info?.["class"] || state?.className;

  useEffect(() => {
    if (!usuario?.institutionId) return;
    const carregar = async () => {
      setCarregando(true);
      setErro("");
      try {
        const data = await getClassItems(usuario.institutionId, id);
        setInfo(data.info);
        setItens(data.dates || []);
      } catch (err) {
        setItens([]);
        setErro(ERROS[err.status] || "Erro ao carregar aulas.");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [id, usuario?.institutionId]);

  const today = todayLocal();
  const hasToday = itens.some(item => item.created_at === today);
  const nextItem = !hasToday ? itens.find(item => item.created_at > today) : null;

  return (
    <div className="page">
      <div className="page__content">
        <div className="panel">
          <div className="page-title-row">
            <h2 className="page-title">{subject}</h2>
            {info?.join_code && (
              <span className="code-chip" title="Compartilhe este código com os alunos para que entrem na turma">
                Código: {info.join_code}
              </span>
            )}
          </div>
          <div className="page-subtitle">
            {professorName && <div className="page-subtitle__primary">Prof. {professorName}</div>}
            {className && <div className="page-subtitle__secondary">{className}</div>}
          </div>

          {carregando ? (
            <Skeleton variant="list" count={4} />
          ) : erro ? (
            <p className="state-message state-message--error">{erro}</p>
          ) : itens.length === 0 ? (
            <p className="state-message">Nenhuma aula encontrada.</p>
          ) : (
            <div className="lesson-list">
              {itens.map((item) => {
                const isToday = item.created_at === today;
                const isFuture = item.created_at > today;

                return (
                  <div
                    key={item.id}
                    className={cx("lesson-card", isFuture && "lesson-card--future", isToday && "lesson-card--today")}
                    {...clickable(() => navigate(
                      `/materia/${id}/aula/${item.id}`,
                      { state: { item, subject, professorName, className } }
                    ))}
                  >
                    <div className="lesson-card__row">
                      <strong className="lesson-card__title">{item.title}</strong>
                      {isProfessor && item.rating_count > 0 && (
                        <span className="rating-pill">{item.avg_rating.toFixed(1)} ★ ({item.rating_count})</span>
                      )}
                    </div>
                    <div className="lesson-card__date-row">
                      <p className="lesson-card__date">{formatDate(item.created_at)}</p>
                      {item === nextItem && <span className="badge">Próxima aula</span>}
                      {isStudent && !isFuture && (
                        item.rated_by_user
                          ? <span className="badge">Avaliada ✓</span>
                          : <span className="badge badge--action">Avaliar</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
