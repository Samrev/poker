import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../styles/Poker.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PlayersBalancesModal from "./PlayersBalancesModal";
import CardDisplay from "./CardDisplay";
import { startGame } from "../../api/game";
import PlayerRole from "../../strings";
const Poker: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const guestId = searchParams.get("guestId");
  useEffect(() => {
    if (!guestId) {
      navigate("/");
    }
  }, [guestId, navigate]);

  const [potBalance, setPotBalance] = useState<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [showBalancesModal, setShowBalancesModal] = useState<boolean>(false);
  const [playersBalances, setplayersBalances] = useState(new Map());
  const [pokerCards, setPokerCards] = useState<string[]>([]);
  const [playerCards, setPlayerCards] = useState<string[]>([]);
  const [isActionButtonsEnabled, setIsActionButtonsEnabled] =
    useState<boolean>(false);
  const [roundCount, setRoundCount] = useState<number>(0);
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [isDealer, setIsDealer] = useState<boolean>(false);
  const [isBigBlind, setIsBigBlind] = useState<boolean>(false);
  const [isSmallBlind, setIsSmallBlind] = useState<boolean>(false);
  const getTitle = useMemo(() => {
    return isDealer
      ? PlayerRole.dealer
      : isSmallBlind
        ? PlayerRole.smallBlind
        : isBigBlind
          ? PlayerRole.bigBlind
          : PlayerRole.player;
  }, [isDealer, isSmallBlind, isBigBlind]);

  const fetchGameData = useCallback(async () => {
    try {
      const gameData = await startGame(roomId);
      console.log(gameData);
      setPotBalance(gameData.potBalance);
      setCurrentPlayer(gameData.playerTurn);
      setplayersBalances(gameData.playersBalances);
      setPokerCards(gameData.pokerCards);
      setCurrentBid(gameData.currentBid);
      setIsDealer(gameData.currentDealer === guestId);
      setIsBigBlind(gameData.currentBigBlind === guestId);
      setIsSmallBlind(gameData.currentSmallBlind === guestId);
      if (guestId !== null) {
        setPlayerCards(gameData.playerCards[guestId]);
      }
      setIsActionButtonsEnabled(gameData.playerTurn === guestId);
    } catch (error) {
      console.error("Error fetching game data:", error);
    }
  }, [roomId, guestId]);

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
  const mainDeck = "card back black";
  const hiddenPokerCards = "card back orange";
  const isCardShown = (cardIndex: number) => {
    return (
      cardIndex < 3 ||
      (cardIndex === 3 && roundCount >= 1) ||
      (cardIndex === 4 && roundCount >= 2)
    );
  };

  return (
    <div className="poker-container">
      <div className="pot-bid-container">
        <h2 className="pot-balance">Pot Balance: ${potBalance}</h2>
        <h2 className="current-bid">Current Bid: ${currentBid}</h2>
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
            {pokerCards.map((card, index) => (
              <CardDisplay
                key={index}
                card={isCardShown(index) ? card : hiddenPokerCards}
              />
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
              <CardDisplay card={playerCards[0]} />
              <CardDisplay card={playerCards[1]} />
            </div>
          </div>
        </div>
        <div className="player-title">
          <h3>{getTitle}</h3>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="action-button check"
          onClick={handleCheck}
          disabled={!isActionButtonsEnabled}
        >
          Check
        </button>
        <button
          className="action-button fold"
          onClick={handleFold}
          disabled={!isActionButtonsEnabled}
        >
          Fold
        </button>
        <button
          className="action-button raise"
          onClick={handleRaise}
          disabled={!isActionButtonsEnabled}
        >
          Raise
        </button>
      </div>

      <div className="balance-container">
        <button className="show-balances-button" onClick={handleShowBalances}>
          Show Player Balances
        </button>

        {showBalancesModal && (
          <PlayersBalancesModal
            playersBalances={playersBalances}
            handleCloseButton={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default Poker;
