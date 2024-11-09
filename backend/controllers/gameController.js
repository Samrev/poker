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
  const { roomId } = req.body;
  const shuffledDeck = shuffle(deck);
  try {
    const room = await Room.findOne({ roomId: roomId }).populate("players");
    const players = room.players.map((player) => player.guestId);

    let playersBalances = {};
    let playersCards = {};
    let playersStatus = {};
    let playersBids = {};
    let cardIndex = 0;
    for (let playerId of players) {
      playersCards[playerId] = [
        shuffledDeck[cardIndex++],
        shuffledDeck[cardIndex++],
      ];
      playersStatus[playerId] = true;
      playersBalances[playerId] = 500;
      playersBids[playerId] = 0;
    }

    let pokerCards = [];
    for (let i = 0; i < 5; i++) {
      pokerCards.push(shuffledDeck[cardIndex++]);
    }

    const game = new Game({
      roomId: roomId,
      playersCards: playersCards,
      pokerCards: pokerCards,
      playersBalances: playersBalances,
      playersBids: playersBids,
      playerTurn: players[1],
      currentDealer: players[0],
      currentSmallBlind: players[1],
      currentBigBlind: players[2],
      playersStatus: playersStatus,
    });

    await game.save();
    res.status(200).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating a game" });
  }
};

export const getGame = async (req, res) => {
  const { roomId, guestId } = req.query;
  try {
    const game = await Game.findOne({ roomId: roomId });
    const playerGame = {
      potBalance: game.potBalance,
      currentBid: game.currentBid,
      playerBid: game.playersBids[guestId],
      playerCards: game.playersCards[guestId],
      pokerCards: game.pokerCards,
      playersBalances: game.playersBalances,
      isPlayerTurn: game.playerTurn === guestId,
      isDealer: game.currentDealer === guestId,
      isSmallBlind: game.currentSmallBlind === guestId,
      isBigBlind: game.currentBigBlind === guestId,
      playerStatus: game.playersStatus[guestId],
    };

    res.status(200).json(playerGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching a game" });
  }
};
