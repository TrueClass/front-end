import React, { useState, useEffect } from "react";
import { FaUniversity } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { styles } from "../styles";
import { API_BASE } from "../constants";

export default function Cadastro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [faculdades, setFaculdades] = useState([]);
  const [idFaculdade, setIdFaculdade] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/institution`).then(res => res.json()).then(d => setFaculdades(d.institutions || []));
  }, []);

  const handleFinalizarCadastro = async () => {
    if (password !== confirmPassword) return setErro("As senhas não coincidem");
    if (!idFaculdade) return setErro("Selecione uma instituição");

    const instObj = faculdades.find(f => f.id == idFaculdade);
    const dominio = email.trim().split("@")[1];
    if (!dominio || !instObj?.emails.includes(dominio))
      return setErro("E-mail não permitido para esta instituição.");

    try {
      const response = await fetch(`${API_BASE}/institution/${idFaculdade}/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (response.status === 201) {
        setSucesso("Cadastro realizado! Redirecionando...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setErro("Erro ao cadastrar.");
      }
    } catch (e) { setErro("Erro de conexão."); }
  };

  return (
    <div style={styles.bodyLogin}>
      <div style={styles.container}>
        <img src="/true_class.png" alt="Logo TrueClass" style={styles.logoInternal} />

        <div style={{ position: "relative", width: "100%", marginBottom: "10px" }}>
          <select
            style={{ ...styles.input, appearance: "none", paddingRight: "35px" }}
            value={idFaculdade}
            onChange={(e) => setIdFaculdade(e.target.value)}
          >
            <option value="">Selecione sua Instituição</option>
            {faculdades.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <FaUniversity style={styles.iconSelect} />
        </div>

        <input type="text" placeholder="E-mail Institucional" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Sua Senha" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirme a Senha" style={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

        {erro && <p style={styles.erroTexto}>{erro}</p>}
        {sucesso && <p style={{ ...styles.erroTexto, color: "#2e7d32" }}>{sucesso}</p>}

        <button onClick={handleFinalizarCadastro} style={styles.button}>Finalizar Cadastro</button>
        <p style={styles.footerText}><Link to="/login" style={styles.signupLink}>Voltar para o Login</Link></p>
      </div>
    </div>
  );
}
