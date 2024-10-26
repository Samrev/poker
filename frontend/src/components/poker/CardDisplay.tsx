import React from "react";
import { CardDisplayProps } from "../../types";
import "../../styles/CardDisplay.css";
const PATH = `/images/cards/`;
const CardDisplay: React.FC<CardDisplayProps> = ({ card }) => {
  return (
    <div className="card block">
      <img src={`${PATH}${card}.png`} alt={card} className="card-image" />
    </div>
  );
};

export default CardDisplay;
