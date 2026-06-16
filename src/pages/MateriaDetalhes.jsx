import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { styles } from "../styles";
import { API_BASE } from "../constants";
import { useUser } from "../UserContext";
import { apiFetch } from "../apiFetch";

const HEADER_COLOR = "#42576F";

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric"
  });
}

export default function MateriaDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user: usuario } = useUser();

  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [hoveredDate, setHoveredDate] = useState(null);

  const subject = state?.subject || "Turma";
  const professorName = state?.professorName;
  const className = state?.className;

  useEffect(() => {
    if (!usuario?.institutionId) return;
    setCarregando(true);
    apiFetch(`${API_BASE}/institution/${usuario.institutionId}/classes/${id}/items`)
      .then(res => res.json())
      .then(data => setItens(data.dates || []))
      .catch(err => console.error("Erro ao carregar aulas:", err))
      .finally(() => setCarregando(false));
  }, [id, usuario?.institutionId]);

  const today = new Date().toISOString().split("T")[0];
  const hasToday = itens.some(item => item.created_at === today);
  const nextItem = !hasToday ? itens.find(item => item.created_at > today) : null;

  return (
    <div style={{ backgroundColor: "#f1f3f4", flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "8px 20px", maxWidth: "860px", margin: "0 auto", width: "100%" }}>
        <div style={styles.forumContainer}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h2 style={{ color: HEADER_COLOR, fontSize: "24px", fontWeight: "700", margin: 0 }}>{subject}</h2>
            <span style={{ fontSize: "12px", color: "#888", backgroundColor: "#f1f3f4", border: "1px solid #dadce0", borderRadius: "6px", padding: "2px 8px", fontWeight: "500" }}>ID: {id}</span>
          </div>
          <div style={{ marginBottom: "16px", lineHeight: "1.4" }}>
            {professorName && <div style={{ fontSize: "13px", color: "#5f6368" }}>Prof. {professorName}</div>}
            {className && <div style={{ fontSize: "12px", color: "#aaa" }}>{className}</div>}
          </div>

          {carregando ? (
            <p style={{ color: "#666" }}>Carregando...</p>
          ) : itens.length === 0 ? (
            <p style={{ color: "#666" }}>Nenhuma aula encontrada.</p>
          ) : itens.map((item) => {
            const isToday = item.created_at === today;
            const isPast = item.created_at < today;
            const isNext = item === nextItem;
            const isFirst = item === itens[0];
            const isHovered = hoveredDate === item.created_at;

            const cardStyle = {
              ...styles.aulaCard,
              cursor: "pointer",
              ...(isFirst && { borderTop: "1px solid #eee" }),
              ...(isPast && { opacity: 0.5 }),
              ...(isToday && { borderLeft: "4px solid #2e7d32", backgroundColor: "#e8f5e9" }),
              ...(isHovered && !isToday && { backgroundColor: "#f0f4ff" }),
              ...(isHovered && isPast && { opacity: 0.75 }),
            };

            const titleColor = isPast ? "#999" : isToday ? "#2e7d32" : "#1967d2";

            return (
              <div
                key={item.created_at}
                style={cardStyle}
                onClick={() => navigate(
                  `/materia/${id}/aula/${item.created_at}`,
                  { state: { item, subject, professorName, className } }
                )}
                onMouseEnter={() => setHoveredDate(item.created_at)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <strong style={{ textDecoration: isPast ? "line-through" : "none", color: titleColor }}>
                  {item.title}
                </strong>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <p style={{ fontSize: "12px", color: isPast ? "#bbb" : "#666", margin: 0 }}>
                    {formatDate(item.created_at)}
                  </p>
                  {isNext && (
                    <span style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", fontSize: "10px", fontWeight: "700", padding: "0px 6px", borderRadius: "10px", border: "1px solid #a5d6a7", whiteSpace: "nowrap", lineHeight: "16px" }}>
                      Próxima aula
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
