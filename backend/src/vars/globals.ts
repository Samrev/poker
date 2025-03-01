export const deck = [
  // 2s
  "2_of_clubs",
  "2_of_diamonds",
  "2_of_hearts",
  "2_of_spades",
  // 3s
  "3_of_clubs",
  "3_of_diamonds",
  "3_of_hearts",
  "3_of_spades",
  // 4s
  "4_of_clubs",
  "4_of_diamonds",
  "4_of_hearts",
  "4_of_spades",
  // 5s
  "5_of_clubs",
  "5_of_diamonds",
  "5_of_hearts",
  "5_of_spades",
  // 6s
  "6_of_clubs",
  "6_of_diamonds",
  "6_of_hearts",
  "6_of_spades",
  // 7s
  "7_of_clubs",
  "7_of_diamonds",
  "7_of_hearts",
  "7_of_spades",
  // 8s
  "8_of_clubs",
  "8_of_diamonds",
  "8_of_hearts",
  "8_of_spades",
  // 9s
  "9_of_clubs",
  "9_of_diamonds",
  "9_of_hearts",
  "9_of_spades",
  // 10s
  "10_of_clubs",
  "10_of_diamonds",
  "10_of_hearts",
  "10_of_spades",
  // Jacks
  "jack_of_clubs",
  "jack_of_diamonds",
  "jack_of_hearts",
  "jack_of_spades",
  // Queens
  "queen_of_clubs",
  "queen_of_diamonds",
  "queen_of_hearts",
  "queen_of_spades",
  // Kings
  "king_of_clubs",
  "king_of_diamonds",
  "king_of_hearts",
  "king_of_spades",
  // Aces
  "ace_of_clubs",
  "ace_of_diamonds",
  "ace_of_hearts",
  "ace_of_spades",
];
export enum GameStatus {
  ROUND_COMPLETED = "ROUND_COMPLETED",
  GAME_COMPLETED = "GAME_COMPLETED",
  CONTINUE = "CONTINUE",
}

export enum PlayerStatus {
  IN_GAME = "IN_GAME",
  FOLDED = "FOLDED",
  ALL_IN = "ALL_IN",
}

export type hands =
  | "Royal Flush"
  | "Straight Flush"
  | "Four of a Kind"
  | "Full House"
  | "Flush"
  | "Straight"
  | "Three of a Kind"
  | "Two Pair"
  | "One Pair"
  | "High Card";
