import React, { useState, useEffect, useCallback } from "react";
import { FaArrowLeft, FaCommentAlt, FaStar } from "react-icons/fa";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getClassItems } from "../api/classes";
import { getRatings, postRating, setBoost } from "../api/feedback";
import { clickable, cx, todayLocal } from "../utils";
import RatingTable, { RatingRow } from "../components/RatingTable";
import Skeleton from "../components/Skeleton";

const PAGE_SIZE = 10;

const ERROS_AVALIACAO = {
  403: "Você não está matriculado nesta turma.",
  409: "Você já avaliou esta aula.",
  422: "Esta aula ainda não está disponível para avaliação.",
};

export default function AulaDetalhes() {
  const { id, aulaId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const { user: usuario } = useUser();
  const isStudent = usuario?.role === "student";

  const [item, setItem] = useState(state?.item ?? null);
  const [erroAula, setErroAula] = useState("");

  const [guiaAtiva, setGuiaAtiva] = useState("Avaliacao");
  const [minhaNota, setMinhaNota] = useState(0);
  const [meuComentario, setMeuComentario] = useState("");
  const [minhaAvaliacao, setMinhaAvaliacao] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erroAvaliacao, setErroAvaliacao] = useState("");
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  useEffect(() => {
    if (item || !usuario?.institutionId) return;
    getClassItems(usuario.institutionId, id)
      .then(data => {
        const found = (data.dates || []).find(d => String(d.id) === aulaId);
        if (found) setItem(found);
        else setErroAula("Aula não encontrada.");
      })
      .catch(err => setErroAula(err.status === 403 ? "Você não tem acesso a esta turma." : "Erro ao carregar a aula."));
  }, [item, id, aulaId, usuario?.institutionId]);

  const carregarAvaliacoes = useCallback(async (pageToLoad) => {
    const data = await getRatings(aulaId, pageToLoad, PAGE_SIZE);
    setTotal(data.total);
    setMinhaAvaliacao(data.user_rating);
    setAvaliacoes(prev => {
      if (pageToLoad === 1) return data.ratings;
      const vistos = new Set(prev.map(av => av.id));
      return [...prev, ...data.ratings.filter(av => !vistos.has(av.id))];
    });
    setPage(pageToLoad);
  }, [aulaId]);

  useEffect(() => {
    carregarAvaliacoes(1).catch(err => console.error("Erro ao carregar avaliações:", err));
  }, [carregarAvaliacoes]);

  const carregarMais = async () => {
    setCarregandoMais(true);
    try {
      await carregarAvaliacoes(page + 1);
    } catch (err) {
      console.error("Erro ao carregar avaliações:", err);
    } finally {
      setCarregandoMais(false);
    }
  };

  const handleBoost = async (av) => {
    let boosts;
    try {
      ({ boosts } = await setBoost(av.id, !av.boosted_by_user));
    } catch {
      return;
    }
    const atualizar = (x) => x.id === av.id ? { ...x, boosts, boosted_by_user: !av.boosted_by_user } : x;
    setAvaliacoes(prev => prev.map(atualizar));
    setMinhaAvaliacao(prev => prev && atualizar(prev));
  };

  const handlePostarAvaliacao = async () => {
    if (!minhaNota) return setErroAvaliacao("Selecione uma nota.");
    if (!meuComentario.trim()) return setErroAvaliacao("Escreva um comentário.");
    setErroAvaliacao("");
    setEnviandoAvaliacao(true);
    try {
      const nova = await postRating(aulaId, minhaNota, meuComentario.trim());
      setMinhaAvaliacao({ id: nova.id, value: minhaNota, content: meuComentario.trim(), sent_by_user: true, boosts: 0, boosted_by_user: false });
      setTotal(t => t + 1);
    } catch (err) {
      if (err.status === 409) await carregarAvaliacoes(1).catch(() => {});
      else setErroAvaliacao(ERROS_AVALIACAO[err.status] || (err.status ? "Erro ao enviar avaliação." : "Erro de conexão."));
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  const isFuture = item ? item.created_at > todayLocal() : false;
  const temMais = avaliacoes.length < total - (minhaAvaliacao ? 1 : 0);

  const onBoost = isStudent ? handleBoost : undefined;

  const tab = (key, label, icon) => (
    <div
      {...clickable(() => setGuiaAtiva(key))}
      role="tab"
      aria-selected={guiaAtiva === key}
      className={cx("tab", guiaAtiva === key && "tab--active")}
    >
      {icon} {label}
    </div>
  );

  const emptyState = (Icon, title, hint) => (
    <div className="empty-state">
      <Icon className="empty-state__icon" />
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__hint">{hint}</p>
    </div>
  );

  return (
    <div className="page">
      <div className="page__content">
        <div className="panel">
          <button
            onClick={() => navigate(`/materia/${id}`, { state: { subject: state?.subject, professorName: state?.professorName, className: state?.className } })}
            className="back-link"
          >
            <FaArrowLeft /> Voltar para aulas
          </button>

          {item?.title && <h3 className="lesson-heading">{item.title}</h3>}

          <div className="tabs" role="tablist">
            {tab("Avaliacao", `Avaliações (${total})`, <FaStar />)}
            {tab("Comentarios", "Dúvidas", <FaCommentAlt />)}
          </div>

          {guiaAtiva === "Comentarios" && emptyState(FaCommentAlt, "Volte novamente mais tarde", "Ainda estamos trabalhando nisso")}

          {guiaAtiva === "Avaliacao" && (
            <div className="tab-panel">
              {erroAula ? (
                <p className="state-message state-message--error">{erroAula}</p>
              ) : !item ? (
                <Skeleton variant="line" count={3} />
              ) : isFuture ? (
                emptyState(FaStar, "Esta aula ainda não ocorreu", "O feedback estará disponível após a realização da aula")
              ) : (
                <>
                  {isStudent && !minhaAvaliacao && (
                    <div className="rating-form">
                      <h4>Como você avalia esta aula?</h4>
                      <div className="star-picker" role="radiogroup" aria-label="Nota da aula">
                        {[1, 2, 3, 4, 5].map(estrela => (
                          <span
                            key={estrela}
                            {...clickable(() => setMinhaNota(estrela))}
                            role="radio"
                            aria-checked={estrela === minhaNota}
                            aria-label={`${estrela} estrela${estrela > 1 ? "s" : ""}`}
                            className={cx("star-picker__star", estrela <= minhaNota && "star-picker__star--on")}
                          >★</span>
                        ))}
                      </div>
                      <textarea
                        className="input input--textarea"
                        placeholder="Deixe seu feedback/comentário sobre a aula (Obrigatório)..."
                        value={meuComentario}
                        maxLength={280}
                        onChange={e => setMeuComentario(e.target.value)}
                      />
                      {erroAvaliacao && <p className="text-error">{erroAvaliacao}</p>}
                      <button onClick={handlePostarAvaliacao} disabled={enviandoAvaliacao} className="btn">
                        {enviandoAvaliacao ? "Enviando..." : "Enviar avaliação"}
                      </button>
                    </div>
                  )}
                  {total === 0 ? (
                    <p className="state-message">Nenhuma avaliação enviada ainda.</p>
                  ) : (
                    <>
                      <RatingTable>
                        {minhaAvaliacao && <RatingRow rating={minhaAvaliacao} mine onBoost={onBoost} />}
                        {avaliacoes.map(av => <RatingRow key={av.id} rating={av} onBoost={onBoost} />)}
                      </RatingTable>
                      {temMais && (
                        <button onClick={carregarMais} disabled={carregandoMais} className="btn btn--secondary load-more">
                          {carregandoMais ? "Carregando..." : "Carregar mais avaliações"}
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
