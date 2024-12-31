"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetGame = exports.getWinners = exports.resetRound = exports.allInGame = exports.foldGame = exports.raiseGame = exports.checkGame = exports.getGame = exports.startGame = void 0;
const models_1 = require("../models");
const poker_1 = require("../services/poker");
const index_1 = require("../vars/index");
const shuffle = (array) => {
    return array
        .map((a) => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value);
};
const findNextPlayer = (playersStatus, nextTurn, guestId) => {
    while (playersStatus[nextTurn[guestId]] !== index_1.PlayerStatus.IN_GAME) {
        guestId = nextTurn[guestId];
    }
    return nextTurn[guestId];
};
const startGame = async (req, res) => {
    const { roomId } = req.body;
    const shuffledDeck = shuffle(index_1.deck);
    try {
        const room = await models_1.Room.findOne({ roomId }).populate("players");
        if (!room) {
            res.status(404).json({ message: "Room not found" });
            return;
        }
        const players = room.players.map((player) => player.guestId);
        let playersBalances = {};
        let playersCards = {};
        let playersStatus = {};
        let playersBids = {};
        let nextTurn = {};
        let contributedPlayersBids = {};
        let cardIndex = 0;
        let firstPlayer = players[room.numberOfPlayers - 1];
        for (let playerId of players) {
            playersCards[playerId] = [
                shuffledDeck[cardIndex++],
                shuffledDeck[cardIndex++],
            ];
            playersStatus[playerId] = index_1.PlayerStatus.IN_GAME;
            playersBalances[playerId] = 500;
            playersBids[playerId] = 0;
            contributedPlayersBids[playerId] = 0;
            nextTurn[firstPlayer] = playerId;
            firstPlayer = playerId;
        }
        const pokerCards = shuffledDeck.slice(cardIndex, cardIndex + 5);
        const game = new models_1.Game({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating a game" });
    }
};
exports.startGame = startGame;
const getGame = async (req, res) => {
    const { roomId, guestId } = req.query;
    try {
        const game = await models_1.Game.findOne({ roomId });
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching a game" });
    }
};
exports.getGame = getGame;
const checkGame = async (req, res) => {
    try {
        const { roomId, guestId } = req.query;
        const game = await models_1.Game.findOne({ roomId });
        if (!game) {
            res.status(404).json({ error: "Game not found" });
            return;
        }
        const nextTurnGuestId = findNextPlayer(game.playersStatus, game.nextTurn, guestId);
        const isCompleted = nextTurnGuestId === game.firstPlayer
            ? game.roundNo === 3
                ? index_1.GameStatus.GAME_COMPLETED
                : index_1.GameStatus.ROUND_COMPLETED
            : index_1.GameStatus.CONTINUE;
        const addMoney = game.currentBid - game.playersBids[guestId];
        const updatedGame = await models_1.Game.findOneAndUpdate({ roomId }, {
            $inc: {
                [`playersBalances.${guestId}`]: -addMoney,
                potBalance: addMoney,
                [`contributedPlayersBids.${guestId}`]: addMoney,
            },
            $set: {
                playerTurn: nextTurnGuestId,
                [`playersBids.${guestId}`]: game.currentBid,
            },
        }, { new: true });
        if (!updatedGame) {
            res.status(500).json({ error: "Failed to update the game state" });
            return;
        }
        res.status(200).json({
            message: "Check action completed successfully",
            isCompleted,
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "An error occurred during the check action" });
    }
};
exports.checkGame = checkGame;
const raiseGame = async (req, res) => {
    try {
        const { roomId, bid, guestId } = req.query;
        const bidAsNumber = Number(bid);
        const game = await models_1.Game.findOne({ roomId: roomId });
        if (!game) {
            res.status(404).json({ error: "Game not found" });
            return;
        }
        const nextTurnGuestId = findNextPlayer(game.playersStatus, game.nextTurn, guestId);
        await models_1.Game.findOneAndUpdate({ roomId: roomId }, {
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
        });
        res.status(200).json({
            message: "Raise action completed successfully",
        });
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "An error occurred during the raise action" });
    }
};
exports.raiseGame = raiseGame;
const foldGame = async (req, res) => {
    try {
        const { roomId, guestId } = req.query;
        const game = await models_1.Game.findOne({ roomId: roomId });
        if (!game) {
            res.status(404).json({ error: "Game not found" });
            return;
        }
        const nextTurnGuestId = findNextPlayer(game.playersStatus, game.nextTurn, guestId);
        //advance firstPlayer if current player is firstPlayer
        let firstPlayer = game.firstPlayer === guestId ? nextTurnGuestId : game.firstPlayer;
        const isCompleted = nextTurnGuestId === game.firstPlayer
            ? game.roundNo === 3
                ? index_1.GameStatus.GAME_COMPLETED
                : index_1.GameStatus.ROUND_COMPLETED
            : index_1.GameStatus.CONTINUE;
        await models_1.Game.findOneAndUpdate({ roomId: roomId }, {
            $set: {
                [`playersStatus.${guestId}`]: index_1.PlayerStatus.FOLDED,
                playerTurn: nextTurnGuestId,
                firstPlayer: firstPlayer,
            },
        });
        res.status(200).json({
            message: "Fold action completed successfully",
            isCompleted: isCompleted,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred during the fold action" });
    }
};
exports.foldGame = foldGame;
const allInGame = async (req, res) => {
    try {
        const { roomId, guestId } = req.query;
        const game = await models_1.Game.findOne({ roomId: roomId });
        if (!game) {
            res.status(404).json({ error: "Game not found" });
            return;
        }
        const nextTurnGuestId = findNextPlayer(game.playersStatus, game.nextTurn, guestId);
        const isCompleted = nextTurnGuestId === game.firstPlayer
            ? game.roundNo === 3
                ? index_1.GameStatus.GAME_COMPLETED
                : index_1.GameStatus.ROUND_COMPLETED
            : index_1.GameStatus.CONTINUE;
        const playerBalance = game.playersBalances[guestId];
        await models_1.Game.findOneAndUpdate({ roomId: roomId }, {
            $inc: {
                [`contributedPlayersBids.${guestId}`]: playerBalance,
            },
            $set: {
                playerTurn: nextTurnGuestId,
                [`playersBalances.${guestId}`]: 0,
                [`playersStatus.${guestId}`]: index_1.PlayerStatus.ALL_IN,
            },
        });
        res.status(200).json({
            message: "All-in action completed successfully",
            isCompleted: isCompleted,
        });
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ error: "An error occurred during the all-in action" });
    }
};
exports.allInGame = allInGame;
const resetRound = async (req, res) => {
    try {
        const { roomId } = req.query;
        const game = await models_1.Game.findOne({ roomId });
        if (!game) {
            res.status(404).json({ error: "Game not found" });
            return;
        }
        const playersBids = {};
        for (const playerId of Object.keys(game.playersStatus)) {
            playersBids[playerId] = 0;
        }
        await models_1.Game.findOneAndUpdate({ roomId }, {
            $set: {
                playerTurn: game.firstPlayer,
                playersBids,
                currentBid: 0,
            },
        });
        res
            .status(200)
            .json({ message: "Game has been moved to the next round successfully" });
    }
    catch (error) {
        console.error("Error in resetRound:", error);
        res.status(500).json({
            error: "An error occurred while moving the game to the next round",
        });
    }
};
exports.resetRound = resetRound;
const getWinners = async (req, res) => {
    try {
        const { roomId } = req.query;
        const game = await models_1.Game.findOne({ roomId });
        if (!game) {
            res.status(404).json({ error: "Game not found" });
            return;
        }
        const { winningData, playersBalances, potBalance } = (0, poker_1.rewardWinners)(game.pokerCards, game.playersCards, game.playersStatus, game.contributedPlayersBids, game.playersBalances, game.potBalance);
        const { winners, bestHand } = winningData;
        await models_1.Game.findOneAndUpdate({ roomId }, {
            $set: {
                playersBalances,
                potBalance,
            },
        });
        res.status(200).json({
            message: "Found winner successfully",
            winners,
            bestHand,
        });
    }
    catch (error) {
        console.error("Error in getWinners:", error);
        res.status(500).json({ error: "An error occurred while getting winners" });
    }
};
exports.getWinners = getWinners;
const resetGame = async (req, res) => {
    try {
        const { roomId } = req.query;
        const shuffledDeck = shuffle(index_1.deck);
        const game = await models_1.Game.findOne({ roomId });
        if (!game) {
            res.status(404).json({ error: "Game not found" });
            return;
        }
        let cardIndex = 0;
        const playersCards = {};
        const playersStatus = {};
        const playersBids = {};
        const contributedPlayersBids = {};
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
        const pokerCards = shuffledDeck.slice(cardIndex, cardIndex + 5);
        cardIndex += 5;
        await models_1.Game.findOneAndUpdate({ roomId }, {
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
        });
        res.status(200).json({ message: "Game has been reset successfully" });
    }
    catch (error) {
        console.error("Error in resetGame:", error);
        res
            .status(500)
            .json({ error: "An error occurred while resetting the game" });
    }
};
exports.resetGame = resetGame;
//# sourceMappingURL=gameController.js.map