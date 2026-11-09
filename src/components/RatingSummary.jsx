import React, { useEffect, useState } from "react";
import { FaMagic } from "react-icons/fa";
import { getRatingsSummary, generateRatingsSummary } from "../api/feedback";
import Skeleton from "./Skeleton";

const ERROS_RESUMO = {
  403: "Você não tem acesso a esta aula.",
  404: "Esta aula ainda não possui avaliações.",
  503: "O resumo está indisponível no momento. Tente novamente mais tarde.",
};

const formatarData = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

export default function RatingSummary({ classItemId, totalRatings }) {
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");

  const buscarResumo = () =>
    getRatingsSummary(classItemId)
      .then(setResumo)
      .catch(() => setErro("Erro ao carregar o resumo."));

  // loads the stored summary only; generating is up to the professor
  useEffect(() => {
    getRatingsSummary(classItemId)
      .then(setResumo)
      .catch(() => setErro("Erro ao carregar o resumo."))
      .finally(() => setCarregando(false));
  }, [classItemId]);

  const gerarResumo = async () => {
    setErro("");
    setGerando(true);
    try {
      setResumo(await generateRatingsSummary(classItemId));
    } catch (err) {
      // 409: summary already covers every rating, just show the stored one
      if (err.status === 409) await buscarResumo();
      else setErro(ERROS_RESUMO[err.status] || (err.status ? "Erro ao gerar o resumo." : "Erro de conexão."));
    } finally {
      setGerando(false);
    }
  };

  // the professor may have the page open while new ratings arrive
  const atualizado = resumo && resumo.up_to_date && totalRatings <= resumo.rating_count;
  const podeGerar = !carregando && !gerando && !atualizado;

  return (
    <section className="rating-summary" aria-live="polite">
      <h4 className="rating-summary__title"><FaMagic /> Resumo das avaliações</h4>

      {carregando || gerando ? (
        <Skeleton variant="line" count={3} />
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
