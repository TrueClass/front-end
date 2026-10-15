import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { getProfessorClasses, getProfessorFeedbacks } from "../../api/professors";
import RatingTable, { RatingRow } from "../../components/RatingTable";
import Skeleton from "../../components/Skeleton";

const shortDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

function FeedbackSection({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="feedback-section">
      <h4 className="feedback-section__title">{title}</h4>
      <RatingTable boxed>
        {items.map(item => (
          <RatingRow key={item.id} rating={item} meta={`${item.subject}${item.title ? ` · ${item.title}` : ""}`} />
        ))}
      </RatingTable>
    </div>
  );
}

export default function ProfessorDetalhesCoordenador() {
  const { professorId } = useParams();
  const { user: usuario } = useUser();
  const institutionId = usuario?.institutionId;

  const [professor, setProfessor] = useState(null);
  const [classes, setClasses] = useState([]);
  const [erro, setErro] = useState("");
  const [feedbacks, setFeedbacks] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!institutionId) return;

    const fetchAll = async () => {
      setCarregando(true);
      setErro("");
      try {
        const [classesResult, feedbacksResult] = await Promise.allSettled([
          getProfessorClasses(institutionId, professorId),
          getProfessorFeedbacks(institutionId, professorId),
        ]);
        if (classesResult.status === "fulfilled") {
          setProfessor(classesResult.value.professor);
          setClasses(classesResult.value.classes || []);
        } else {
          setErro(classesResult.reason?.status === 403 ? "Você não coordena este professor." : "Não foi possível carregar os dados do professor.");
        }
        if (feedbacksResult.status === "fulfilled") setFeedbacks(feedbacksResult.value);
      } catch (err) {
        console.error("Erro ao carregar dados do professor:", err);
      } finally {
        setCarregando(false);
      }
    };

    fetchAll();
  }, [professorId, institutionId]);

  const hasFeedbacks = feedbacks?.most_boosted?.length || feedbacks?.highest_rating?.length || feedbacks?.lowest_rating?.length;

  return (
    <div className="page">
      <div className="page__content page__content--stack">
        <div className="panel">
          <h2 className="page-title">Prof. {professor?.name || `Professor ${professorId}`}</h2>
          <div className="page-subtitle">
            {professor?.email && <div className="page-subtitle__primary">{professor.email}</div>}
            {professor?.rating != null && (
              <div className="professor-rating">{professor.rating.toFixed(1)} ★ média geral</div>
            )}
          </div>
        </div>

        {carregando ? (
          <Skeleton variant="block" count={2} />
        ) : erro ? (
          <p className="state-message state-message--error">{erro}</p>
        ) : (
          <>
            <div className="panel">
              <h3 className="section-title">Turmas</h3>
              {classes.length === 0 ? (
                <p className="state-message">Nenhuma turma encontrada.</p>
              ) : (
                classes.map(cls => (
                  <div key={cls.id} className="class-row">
                    <div>
                      <strong className="class-row__name">{cls.subject}</strong>
                      <div className="class-row__group">{cls.class}</div>
                    </div>
                    <div className="class-row__stats">
                      <div>Última aula: <span className="class-row__value">{shortDate(cls.last_class)}</span></div>
                      <div>
                        Média: <span className="class-row__value class-row__value--strong">{cls.avg_rating != null ? `${cls.avg_rating.toFixed(1)} ★ (${cls.rating_count})` : "Sem notas"}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="panel">
              <h3 className="section-title">Feedbacks dos alunos</h3>
              {hasFeedbacks ? (
                <>
                  <FeedbackSection title="Mais votados" items={feedbacks.most_boosted} />
                  <FeedbackSection title="Melhor avaliação" items={feedbacks.highest_rating} />
                  <FeedbackSection title="Pior avaliação" items={feedbacks.lowest_rating} />
                </>
              ) : (
                <p className="state-message">Nenhum feedback recebido ainda.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
