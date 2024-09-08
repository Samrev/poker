import React from 'react';
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import { createGuest } from '../api/players';

// Functional component with React.FC type
const Home: React.FC = () => {
  const navigate = useNavigate();
  const handlePlayAsGuest = async () => {
    const guestId = await createGuest();
    if (guestId) {
      navigate(`/guest/${guestId}`);
    } else {
      console.error('Failed to create guest');
    }
  };
  return (
    <div className="home-container">
      <h1>Poker Game</h1>
      <button onClick={handlePlayAsGuest}>Play as Guest</button>
    </div>
  );
};

export default Home;
