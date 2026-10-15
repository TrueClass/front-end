import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";
import RequireAuth, { SessionWatcher } from "./components/RequireAuth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Mural from "./pages/Mural";
import MateriaDetalhes from "./pages/MateriaDetalhes";
import AulaDetalhes from "./pages/AulaDetalhes";
import CriarMateria from "./pages/professor/CriarMateria";
import NotaGeralProfessor from "./pages/professor/NotaGeralProfessor";
import ProfessorDetalhesCoordenador from "./pages/coordenador/ProfessorDetalhesCoordenador";

const withLayout = (page, role) => <RequireAuth role={role}><Layout>{page}</Layout></RequireAuth>;

export default function App() {
  return (
    <UserProvider>
      <ToastProvider>
        <BrowserRouter>
          <SessionWatcher />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/professor/criar-materia" element={<RequireAuth role="professor"><CriarMateria /></RequireAuth>} />
            <Route path="/mural" element={withLayout(<Mural />)} />
            <Route path="/materia/:id" element={withLayout(<MateriaDetalhes />)} />
            <Route path="/materia/:id/aula/:aulaId" element={withLayout(<AulaDetalhes />)} />
            <Route path="/professor/nota-geral" element={withLayout(<NotaGeralProfessor />, "professor")} />
            <Route path="/coordenador/professor/:professorId" element={withLayout(<ProfessorDetalhesCoordenador />, "professor")} />
            <Route path="*" element={<Navigate to="/mural" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </UserProvider>
  );
}
