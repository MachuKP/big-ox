export enum EPage {
  GAME_ROOM = "game-room",
  LOBBY = "lobby",
}

export interface IRoomData {
  roomId: string;
  roomName: string;
}

export interface IGlobal {
  page: EPage;
  isHost: boolean;
  roomData: IRoomData;
  updatePage: (page: EPage) => void;
  updateHostStatus: (status: boolean) => void;
  updateRoomData: (roomData: IRoomData) => void;
}
