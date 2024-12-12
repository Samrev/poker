import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/Room.css";
import {
  FaCheckCircle,
  FaPlay,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import { leaveRoom, toggleReadyPlayer } from "../../api/players";
import { startGame } from "../../api/game";
import { socketRoom } from "../../utils/socketInstance";
import { useRoom } from "../../hooks/useRoom";

const Room: React.FC = () => {
  const location = useLocation();
  const { roomId, guestId } = location.state || {};
  const navigate = useNavigate();

  useEffect(() => {
    if (!guestId || !roomId) {
      navigate("/");
    }
    socketRoom.emit("joinRoom", { roomId, guestId });
  }, [guestId, roomId, navigate]);

  const { roomData, refetch } = useRoom(roomId);
  const players = roomData?.players;
  const maxNumberOfPlayers = roomData?.maxNumberOfPlayers;
  const [isStartButtonEnabled, setStartButtonEnabled] = useState(false);

  useEffect(() => {
    const allPlayersIn = players?.length === maxNumberOfPlayers;
    const allPlayersReady = (players || []).every((player) => player.isPlaying);
    setStartButtonEnabled(allPlayersReady && allPlayersIn);
  }, [maxNumberOfPlayers, players]);

  const handlePlayerReady = async () => {
    try {
      await toggleReadyPlayer(guestId);
      socketRoom.emit("toogleReadinessStatus", { roomId, guestId });
    } catch (error) {
      console.error("Failed to toggle player readiness", error);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(roomId, guestId);
      socketRoom.emit("leaveRoom", { roomId, guestId });
      navigate("/");
    } catch (error) {
      console.error("Failed to leave room", error);
    }
  };
  const isHost = players
    ? players.length > 0 && players[0].guestId === guestId
    : false;

  const handleStartGame = async () => {
    await startGame(roomId);
    socketRoom.emit("startGame", { roomId });
    navigate("/poker", { state: { roomId, guestId, isHost } });
  };

  useEffect(() => {
    socketRoom.on("roomStatusChanged", refetch);
    socketRoom.on("gameStarted", () => {
      socketRoom.disconnect();
      navigate("/poker", { state: { roomId, guestId } });
    });

    return () => {
      socketRoom.off("roomStatusChanged");
      socketRoom.off("gameStarted");
    };
  }, [roomId, guestId, navigate, refetch]);

  const playerBlocks = Array.from(
    { length: roomData?.maxNumberOfPlayers || 0 },
    (_, index) => {
      const player = roomData?.players[index];
      return (
        <div
          key={index}
          className={`player-card ${player?.guestId === guestId ? "highlight" : ""}`}
        >
          <FaUserCircle
            size={40}
            color="#3498db"
            style={{ marginBottom: "10px" }}
          />
          <h3>{player ? player.guestId : "Waiting for player..."}</h3>
          {player && player.guestId === guestId ? (
            <button className="action-button" onClick={handlePlayerReady}>
              <FaCheckCircle style={{ marginRight: "8px" }} />
              {player.isPlaying ? "Wait" : "Ready"}
            </button>
          ) : (
            <p className="waiting-message">
              {player && player.isPlaying ? "Ready!" : "Waiting..."}
            </p>
          )}
        </div>
      );
    }
  );

  return (
    <div className="room-container">
      <h2>Room ID: {roomId}</h2>
      <button className="leave-room-button" onClick={handleLeaveRoom}>
        <FaSignOutAlt style={{ marginRight: "8px" }} />
        Leave Room
      </button>

      <div className="player-cards">{playerBlocks}</div>

      {isHost && (
        <button
          className={`start-game-button ${isStartButtonEnabled ? "active" : "disabled"}`}
          onClick={handleStartGame}
          disabled={!isStartButtonEnabled}
        >
          <FaPlay style={{ marginRight: "8px" }} />
          Start Game
        </button>
      )}
    </div>
  );
};

export default Room;
