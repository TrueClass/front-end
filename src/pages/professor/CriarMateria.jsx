import React, { useState, useEffect, useMemo } from "react";
import { FaArrowLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { styles } from "../../styles";
import { API_BASE } from "../../constants";
import { useUser } from "../../UserContext";
import { apiFetch } from "../../apiFetch";

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getClassDates(startStr, endStr, frequency) {
  const dates = new Set();
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");

  let current = new Date(start);
  if (frequency === "biweekly_b") current.setDate(current.getDate() + 7);

  const step = frequency === "weekly" ? 7 : 14;
  while (current <= end) {
    dates.add(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + step);
  }
  return dates;
}

function CalendarioPreview({ startDate, endDate, frequency, titles, onTitleChange }) {
  const [viewDate, setViewDate] = useState(() => new Date(startDate + "T00:00:00"));
  const [editingDate, setEditingDate] = useState(null);

  const classDates = useMemo(
    () => getClassDates(startDate, endDate, frequency),
    [startDate, endDate, frequency]
  );

  const sortedDates = useMemo(() => [...classDates].sort(), [classDates]);

  useEffect(() => { setEditingDate(null); }, [viewDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ border: "1px solid #dadce0", borderRadius: "10px", overflow: "hidden", backgroundColor: "white" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#022e61" }}>
        <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}>
          <FaChevronLeft />
        </button>
        <span style={{ fontWeight: "600", color: "white", fontSize: "15px" }}>{MONTH_NAMES[month]} {year}</span>
        <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} style={{ background: "none", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}>
          <FaChevronRight />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "10px 10px 4px" }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: "700", color: "#70757a", paddingBottom: "6px" }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "3px", padding: "0 10px 12px" }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isClass = classDates.has(dateStr);
          const isStart = dateStr === startDate;
          const isEnd = dateStr === endDate;
          const isEditing = dateStr === editingDate;
          const hasCustomTitle = isClass && !!titles[dateStr];

          return (
            <div
              key={i}
              onClick={() => isClass && setEditingDate(isEditing ? null : dateStr)}
              style={{
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                fontSize: "13px",
                fontWeight: isClass ? "700" : "400",
                backgroundColor: isStart ? "#2e7d32" : isEnd ? "#c62828" : isEditing ? "#1967d2" : isClass ? "#d2e3fc" : "transparent",
                color: (isStart || isEnd || isEditing) ? "white" : isClass ? "#1967d2" : "#333",
                cursor: isClass ? "pointer" : "default",
                outline: hasCustomTitle && !isEditing ? "2px solid #1967d2" : "none",
                outlineOffset: "1px",
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {editingDate && (
        <div style={{ padding: "10px 12px", borderTop: "1px solid #e8eaed", backgroundColor: "#f8f9fa" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              autoFocus
              type="text"
              value={titles[editingDate] || ""}
              onChange={e => onTitleChange(editingDate, e.target.value)}
              onKeyDown={e => (e.key === "Enter" || e.key === "Escape") && setEditingDate(null)}
              placeholder={`Aula ${sortedDates.indexOf(editingDate) + 1}`}
              style={{ ...styles.input, flex: 1, margin: 0 }}
            />
            <button
              type="button"
              onClick={() => setEditingDate(null)}
              style={{ padding: "0 14px", backgroundColor: "#1967d2", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "13px", alignSelf: "stretch" }}
            >
              ✓
            </button>
          </div>
        </div>
      )}

      <div style={{ padding: "8px 16px 12px", fontSize: "12px", color: "#70757a", borderTop: "1px solid #f0f0f0" }}>
{(() => { const unnamed = classDates.size - Object.keys(titles).filter(d => classDates.has(d) && titles[d]).length; return <span style={{ color: unnamed > 0 ? "#c62828" : "#2e7d32", fontWeight: "600" }}>{unnamed} aula{unnamed !== 1 ? "s" : ""} sem nome</span>; })()}
      </div>
    </div>
  );
}

function validateDates(start, end) {
  if (!start || !end) return null;
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const now = new Date(new Date().toISOString().split("T")[0] + "T00:00:00");
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
  const [sucesso, setSucesso] = useState("");

  const navigate = useNavigate();
  const { user: usuario, refreshClasses } = useUser();

  const today = new Date().toISOString().split("T")[0];
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

    try {
      const res = await apiFetch(`${API_BASE}/institution/${usuario.institutionId}/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: nome,
          class_name: className,
          start_date: dataInicio,
          end_date: dataFim,
          frequency,
          titles: [...getClassDates(dataInicio, dataFim, frequency)].sort().map((d, i) => titles[d] || `Aula ${i + 1}`),
        }),
      });

      if (res.status === 201) {
        refreshClasses();
        setSucesso("Turma criada! Redirecionando...");
        setTimeout(() => navigate("/mural"), 2000);
      } else {
        setErro("Erro ao criar a turma.");
      }
    } catch {
      setErro("Erro de conexão com o servidor.");
    }
  };

  return (
    <div style={{ backgroundColor: "#f1f3f4", minHeight: "100vh" }}>
      <header style={{ ...styles.muralHeader, backgroundColor: "#022e61", justifyContent: "center" }}>
        <button onClick={() => navigate("/mural")} style={{ ...styles.backBtn, position: "absolute", left: "20px", color: "white", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
          <FaArrowLeft /> Voltar
        </button>
        <h2 style={{ ...styles.muralTitle, color: "white" }}>Criar Nova Turma</h2>
      </header>

      <div style={{ padding: "30px", maxWidth: "960px", margin: "40px auto", display: "flex", gap: "30px", alignItems: "flex-start", justifyContent: "center" }}>
        <div style={{ ...styles.container, flex: "0 0 420px", textAlign: "left" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#333", fontSize: "15px", fontWeight: "800", textAlign: "center" }}>Dados da Turma</h3>
          <form onSubmit={handleSubmit}>

            <label style={styles.formLabel}>Nome da Matéria *</label>
            <input
              type="text"
              placeholder="Ex: Estrutura de Dados II"
              style={styles.input}
              value={nome}
              onChange={e => setNome(e.target.value)}
            />

            <label style={styles.formLabel}>Nome da Turma *</label>
            <input
              type="text"
              placeholder="Ex: Turma A - 2025.1"
              style={styles.input}
              value={className}
              onChange={e => setClassName(e.target.value)}
            />

            <div style={{ display: "flex", gap: "15px", marginTop: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={styles.formLabel}>Data de Início *</label>
                <input type="date" style={styles.input} value={dataInicio} min={today} onChange={e => handleDataInicio(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.formLabel}>Data de Fim *</label>
                <input type="date" style={styles.input} value={dataFim} min={dataInicio} onChange={e => handleDataFim(e.target.value)} />
              </div>
            </div>

            <label style={{ ...styles.formLabel, display: "block", marginTop: "16px" }}>Frequência *</label>
            <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
              {[
                { value: "weekly", label: "Semanal" },
                { value: "biweekly_a", label: "Quinzenal A" },
                { value: "biweekly_b", label: "Quinzenal B" },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFrequency(opt.value)}
                  style={{
                    flex: 1,
                    padding: "9px 6px",
                    borderRadius: "6px",
                    border: `2px solid ${frequency === opt.value ? "#1967d2" : "#dadce0"}`,
                    backgroundColor: frequency === opt.value ? "#d2e3fc" : "white",
                    color: frequency === opt.value ? "#1967d2" : "#555",
                    fontWeight: frequency === opt.value ? "700" : "400",
                    cursor: "pointer",
                    fontSize: "13px",
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {erro && <p style={{ ...styles.erroTexto, textAlign: "center", marginTop: "12px" }}>{erro}</p>}
            {sucesso && <p style={{ ...styles.erroTexto, color: "#2e7d32", textAlign: "center", marginTop: "12px" }}>{sucesso}</p>}

            <button type="submit" style={{ ...styles.button, marginTop: "16px" }}>Criar Turma</button>
          </form>
        </div>

        <div style={{ flex: "0 0 300px", position: "sticky", top: "30px" }}>
          <h3 style={{ margin: 0, color: "#333", fontSize: "15px", fontWeight: "800", textAlign: "center" }}>Pré-visualização de Aulas</h3>
          {datesReady ? (
            <CalendarioPreview
              startDate={dataInicio}
              endDate={dataFim}
              frequency={frequency}
              titles={titles}
              onTitleChange={(dateStr, val) => setTitles(prev => ({ ...prev, [dateStr]: val }))}
            />
          ) : (
            <div style={{ flex: 1, border: "1px dashed #dadce0", borderRadius: "10px", padding: "40px 20px", textAlign: "center", color: "#aaa", fontSize: "14px", backgroundColor: "white" }}>
              Selecione as datas e a frequência para visualizar o calendário de aulas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
