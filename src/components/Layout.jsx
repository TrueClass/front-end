import React, { useState, useEffect } from "react";
import { FaThLarge, FaBook, FaChevronDown, FaChevronRight, FaChalkboardTeacher } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../UserContext";
import { apiFetch } from "../apiFetch";
import { API_BASE } from "../constants";
import { styles } from "../styles";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user: usuario, logout, classesVersion } = useUser();

  const [lista, setLista] = useState([]);
  const [showClasses, setShowClasses] = useState(false);
  const [professores, setProfessores] = useState([]);
  const [showProfessores, setShowProfessores] = useState(false);

  const isCoordenador = usuario?.role === "coordinator";

  useEffect(() => {
    if (!usuario?.institutionId) return;
    apiFetch(`${API_BASE}/institution/${usuario.institutionId}/classes`)
      .then(r => r.json())
      .then(data => setLista(data.classes || []))
      .catch(() => {});
  }, [usuario?.institutionId, classesVersion]);

  useEffect(() => {
    if (!isCoordenador || !usuario?.institutionId) return;
    apiFetch(`${API_BASE}/institution/${usuario.institutionId}/professor_by_coordinator`)
      .then(r => r.json())
      .then(data => setProfessores(data.professors || []))
      .catch(() => {});
  }, [isCoordenador, usuario?.institutionId]);

  const navItem = (path, label, icon) => {
    const isActive = pathname === path;
    return (
      <div
        key={path}
        onClick={() => navigate(path)}
        onMouseEnter={e => !isActive && (e.currentTarget.style.backgroundColor = "#f1f3f4")}
        onMouseLeave={e => !isActive && (e.currentTarget.style.backgroundColor = "transparent")}
        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 18px", cursor: "pointer", borderRadius: "0 24px 24px 0", marginRight: "12px", backgroundColor: isActive ? "#e8f0fe" : "transparent", color: isActive ? "#1967d2" : "#444", fontWeight: isActive ? "600" : "400", fontSize: "14px", transition: "background-color 0.15s" }}
      >
        <span style={{ fontSize: "15px" }}>{icon}</span>
        {label}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", height: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={styles.muralHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "absolute", left: "20px" }}>
          <img src="/true_class.png" alt="Logo TrueClass" style={{ height: "38px", width: "auto" }} />
          <span style={{ color: "#5f6368", fontSize: "17px", fontWeight: "600" }}>— {usuario?.faculdadeNome}</span>
        </div>
        <button
          onClick={async () => {
            await fetch(`${API_BASE}/authenticate`, { method: "DELETE", credentials: "include" }).catch(() => {});
            logout();
            navigate("/login");
          }}
          style={styles.logoutButton}
        >
          Sair
        </button>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside style={{ width: "260px", flexShrink: 0, backgroundColor: "white", borderRight: "1px solid #dadce0", padding: "12px 0", overflowY: "auto" }}>
          {navItem("/mural", "Mural", <FaThLarge />)}

          <div
            onClick={() => setShowClasses(p => !p)}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f1f3f4"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 18px", cursor: "pointer", borderRadius: "0 24px 24px 0", marginRight: "12px", fontSize: "14px", color: "#444", transition: "background-color 0.15s", userSelect: "none" }}
          >
            <span style={{ fontSize: "15px" }}><FaBook /></span>
            <span style={{ flex: 1 }}>Minhas Turmas</span>
            <span style={{ fontSize: "11px", color: "#aaa" }}>{showClasses ? <FaChevronDown /> : <FaChevronRight />}</span>
          </div>

          {showClasses && (
            <div style={{ paddingBottom: "4px" }}>
              {lista.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#aaa", padding: "4px 18px 4px 44px", margin: 0 }}>Nenhuma turma</p>
              ) : (
                lista.map(cls => (
                  <div
                    key={cls.id}
                    onClick={() => navigate(`/materia/${cls.id}`, { state: { subject: cls.subject, professorName: cls.professor_name, className: cls["class"] } })}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f1f3f4"}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                    style={{ padding: "7px 18px 7px 44px", cursor: "pointer", fontSize: "13px", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "background-color 0.15s" }}
                    title={cls.subject}
                  >
                    {cls.subject}
                  </div>
                ))
              )}
            </div>
          )}

          {isCoordenador && (
            <>
              <div
                onClick={() => setShowProfessores(p => !p)}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f1f3f4"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 18px", cursor: "pointer", borderRadius: "0 24px 24px 0", marginRight: "12px", fontSize: "14px", color: "#444", transition: "background-color 0.15s", userSelect: "none" }}
              >
                <span style={{ fontSize: "15px" }}><FaChalkboardTeacher /></span>
                <span style={{ flex: 1 }}>Professores</span>
                <span style={{ fontSize: "11px", color: "#aaa" }}>{showProfessores ? <FaChevronDown /> : <FaChevronRight />}</span>
              </div>

              {showProfessores && (
                <div style={{ paddingBottom: "4px" }}>
                  {professores.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "#aaa", padding: "4px 18px 4px 44px", margin: 0 }}>Nenhum professor</p>
                  ) : (
                    professores.map(prof => (
                      <div
                        key={prof.id}
                        onClick={() => navigate(`/coordenador/professor/${prof.id}`, { state: { professor: prof } })}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f1f3f4"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                        style={{ padding: "7px 18px 7px 44px", cursor: "pointer", fontSize: "13px", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "background-color 0.15s" }}
                        title={prof.name}
                      >
                        {prof.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </aside>

        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
