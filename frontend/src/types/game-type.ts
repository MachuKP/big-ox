export enum TextColorType {
  RED = "text-red-600",
  ORANGE = "text-orange-500",
  YELLOW = "text-yellow-500",
  GREEN = "text-green-500",
}

export enum OrderType {
  ONE = "1",
  FIVE = "5",
  FIFTEEN = "15",
  TWENTY_FIVE = "25",
}

export enum SymbolType {
  X = "X",
  O = "O",
}

export interface SocketResponse {
  board: [SymbolType | "", OrderType | ""][][];
  host_symbol: SymbolType;
  current_turn: SymbolType;
  host_time: string;
  opp_time: string;
  winner: SymbolType | "";
}

export interface CreateRoomResponse extends SocketResponse {
  room_id: string;
}

export interface SocketRequest {
  host_id: string;
  symbol: SymbolType;
  order: OrderType;
  position: [number, number];
}

export interface RoomListResponse {
  id: string;
  name: string;
  player_number: number;
}
