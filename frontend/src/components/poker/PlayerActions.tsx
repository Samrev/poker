import React, { useState, useEffect } from "react";
import { PlayerGameData } from "../../types";
import { allInGame, checkGame, foldGame } from "../../api/game";
import { showErrorToast, showSuccessToast } from "../../utils/toastUtils";
import PlayerRaiseModal from "./modals/PlayerRaiseModal";
import { socketPoker } from "../../utils/socketInstance";

// import "./PlayerActions.css";

interface PlayerActionsProps {
  playerData: PlayerGameData;
  guestId: string;
  roomId: string;
  refetchGameData: () => void;
}

const PlayerActions: React.FC<PlayerActionsProps> = ({
  playerData,
  guestId,
  roomId,
  refetchGameData,
}) => {
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  const hasBalanceToCheck =
    Number(playerData.playersBalances[guestId]) >= playerData.currentBid;
  const hasBalanceToRaise =
    Number(playerData.playersBalances[guestId]) > playerData.currentBid;
  const isNotBlind =
    playerData.roundNo > 0 ||
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

  const handleCloseRaiseModal = () => {
    setIsRaiseModalOpen(false);
  };

  const handelShowRaiseModal = () => {
    setIsRaiseModalOpen(true);
  };
  const handleCheck = async () => {
    try {
      await checkGame(roomId, guestId);
      showSuccessToast("Player checked");
      socketPoker.emit("playerMoved", { roomId });
    } catch (error) {
      showErrorToast("Failed to check the game. Please try again.");
    }
  };

  const handleFold = async () => {
    try {
      await foldGame(roomId, guestId);
      showSuccessToast("Player folded");
      socketPoker.emit("playerMoved", { roomId });
    } catch (error) {
      showErrorToast("Failed to fold the game. Please try again.");
    }
  };

  const handleAllIn = async () => {
    try {
      await allInGame(roomId, guestId);
      showSuccessToast("Player All In");
      socketPoker.emit("playerMoved", { roomId });
    } catch (error) {
      showErrorToast("Failed to all In the game. Please try again.");
    }
  };

  useEffect(() => {
    socketPoker.on("gameUpdated", () => {
      console.log("game updated");
    });
  });

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
        onClick={handelShowRaiseModal}
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
          roomId={roomId}
        />
      )}
    </div>
  );
};

export default PlayerActions;
