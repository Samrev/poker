import React, { useState, useEffect } from "react";
import { PlayerGameData } from "../../types";
import {
  allInGame,
  checkGame,
  foldGame,
  raiseGame,
  resetRound,
} from "../../api/game";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";
import PlayerRaiseModal from "./modals/PlayerRaiseModal";
import { socketPoker } from "../../utils/socketInstance";

interface PlayerActionsProps {
  playerData: PlayerGameData;
  guestId: string;
  roomId: string;
  refetchGameData: () => void;
  handleStartNextRound: () => void;
}
enum GameStatus {
  roundCompletion = "ROUND_COMPLETED",
  gameCompletion = "GAME_COMPLETED",
}

const PlayerActions: React.FC<PlayerActionsProps> = ({
  playerData,
  guestId,
  roomId,
  refetchGameData,
  handleStartNextRound,
}) => {
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  const hasBalanceToCheck =
    Number(playerData.playersBalances[guestId]) >= playerData.currentBid;
  const hasBalanceToRaise =
    Number(playerData.playersBalances[guestId]) > playerData.currentBid;
  const isNotBlind =
    playerData.roundNo > 0 ||
    playerData.currentBid >= 10 ||
    (!playerData.isSmallBlind && !playerData.isBigBlind);

  const isFoldEnabled =
    isNotBlind && playerData.playerStatus && playerData.isPlayerTurn;

  const isCheckEnabled =
    isNotBlind &&
    playerData?.playerStatus &&
    playerData?.isPlayerTurn &&
    hasBalanceToCheck;

  const isRaiseEnabled =
    playerData.isPlayerTurn && playerData.playerStatus && hasBalanceToRaise;

  const isAllInEnabled =
    !hasBalanceToCheck && playerData.isPlayerTurn && playerData.playerStatus;

  const handleCloseRaiseModal = () => {
    setIsRaiseModalOpen(false);
  };

  const handelShowRaiseModal = () => {
    setIsRaiseModalOpen(true);
  };
  const handleCheck = async () => {
    try {
      const res = await checkGame(roomId, guestId);
      showSuccessToast("Player checked");
      if (res.isCompleted === GameStatus.roundCompletion) {
        await resetRound(roomId);
      } else if (res.isCompleted === GameStatus.gameCompletion) {
        handleStartNextRound();
      }
      socketPoker.emit("playerMoved", { guestId, roomId });
    } catch (error) {
      showErrorToast("Failed to check the game. Please try again.");
    }
  };

  const handleFold = async () => {
    try {
      const res = await foldGame(roomId, guestId);
      showSuccessToast("Player folded");
      if (res.isCompleted) {
        await resetRound(roomId);
      } else if (res.isCompleted === GameStatus.gameCompletion) {
        handleStartNextRound();
      }
      socketPoker.emit("playerMoved", { guestId, roomId });
    } catch (error) {
      showErrorToast("Failed to fold the game. Please try again.");
    }
  };

  const handleAllIn = async () => {
    try {
      const res = await allInGame(roomId, guestId);
      showSuccessToast("Player All In");
      if (res.isCompleted) {
        await resetRound(roomId);
      } else if (res.isCompleted === GameStatus.gameCompletion) {
        handleStartNextRound();
      }
      socketPoker.emit("playerMoved", { guestId, roomId });
    } catch (error) {
      showErrorToast("Failed to all In the game. Please try again.");
    }
  };
  const handleRaise = async (raiseAmount: number) => {
    try {
      await raiseGame(roomId, guestId, raiseAmount);
      showSuccessToast(`Player raised $${raiseAmount}`);
      socketPoker.emit("playerMoved", { roomId, guestId });
      handleCloseRaiseModal();
    } catch (error) {
      showErrorToast("Failed to raise the game. Please try again.");
    }
  };

  useEffect(() => {
    const handlePokerStatusChange = () => {
      refetchGameData();
    };
    socketPoker.on("pokerStatusChanged", handlePokerStatusChange);
    return () => {
      socketPoker.off("pokerStatusChanged");
    };
  }, [refetchGameData]);

  return (
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
        onClick={
          isNotBlind
            ? handelShowRaiseModal
            : playerData.isSmallBlind
              ? () => handleRaise(5)
              : () => handleRaise(10)
        }
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

      {isRaiseModalOpen && (
        <PlayerRaiseModal
          playerData={playerData}
          guestId={guestId}
          handleCloseRaiseModal={handleCloseRaiseModal}
          handleRaise={handleRaise}
        />
      )}
    </div>
  );
};

export default PlayerActions;
