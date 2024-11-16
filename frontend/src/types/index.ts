export interface Player {
  guestId: string;
  isPlaying: boolean;
  roomId: string;
}
export interface Room {
  roomId: string;
  numberOfPlayers: number;
  maxNumberOfPlayers: number;
  players: Player[];
}

export interface EnterRoomModalProps {
  handleCancelEnterRoom: () => void;
  guestId: string;
}
export interface CreateRoomModalProps {
  handleCancelCreateRoom: () => void;
  guestId: string;
}

export interface PlayersBalancesModalProps {
  playersBalances: Record<string, number>;
  handleCloseButton: () => void;
}

export interface CardDisplayProps {
  card: string;
}
export interface PlayerGameData {
  potBalance: number;
  currentBid: number;
  playerBid: number;
  playerCards: string[];
  pokerCards: string[];
  playersBalances: Record<string, number>;
  isPlayerTurn: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  playerStatus: boolean;
  nextTurn: Record<string, string>;
  roundNo: number;
  lastPlayer: string;
  contributedPlayersBids: Record<string, number>;
}
