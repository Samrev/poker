import Game from "../models/game.js";
import Room from "../models/room.js";
import Player from "../models/player.js";
import deck from "../vars/deck";

const shuffle = (array) => {
  return array
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
};

export const startGame = async (req, res) => {
  const { roomId } = req.params;
  const shuffledDeck = shuffle(deck);
  try {
    const Oldgame = await Game.findOne({ roomId: roomId });
    if (Oldgame) {
      return res.status(200).json(Oldgame);
    }
    const room = await Room.findOne({ roomId: roomId }).populate("players");
    const players = room.players.map((player) => player.guestId);
    const playersBalances = players.reduce((acc, guestId) => {
      acc[guestId] = 500;
      return acc;
    }, {});
    let playerCards = new Map();
    let cardIndex = 0;
    for (let playerId of players) {
      playerCards.set(playerId, [
        shuffledDeck[cardIndex++],
        shuffledDeck[cardIndex++],
      ]);
    }

    let pokerCards = [];
    for (let i = 0; i < 5; i++) {
      pokerCards.push(shuffledDeck[cardIndex++]);
    }

    const game = new Game({
      roomId: roomId,
      playerCards: playerCards,
      pokerCards: pokerCards,
      playersBalances: playersBalances,
      playerTurn: players[0],
      currentDealer: players[0],
      currentSmallBlind: players[1],
      currentBigBlind: players[2],
    });

    await game.save();
    res.status(200).json(game);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Error creating a game" });
  }
};
