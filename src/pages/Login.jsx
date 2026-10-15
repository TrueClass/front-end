import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaEyeSlash, FaUniversity } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { login as loginRequest, getMe } from "../api/auth";
import { listInstitutions } from "../api/institutions";
import Select from "../components/Select";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [erroLogin, setErroLogin] = useState("");
  const [faculdades, setFaculdades] = useState([]);
  const [faculdadeSelecionada, setFaculdadeSelecionada] = useState("");

  const navigate = useNavigate();
  const senhaRef = useRef(null);
  const { login } = useUser();

  useEffect(() => {
    listInstitutions()
      .then(setFaculdades)
      .catch((err) => console.error("Erro ao buscar instituições:", err));
  }, []);

  const handleEntrar = async () => {
    setErroLogin("");
    if (!faculdadeSelecionada) return setErroLogin("Selecione uma instituição");

    const instObj = faculdades.find(f => f.name === faculdadeSelecionada);
    const dominio = email.trim().split("@")[1];
    if (!dominio || !instObj?.emails.includes(dominio))
      return setErroLogin("E-mail não permitido para esta instituição.");

    try {
      await loginRequest(email.trim(), password);
      const me = await getMe();
      login({
        ...me,
        institutionId: me.institution_id,
        faculdadeNome: me.institution_name,
      });
      navigate("/mural");
    } catch (err) {
      if (err.status === 401) setErroLogin("E-mail ou senha incorretos");
      else if (err.status) setErroLogin("Não foi possível entrar. Tente novamente.");
      else setErroLogin("Servidor indisponível.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img src="/true_class.png" alt="Logo TrueClass" className="auth-card__logo" />

        <Select
          value={faculdadeSelecionada}
          onChange={setFaculdadeSelecionada}
          options={faculdades.map(f => ({ value: f.name, label: f.name }))}
          placeholder="Selecione sua instituição"
          icon={<FaUniversity />}
        />

        <input type="email" placeholder="E-mail" className="input" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && senhaRef.current?.focus()} />

        <div className="password-wrapper">
          <input ref={senhaRef} type={showPass ? "text" : "password"} placeholder="Senha" className="input" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleEntrar()} />
          <button type="button" onClick={() => setShowPass(!showPass)} className="password-toggle" aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}>
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {erroLogin && <p className="text-error">{erroLogin}</p>}
        <button onClick={handleEntrar} className="btn">Entrar</button>

        <p className="auth-card__footer">
          Não tem uma conta? <Link to="/cadastro" className="link">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
