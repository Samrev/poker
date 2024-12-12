import React from "react";
import "../../../styles/PlayersWinningModal.css";
import { WinningData } from "../../../types";

interface PlayersWinningModalProps {
  winningData: WinningData;
  handleCloseWinnersModal: () => void;
}

const PlayersWinningModal: React.FC<PlayersWinningModalProps> = ({
  winningData,
  handleCloseWinnersModal,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={handleCloseWinnersModal}>
          &times;
        </button>
        <h3>Winners</h3>
        <p>
          <strong>It's a</strong> {winningData.bestHand}
        </p>
        <p>
          <strong>Winners:</strong> {winningData.winners.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default PlayersWinningModal;
