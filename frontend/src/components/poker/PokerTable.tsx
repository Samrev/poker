import React from "react";
import CardDisplay from "./CardDisplay";
import { Deck } from "../../strings";
import { PlayerGameData } from "../../types";

interface PokerTableProps {
  playerData: PlayerGameData;
}
const PokerTable: React.FC<PokerTableProps> = ({ playerData }) => {
  const isCardShown = (cardIndex: number) => {
    return (
      cardIndex < 3 ||
      (cardIndex === 3 && playerData.roundNo >= 1) ||
      (cardIndex === 4 && playerData.roundNo >= 2)
    );
  };
  return (
    <div className="flex-container">
      <div className="poker-table">
        <h3>Deck</h3>
        <div className="community-cards">
          <CardDisplay card={Deck.mainDeck} />
        </div>
      </div>

      <div className="poker-table">
        <h3>Poker Cards</h3>
        <div className="community-cards">
          {playerData.pokerCards.map((card: string, index: number) => (
            <CardDisplay
              key={index}
              card={isCardShown(index) ? card : Deck.hiddenPokerCards}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokerTable;
