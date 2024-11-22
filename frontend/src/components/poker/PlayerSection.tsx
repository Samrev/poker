import React, { useMemo } from "react";
import CardDisplay from "./CardDisplay";
import { getTitle } from "../../utils/cardUtils";
import { PlayerGameData } from "../../types";

interface PlayerSectionProps {
  playerData: PlayerGameData;
  guestId: string;
}

const PlayerSection: React.FC<PlayerSectionProps> = ({
  playerData,
  guestId,
}) => {
  const title = useMemo(() => getTitle(playerData), [playerData]);
  return (
    <div className="player-section">
      <div className="player-cards">
        <div className="player-cards-block">
          <h4>Your Cards</h4>
          <div className="player-hand">
            <CardDisplay card={playerData.playerCards[0]} />
            <CardDisplay card={playerData.playerCards[1]} />
          </div>
        </div>
      </div>
      <div className="player-title">
        <h3>
          {title}-{guestId}
        </h3>
      </div>
    </div>
  );
};

export default PlayerSection;
