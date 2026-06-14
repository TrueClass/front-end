import React, { useState, useEffect } from "react";
import { FaArrowUp, FaArrowLeft, FaCommentAlt, FaStar } from "react-icons/fa";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { styles } from "../styles";
import { API_BASE } from "../constants";
import { apiFetch } from "../apiFetch";

const HEADER_COLOR = "#42576F";

export default function AulaDetalhes() {
  const { id, aulaDate } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const item = state?.item;
  const subject = state?.subject || "Turma";
  const professorName = state?.professorName;
  const className = state?.className;

  const [guiaAtiva, setGuiaAtiva] = useState("Avaliacao");
  const [duvidas] = useState([]);
  const [minhaNota, setMinhaNota] = useState(0);
  const [meuComentario, setMeuComentario] = useState("");
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [erroAvaliacao, setErroAvaliacao] = useState("");
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);

  const feedbackId = item?.id ?? aulaDate;

  useEffect(() => {
    apiFetch(`${API_BASE}/feedback/${feedbackId}`)
      .then(r => r.json())
      .then(data => setAvaliacoes(data.ratings || []))
      .catch(() => {});
  }, [feedbackId]);

  const handleBoost = async (avId) => {
    const current = avaliacoes.find(av => av.id === avId);
    const method = current?.boosted_by_user ? "DELETE" : "POST";
    const res = await apiFetch(`${API_BASE}/feedback/${avId}/boost`, { method });
    if (res.ok) {
      const data = await res.json();
      setAvaliacoes(prev => prev.map(av => av.id === avId
        ? { ...av, boosts: data.boosts, boosted_by_user: !current?.boosted_by_user }
        : av
      ));
    }
  };

  const handlePostarAvaliacao = async () => {
    if (!minhaNota) return setErroAvaliacao("Selecione uma nota.");
    if (!meuComentario.trim()) return setErroAvaliacao("Escreva um comentário.");
    setErroAvaliacao("");
    setEnviandoAvaliacao(true);
    try {
      const res = await apiFetch(`${API_BASE}/feedback/${feedbackId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: minhaNota, content: meuComentario.trim() }),
      });
      if (res.status === 201) {
        const nova = await res.json();
        setAvaliacoes(prev => [{ id: nova.id, value: minhaNota, content: meuComentario.trim(), sent_by_user: 1, boosts: 0, boosted_by_user: false }, ...prev]);
      } else if (res.status === 409) {
        const refetch = await apiFetch(`${API_BASE}/feedback/${feedbackId}`);
        const data = await refetch.json();
        setAvaliacoes(data.ratings || []);
      } else {
        setErroAvaliacao("Erro ao enviar avaliação.");
      }
    } catch {
      setErroAvaliacao("Erro de conexão.");
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  const ratingRow = (av, highlight) => (
    <tr key={av.id} style={{ borderBottom: "1px solid #f0f0f0", backgroundColor: highlight ? "#fffde7" : "transparent" }}>
      <td style={{ padding: "10px 12px", textAlign: "center", verticalAlign: "middle", borderRight: "1px solid #dadce0" }}>
        <div style={{ color: "#fbbc04", fontWeight: "700", fontSize: "16px", lineHeight: "1" }}>{av.value}</div>
        <div style={{ color: "#fbbc04", fontSize: "12px", letterSpacing: "1px", lineHeight: "1", marginTop: "3px" }}>
          {"★".repeat(av.value)}{"☆".repeat(5 - av.value)}
        </div>
      </td>
      <td style={{ padding: "10px 12px", color: "#333", verticalAlign: "middle" }}>
        {highlight && <span style={{ fontSize: "11px", fontWeight: "700", color: "#f9a825", display: "block", marginBottom: "3px" }}>Seu comentário</span>}
        {av.content}
      </td>
      <td style={{ padding: "10px 12px", textAlign: "center", verticalAlign: "middle", borderLeft: "1px solid #dadce0" }}>
        <button
          onClick={() => handleBoost(av.id)}
          style={{ background: "none", border: "none", cursor: "pointer", color: av.boosted_by_user ? "#1967d2" : "#ccc", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", margin: "0 auto" }}
        >
          <FaArrowUp style={{ fontSize: "14px" }} />
          <span style={{ fontSize: "11px", fontWeight: "600" }}>{av.boosts ?? 0}</span>
        </button>
      </td>
    </tr>
  );

  const today = new Date().toISOString().split("T")[0];
  const isFuture = aulaDate > today;

  const minhaAvaliacao = avaliacoes.find(av => av.sent_by_user === 1);
  const outrasAvaliacoes = avaliacoes.filter(av => av.sent_by_user !== 1);

  return (
    <div style={{ backgroundColor: "#f1f3f4", flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "8px 20px", maxWidth: "860px", margin: "0 auto", width: "100%" }}>
        <div style={styles.forumContainer}>
          <button
            onClick={() => navigate(`/materia/${id}`, { state: { subject, professorName, className } })}
            style={{ background: "none", border: "none", cursor: "pointer", color: HEADER_COLOR, display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "600", padding: "0 0 6px", marginBottom: "0" }}
          >
            <FaArrowLeft style={{ fontSize: "20px" }} /> Voltar para aulas
          </button>

          <div style={styles.tabContainer}>
            <div
              onClick={() => setGuiaAtiva("Avaliacao")}
              style={{ ...styles.tabItem, color: guiaAtiva === "Avaliacao" ? HEADER_COLOR : "#5f6368", borderBottom: guiaAtiva === "Avaliacao" ? `3px solid ${HEADER_COLOR}` : "3px solid transparent", fontWeight: "600" }}
            >
              <FaStar style={{ marginRight: "8px" }} /> Avaliações de Aula ({avaliacoes.length})
            </div>
            <div
              onClick={() => setGuiaAtiva("Comentarios")}
              style={{ ...styles.tabItem, color: guiaAtiva === "Comentarios" ? HEADER_COLOR : "#5f6368", borderBottom: guiaAtiva === "Comentarios" ? `3px solid ${HEADER_COLOR}` : "3px solid transparent", fontWeight: "600" }}
            >
              <FaCommentAlt style={{ marginRight: "8px" }} /> Dúvidas ({duvidas.length})
            </div>
          </div>

          {guiaAtiva === "Comentarios" && (
            <div style={{ marginTop: "40px", textAlign: "center", padding: "20px" }}>
              <FaCommentAlt style={{ fontSize: "32px", color: "#dadce0", marginBottom: "12px" }} />
              <p style={{ margin: 0, fontWeight: "600", color: "#5f6368" }}>Volte novamente mais tarde</p>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#aaa" }}>Ainda estamos trabalhando nisso</p>
            </div>
          )}

          {guiaAtiva === "Avaliacao" && (
            <div style={{ marginTop: "20px" }}>
              {isFuture ? (
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  <FaStar style={{ fontSize: "36px", color: "#dadce0", marginBottom: "12px" }} />
                  <p style={{ margin: 0, fontWeight: "600", color: "#5f6368" }}>Esta aula ainda não ocorreu</p>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#aaa" }}>O feedback estará disponível após a realização da aula</p>
                </div>
              ) : !minhaAvaliacao && (
                <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px", border: "1px solid #dadce0", marginBottom: "20px", textAlign: "center" }}>
                  <h4>Como você avalia esta aula?</h4>
                  <div style={{ fontSize: "35px", margin: "10px 0" }}>
                    {[1, 2, 3, 4, 5].map(estrela => (
                      <span key={estrela} onClick={() => setMinhaNota(estrela)} style={{ cursor: "pointer", color: estrela <= minhaNota ? "#fbbc04" : "#e8eaed" }}>★</span>
                    ))}
                  </div>
                  <textarea
                    style={{ ...styles.input, height: "80px", resize: "none", fontFamily: "inherit" }}
                    placeholder="Deixe seu feedback/comentário sobre a aula (Obrigatório)..."
                    value={meuComentario}
                    onChange={e => setMeuComentario(e.target.value)}
                  />
                  {erroAvaliacao && <p style={{ ...styles.erroTexto, marginTop: "8px" }}>{erroAvaliacao}</p>}
                  <button onClick={handlePostarAvaliacao} disabled={enviandoAvaliacao} style={{ ...styles.button, marginTop: "10px", opacity: enviandoAvaliacao ? 0.6 : 1 }}>
                    {enviandoAvaliacao ? "Enviando..." : "Postar Avaliação"}
                  </button>
                </div>
              )}
              {!isFuture && avaliacoes.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666" }}>Nenhuma avaliação enviada ainda.</p>
              ) : !isFuture && (
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #dadce0" }}>
                      <th style={{ padding: "8px 12px", textAlign: "center", color: "#5f6368", fontWeight: "600", width: "100px", borderRight: "1px solid #dadce0" }}>Nota</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", color: "#5f6368", fontWeight: "600" }}>Conteúdo</th>
                      <th style={{ padding: "8px 12px", textAlign: "center", color: "#5f6368", fontWeight: "600", width: "80px", borderLeft: "1px solid #dadce0" }}>Boosts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {minhaAvaliacao && ratingRow(minhaAvaliacao, true)}
                    {outrasAvaliacoes.map(av => ratingRow(av, false))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
