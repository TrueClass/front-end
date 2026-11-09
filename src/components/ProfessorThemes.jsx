import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaMagic } from "react-icons/fa";
import { getProfessorThemes, generateProfessorThemes } from "../api/professors";
import { cx } from "../utils";
import Skeleton from "./Skeleton";

const INTERVALO_CONSULTA = 3000;

const ERROS_TEMAS = {
  403: "Você não coordena este professor.",
  404: "Este professor ainda não possui avaliações.",
};

const ERRO_GERACAO = "Os temas estão indisponíveis no momento. Tente novamente mais tarde.";

const formatarData = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

const porcentagem = (share) => `${Math.round(share * 100)}%`;

// start/end vêm do back em code points, por isso Array.from em vez de slice direto (emojis ocupam 2 posições em JS)
function TrechoDestacado({ evidencia }) {
  const chars = Array.from(evidencia.content);
  return (
    <p className="theme-evidence__text">
      {chars.slice(0, evidencia.start).join("")}
      <mark className={`theme-evidence__mark theme-evidence__mark--${evidencia.sentiment}`}>
        {chars.slice(evidencia.start, evidencia.end).join("")}
      </mark>
      {chars.slice(evidencia.end).join("")}
    </p>
  );
}

function Evidencias({ itens }) {
  return (
    <ul className="theme-evidences">
      {itens.map((ev, i) => (
        <li key={`${ev.rating_id}-${i}`} className="theme-evidence">
          <TrechoDestacado evidencia={ev} />
          <span className="theme-evidence__meta">
            {ev.subject}{ev.title ? ` · ${ev.title}` : ""}{ev.boosts > 0 && ` · ${ev.boosts} apoio${ev.boosts > 1 ? "s" : ""}`}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Tema({ tema, aberto, onToggle }) {
  const share = tema.positive_share;
  return (
    <li className="theme">
      <button className="theme__header" onClick={onToggle} aria-expanded={aberto}>
        <span className="theme__name">{tema.name}</span>
        {share != null && (
          <span className="theme__bar" aria-hidden="true">
            <span className="theme__bar-fill" style={{ width: porcentagem(share) }} />
          </span>
        )}
        <span className="theme__stats">
          {share != null ? `${porcentagem(share)} positivo · ` : ""}
          {tema.mentions} menç{tema.mentions === 1 ? "ão" : "ões"}
        </span>
      </button>
      {aberto && <Evidencias itens={tema.evidences} />}
    </li>
  );
}

function GrupoTemas({ titulo, temas, aberto, onToggle }) {
  if (!temas.length) return null;
  return (
    <div className="feedback-section">
      <h4 className="feedback-section__title">{titulo}</h4>
      <ul className="themes">
        {temas.map(tema => (
          <Tema key={tema.name} tema={tema} aberto={aberto === tema.name} onToggle={() => onToggle(tema.name)} />
        ))}
      </ul>
    </div>
  );
}

export default function ProfessorThemes({ institutionId, professorId }) {
  const [snapshot, setSnapshot] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [aberto, setAberto] = useState(null);
  const snapshotAnterior = useRef(null);

  const aplicarStatus = useCallback((status) => {
    setSnapshot(status.snapshot);
    if (status.generating) snapshotAnterior.current = status.snapshot?.created_at ?? null;
    setGerando(status.generating);
  }, []);

  useEffect(() => {
    getProfessorThemes(institutionId, professorId)
      .then(aplicarStatus)
      .catch(() => setErro("Erro ao carregar os temas."))
      .finally(() => setCarregando(false));
  }, [institutionId, professorId, aplicarStatus]);

  useEffect(() => {
    if (!gerando) return;
    let ativo = true;
    let timer;

    const consultar = async () => {
      try {
        const status = await getProfessorThemes(institutionId, professorId);
        if (!ativo) return;
        if (!status.generating) {
          setSnapshot(status.snapshot);
          setGerando(false);
          if (!status.snapshot || status.snapshot.created_at === snapshotAnterior.current) setErro(ERRO_GERACAO);
          return;
        }
      } catch {
        if (!ativo) return;
      }
      timer = setTimeout(consultar, INTERVALO_CONSULTA);
    };

    timer = setTimeout(consultar, INTERVALO_CONSULTA);
    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [gerando, institutionId, professorId]);

  const gerarTemas = async () => {
    setErro("");
    snapshotAnterior.current = snapshot?.created_at ?? null;
    setGerando(true);
    try {
      aplicarStatus(await generateProfessorThemes(institutionId, professorId));
    } catch (err) {
      setGerando(false);
      if (err.status === 409) {
        await getProfessorThemes(institutionId, professorId).then(aplicarStatus).catch(() => {});
        return;
      }
      setErro(ERROS_TEMAS[err.status] || (err.status ? "Erro ao gerar os temas." : "Erro de conexão."));
    }
  };

  const alternar = (nome) => setAberto(atual => (atual === nome ? null : nome));

  const temas = snapshot?.themes ?? [];
  const fortes = temas.filter(t => t.positive_share != null && t.positive_share >= 0.5);
  const melhorar = temas.filter(t => t.positive_share != null && t.positive_share < 0.5);
  const neutros = temas.filter(t => t.positive_share == null);
  const pontuais = snapshot?.isolated ?? [];
  const podeGerar = !carregando && !gerando && !snapshot?.up_to_date;

  return (
    <div className="panel professor-themes" aria-live="polite">
      <h3 className="section-title professor-themes__title"><FaMagic /> Temas dos feedbacks</h3>

      {carregando ? (
        <Skeleton variant="line" count={3} />
      ) : gerando ? (
        <>
          <p className="rating-summary__hint">Analisando os feedbacks, isso pode levar alguns minutos...</p>
          <Skeleton variant="line" count={3} />
        </>
      ) : snapshot ? (
        <>
          {temas.length === 0 && pontuais.length === 0 && (
            <p className="state-message">Nenhum tema identificado nos feedbacks.</p>
          )}
          <GrupoTemas titulo="Pontos fortes" temas={fortes} aberto={aberto} onToggle={alternar} />
          <GrupoTemas titulo="Pontos a melhorar" temas={melhorar} aberto={aberto} onToggle={alternar} />
          <GrupoTemas titulo="Observações neutras" temas={neutros} aberto={aberto} onToggle={alternar} />
          {pontuais.length > 0 && (
            <div className="feedback-section">
              <button
                className={cx("theme__header", "theme__header--plain")}
                onClick={() => alternar("__pontuais")}
                aria-expanded={aberto === "__pontuais"}
              >
                <span className="feedback-section__title">Temas pontuais ({pontuais.length})</span>
              </button>
              {aberto === "__pontuais" && <Evidencias itens={pontuais} />}
            </div>
          )}
          <p className="rating-summary__meta">
            Gerado por IA a partir de {snapshot.rating_count} avaliaç{snapshot.rating_count === 1 ? "ão" : "ões"} · {formatarData(snapshot.created_at)}
            {snapshot.up_to_date && " · Atualizado com todas as avaliações"}
          </p>
        </>
      ) : (
        <p className="rating-summary__hint">
          Identifique com IA os temas em que o professor vai bem ou precisa melhorar, a partir de todos os feedbacks dos alunos.
        </p>
      )}

      {erro && <p className="text-error">{erro}</p>}

      {podeGerar && (
        <button onClick={gerarTemas} className="btn rating-summary__btn">
          {snapshot ? "Atualizar temas com novas avaliações" : "Gerar temas"}
        </button>
      )}
    </div>
  );
}
