import React, { useEffect, useState } from "react";
import "../../styles/Poker.css";
import { useLocation, useNavigate } from "react-router-dom";
import PlayersBalancesModal from "./modals/PlayersBalancesModal";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css";
import { usePoker } from "../../hooks/usePoker";
import PokerTable from "./PokerTable";
import PlayerSection from "./PlayerSection";
import PlayerActions from "./PlayerActions";

const Poker: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId, guestId } = location.state || {};

  useEffect(() => {
    if (!guestId || !roomId) {
      navigate("/");
    }
  }, [guestId, roomId, navigate]);

  const { playerData, error, refetch } = usePoker(roomId, guestId);
  const [showBalancesModal, setShowBalancesModal] = useState<boolean>(false);

  console.log("playerData", playerData);

  if (error) {
    console.error("Error fetching game data:", error);
    return <div>Error loading game data.</div>;
  }

  if (!playerData) {
    return <div>Loading...</div>;
  }

  const handleShowBalances = () => {
    setShowBalancesModal(true);
  };

  const handleCloseModal = () => {
    setShowBalancesModal(false);
  };

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
