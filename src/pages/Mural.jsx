import React, { useState, useEffect } from "react";
import { FaBook } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getClasses, enrollInClass } from "../api/classes";
import Skeleton from "../components/Skeleton";
import { clickable, cx, todayLocal } from "../utils";

const JOIN_CODE_MAX_LENGTH = 7;

const ERROS_ENTRADA = {
  404: "Turma não encontrada.",
  409: "Você já está nessa turma.",
};

export default function Mural() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [erroJoin, setErroJoin] = useState("");

  const navigate = useNavigate();
  const { user: usuario, refreshClasses, classesVersion } = useUser();

  const isProfessor = usuario?.role === "professor";
  const today = todayLocal();
  const shortDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  useEffect(() => {
    if (!usuario?.institutionId) return;
    const carregar = async () => {
      setCarregando(true);
      setErroLista("");
      try {
        setLista(await getClasses(usuario.institutionId));
      } catch (err) {
        console.error("Erro ao carregar mural:", err);
        setErroLista("Não foi possível carregar suas turmas.");
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [usuario?.institutionId, classesVersion]);

  const acaoPrincipal = () => isProfessor ? navigate("/professor/criar-materia") : setShowJoinModal(true);

  const fecharModal = () => { setShowJoinModal(false); setCodigo(""); setErroJoin(""); };

  const handleJoin = async () => {
    setErroJoin("");
    const code = codigo.trim().toUpperCase();
    if (!code) return setErroJoin("Informe o código da turma.");
    try {
      await enrollInClass(usuario.institutionId, code);
      fecharModal();
      refreshClasses();
    } catch (err) {
      setErroJoin(ERROS_ENTRADA[err.status] || (err.status ? "Erro ao entrar na turma." : "Servidor indisponível."));
    }
  };

  return (
    <div className="page page--shell">
      <div className="fab-container">
        <button
          onClick={acaoPrincipal}
          className="fab"
          title={isProfessor ? "Criar nova turma" : "Entrar em uma turma"}
          aria-label={isProfessor ? "Criar nova turma" : "Entrar em uma turma"}
        >
          <svg className="fab__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
            <path className="fab__circle" d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" />
            <path d="M8 12H16" />
            <path d="M12 16V8" />
          </svg>
        </button>
      </div>

      {showJoinModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && fecharModal()}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="join-title" onKeyDown={(e) => e.key === "Escape" && fecharModal()}>
            <h3 id="join-title" className="modal__title">Entrar em uma turma</h3>
            <input
              type="text"
              placeholder="Código da turma"
              className="input input--code"
              value={codigo}
              maxLength={JOIN_CODE_MAX_LENGTH}
              autoFocus
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            {erroJoin && <p className="text-error">{erroJoin}</p>}
            <div className="modal__actions">
              <button onClick={handleJoin} className="btn">Entrar</button>
              <button onClick={fecharModal} className="btn btn--secondary">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="card-grid">
        {carregando ? (
          <Skeleton variant="card" count={3} />
        ) : erroLista ? (
          <p className="state-message state-message--error">{erroLista}</p>
        ) : lista.length === 0 ? (
          <div className="empty-state empty-state--card">
            <FaBook className="empty-state__icon" />
            <p className="empty-state__title">
              {isProfessor ? "Você ainda não tem turmas" : "Você ainda não está em nenhuma turma"}
            </p>
            <p className="empty-state__hint">
              {isProfessor ? "Crie a primeira e compartilhe o código com os alunos." : "Peça o código da turma ao seu professor."}
            </p>
            <button onClick={acaoPrincipal} className="btn empty-state__action">
              {isProfessor ? "Criar turma" : "Entrar com código"}
            </button>
          </div>
        ) : (
          lista.map(cls => {
            const isToday = cls.next_class === today;
            return (
              <div key={cls.id} className="class-card" {...clickable(() => navigate(`/materia/${cls.id}`, { state: { subject: cls.subject, professorName: cls.professor_name, className: cls["class"] } }))}>
                <div className="class-card__header">
                  <h3 className="class-card__title">{cls.subject}</h3>
                  <div className="class-card__meta">
                    <div className="class-card__professor">Prof. {cls.professor_name}</div>
                    {cls["class"] && <div className="class-card__group">{cls["class"]}</div>}
                  </div>
                </div>
                <div className="class-card__body">
                  <span className="class-card__label">Última aula:</span>
                  <span className="class-card__value">{cls.last_class ? shortDate(cls.last_class) : "—"}</span>
                  <span className="class-card__label">Próxima aula:</span>
                  <div className="class-card__date">
                    <span className={cx("class-card__value", isToday && "class-card__value--today")}>
                      {cls.next_class ? shortDate(cls.next_class) : "—"}
                    </span>
                    {isToday && <span className="badge">Hoje</span>}
                  </div>
                  {cls.join_code && (
                    <>
                      <span className="class-card__label">Código:</span>
                      <span className="class-card__code">{cls.join_code}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
