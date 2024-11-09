import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRoom } from "../../api/room";
import "../../styles/Room.css";
import { Player } from "../../types";
import {
  FaCheckCircle,
  FaPlay,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import { leaveRoom, toggleReadyPlayer } from "../../api/players";
import { io } from "socket.io-client";
import { startGame } from "../../api/game";

const socket = io(process.env.REACT_APP_API_URL);

const Room: React.FC = () => {
  const location = useLocation();
  const { roomId, guestId } = location.state || {};
  console.log(roomId, guestId);
  const navigate = useNavigate();

  useEffect(() => {
    if (!guestId || !roomId) {
      navigate("/");
    }
    socket.emit("joinRoom", { roomId, guestId });
  }, [guestId, roomId, navigate]);

  const [players, setPlayers] = useState<Player[]>([]);
  const [maxNumberOfPlayers, setMaxNumberOfPlayers] = useState<number>(0);
  const [isStartButtonEnabled, setStartButtonEnabled] = useState(false);

  const checkIfReadyToStart = (
    players: Player[],
    maxNumberOfPlayers: number
  ) => {
    const allPlayersIn = players.length === maxNumberOfPlayers;
    const allPlayersReady = players.every((player) => player.isPlaying);
    setStartButtonEnabled(allPlayersReady && allPlayersIn);
  };

  // Fetch room details and players
  const fetchRoomData = useCallback(async () => {
    try {
      const room = await getRoom(roomId);
      if (room) {
        setPlayers(room.players || []);
        setMaxNumberOfPlayers(room.maxNumberOfPlayers || 0); // Set max players
        checkIfReadyToStart(room.players || [], room.maxNumberOfPlayers);
      }
    } catch (error) {
      console.error("Failed to fetch room data", error);
    }
  }, [roomId]);

  const handlePlayerReady = async () => {
    try {
      await toggleReadyPlayer(guestId);
      socket.emit("toogleReadinessStatus", { roomId, guestId });
    } catch (error) {
      console.error("Failed to toggle player readiness", error);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(roomId, guestId);
      socket.emit("leaveRoom", { roomId, guestId });
      navigate("/");
    } catch (error) {
      console.error("Failed to leave room", error);
    }
  };

  const handleStartGame = async () => {
    await startGame(roomId);
    socket.emit("startGame", { roomId });
    navigate("/poker", { state: { roomId, guestId } });
  };

  useEffect(() => {
    fetchRoomData();

    socket.on("readyStatusChanged", fetchRoomData);
    socket.on("playerJoined", fetchRoomData);
    socket.on("playerLeft", fetchRoomData);
    socket.on("gameStarted", () => {
      navigate("/poker", { state: { roomId, guestId } });
    });

    return () => {
      socket.off("readyStatusChanged");
      socket.off("playerJoined");
      socket.off("playerLeft");
    };
  }, [fetchRoomData, roomId, guestId, navigate]);

  const isHost = players.length > 0 && players[0].guestId === guestId;

  // Create an array for the player blocks (fixed size based on maxNumberOfPlayers)
  const playerBlocks = Array.from(
    { length: maxNumberOfPlayers },
    (_, index) => {
      const player = players[index];
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
