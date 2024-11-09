import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Game.css";
import EnterRoomModal from "./room/EnterRoomModal"; // Import the new component
import CreateRoomModal from "./room/CreateRoomModal";
const Game: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { guestId } = location.state || {};

  useEffect(() => {
    if (!guestId) {
      navigate("/");
    }
  }, [guestId, navigate]);

  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] =
    useState<boolean>(false);
  const [isEnterRoomModalOpen, setIsEnterRoomModalOpen] =
    useState<boolean>(false);

  const handleCreateRoom = () => setIsCreateRoomModalOpen(true);
  const handleEnterRoom = () => setIsEnterRoomModalOpen(true);

  return (
    <div className="game-container">
      <h2>Welcome, Guest {guestId}</h2>
      <div className="game-controls">
        <button onClick={handleCreateRoom}>Create Room</button>
        <button onClick={handleEnterRoom}>Enter Room</button>
      </div>

      {isCreateRoomModalOpen && (
        <CreateRoomModal
          handleCancelCreateRoom={() => setIsCreateRoomModalOpen(false)}
          guestId={guestId}
        />
      )}

      {isEnterRoomModalOpen && (
        <EnterRoomModal
          handleCancelEnterRoom={() => setIsEnterRoomModalOpen(false)}
          guestId={guestId}
        />
      )}
    </div>
  );
};

export default Game;
