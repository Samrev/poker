import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Game from "./components/Game";
import Room from "./components/room/Room";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guest/:guestId" element={<Game />} />
        <Route path="/room/:roomId" element={<Room />} /> 
      </Routes>
    </Router>
  );
}

export default App;
