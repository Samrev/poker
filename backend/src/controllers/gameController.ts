import { Request, Response } from "express";
import { Game, Room } from "../models";
import { rewardWinners } from "../services/poker";
import { GameStatus, deck, PlayerStatus } from "../vars/index";

const shuffle = (array: any[]): any[] => {
  return array
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
};

const findNextPlayer = (
  playersStatus: Record<string, PlayerStatus>,
  nextTurn: Record<string, string>,
  guestId: string
): string => {
  while (playersStatus[nextTurn[guestId]] !== PlayerStatus.IN_GAME) {
    guestId = nextTurn[guestId];
  }
  return nextTurn[guestId];
};

const noPlayersLeft = (playersStatus: Record<string, PlayerStatus>): number => {
  let playersLeft = 0;
  for (const player of Object.keys(playersStatus)) {
    if (playersStatus[player] === PlayerStatus.IN_GAME) {
      playersLeft++;
    }
  }
  return playersLeft;
};

export const startGame = async (req: Request, res: Response): Promise<void> => {
  const { roomId } = req.body;
  const shuffledDeck = shuffle(deck);
  try {
    const room = await Room.findOne({ roomId }).populate("players");
    if (!room) {
      res.status(404).json({ message: "Room not found" });
      return;
    }
    const players = room.players.map((player: any) => player.guestId);

    let playersBalances: Record<string, number> = {};
    let playersCards: Record<string, string[]> = {};
    let playersStatus: Record<string, PlayerStatus> = {};
    let playersBids: Record<string, number> = {};
    let nextTurn: Record<string, string> = {};
    let contributedPlayersBids: Record<string, number> = {};
    let cardIndex = 0;
    let firstPlayer = players[room.numberOfPlayers - 1];

    for (let playerId of players) {
      playersCards[playerId] = [
        shuffledDeck[cardIndex++],
        shuffledDeck[cardIndex++],
      ];
      playersStatus[playerId] = PlayerStatus.IN_GAME;
      playersBalances[playerId] = 500;
      playersBids[playerId] = 0;
      contributedPlayersBids[playerId] = 0;
      nextTurn[firstPlayer] = playerId;
      firstPlayer = playerId;
    }

    const pokerCards = shuffledDeck.slice(cardIndex, cardIndex + 5);

    const game = new Game({
      roomId,
      playersCards,
      pokerCards,
      playersBalances,
      playersBids,
      playerTurn: players[1],
      currentDealer: players[0],
      currentSmallBlind: players[1],
      currentBigBlind: players[2],
      playersStatus,
      nextTurn,
      firstPlayer: players[1],
      contributedPlayersBids,
    });

    await game.save();
    res.status(200).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating a game" });
  }
};

export const getGame = async (req: Request, res: Response): Promise<void> => {
  const { roomId, guestId } = req.query as { roomId: string; guestId: string };
  try {
    const game = await Game.findOne({ roomId });
    if (!game) {
      res.status(404).json({ message: "Game not found" });
      return;
    }
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
    console.log(`Got the game in room ${roomId}`);
    res.status(200).json(playerGame);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching a game" });
  }
};

export const checkGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, guestId } = req.query as {
      roomId: string;
      guestId: string;
    };
    const game = await Game.findOne({ roomId });

    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    const nextTurnGuestId = findNextPlayer(
      game.playersStatus,
      game.nextTurn,
      guestId
    );
    const isCompleted =
      nextTurnGuestId === game.firstPlayer
        ? game.roundNo === 3
          ? GameStatus.GAME_COMPLETED
          : GameStatus.ROUND_COMPLETED
        : GameStatus.CONTINUE;

    const addMoney = game.currentBid - game.playersBids[guestId];

    const updatedGame = await Game.findOneAndUpdate(
      { roomId },
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
      res.status(500).json({ error: "Failed to update the game state" });
      return;
    }

    res.status(200).json({
      message: "Check action completed successfully",
      isCompleted,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred during the check action" });
  }
};

export const raiseGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, bid, guestId } = req.query as {
      roomId: string;
      bid: string;
      guestId: string;
    };
    const bidAsNumber = Number(bid);
    const game = await Game.findOne({ roomId: roomId });
    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
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

export const foldGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, guestId } = req.query as {
      roomId: string;
      guestId: string;
    };
    const game = await Game.findOne({ roomId: roomId });

    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    const nextTurnGuestId = findNextPlayer(
      game.playersStatus,
      game.nextTurn,
      guestId
    );

    //advance firstPlayer if current player is firstPlayer
    let firstPlayer =
      game.firstPlayer === guestId ? nextTurnGuestId : game.firstPlayer;

    //check no of players left
    const playersLeft = noPlayersLeft(game.playersStatus);

    const isCompleted =
      nextTurnGuestId === game.firstPlayer
        ? game.roundNo === 3 || playersLeft === 1
          ? GameStatus.GAME_COMPLETED
          : GameStatus.ROUND_COMPLETED
        : GameStatus.CONTINUE;

    await Game.findOneAndUpdate(
      { roomId: roomId },
      {
        $set: {
          [`playersStatus.${guestId}`]: PlayerStatus.FOLDED,
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

export const allInGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, guestId } = req.query as {
      roomId: string;
      guestId: string;
    };
    const game = await Game.findOne({ roomId: roomId });

    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    const nextTurnGuestId = findNextPlayer(
      game.playersStatus,
      game.nextTurn,
      guestId
    );
    const isCompleted =
      nextTurnGuestId === game.firstPlayer
        ? game.roundNo === 3
          ? GameStatus.GAME_COMPLETED
          : GameStatus.ROUND_COMPLETED
        : GameStatus.CONTINUE;

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
          [`playersStatus.${guestId}`]: PlayerStatus.ALL_IN,
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

export const resetRound = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { roomId } = req.query as { roomId: string };

    const game = await Game.findOne({ roomId });
    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    const playersBids: Record<string, number> = {};
    for (const playerId of Object.keys(game.playersStatus)) {
      playersBids[playerId] = 0;
    }

    await Game.findOneAndUpdate(
      { roomId },
      {
        $inc: {
          roundNo: 1,
        },
        $set: {
          playerTurn: game.firstPlayer,
          playersBids,
          currentBid: 0,
        },
      }
    );
    res
      .status(200)
      .json({ message: "Game has been moved to the next round successfully" });
  } catch (error) {
    console.error("Error in resetRound:", error);
    res.status(500).json({
      error: "An error occurred while moving the game to the next round",
    });
  }
};

export const getWinners = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { roomId } = req.query as { roomId: string };

    const game = await Game.findOne({ roomId });
    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }
    const { winningData, playersBalances, potBalance } = rewardWinners(
      game.pokerCards,
      game.playersCards,
      game.playersStatus,
      game.contributedPlayersBids,
      game.playersBalances,
      game.potBalance
    );

    const { winners, bestHand } = winningData;

    await Game.findOneAndUpdate(
      { roomId },
      {
        $set: {
          playersBalances,
          potBalance,
        },
      }
    );

    res.status(200).json({
      message: "Found winner successfully",
      winners,
      bestHand,
    });
  } catch (error) {
    console.error("Error in getWinners:", error);
    res.status(500).json({ error: "An error occurred while getting winners" });
  }
};
export const resetGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId } = req.query as { roomId: string };
    const shuffledDeck = shuffle(deck);
    const game = await Game.findOne({ roomId });
    if (!game) {
      res.status(404).json({ error: "Game not found" });
      return;
    }

    let cardIndex = 0;
    const playersCards: Record<string, string[]> = {};
    const playersStatus: Record<string, PlayerStatus> = {};
    const playersBids: Record<string, number> = {};
    const contributedPlayersBids: Record<string, number> = {};

    const currentDealer = game.nextTurn[game.currentDealer];
    const currentSmallBlind = game.nextTurn[currentDealer];
    const currentBigBlind = game.nextTurn[currentSmallBlind];

    for (const playerId of Object.keys(game.playersStatus)) {
      playersCards[playerId] = [
        shuffledDeck[cardIndex++],
        shuffledDeck[cardIndex++],
      ];
      playersStatus[playerId] = PlayerStatus.IN_GAME;
      playersBids[playerId] = 0;
      contributedPlayersBids[playerId] = 0;
    }

    const pokerCards = shuffledDeck.slice(cardIndex, cardIndex + 5);
    cardIndex += 5;

    await Game.findOneAndUpdate(
      { roomId },
      {
        $set: {
          playersCards,
          pokerCards,
          currentBid: 0,
          playerTurn: currentSmallBlind,
          playersBids,
          contributedPlayersBids,
          playersStatus,
          currentDealer,
          currentSmallBlind,
          currentBigBlind,
          roundNo: 0,
          firstPlayer: currentDealer,
        },
      }
    );

    res.status(200).json({ message: "Game has been reset successfully" });
  } catch (error) {
    console.error("Error in resetGame:", error);
    res
      .status(500)
      .json({ error: "An error occurred while resetting the game" });
  }
};
