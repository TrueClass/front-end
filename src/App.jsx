import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { UserProvider, useUser } from "./UserContext";
import { configureApiFetch } from "./apiFetch";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Mural from "./pages/Mural";
import MateriaDetalhes from "./pages/MateriaDetalhes";
import AulaDetalhes from "./pages/AulaDetalhes";
import CriarMateria from "./pages/professor/CriarMateria";
import MateriaDetalhesProfessor from "./pages/professor/MateriaDetalhesProfessor";
import NotaGeralProfessor from "./pages/professor/NotaGeralProfessor";
import ProfessorDetalhesCoordenador from "./pages/coordenador/ProfessorDetalhesCoordenador";
import "./App.css";

function AuthInit() {
  const { logout } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    configureApiFetch(() => { logout(); navigate("/login"); });
  }, [logout, navigate]);
  return null;
}

export default function App() {
  return (
    <UserProvider>
    <Router>
      <AuthInit />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/professor/criar-materia" element={<CriarMateria />} />
        <Route path="/mural" element={<Layout><Mural /></Layout>} />
        <Route path="/materia/:id" element={<Layout><MateriaDetalhes /></Layout>} />
        <Route path="/materia/:id/aula/:aulaDate" element={<Layout><AulaDetalhes /></Layout>} />
        <Route path="/professor/materia/:id" element={<Layout><MateriaDetalhesProfessor /></Layout>} />
        <Route path="/professor/nota-geral" element={<Layout><NotaGeralProfessor /></Layout>} />
        <Route path="/coordenador/professor/:professorId" element={<Layout><ProfessorDetalhesCoordenador /></Layout>} />
      </Routes>
    </Router>
    </UserProvider>
  );
}
