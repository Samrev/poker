import React from "react";
import "../../styles/PlayerBalancesModal.css";
import { PlayerBalancesModalProps } from "../../types";

const PlayerBalancesModal: React.FC<PlayerBalancesModalProps> = ({
  playerBalances,
  handleCloseButton,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Player Balances</h2>
        <table className="player-balances-table">
          <thead>
            <tr>
              <th>Player ID</th>
              <th>Name</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {playerBalances.map((player, index) => (
              <tr key={index}>
                <td>{index}</td>
                <td>{player.name}</td>
                <td>${player.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="close-button" onClick={handleCloseButton}>
          Close
        </button>
      </div>
    </div>
  );
};

export default PlayerBalancesModal;
