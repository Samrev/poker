import React from "react";
import { CardDisplayProps } from "../../types";
import "../../styles/CardDisplay.css";
const CardDisplay: React.FC<CardDisplayProps> = ({ card }) => {
  return (
    <div className="card block">
      <img
        src={`/images/cards/${card}.png`}
        alt={card}
        className="card-image"
      />
    </div>
  );
};

export default CardDisplay;
