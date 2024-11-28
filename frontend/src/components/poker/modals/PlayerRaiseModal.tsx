import React, { useState } from "react";
import { PlayerGameData } from "../../../types";
import { raiseGame } from "../../../api/game";
import { showErrorToast, showSuccessToast } from "../../../utils/toastUtils";
import { socketPoker } from "../../../utils/socketInstance";
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
  const [raiseAmount, setRaiseAmount] = useState(playerData.currentBid + 5);

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Raise Your Bid</h3>
        <p>Select your raise amount:</p>
        <input
          type="range"
          min={playerData.currentBid}
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
          <button onClick={() => handleRaise(5)}>Submit</button>
          <button onClick={() => handleCloseRaiseModal()}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
export default PlayerRaiseModal;
