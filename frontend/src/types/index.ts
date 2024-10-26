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
  playersBalances: Map<string, number>;
  handleCloseButton: () => void;
}

export interface CardDisplayProps {
  card: string;
}
