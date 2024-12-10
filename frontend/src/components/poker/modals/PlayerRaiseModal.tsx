import React, { useState } from "react";
import { PlayerGameData } from "../../../types";
import "../../../styles/PlayerRaiseModal.css";
interface PlayerRaiseModalProps {
  playerData: PlayerGameData;
  guestId: string;
  handleCloseRaiseModal: () => void;
  handleRaise: (raiseAmount: number) => void;
}
const PlayerRaiseModal: React.FC<PlayerRaiseModalProps> = ({
  playerData,
  guestId,
  handleCloseRaiseModal,
  handleRaise,
}) => {
  const maxRaiseAmount = Number(playerData.playersBalances[guestId]);
  const minRaiseAmount = Number(playerData.currentBid + 5);
  const [raiseAmount, setRaiseAmount] = useState(minRaiseAmount);

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Raise Your Bid</h3>
        <p>Select your raise amount:</p>
        <input
          type="range"
          min={minRaiseAmount}
          max={maxRaiseAmount}
          step="5"
          value={raiseAmount}
          onChange={(e) => setRaiseAmount(Number(e.target.value))}
          className="raise-slider"
        />
        <p>
          Selected Amount: <strong>${raiseAmount}</strong>
        </p>
        <div className="modal-actions">
          <button onClick={() => handleRaise(raiseAmount)}>Submit</button>
          <button onClick={() => handleCloseRaiseModal()}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
export default PlayerRaiseModal;
