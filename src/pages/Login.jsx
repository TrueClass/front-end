import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaEyeSlash, FaUniversity } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { styles } from "../styles";
import { API_BASE } from "../constants";
import { useUser } from "../UserContext";

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
    fetch(`${API_BASE}/institution`)
      .then((res) => res.json())
      .then((dados) => {
        if (dados && dados.institutions) setFaculdades(dados.institutions);
      })
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
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (response.ok) {
        const meRes = await fetch(`${API_BASE}/me`, { credentials: "include" });
        const me = await meRes.json();
        login({
          ...me,
          institutionId: instObj?.id,
          faculdadeNome: faculdadeSelecionada,
        });
        navigate("/mural");
      } else {
        setErroLogin("E-mail ou senha incorretos");
      }
    } catch (error) {
      setErroLogin("Servidor indisponível.");
    }
  };

  return (
    <div style={styles.bodyLogin}>
      <div style={styles.container}>
        <img src="/true_class.png" alt="Logo TrueClass" style={styles.logoInternal} />

        <div style={{ position: "relative", width: "100%", marginBottom: "10px" }}>
          <select
            style={{ ...styles.input, appearance: "none", paddingRight: "35px" }}
            value={faculdadeSelecionada}
            onChange={(e) => setFaculdadeSelecionada(e.target.value)}
          >
            <option value="">Selecione sua instituição...</option>
            {faculdades.map((f) => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
          <FaUniversity style={styles.iconSelect} />
        </div>

        <input type="text" placeholder="E-mail" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && senhaRef.current?.focus()} />

        <div style={styles.passwordWrapper}>
          <input ref={senhaRef} type={showPass ? "text" : "password"} placeholder="Senha" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleEntrar()} />
          <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeButton}>
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {erroLogin && <p style={styles.erroTexto}>{erroLogin}</p>}
        <button onClick={handleEntrar} style={styles.button}>Acessar Portal</button>

        <p style={styles.footerText}>
          Não tem uma conta? <Link to="/cadastro" style={styles.signupLink}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
