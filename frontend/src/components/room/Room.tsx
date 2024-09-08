import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getRoom } from '../../api/room';
import '../../styles/Room.css';
import { Player } from '../../types';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();

  // Helper function to extract query parameters
  const getQueryParams = (search: string) => {
    return new URLSearchParams(search);
  };

  // Extract guestId from query parameters
  const queryParams = getQueryParams(location.search);
  const guestId = queryParams.get('guestId');

  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const room = await getRoom(roomId!);
        if (room) {
          setPlayers(room.players || []);
          console.log("room", room);
        }
      } catch (error) {
        console.error('Failed to fetch players', error);
      }
    };

    fetchPlayers();
  }, [roomId]);

  if (!guestId) {
    return <div>Error: Guest ID is missing</div>;
  }

  return (
    <div className="room-container">
      <h2>Room ID: {roomId}</h2>
      <div className="player-cards">
        {players.map((player, index) => (
          <div
            key={index}
            className={`player-card ${player.isPlaying ? 'playing' : ''} ${guestId === player.guestId ? 'highlight' : ''}`}
          >
            <h3>{player.guestId}</h3>
            {guestId === player.guestId ? (
              <button className="action-button">Ready</button> // Show button only if it's the guest's card
            ) : (
              <p>Waiting...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Room;
