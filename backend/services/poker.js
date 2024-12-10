const rankOrder = {
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
const hands = [
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

const getCombinations = (arr, k) => {
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
const mapToRanks = (cards) => {
  return cards
    .map((card) => rankOrder[card.split("_")[0]])
    .sort((a, b) => a - b);
};
const getRankCount = (ranks) =>
  ranks.reduce((count, rank) => {
    count[rank] = (count[rank] || 0) + 1;
    return count;
  }, {});

const isSameSuit = (suits) => suits.every((suit) => suit === suits[0]);

const isSeq = (ranks) =>
  ranks.every((rank, i, arr) => i === 0 || rank === arr[i - 1] + 1);

const isRoyalFlush = (suits, ranks) =>
  isSameSuit(suits) &&
  JSON.stringify(ranks) === JSON.stringify([10, 11, 12, 13, 14]);

const isStraightFlush = (suits, ranks) => isSameSuit(suits) && isSeq(ranks);

const isFourOfAKind = (rankCount) => Object.values(rankCount).includes(4);

const isFullHouse = (rankCount) =>
  Object.values(rankCount).includes(3) && Object.values(rankCount).includes(2);

const isFlush = (suits) => isSameSuit(suits);

const isStraight = (ranks) => isSeq(ranks);

const isThreeOfAKind = (rankCount) => Object.values(rankCount).includes(3);

const isTwoPair = (rankCount) =>
  Object.values(rankCount).filter((count) => count === 2).length === 2;

const isOnePair = (rankCount) => Object.values(rankCount).includes(2);

const evaluateHand = (cards) => {
  const ranks = mapToRanks(cards);
  const suits = cards.map((card) => card.split("_").pop());
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

const pokerHand = (hands) => {
  const combinations = getCombinations(hands, 5);
  let bestHand = 9;
  let bestRanks = [2, 2, 2, 2, 2];
  for (const combination of combinations) {
    const currentHand = evaluateHand(combination);
    if (currentHand < bestHand) {
      bestHand = currentHand;
      bestRanks = mapToRanks(combination);
    } else if (currentHand === bestHand) {
      const currentRanks = mapToRanks(combination);
      for (let i = currentRanks.length - 1; i >= 0; i--) {
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

export const pokerWinner = (pokerCards, playersCards, playersStatus) => {
  let bestHandRank = 10;
  let bestRanks;
  let winners = [];

  for (const [player, playerCards] of Object.entries(playersCards)) {
    if (!playersStatus[player]) continue;

    const allCards = [...pokerCards, ...playerCards];
    const { bestHand, bestRanks: playerBestRanks } = pokerHand(allCards);
    if (bestHand < bestHandRank) {
      bestHandRank = bestHand;
      bestRanks = playerBestRanks;
      winners = [player];
    } else if (bestHand === bestHandRank) {
      let isBetter = false,
        isWorse = false;
      for (let i = playerBestRanks.length - 1; i >= 0; i--) {
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
