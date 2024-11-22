import React, { useState } from "react";
import { PlayerGameData } from "../../../types";
import { raiseGame } from "../../../api/game";
import { showErrorToast, showSuccessToast } from "../../../utils/toastUtils";
import socket from "../../../utils/socketInstance";
interface PlayerRaiseModalProps {
  playerData: PlayerGameData;
  guestId: string;
  handleCloseRaiseModal: () => void;
  roomId: string;
}
const PlayerRaiseModal: React.FC<PlayerRaiseModalProps> = ({
  playerData,
  guestId,
  handleCloseRaiseModal,
  roomId,
}) => {
  const maxRaiseAmount = Number(playerData.playersBalances[guestId]);
  const [raiseAmount, setRaiseAmount] = useState(playerData.currentBid + 5);
  const handleRaise = async () => {
    try {
      await raiseGame(roomId, guestId, raiseAmount);
      showSuccessToast(`Player raised $${raiseAmount}`);
      socket.emit("playerMoved", { roomId });
      handleCloseRaiseModal();
    } catch (error) {
      showErrorToast("Failed to raise the game. Please try again.");
    }
  };
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Raise Your Bid</h3>
        <p>Select your raise amount:</p>
        <input
          type="range"
          min="5"
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
          <button onClick={handleRaise}>Submit</button>
          <button onClick={() => handleCloseRaiseModal()}>Cancel</button>
        </div>
      </div>
    </div>
  );
};
export default PlayerRaiseModal;
