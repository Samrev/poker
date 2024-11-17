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
    let nextTurn = {};
    let cardIndex = 0;
    let lastPlayer = players[room.numberOfPlayers - 1];
    let contributedPlayersBids = {};
    for (let playerId of players) {
      playersCards[playerId] = [
        shuffledDeck[cardIndex++],
        shuffledDeck[cardIndex++],
      ];
      playersStatus[playerId] = true;
      playersBalances[playerId] = 500;
      playersBids[playerId] = 0;
      contributedPlayersBids[playerId] = 0;
      nextTurn[lastPlayer] = playerId;
      lastPlayer = playerId;
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
      nextTurn: nextTurn,
      lastPlayer: players[0],
      contributedPlayersBids: contributedPlayersBids,
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
      nextTurn: game.nextTurn,
      roundNo: game.roundNo,
      lastPlayer: game.lastPlayer,
      contributedPlayersBids: game.contributedPlayersBids,
    };
    console.log("got the game");
    res.status(200).json(playerGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching a game" });
  }
};

export const checkGame = async (req, res) => {
  try {
    const { roomId } = req.query;
    let { guestId } = req.query;

    const game = await Game.findOneAndUpdate({ roomId: roomId });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    while (!game.playersStatus[game.nextTurn[guestId]]) {
      guestId = game.nextTurn[guestId];
    }

    const nextTurnGuestId = game.nextTurn[guestId];

    const updatedGame = await Game.findOneAndUpdate(
      { roomId: roomId },
      {
        $inc: {
          [`playersBalances.${guestId}`]: -game.currentBid,
          potBalance: game.currentBid,
          roundNo: guestId === game.lastPlayer ? 1 : 0,
          [`contributedPlayersBids.${guestId}`]: game.currentBid,
        },
        $set: {
          playerTurn: nextTurnGuestId,
          [`playersBids.${guestId}`]: game.currentBid,
        },
      },
      { new: true }
    );

    if (!updatedGame) {
      return res.status(500).json({ error: "Failed to update the game state" });
    }

    res.status(200).json({ message: "Check action completed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred during the check action" });
  }
};

export const raiseGame = async (req, res) => {
  try {
    const { roomId, bid } = req.query;
    let { guestId } = req.query;
    const game = await Game.findOneAndUpdate({ roomId: roomId });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    while (!game.playersStatus[game.nextTurn[guestId]]) {
      guestId = game.nextTurn[guestId];
    }

    const nextTurnGuestId = game.nextTurn[guestId];
    await Game.findOneAndUpdate(
      { roomId: roomId },
      {
        $inc: {
          [`playersBalances.${guestId}`]: -bid,
          potBalance: bid,
          [`contributedPlayersBids.${guestId}`]: bid,
        },
        $set: {
          playerTurn: nextTurnGuestId,
          [`playersBids.${guestId}`]: bid,
          lastPlayer: guestId,
        },
      }
    );

    res.status(200).json({ message: "Raise action completed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred during the raise action" });
  }
};

export const foldGame = async (req, res) => {
  try {
    const { roomId } = req.query;
    let { guestId } = req.query;
    const game = await Game.findOneAndUpdate({ roomId: roomId });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    while (!game.playersStatus[game.nextTurn[guestId]]) {
      guestId = game.nextTurn[guestId];
    }

    const nextTurnGuestId = game.nextTurn[guestId];
    await Game.findOneAndUpdate(
      { roomId: roomId },
      {
        $inc: {
          roundNo: guestId === game.lastPlayer ? 1 : 0,
        },
        $set: {
          [`playersStatus.${guestId}`]: false,
          playerTurn: nextTurnGuestId,
        },
      }
    );

    res.status(200).json({ message: "Fold action completed successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred during the fold action" });
  }
};

export const allInGame = async (req, res) => {
  try {
    const { roomId } = req.query;
    let { guestId } = req.query;
    const game = await Game.findOneAndUpdate({ roomId: roomId });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    while (!game.playersStatus[game.nextTurn[guestId]]) {
      guestId = game.nextTurn[guestId];
    }

    const nextTurnGuestId = game.nextTurn[guestId];
    const playerBalance = game.playersBalances[guestId];

    await Game.findOneAndUpdate(
      { roomId: roomId },
      {
        $inc: {
          roundNo: guestId === game.lastPlayer ? 1 : 0,
          [`contributedPlayersBids.${guestId}`]: playerBalance,
        },
        $set: {
          playerTurn: nextTurnGuestId,
          [`playersBalances.${guestId}`]: 0,
        },
      }
    );

    res.status(200).json({ message: "All-in action completed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred during the all-in action" });
  }
};

export const resetGame = async (req, res) => {
  try {
    const { roomId } = req.query;
    const shuffledDeck = shuffle(deck);
    const game = await Game.findOne({ roomId: roomId });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    let cardIndex = 0;
    let playersCards = {};
    let playersStatus = {};
    let playersBids = {};
    let contributedPlayersBids = {};
    const currentDealer = game.nextTurn[game.currentDealer];
    const currentSmallBlind = game.nextTurn[currentDealer];
    const currentBigBlind = game.nextTurn[currentSmallBlind];

    for (let playerId of game.players) {
      playersCards[playerId] = [
        shuffledDeck[cardIndex++],
        shuffledDeck[cardIndex++],
      ];
      playersStatus[playerId] = true;
      playersBids[playerId] = 0;
      contributedPlayersBids[playerId] = 0;
    }

    let pokerCards = [];
    for (let i = 0; i < 5; i++) {
      pokerCards.push(shuffledDeck[cardIndex++]);
    }

    await Game.findOneAndUpdate(
      { roomId: roomId },
      {
        $set: {
          playersCards: playersCards,
          pokerCards: pokerCards,
          currentBid: 0,
          playerTurn: currentSmallBlind,
          playersBids: playersBids,
          contributedPlayersBids: contributedPlayersBids,
          playersStatus: playersStatus,
          currentDealer: currentDealer,
          currentSmallBlind: currentSmallBlind,
          currentBigBlind: currentBigBlind,
          roundNo: 0,
          lastPlayer: currentDealer,
        },
      }
    );

    res.status(200).json({ message: "Game has been reset successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while resetting the game" });
  }
};
