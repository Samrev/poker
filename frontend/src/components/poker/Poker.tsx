import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../styles/Poker.css";
import { useLocation, useNavigate } from "react-router-dom";
import PlayersBalancesModal from "./modals/PlayersBalancesModal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePoker } from "../../hooks/usePoker";
import PokerTable from "./PokerTable";
import PlayerSection from "./PlayerSection";
import PlayerActions from "./PlayerActions";
import { socketPoker } from "../../utils/socketInstance";
import { getWinners, resetGame } from "../../api/game";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";
import { WinningData } from "../../types";
import PlayersWinningModal from "./modals/PlayersWinningModal";

const Poker: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId, guestId } = location.state || {};

  useEffect(() => {
    if (!guestId || !roomId) {
      navigate("/");
    }
    socketPoker.emit("joinPoker", { roomId, guestId });
  }, [guestId, roomId, navigate]);

  const { playerData, error, refetch } = usePoker(roomId, guestId);
  const [showBalancesModal, setShowBalancesModal] = useState<boolean>(false);
  const [isNextRoundEnabled, setIsNextRoundEnabled] = useState<boolean>(false);
  const [showWinnersModal, setShowWinnersModal] = useState<boolean>(false);
  const winningData = useRef<WinningData | undefined>();

  const handleStartNextRound = useCallback(async () => {
    try {
      const fetchedWinners = await getWinners(roomId);
      winningData.current = fetchedWinners;
      setIsNextRoundEnabled(true);
      setShowWinnersModal(true);
      console.log("Winners of the round:", winningData.current);
    } catch (error) {
      console.error("Failed to fetch winners:", error);
    }
  }, [roomId]);

  const handleShowBalances = () => {
    setShowBalancesModal(true);
  };

  const handleCloseModal = () => {
    setShowBalancesModal(false);
  };

  const handleCloseWinnersModal = () => {
    setShowWinnersModal(false);
  };

  const handleNextRound = async () => {
    try {
      await resetGame(roomId);
      showSuccessToast("Next round started successfully!");
      socketPoker.emit("nextRound", { roomId });
    } catch (error) {
      showErrorToast("Failed to start the next round. Please try again.");
    }
  };

  useEffect(() => {
    socketPoker.on("enabledNextRound", handleStartNextRound);
    return () => {
      socketPoker.off("enabledNextRound");
    };
  }, [handleStartNextRound]);

  if (error) {
    console.error("Error fetching game data:", error);
    return <div>Error loading game data.</div>;
  }

  if (!playerData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="poker-container">
      <div className="pot-bid-container">
        <h2 className="pot-balance">Pot Balance: ${playerData.potBalance}</h2>
        <h2 className="current-bid">Current Bid: ${playerData.currentBid}</h2>
      </div>

      <PokerTable playerData={playerData} />
      <PlayerSection playerData={playerData} guestId={guestId} />

      <PlayerActions
        playerData={playerData}
        guestId={guestId}
        roomId={roomId}
        refetchGameData={refetch}
      />

      {playerData.isSmallBlind && (
        <div className="action-buttons-container">
          <button
            className="next-round-button"
            onClick={handleNextRound}
            disabled={!isNextRoundEnabled}
          >
            Next Round
          </button>
        </div>
      )}
      {showWinnersModal && winningData.current && (
        <PlayersWinningModal
          winningData={winningData.current}
          handleCloseWinnersModal={handleCloseWinnersModal}
        />
      )}

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
