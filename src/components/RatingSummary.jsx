import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaMagic } from "react-icons/fa";
import { getRatingsSummary, generateRatingsSummary } from "../api/feedback";
import Skeleton from "./Skeleton";

const INTERVALO_CONSULTA = 3000;

const ERROS_RESUMO = {
  403: "Você não tem acesso a esta aula.",
  404: "Esta aula ainda não possui avaliações.",
};

const ERRO_GERACAO = "O resumo está indisponível no momento. Tente novamente mais tarde.";

const formatarData = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export default function RatingSummary({ classItemId, totalRatings }) {
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const resumoAnterior = useRef(null);

  const aplicarStatus = useCallback((status) => {
    setResumo(status.summary);
    if (status.generating) resumoAnterior.current = status.summary?.created_at ?? null;
    setGerando(status.generating);
  }, []);

  useEffect(() => {
    getRatingsSummary(classItemId)
      .then(aplicarStatus)
      .catch(() => setErro("Erro ao carregar o resumo."))
      .finally(() => setCarregando(false));
  }, [classItemId, aplicarStatus]);

  useEffect(() => {
    if (!gerando) return;
    let ativo = true;
    let timer;

    const consultar = async () => {
      try {
        const status = await getRatingsSummary(classItemId);
        if (!ativo) return;
        if (!status.generating) {
          setResumo(status.summary);
          setGerando(false);
          if (!status.summary || status.summary.created_at === resumoAnterior.current) setErro(ERRO_GERACAO);
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
  }, [gerando, classItemId]);

  const gerarResumo = async () => {
    setErro("");
    resumoAnterior.current = resumo?.created_at ?? null;
    setGerando(true);
    try {
      aplicarStatus(await generateRatingsSummary(classItemId));
    } catch (err) {
      setGerando(false);
      if (err.status === 409) {
        await getRatingsSummary(classItemId).then(aplicarStatus).catch(() => {});
        return;
      }
      setErro(ERROS_RESUMO[err.status] || (err.status ? "Erro ao gerar o resumo." : "Erro de conexão."));
    }
  };

  const atualizado = resumo && resumo.up_to_date && totalRatings <= resumo.rating_count;
  const podeGerar = !carregando && !gerando && !atualizado;

  return (
    <section className="rating-summary" aria-live="polite">
      <h4 className="rating-summary__title"><FaMagic /> Resumo das avaliações</h4>

      {carregando ? (
        <Skeleton variant="line" count={3} />
      ) : gerando ? (
        <>
          <p className="rating-summary__hint">Gerando resumo, isso pode levar até um minuto...</p>
          <Skeleton variant="line" count={3} />
        </>
      ) : resumo ? (
        <>
          <p className="rating-summary__text">{resumo.summary}</p>
          <p className="rating-summary__meta">
            Gerado por IA a partir de {resumo.rating_count} avaliaç{resumo.rating_count === 1 ? "ão" : "ões"} · {formatarData(resumo.created_at)}
            {atualizado && " · Atualizado com todas as avaliações"}
          </p>
        </>
      ) : (
        <p className="rating-summary__hint">
          Gere um resumo com IA dos pontos positivos, pontos a melhorar e sugestões dos alunos.
        </p>
      )}

      {erro && <p className="text-error">{erro}</p>}

      {podeGerar && (
        <button onClick={gerarResumo} className="btn rating-summary__btn">
          {resumo ? "Atualizar resumo com novas avaliações" : "Gerar resumo"}
        </button>
      )}
    </section>
  );
}
