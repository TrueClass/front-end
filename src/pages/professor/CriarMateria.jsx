import React, { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useToast } from "../../context/ToastContext";
import { createClass } from "../../api/classes";
import ClassCalendar from "../../components/ClassCalendar";
import { cx, getClassDates, todayLocal } from "../../utils";

const FREQUENCIES = [
  { value: "weekly", label: "Semanal" },
  { value: "biweekly_a", label: "Quinzenal A" },
  { value: "biweekly_b", label: "Quinzenal B" },
];

function validateDates(start, end) {
  if (!start || !end) return null;
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const now = new Date(todayLocal() + "T00:00:00");
  if (s < now) return "A data de início não pode ser anterior a hoje.";
  if (e < s) return "A data de fim não pode ser anterior à de início.";
  const maxEnd = new Date(s);
  maxEnd.setMonth(maxEnd.getMonth() + 6);
  if (e > maxEnd) return "O período não pode exceder 6 meses.";
  return null;
}

export default function CriarMateria() {
  const [nome, setNome] = useState("");
  const [className, setClassName] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [titles, setTitles] = useState({});
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const { user: usuario, refreshClasses } = useUser();
  const showToast = useToast();

  const today = todayLocal();
  const dateError = validateDates(dataInicio, dataFim);
  const datesReady = dataInicio && dataFim && !dateError;

  const handleDataInicio = (val) => {
    setDataInicio(val);
    setErro(validateDates(val, dataFim) || "");
  };

  const handleDataFim = (val) => {
    setDataFim(val);
    setErro(validateDates(dataInicio, val) || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !className || !dataInicio || !dataFim) return setErro("Preencha todos os campos obrigatórios.");
    if (dateError) return setErro(dateError);

    setErro("");
    setEnviando(true);
    try {
      const criada = await createClass(usuario.institutionId, {
        subject: nome,
        class_name: className,
        start_date: dataInicio,
        end_date: dataFim,
        frequency,
        titles: [...getClassDates(dataInicio, dataFim, frequency)].sort().map((d, i) => titles[d] || `Aula ${i + 1}`),
      });
      refreshClasses();
      showToast(`Turma criada! Código de entrada: ${criada.join_code}`);
      navigate(`/materia/${criada.id}`);
    } catch (err) {
      if (err.status === 422) setErro("Dados inválidos. Verifique os campos e o período (máx. 6 meses).");
      else if (err.status) setErro("Erro ao criar a turma.");
      else setErro("Erro de conexão com o servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="create-page">
      <header className="app-header app-header--brand">
        <button onClick={() => navigate("/mural")} className="app-header__back">
          <FaArrowLeft /> Voltar
        </button>
        <h2 className="app-header__title">Criar nova turma</h2>
      </header>

      <div className="create-layout">
        <div className="create-form">
          <h3 className="create-section-title">Dados da turma</h3>
          <form onSubmit={handleSubmit}>
            <label className="form-label" htmlFor="nome-materia">Nome da matéria *</label>
            <input
              id="nome-materia"
              type="text"
              placeholder="Ex: Estrutura de Dados II"
              maxLength={70}
              className="input"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />

            <label className="form-label" htmlFor="nome-turma">Nome da turma *</label>
            <input
              id="nome-turma"
              type="text"
              placeholder="Ex: Turma A - 2025.1"
              maxLength={70}
              className="input"
              value={className}
              onChange={e => setClassName(e.target.value)}
            />

            <div className="form-row">
              <div>
                <label className="form-label" htmlFor="data-inicio">Data de início *</label>
                <input id="data-inicio" type="date" className="input" value={dataInicio} min={today} onChange={e => handleDataInicio(e.target.value)} />
              </div>
              <div>
                <label className="form-label" htmlFor="data-fim">Data de fim *</label>
                <input id="data-fim" type="date" className="input" value={dataFim} min={dataInicio} onChange={e => handleDataFim(e.target.value)} />
              </div>
            </div>

            <span className="form-label form-label--spaced">Frequência *</span>
            <div className="freq-options" role="radiogroup" aria-label="Frequência">
              {FREQUENCIES.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={frequency === opt.value}
                  onClick={() => setFrequency(opt.value)}
                  className={cx("freq-option", frequency === opt.value && "freq-option--active")}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {erro && <p className="text-error form-message">{erro}</p>}

            <button type="submit" disabled={enviando} className="btn">Criar turma</button>
          </form>
        </div>

        <div className="preview">
          <h3 className="create-section-title">Pré-visualização das aulas</h3>
          {datesReady ? (
            <ClassCalendar
              startDate={dataInicio}
              endDate={dataFim}
              frequency={frequency}
              titles={titles}
              onTitleChange={(dateStr, val) => setTitles(prev => ({ ...prev, [dateStr]: val }))}
            />
          ) : (
            <div className="preview-empty">
              Selecione as datas e a frequência para visualizar o calendário de aulas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
