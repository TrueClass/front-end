import React, { useState, useEffect, useRef } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { styles } from "../styles";
import { API_BASE } from "../constants";
import { useUser } from "../UserContext";
import { apiFetch } from "../apiFetch";

export default function Mural() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [erroJoin, setErroJoin] = useState("");

  const navigate = useNavigate();
  const { user: usuario, refreshClasses, classesVersion } = useUser();
  const menuRef = useRef(null);

  const isProfessor = usuario?.role === "professor" || usuario?.role === "coordinator";
  const today = new Date().toISOString().split("T")[0];
  const shortDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  useEffect(() => {
    if (!usuario?.institutionId) return;
    const carregar = async () => {
      setCarregando(true);
      try {
        const res = await apiFetch(`${API_BASE}/institution/${usuario.institutionId}/classes`);
        const data = await res.json();
        setLista(data.classes || []);
      } catch (err) {
        console.error("Erro ao carregar mural:", err);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [usuario?.institutionId, classesVersion]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleJoin = async () => {
    setErroJoin("");
    if (!codigo.trim()) return setErroJoin("Informe o código da turma.");
    try {
      const res = await apiFetch(
        `${API_BASE}/institution/${usuario.institutionId}/classes/${codigo.trim()}/enroll`,
        { method: "POST" }
      );
      if (res.ok) {
        setShowJoinModal(false);
        setCodigo("");
        refreshClasses();
      } else if (res.status === 409) {
        setErroJoin("Você já está nessa turma.");
      } else if (res.status === 404) {
        setErroJoin("Turma não encontrada.");
      } else {
        setErroJoin("Erro ao entrar na turma.");
      }
    } catch {
      setErroJoin("Servidor indisponível.");
    }
  };

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <div ref={menuRef} style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {isProfessor && showMenu && (
          <div style={{ marginBottom: "10px", backgroundColor: "white", borderRadius: "10px", boxShadow: "0 6px 20px rgba(0,0,0,0.15)", overflow: "hidden", minWidth: "180px" }}>
            <button
              onClick={() => { setShowMenu(false); navigate("/professor/criar-materia"); }}
              style={{ display: "block", width: "100%", padding: "13px 18px", background: "none", border: "none", textAlign: "center", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#333" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5f5f5"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Criar nova turma
            </button>
            <div style={{ height: "1px", backgroundColor: "#f0f0f0", margin: "0 12px" }} />
            <button
              onClick={() => { setShowMenu(false); setShowJoinModal(true); }}
              style={{ display: "block", width: "100%", padding: "13px 18px", background: "none", border: "none", textAlign: "center", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#333" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5f5f5"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            >
              Entrar com código
            </button>
          </div>
        )}
        <button
          onClick={() => isProfessor ? setShowMenu(prev => !prev) : setShowJoinModal(true)}
          style={{ ...styles.addButton, position: "static", backgroundColor: showMenu ? "#1a56b0" : undefined, transform: showMenu ? "rotate(45deg)" : "none", transition: "background-color 0.2s, transform 0.2s" }}
          title="Adicionar Matéria"
        >
          <FaPlus />
        </button>
      </div>

      {showJoinModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: "15px", color: "#333" }}>Entrar em uma Turma</h3>
            <input
              type="text"
              placeholder="Código da turma"
              style={styles.input}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            {erroJoin && <p style={styles.erroTexto}>{erroJoin}</p>}
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button onClick={handleJoin} style={styles.button}>Entrar</button>
              <button onClick={() => { setShowJoinModal(false); setCodigo(""); setErroJoin(""); }} style={{ ...styles.button, backgroundColor: "#6c757d" }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.gridContainer}>
        {carregando ? (
          <p>Carregando...</p>
        ) : lista.length === 0 ? (
          <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#666" }}>Nenhuma matéria disponível.</p>
        ) : (
          lista.map(cls => (
            <div key={cls.id} style={styles.muralCard} onClick={() => navigate(`/materia/${cls.id}`, { state: { subject: cls.subject, professorName: cls.professor_name, className: cls["class"] } })}>
              <div style={{ ...styles.muralCardHeader, backgroundColor: "#42576F" }}>
                <h3 style={{ color: "white", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cls.subject}</h3>
                <div style={{ marginTop: "6px", lineHeight: "1.3" }}>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px" }}>Prof. {cls.professor_name}</div>
                  {cls["class"] && <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{cls["class"]}</div>}
                </div>
              </div>
              <div style={{ padding: "10px 15px", display: "grid", gridTemplateColumns: "max-content 1fr", columnGap: "8px", rowGap: "0px", fontSize: "12px", lineHeight: "1.3" }}>
                <span style={{ color: "#aaa" }}>Última aula:</span>
                <span style={{ color: "#555" }}>{cls.last_class ? shortDate(cls.last_class) : "N/A"}</span>
                <span style={{ color: "#aaa" }}>Próxima aula:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ color: cls.next_class === today ? "#2e7d32" : "#555", fontWeight: cls.next_class === today ? "700" : "400" }}>
                    {cls.next_class ? shortDate(cls.next_class) : "N/A"}
                  </span>
                  {cls.next_class === today && (
                    <span style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", fontSize: "10px", fontWeight: "700", padding: "0px 5px", borderRadius: "10px", border: "1px solid #a5d6a7", whiteSpace: "nowrap", lineHeight: "15px" }}>
                      Hoje!
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
