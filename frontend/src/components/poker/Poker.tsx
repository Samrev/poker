import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/Poker.css";
import { useLocation, useNavigate } from "react-router-dom";
import PlayersBalancesModal from "./PlayersBalancesModal";
import CardDisplay from "./CardDisplay";
import PlayerRole from "../../strings";
import { toast, ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css";
import { usePoker } from "./hooks/usePoker";
import { allInGame, checkGame, foldGame, raiseGame } from "../../api/game";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_URL);

const Poker: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId, guestId } = location.state || {};

  // Check for guestId and roomId, navigate if undefined
  useEffect(() => {
    if (!guestId || !roomId) {
      navigate("/");
    }
  }, [guestId, roomId, navigate]);

  const { playerData, error, refetch } = usePoker(roomId, guestId);
  const roundCount = useRef(0);
  const [showBalancesModal, setShowBalancesModal] = useState<boolean>(false);
  const getTitle = useMemo(() => {
    return playerData?.isDealer
      ? PlayerRole.dealer
      : playerData?.isSmallBlind
        ? PlayerRole.smallBlind
        : playerData?.isBigBlind
          ? PlayerRole.bigBlind
          : PlayerRole.player;
  }, [playerData]);

  console.log("playerData", playerData);

  if (error) {
    console.error("Error fetching game data:", error);
    return <div>Error loading game data.</div>;
  }

  if (!playerData) {
    return <div>Loading...</div>;
  }

  const hasBalanceToCheck =
    Number(playerData.playersBalances[guestId]) >= playerData.currentBid;
  const hasBalanceToRaise =
    Number(playerData.playersBalances[guestId]) > playerData.currentBid;
  const isNotBlind =
    roundCount.current > 0 ||
    (!playerData.isSmallBlind && !playerData.isBigBlind);

  const isFoldEnabled =
    isNotBlind && playerData.playerStatus && playerData.isPlayerTurn;

  const isCheckEnabled =
    true ||
    (isNotBlind &&
      playerData?.playerStatus &&
      playerData?.isPlayerTurn &&
      hasBalanceToCheck);

  const isRaiseEnabled =
    playerData.isPlayerTurn && playerData.playerStatus && hasBalanceToRaise;

  const isAllInEnabled =
    !hasBalanceToCheck && playerData.isPlayerTurn && playerData.playerStatus;

  const handleShowBalances = () => {
    setShowBalancesModal(true);
  };

  const handleCloseModal = () => {
    setShowBalancesModal(false);
  };

  const handleCheck = async () => {
    try {
      await checkGame(roomId, guestId);
      toast.info("Player checked", {
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
      socket.emit("playerMoved");
    } catch (error) {
      toast.error("Failed to check the game. Please try again.", {
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  const handleFold = async () => {
    try {
      await foldGame(roomId, guestId);
      toast.info("Player folded", {
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
      socket.emit("playerMoved");
    } catch (error) {
      toast.error("Failed to fold the game. Please try again.", {
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  const handleRaise = async () => {
    try {
      await raiseGame(roomId, guestId);
      toast.info("Player raised", {
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
      socket.emit("playerMoved");
    } catch (error) {
      toast.error("Failed to raise the game. Please try again.", {
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };
  const handleAllIn = async () => {
    try {
      await allInGame(roomId, guestId);
      toast.info("Player all In", {
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
      socket.emit("playerMoved");
    } catch (error) {
      toast.error("Failed to all In the game. Please try again.", {
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
    }
  };

  const mainDeck = "card back black";
  const hiddenPokerCards = "card back orange";

  const isCardShown = (cardIndex: number) => {
    return (
      cardIndex < 3 ||
      (cardIndex === 3 && roundCount.current >= 1) ||
      (cardIndex === 4 && roundCount.current >= 2)
    );
  };

  return (
    <div className="poker-container">
      <div className="pot-bid-container">
        <h2 className="pot-balance">Pot Balance: ${playerData.potBalance}</h2>
        <h2 className="current-bid">Current Bid: ${playerData.currentBid}</h2>
      </div>

      <div className="flex-container">
        <div className="poker-table">
          <h3>Deck</h3>
          <div className="community-cards">
            <CardDisplay card={mainDeck} />
          </div>
        </div>

        <div className="poker-table">
          <h3>Poker Cards</h3>
          <div className="community-cards">
            {playerData.pokerCards.map((card: string, index: number) => (
              <CardDisplay
                key={index}
                card={isCardShown(index) ? card : hiddenPokerCards}
              />
            ))}
          </div>
        </div>
      </div>

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
            {getTitle}-{guestId}
          </h3>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="action-button check"
          onClick={handleCheck}
          disabled={!isCheckEnabled}
        >
          Check
        </button>
        <button
          className="action-button fold"
          onClick={handleFold}
          disabled={!isFoldEnabled}
        >
          Fold
        </button>
        <button
          className="action-button raise"
          onClick={handleRaise}
          disabled={!isRaiseEnabled}
        >
          Raise
        </button>
        <button
          className="action-button all-in"
          onClick={handleAllIn}
          disabled={!isAllInEnabled}
        >
          All In
        </button>
      </div>

      <div className="balance-container">
        <button className="show-balances-button" onClick={handleShowBalances}>
          Show Player Balances
        </button>

        {showBalancesModal && (
          <PlayersBalancesModal
            playersBalances={playerData.playersBalances}
            handleCloseButton={handleCloseModal}
          />
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default Poker;
