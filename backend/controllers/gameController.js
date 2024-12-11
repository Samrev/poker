import Game from "../models/game.js";
import Room from "../models/room.js";
import { pokerWinner } from "../services/poker.js";
import { gameStatus, deck } from "../vars/globals";

const shuffle = (array) => {
  return array
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
};

const findNextPlayer = (playersStatus, nextTurn, guestId) => {
  while (!playersStatus[nextTurn[guestId]]) {
    guestId = nextTurn[guestId];
  }
  return nextTurn[guestId];
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
    let firstPlayer = players[room.numberOfPlayers - 1];
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
      nextTurn[firstPlayer] = playerId;
      firstPlayer = playerId;
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
      firstPlayer: players[1],
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
      firstPlayer: game.firstPlayer,
      contributedPlayersBids: game.contributedPlayersBids,
    };
    console.log(`got the game in ${roomId}`);
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
    const game = await Game.findOne({ roomId: roomId });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const nextTurnGuestId = findNextPlayer(
      game.playersStatus,
      game.nextTurn,
      guestId
    );
    const isCompleted =
      nextTurnGuestId === game.firstPlayer
        ? game.roundNo === 3
          ? gameStatus.gameCompletion
          : gameStatus.roundCompletion
        : gameStatus.noCompletion;

    const addMoney = game.currentBid - game.playersBids[guestId];

    const updatedGame = await Game.findOneAndUpdate(
      { roomId: roomId },
      {
        $inc: {
          [`playersBalances.${guestId}`]: -addMoney,
          potBalance: addMoney,
          [`contributedPlayersBids.${guestId}`]: addMoney,
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
    res.status(200).json({
      message: "Check action completed successfully",
      isCompleted: isCompleted,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred during the check action" });
  }
};

export const raiseGame = async (req, res) => {
  try {
    const { roomId, bid } = req.query;

    let { guestId } = req.query;
    const bidAsNumber = Number(bid);
    const game = await Game.findOne({ roomId: roomId });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    const nextTurnGuestId = findNextPlayer(
      game.playersStatus,
      game.nextTurn,
      guestId
    );

    await Game.findOneAndUpdate(
      { roomId: roomId },
      {
        $inc: {
          [`playersBalances.${guestId}`]: -bidAsNumber,
          potBalance: bid,
          [`contributedPlayersBids.${guestId}`]: bidAsNumber,
        },
        $set: {
          playerTurn: nextTurnGuestId,
          [`playersBids.${guestId}`]: bidAsNumber,
          firstPlayer: guestId,
          currentBid: bidAsNumber,
        },
      }
    );
    res.status(200).json({
      message: "Raise action completed successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred during the raise action" });
  }
};

export const foldGame = async (req, res) => {
  try {
    const { roomId } = req.query;
    let { guestId } = req.query;
    const game = await Game.findOne({ roomId: roomId });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const nextTurnGuestId = findNextPlayer(
      game.playersStatus,
      game.nextTurn,
      guestId
    );

    //advance firstPlayer if current player is firstPlayer
    let firstPlayer =
      game.firstPlayer === guestId ? nextTurnGuestId : game.firstPlayer;

    const isCompleted =
      nextTurnGuestId === game.firstPlayer
        ? game.roundNo === 3
          ? gameStatus.gameCompletion
          : gameStatus.roundCompletion
        : gameStatus.noCompletion;

    await Game.findOneAndUpdate(
      { roomId: roomId },
      {
        $set: {
          [`playersStatus.${guestId}`]: false,
          playerTurn: nextTurnGuestId,
          firstPlayer: firstPlayer,
        },
      }
    );

    res.status(200).json({
      message: "Fold action completed successfully",
      isCompleted: isCompleted,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred during the fold action" });
  }
};

export const allInGame = async (req, res) => {
  try {
    const { roomId } = req.query;
    let { guestId } = req.query;
    const game = await Game.findOne({ roomId: roomId });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const nextTurnGuestId = findNextPlayer(
      game.playersStatus,
      game.nextTurn,
      guestId
    );
    const isCompleted =
      nextTurnGuestId === game.firstPlayer
        ? game.roundNo === 3
          ? gameStatus.gameCompletion
          : gameStatus.roundCompletion
        : gameStatus.noCompletion;

    const playerBalance = game.playersBalances[guestId];

    await Game.findOneAndUpdate(
      { roomId: roomId },
      {
        $inc: {
          [`contributedPlayersBids.${guestId}`]: playerBalance,
        },
        $set: {
          playerTurn: nextTurnGuestId,
          [`playersBalances.${guestId}`]: 0,
        },
      }
    );

    res.status(200).json({
      message: "All-in action completed successfully",
      isCompleted: isCompleted,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred during the all-in action" });
  }
};

export const resetRound = async (req, res) => {
  try {
    const { roomId } = req.query;
    const game = await Game.findOne({ roomId: roomId });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    let playersBids = {};
    for (const playerId of Object.keys(game.playersStatus)) {
      playersBids[playerId] = 0;
    }
    await Game.findOneAndUpdate(
      { roomId: roomId },
      {
        $inc: {
          roundNo: 1,
        },
        $set: {
          playerTurn: game.firstPlayer,
          playersBids: playersBids,
          currentBid: 0,
        },
      }
    );
    res
      .status(200)
      .json({ message: "Game has been moved to next round successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while moving the game to next round" });
  }
};

export const getWinners = async (req, res) => {
  try {
    const { roomId } = req.query;
    const game = await Game.findOne({ roomId: roomId });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    const winners = pokerWinner(
      game.pokerCards,
      game.playersCards,
      game.playersStatus
    );
    res.status(200).json({ message: "Found winner sucessfully" });
    req.io.of("/poker").to(roomId).emit("roundFinished", {
      winners: winners,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred while getting winners" });
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

    for (const playerId of Object.keys(game.playersStatus)) {
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
          firstPlayer: currentDealer,
        },
      }
    );

    res.status(200).json({ message: "Game has been reset successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "An error occurred while resetting the game" });
  }
};
