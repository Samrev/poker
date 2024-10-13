//TODO: Make a Leave room functionality

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getRoom } from "../../api/room";
import "../../styles/Room.css";
import { Player } from "../../types";
import { FaCheckCircle, FaSignOutAlt, FaUserCircle } from "react-icons/fa"; // Icons
import { leaveRoom, toggleReadyPlayer } from "../../api/players";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_BASE_URL);
const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Ensure roomId exists
  if (!roomId) {
    throw new Error("Room ID is missing");
  }

  // Extract guestId from query parameters
  const queryParams = new URLSearchParams(location.search);
  const guestId = queryParams.get("guestId");

  socket.emit("RoomId", roomId);

  useEffect(() => {
    if (!guestId || !roomId) {
      navigate("/");
    }
    console.log("useEffect called");
    socket.emit("joinRoom", { roomId, guestId });
  }, [guestId, roomId, navigate]);

  const [players, setPlayers] = useState<Player[]>([]);

  // Fetch players function, memoized to avoid unnecessary re-renders
  const fetchPlayers = useCallback(async () => {
    try {
      const room = await getRoom(roomId);
      if (room) {
        setPlayers(room.players || []);
        console.log("Player Set");
      }
      console.log("fetched players");
    } catch (error) {
      console.error("Failed to fetch players", error);
    }
  }, [roomId]);

  // Toggle player readiness
  const handlePlayerReady = async () => {
    try {
      await toggleReadyPlayer(guestId);
      console.log("Player readiness toggling");
      socket.emit("toogleReadinessStatus", { roomId, guestId });
    } catch (error) {
      console.error("Failed to toggle player readiness", error);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom(roomId, guestId);
      console.log("Player leaving the room");
      socket.emit("leaveRoom", { roomId, guestId });
      navigate("/"); // Navigate back to the home page or a lobby after leaving
    } catch (error) {
      console.error("Failed to leave room", error);
    }
  };

  useEffect(() => {
    fetchPlayers();

    socket.on("readyStatusChanged", (data) => {
      console.log(`${data.guestId} toggled readiness`);
      fetchPlayers();
    });

    socket.on("playerJoined", (data) => {
      console.log(`${data.guestId} joined the room`);
      fetchPlayers();
    });

    socket.on("playerLeft", (data) => {
      console.log(`${data.guestId} left the room`);
      fetchPlayers();
    });

    return () => {
      socket.off("readyStatusChanged");
      socket.off("playerJoined");
      socket.off("playerLeft");
    };
  }, [fetchPlayers]);

  return (
    <div className="room-container">
      <h2>Room ID: {roomId}</h2>
      <button className="leave-room-button" onClick={handleLeaveRoom}>
        <FaSignOutAlt style={{ marginRight: "8px" }} />
        Leave Room
      </button>
      <div className="player-cards">
        {players.map((player, index) => (
          <div
            key={index}
            className={`player-card ${guestId === player.guestId ? "highlight" : ""}`}
          >
            <FaUserCircle
              size={40}
              color="#3498db"
              style={{ marginBottom: "10px" }}
            />
            <h3>{player.guestId}</h3>
            {guestId === player.guestId ? (
              <button className="action-button" onClick={handlePlayerReady}>
                <FaCheckCircle style={{ marginRight: "8px" }} />
                {player.isPlaying ? "Wait" : "Ready"}
              </button>
            ) : (
              <p className="waiting-message">
                {player.isPlaying ? "Ready!" : "Waiting..."}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;
