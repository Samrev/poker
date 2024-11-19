import React from "react";
import "../../../styles/PlayersBalancesModal.css";
import { PlayersBalancesModalProps } from "../../../types";

const PlayersBalancesModal: React.FC<PlayersBalancesModalProps> = ({
  playersBalances,
  handleCloseButton,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Player Balances</h2>
        <table className="player-balances-table">
          <thead>
            <tr>
              <th>Player Id</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(playersBalances).map(([name, balance]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>${balance}</td>
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

export default PlayersBalancesModal;
