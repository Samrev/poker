import React, { useCallback, useEffect, useState } from "react";
import "../../styles/Poker.css";
import { useLocation, useParams } from "react-router-dom";
import PlayerBalancesModal from "./PlayerBalancesModal";
import CardDisplay from "./CardDisplay";
import { startGame } from "../../api/game";
const Poker: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const guestId = searchParams.get("guestId");

  const [potBalance, setPotBalance] = useState<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [showBalancesModal, setShowBalancesModal] = useState<boolean>(false);
  const [playersBalance, setplayersBalance] = useState<any>([]);

  const fetchGameData = useCallback(async () => {
    try {
      const gameData = await startGame(roomId);
      setPotBalance(gameData.potBalance);
      setCurrentPlayer(gameData.playerturn);
      console.log("gameData", gameData);
    } catch (error) {
      console.error("Error fetching game data:", error);
    }
  }, [roomId]);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  const handleShowBalances = () => {
    setShowBalancesModal(true);
  };

  const handleCloseModal = () => {
    setShowBalancesModal(false);
  };

  const handleCheck = () => {
    console.log("Player checked");
  };

  const handleFold = () => {
    console.log("Player folded");
  };

  const handleRaise = () => {
    console.log("Player raised");

    setPotBalance((prev) => prev + 100);
  };

  const pokerCards = [
    "king_of_clubs",
    "king_of_diamonds",
    "king_of_hearts",
    "king_of_spades",
    "ace_of_clubs",
  ];

  return (
    <div className="poker-container">
      <h2 className="pot-balance">Pot Balance: ${potBalance}</h2>

      <div className="flex-container">
        <div className="deck">
          <div className="card back">Deck</div>
        </div>

        <div className="poker-table">
          <h3>Poker Cards</h3>
          <div className="community-cards">
            {pokerCards.map((card, index) => (
              <CardDisplay key={index} card={card} />
            ))}
          </div>
        </div>
      </div>

      <div className="player-info">
        <h3>Player {currentPlayer}'s Turn</h3>
      </div>

      <div className="player-section">
        <div className="player-cards">
          <div className="player-cards-block">
            <h4>Your Cards</h4>
            <div className="player-hand">
              <div className="card">A♦</div> {/* Example card */}
              <div className="card">K♠</div> {/* Example card */}
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="action-button check" onClick={handleCheck}>
          Check
        </button>
        <button className="action-button fold" onClick={handleFold}>
          Fold
        </button>
        <button className="action-button raise" onClick={handleRaise}>
          Raise
        </button>
      </div>

      <div className="balance-container">
        <button className="show-balances-button" onClick={handleShowBalances}>
          Show Player Balances
        </button>

        {showBalancesModal && (
          <PlayerBalancesModal
            playerBalances={playersBalance}
            handleCloseButton={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default Poker;
