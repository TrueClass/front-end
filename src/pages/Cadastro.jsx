import React, { useState, useEffect } from "react";
import { FaUniversity } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { listInstitutions, registerStudent } from "../api/institutions";
import Select from "../components/Select";
import { useToast } from "../context/ToastContext";

const MIN_PASSWORD_LENGTH = 8;

const ERROS_CADASTRO = {
  409: "Este e-mail já está cadastrado.",
  422: "Dados inválidos. Verifique o e-mail e a senha.",
};

export default function Cadastro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [faculdades, setFaculdades] = useState([]);
  const [idFaculdade, setIdFaculdade] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  useEffect(() => {
    listInstitutions()
      .then(setFaculdades)
      .catch(() => setErro("Não foi possível carregar as instituições."));
  }, []);

  const handleFinalizarCadastro = async () => {
    setErro("");
    if (!idFaculdade) return setErro("Selecione uma instituição");
    if (password.length < MIN_PASSWORD_LENGTH) return setErro(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`);
    if (password !== confirmPassword) return setErro("As senhas não coincidem");

    const instObj = faculdades.find(f => String(f.id) === idFaculdade);
    const dominio = email.trim().split("@")[1]?.toLowerCase();
    if (!dominio || !instObj?.emails.includes(dominio))
      return setErro("E-mail não permitido para esta instituição.");

    setEnviando(true);
    try {
      await registerStudent(idFaculdade, email.trim(), password);
      showToast("Cadastro realizado! Agora é só entrar.");
      navigate("/login");
    } catch (err) {
      setErro(ERROS_CADASTRO[err.status] || (err.status ? "Erro ao cadastrar." : "Erro de conexão."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/true_class.png" alt="Logo TrueClass" className="auth-card__logo" />

        <Select
          value={idFaculdade}
          onChange={setIdFaculdade}
          options={faculdades.map(f => ({ value: String(f.id), label: f.name }))}
          placeholder="Selecione sua instituição"
          icon={<FaUniversity />}
        />

        <input type="email" placeholder="E-mail institucional" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder={`Senha (mín. ${MIN_PASSWORD_LENGTH} caracteres)`} className="input" value={password} maxLength={128} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirme a senha" className="input" value={confirmPassword} maxLength={128} onChange={(e) => setConfirmPassword(e.target.value)} />

        {erro && <p className="text-error">{erro}</p>}

        <button onClick={handleFinalizarCadastro} disabled={enviando} className="btn">Finalizar cadastro</button>
        <p className="auth-card__footer"><Link to="/login" className="link">Voltar para o login</Link></p>
      </div>
    </div>
  );
}
