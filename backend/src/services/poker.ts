import { IGame } from "../models/game";
import { GameStatus, PlayerStatus } from "../vars";

const rankOrder: Record<string, number> = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  jack: 11,
  queen: 12,
  king: 13,
  ace: 14,
};

const hands: string[] = [
  "Royal Flush",
  "Straight Flush",
  "Four of a Kind",
  "Full House",
  "Flush",
  "Straight",
  "Three of a Kind",
  "Two Pair",
  "One Pair",
  "High Card",
];

const NO_PLAYER = "-1";

export const shuffle = (array: any[]): any[] => {
  return array
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
};

export const findNextPlayer = (
  noOfPlayers: number,
  playersStatus: Record<string, PlayerStatus>,
  nextTurn: Record<string, string>,
  guestId: string
): string => {
  let cnt = 0;
  while (playersStatus[nextTurn[guestId]] === PlayerStatus.FOLDED) {
    guestId = nextTurn[guestId];
    cnt += 1;
    if (cnt === noOfPlayers) {
      return NO_PLAYER;
    }
  }
  return nextTurn[guestId];
};

export const noPlayersLeft = (
  playersStatus: Record<string, PlayerStatus> | undefined
): number => {
  let playersLeft = 0;
  if (!playersStatus) {
    return 0;
  }
  for (const player of Object.keys(playersStatus)) {
    if (playersStatus[player] === PlayerStatus.IN_GAME) {
      playersLeft++;
    }
  }
  return playersLeft;
};

export const isGameCompleted = (updatedGame: IGame): GameStatus => {
  let bidArray = [];
  const playersLeft = noPlayersLeft(updatedGame.playersStatus);
  for (const player of Object.keys(updatedGame.playersBids)) {
    if (updatedGame.playersStatus[player] === PlayerStatus.IN_GAME) {
      bidArray.push(updatedGame.playersBids[player]);
    }
  }
  const bidMatched =
    bidArray.length === 0 || bidArray.every((bid) => bid === bidArray[0]);
  const isCompleted = bidMatched
    ? playersLeft <= 1 || updatedGame.roundNo === 3
      ? GameStatus.GAME_COMPLETED
      : GameStatus.ROUND_COMPLETED
    : GameStatus.CONTINUE;
  return isCompleted;
};

const getCombinations = <T>(arr: T[], k: number): T[][] => {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [first, ...rest] = arr;
  const withFirst = getCombinations(rest, k - 1).map((combo) => [
    first,
    ...combo,
  ]);
  const withoutFirst = getCombinations(rest, k);
  return [...withFirst, ...withoutFirst];
};

const mapToRanks = (cards: string[]): number[] => {
  return cards.map((card) => rankOrder[card.split("_")[0]]);
};

const sortRanksForHand = (rankCount: Record<number, number>): number[] => {
  const rankGroups = Object.entries(rankCount)
    .map(([rank, count]) => ({
      rank: Number(rank),
      count,
    }))
    .sort((a, b) =>
      a.count === b.count ? b.rank - a.rank : b.count - a.count
    );

  const sortedRanks: number[] = [];
  for (const group of rankGroups) {
    sortedRanks.push(...Array(group.count).fill(group.rank));
  }
  return sortedRanks;
};

const getRankCount = (ranks: number[]): Record<number, number> =>
  ranks.reduce((count: Record<number, number>, rank: number) => {
    count[rank] = (count[rank] || 0) + 1;
    return count;
  }, {});

const isSameSuit = (suits: string[]): boolean =>
  suits.every((suit) => suit === suits[0]);

const isSeq = (ranks: number[]): boolean =>
  ranks.every((rank, i, arr) => i === 0 || rank === arr[i - 1] + 1);

const isRoyalFlush = (suits: string[], ranks: number[]): boolean =>
  isSameSuit(suits) &&
  JSON.stringify(ranks) === JSON.stringify([10, 11, 12, 13, 14]);

const isStraightFlush = (suits: string[], ranks: number[]): boolean =>
  isSameSuit(suits) && isSeq(ranks);

const isFourOfAKind = (rankCount: Record<number, number>): boolean =>
  Object.values(rankCount).includes(4);

const isFullHouse = (rankCount: Record<number, number>): boolean =>
  Object.values(rankCount).includes(3) && Object.values(rankCount).includes(2);

const isFlush = (suits: string[]): boolean => isSameSuit(suits);

const isStraight = (ranks: number[]): boolean => isSeq(ranks);

const isThreeOfAKind = (rankCount: Record<number, number>): boolean =>
  Object.values(rankCount).includes(3);

const isTwoPair = (rankCount: Record<number, number>): boolean =>
  Object.values(rankCount).filter((count) => count === 2).length === 2;

const isOnePair = (rankCount: Record<number, number>): boolean =>
  Object.values(rankCount).includes(2);

const evaluateHand = (cards: string[]): number => {
  const ranks = mapToRanks(cards);
  const suits = cards.map((card) => card.split("_").pop()!);
  const rankCount = getRankCount(ranks);
  let hand = 9;

  if (isRoyalFlush(suits, ranks)) {
    hand = 0;
  } else if (isStraightFlush(suits, ranks)) {
    hand = 1;
  } else if (isFourOfAKind(rankCount)) {
    hand = 2;
  } else if (isFullHouse(rankCount)) {
    hand = 3;
  } else if (isFlush(suits)) {
    hand = 4;
  } else if (isStraight(ranks)) {
    hand = 5;
  } else if (isThreeOfAKind(rankCount)) {
    hand = 6;
  } else if (isTwoPair(rankCount)) {
    hand = 7;
  } else if (isOnePair(rankCount)) {
    hand = 8;
  }
  return hand;
};

const pokerHand = (
  hands: string[]
): { bestHand: number; bestRanks: number[] } => {
  const combinations = getCombinations(hands, 5);
  let bestHand = 9;
  let bestRanks: number[] = [2, 2, 2, 2, 2];
  for (const combination of combinations) {
    const currentHand = evaluateHand(combination);
    if (currentHand < bestHand) {
      bestHand = currentHand;
      bestRanks = sortRanksForHand(getRankCount(mapToRanks(combination)));
    } else if (currentHand === bestHand) {
      const rankCount = getRankCount(mapToRanks(combination));
      const currentRanks = sortRanksForHand(rankCount);
      for (let i = 0; i < currentRanks.length; i++) {
        if (currentRanks[i] > bestRanks[i]) {
          bestRanks = currentRanks;
          break;
        } else if (currentRanks[i] < bestRanks[i]) {
          break;
        }
      }
    }
  }
  return { bestHand, bestRanks };
};

const pokerWinner = (
  pokerCards: string[],
  playersCards: Record<string, string[]>,
  playersStatus: Record<string, PlayerStatus>
): { winners: string[]; bestHand: string; bestRanks: number[] } => {
  let bestHandRank = 10;
  let bestRanks: number[] = [];
  let winners: string[] = [];

  for (const [player, playerCards] of Object.entries(playersCards)) {
    if (playersStatus[player] === PlayerStatus.FOLDED) continue;

    const allCards = [...pokerCards, ...playerCards];
    const { bestHand, bestRanks: playerBestRanks } = pokerHand(allCards);
    if (bestHand < bestHandRank) {
      bestHandRank = bestHand;
      bestRanks = playerBestRanks;
      winners = [player];
    } else if (bestHand === bestHandRank) {
      let isBetter = false,
        isWorse = false;
      for (let i = 0; i < playerBestRanks.length; i++) {
        if (playerBestRanks[i] > bestRanks[i]) {
          isBetter = true;
          break;
        } else if (playerBestRanks[i] < bestRanks[i]) {
          isWorse = true;
          break;
        }
      }
      if (isBetter) {
        bestRanks = playerBestRanks;
        winners = [player];
      } else if (!isWorse) {
        winners.push(player);
      }
    }
  }

  return {
    winners,
    bestHand: hands[bestHandRank],
    bestRanks,
  };
};

export const rewardWinners = (
  pokerCards: string[],
  playerCards: Record<string, string[]>,
  playersStatus: Record<string, PlayerStatus>,
  contributedPlayersBids: Record<string, number>,
  playersBalances: Record<string, number>,
  potBalance: number
): {
  winningData: { winners: string[]; bestHand: string; bestRanks: number[] };
  playersBalances: Record<string, number>;
  potBalance: number;
} => {
  const winningData = pokerWinner(pokerCards, playerCards, playersStatus);
  const allInWinners: string[] = [];
  const inGameWinners: string[] = [];

  for (const player of winningData.winners) {
    if (playersStatus[player] === PlayerStatus.IN_GAME) {
      inGameWinners.push(player);
    } else {
      allInWinners.push(player);
    }
  }

  const inGameWinnersCount = inGameWinners.length;

  for (const [player, bid] of Object.entries(contributedPlayersBids)) {
    for (const winner of allInWinners) {
      const add = Math.floor(
        Math.min(
          contributedPlayersBids[winner] / winningData.winners.length,
          bid / winningData.winners.length
        )
      );
      contributedPlayersBids[player] -= add;
      playersBalances[winner] += add;
      potBalance -= add;
    }
  }

  if (inGameWinnersCount > 0) {
    for (const [player, bid] of Object.entries(contributedPlayersBids)) {
      for (const winner of inGameWinners) {
        const add = Math.floor(bid / inGameWinnersCount);
        contributedPlayersBids[player] -= add;
        playersBalances[winner] += add;
        potBalance -= add;
      }
    }
  }

  for (let i = 0; i < winningData.winners.length; i++) {
    const winner = winningData.winners[i];
    const add = Math.floor(potBalance / (winningData.winners.length - i));
    playersBalances[winner] += add;
    potBalance -= add;
  }

  return { winningData, playersBalances, potBalance };
};
