import React, { useState, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { cx, getClassDates } from "../utils";

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function ClassCalendar({ startDate, endDate, frequency, titles, onTitleChange }) {
  const [viewDate, setViewDate] = useState(() => new Date(startDate + "T00:00:00"));
  const [editingDate, setEditingDate] = useState(null);

  const classDates = useMemo(
    () => getClassDates(startDate, endDate, frequency),
    [startDate, endDate, frequency]
  );

  const sortedDates = useMemo(() => [...classDates].sort(), [classDates]);

  const changeMonth = (newDate) => { setViewDate(newDate); setEditingDate(null); };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const unnamed = classDates.size - Object.keys(titles).filter(d => classDates.has(d) && titles[d]).length;

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button type="button" onClick={() => changeMonth(new Date(year, month - 1, 1))} className="calendar__nav" aria-label="Mês anterior">
          <FaChevronLeft />
        </button>
        <span className="calendar__month">{MONTH_NAMES[month]} {year}</span>
        <button type="button" onClick={() => changeMonth(new Date(year, month + 1, 1))} className="calendar__nav" aria-label="Próximo mês">
          <FaChevronRight />
        </button>
      </div>

      <div className="calendar__weekdays">
        {DAY_NAMES.map(d => <div key={d} className="calendar__weekday">{d}</div>)}
      </div>

      <div className="calendar__days">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          if (!classDates.has(dateStr)) return <div key={i} className="calendar__day">{day}</div>;

          const isEditing = dateStr === editingDate;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setEditingDate(isEditing ? null : dateStr)}
              aria-label={`Editar título da aula de ${day}/${month + 1}`}
              className={cx(
                "calendar__day calendar__day--class",
                titles[dateStr] && "calendar__day--titled",
                isEditing && "calendar__day--editing",
                dateStr === endDate && "calendar__day--end",
                dateStr === startDate && "calendar__day--start",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      {editingDate && (
        <div className="calendar__editor">
          <div className="calendar__editor-row">
            <input
              autoFocus
              type="text"
              className="input"
              value={titles[editingDate] || ""}
              maxLength={280}
              onChange={e => onTitleChange(editingDate, e.target.value)}
              onKeyDown={e => (e.key === "Enter" || e.key === "Escape") && setEditingDate(null)}
              placeholder={`Aula ${sortedDates.indexOf(editingDate) + 1}`}
            />
            <button type="button" onClick={() => setEditingDate(null)} className="calendar__confirm" aria-label="Confirmar título">✓</button>
          </div>
        </div>
      )}

      <div className="calendar__footer">
        <span className={cx("calendar__unnamed", unnamed === 0 && "calendar__unnamed--done")}>
          {unnamed} aula{unnamed !== 1 ? "s" : ""} sem nome
        </span>
      </div>
    </div>
  );
}
