import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Game from "./components/Game";
import Room from "./components/room/Room";
import Poker from "./components/poker/Poker";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/guest/" element={<Game />} />
        <Route path="/room/" element={<Room />} />
        <Route path="/poker/" element={<Poker />} />
      </Routes>
    </Router>
  );
};

export default App;
