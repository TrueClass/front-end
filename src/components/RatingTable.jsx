import React from "react";
import { FaArrowUp } from "react-icons/fa";
import { cx } from "../utils";

export default function RatingTable({ boxed = false, children }) {
  return (
    <table className={cx("rating-table", boxed && "rating-table--boxed")}>
      <thead>
        <tr>
          <th className="rating-table__score">Nota</th>
          <th>Conteúdo</th>
          <th className="rating-table__boost">Boosts</th>
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

export function RatingRow({ rating, mine = false, meta, onBoost }) {
  const boostContent = (
    <>
      <FaArrowUp />
      <span className="boost__count">{rating.boosts ?? 0}</span>
    </>
  );

  return (
    <tr className={cx(mine && "rating-table__row--mine")}>
      <td className="rating-table__score">
        <div className="rating-value">{rating.value}</div>
        <div className="rating-stars">{"★".repeat(rating.value)}{"☆".repeat(5 - rating.value)}</div>
      </td>
      <td className="rating-table__content">
        {mine && <span className="rating-mine-label">Seu comentário</span>}
        {rating.content}
        {meta && <div className="rating-meta">{meta}</div>}
      </td>
      <td className="rating-table__boost">
        {onBoost ? (
          <button
            className={cx("boost", rating.boosted_by_user && "boost--active")}
            onClick={() => onBoost(rating)}
            aria-pressed={!!rating.boosted_by_user}
            aria-label="Dar boost nesta avaliação"
          >
            {boostContent}
          </button>
        ) : (
          <div className="boost boost--static">{boostContent}</div>
        )}
      </td>
    </tr>
  );
}
