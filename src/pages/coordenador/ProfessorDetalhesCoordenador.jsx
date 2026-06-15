import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";
import { useParams, useLocation } from "react-router-dom";
import { styles } from "../../styles";
import { API_BASE } from "../../constants";
import { apiFetch } from "../../apiFetch";
import { useUser } from "../../UserContext";

const HEADER_COLOR = "#42576F";

const shortDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "N/A";

function FeedbackRow({ item }) {
  return (
    <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
      <td style={{ padding: "10px 12px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #dadce0" }}>
        <div style={{ color: "#fbbc04", fontWeight: "700", fontSize: "16px", lineHeight: "1" }}>{item.value}</div>
        <div style={{ color: "#fbbc04", fontSize: "12px", letterSpacing: "1px", lineHeight: "1", marginTop: "3px" }}>
          {"★".repeat(item.value)}{"☆".repeat(5 - item.value)}
        </div>
      </td>
      <td style={{ padding: "10px 12px", color: "#333", verticalAlign: "middle" }}>{item.content}</td>
      <td style={{ padding: "10px 12px", textAlign: "center", verticalAlign: "middle", borderLeft: "1px solid #dadce0" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", color: "#1967d2" }}>
          <FaArrowUp style={{ fontSize: "13px" }} />
          <span style={{ fontSize: "11px", fontWeight: "600" }}>{item.boosts}</span>
        </div>
      </td>
    </tr>
  );
}

function FeedbackSection({ title, items }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginBottom: "24px" }}>
      <h4 style={{ color: "#5f6368", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.6px", margin: "0 0 10px" }}>
        {title}
      </h4>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", border: "1px solid #dadce0", borderRadius: "8px", overflow: "hidden" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #dadce0", backgroundColor: "#f8f9fa" }}>
            <th style={{ padding: "8px 12px", textAlign: "center", color: "#5f6368", fontWeight: "600", width: "100px", borderRight: "1px solid #dadce0" }}>Nota</th>
            <th style={{ padding: "8px 12px", textAlign: "left", color: "#5f6368", fontWeight: "600" }}>Conteúdo</th>
            <th style={{ padding: "8px 12px", textAlign: "center", color: "#5f6368", fontWeight: "600", width: "70px", borderLeft: "1px solid #dadce0" }}>Boosts</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => <FeedbackRow key={item.id} item={item} />)}
        </tbody>
      </table>
    </div>
  );
}

export default function ProfessorDetalhesCoordenador() {
  const { professorId } = useParams();
  const { state } = useLocation();
  const { user: usuario } = useUser();
  const professor = state?.professor;

  const [classes, setClasses] = useState([]);
  const [feedbacks, setFeedbacks] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario?.institutionId) return;
    const { institutionId } = usuario;

    const fetchAll = async () => {
      setCarregando(true);
      try {
        const [classesResult, feedbacksResult] = await Promise.allSettled([
          apiFetch(`${API_BASE}/institution/${institutionId}/professor/${professorId}/classes`).then(r => r.json()),
          apiFetch(`${API_BASE}/institution/${institutionId}/professor/${professorId}/feedbacks?limit=5`).then(r => r.json()),
        ]);
        if (classesResult.status === "fulfilled") setClasses(classesResult.value.classes || []);
        if (feedbacksResult.status === "fulfilled") setFeedbacks(feedbacksResult.value);
      } catch (err) {
        console.error("Erro ao carregar dados do professor:", err);
      } finally {
        setCarregando(false);
      }
    };

    fetchAll();
  }, [professorId, usuario?.institutionId]);

  const hasFeedbacks = feedbacks?.most_boosted?.length || feedbacks?.highest_rating?.length || feedbacks?.lowest_rating?.length;

  return (
    <div style={{ backgroundColor: "#f1f3f4", flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "8px 20px", maxWidth: "860px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>

        <div style={styles.forumContainer}>
          <h2 style={{ color: HEADER_COLOR, fontSize: "24px", fontWeight: "700", margin: "0 0 4px" }}>
            Prof. {professor?.name || `Professor ${professorId}`}
          </h2>
          <div style={{ lineHeight: "1.4" }}>
            {professor?.email && <div style={{ fontSize: "13px", color: "#5f6368" }}>{professor.email}</div>}
            {professor?.rating != null && (
              <div style={{ fontSize: "12px", color: "#aaa" }}>{professor.rating?.toFixed(1)} ★ média geral</div>
            )}
          </div>
        </div>

        {carregando ? (
          <p style={{ color: "#666", textAlign: "center" }}>Carregando...</p>
        ) : (
          <>
            <div style={styles.forumContainer}>
              <h3 style={{ color: HEADER_COLOR, fontSize: "16px", fontWeight: "600", margin: "0 0 14px" }}>Turmas</h3>
              {classes.length === 0 ? (
                <p style={{ color: "#666", margin: 0 }}>Nenhuma turma encontrada.</p>
              ) : (
                classes.map(cls => (
                  <div key={cls.id} style={{ ...styles.aulaCard, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ color: "#333", fontSize: "15px" }}>{cls.subject}</strong>
                      <div style={{ fontSize: "12px", color: "#aaa", marginTop: "2px" }}>{cls.class}</div>
                    </div>
                    <div style={{ fontSize: "12px", textAlign: "right", color: "#aaa" }}>
                      Última aula: <span style={{ color: "#555" }}>{shortDate(cls.last_class)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={styles.forumContainer}>
              <h3 style={{ color: HEADER_COLOR, fontSize: "16px", fontWeight: "600", margin: "0 0 20px" }}>Feedbacks dos Alunos</h3>
              {hasFeedbacks ? (
                <>
                  <FeedbackSection title="Mais votados" items={feedbacks.most_boosted} />
                  <FeedbackSection title="Melhor avaliação" items={feedbacks.highest_rating} />
                  <FeedbackSection title="Pior avaliação" items={feedbacks.lowest_rating} />
                </>
              ) : (
                <p style={{ color: "#666", margin: 0 }}>Nenhum feedback recebido ainda.</p>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
