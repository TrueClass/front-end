import React, { useState, useEffect } from "react";
import { FaThLarge, FaBook, FaChevronDown, FaChevronRight, FaChalkboardTeacher, FaStar, FaBars } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getClasses } from "../api/classes";
import { getCoordinatedProfessors } from "../api/professors";
import { logout as logoutRequest } from "../api/auth";
import { clickable, cx } from "../utils";

function NavGroup({ icon, label, open, onToggle, emptyText, children }) {
  const items = React.Children.toArray(children);
  return (
    <>
      <div {...clickable(onToggle)} aria-expanded={open} className="nav-item">
        <span className="nav-item__icon">{icon}</span>
        <span className="nav-item__label">{label}</span>
        <span className="nav-item__chevron">{open ? <FaChevronDown /> : <FaChevronRight />}</span>
      </div>
      {open && (
        <div className="nav-group">
          {items.length === 0 ? <p className="nav-empty">{emptyText}</p> : items}
        </div>
      )}
    </>
  );
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user: usuario, logout, classesVersion } = useUser();

  const [lista, setLista] = useState([]);
  const [showClasses, setShowClasses] = useState(false);
  const [professores, setProfessores] = useState([]);
  const [showProfessores, setShowProfessores] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const isProfessor = usuario?.role === "professor";
  const isCoordenador = isProfessor && !!usuario?.is_coordinator;

  useEffect(() => {
    if (!usuario?.institutionId) return;
    getClasses(usuario.institutionId).then(setLista).catch(() => setLista([]));
  }, [usuario?.institutionId, classesVersion]);

  useEffect(() => {
    if (!isCoordenador || !usuario?.institutionId) return;
    getCoordinatedProfessors(usuario.institutionId).then(setProfessores).catch(() => setProfessores([]));
  }, [isCoordenador, usuario?.institutionId]);

  useEffect(() => {
    if (!menuAberto) return;
    const onKeyDown = (e) => e.key === "Escape" && setMenuAberto(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuAberto]);

  const irPara = (path, options) => {
    setMenuAberto(false);
    navigate(path, options);
  };

  const navItem = (path, label, icon) => (
    <div
      key={path}
      {...clickable(() => irPara(path))}
      className={cx("nav-item", pathname === path && "nav-item--active")}
      aria-current={pathname === path ? "page" : undefined}
    >
      <span className="nav-item__icon">{icon}</span>
      {label}
    </div>
  );

  const handleLogout = async () => {
    await logoutRequest().catch(() => {});
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <button
          onClick={() => setMenuAberto(a => !a)}
          className="menu-toggle"
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
        >
          <FaBars />
        </button>
        <div className="app-header__brand">
          <img src="/true_class.png" alt="Logo TrueClass" className="app-header__logo" />
          <span className="app-header__institution">— {usuario?.faculdadeNome}</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">Sair</button>
      </header>

      <div className="app-body">
        {menuAberto && <div className="sidebar-backdrop" onClick={() => setMenuAberto(false)} />}
        <aside className={cx("sidebar", menuAberto && "sidebar--open")}>
          {navItem("/mural", "Mural", <FaThLarge />)}
          {isProfessor && navItem("/professor/nota-geral", "Meu desempenho", <FaStar />)}

          <NavGroup icon={<FaBook />} label="Minhas turmas" open={showClasses} onToggle={() => setShowClasses(p => !p)} emptyText="Nenhuma turma">
            {lista.map(cls => (
              <div
                key={cls.id}
                {...clickable(() => irPara(`/materia/${cls.id}`, { state: { subject: cls.subject, professorName: cls.professor_name, className: cls["class"] } }))}
                className="nav-subitem"
                title={cls.subject}
              >
                {cls.subject}
              </div>
            ))}
          </NavGroup>

          {isCoordenador && (
            <NavGroup icon={<FaChalkboardTeacher />} label="Professores" open={showProfessores} onToggle={() => setShowProfessores(p => !p)} emptyText="Nenhum professor">
              {professores.map(prof => (
                <div
                  key={prof.id}
                  {...clickable(() => irPara(`/coordenador/professor/${prof.id}`))}
                  className="nav-subitem"
                  title={prof.name}
                >
                  {prof.name}
                </div>
              ))}
            </NavGroup>
          )}
        </aside>

        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
