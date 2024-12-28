import { EPage, IGlobal } from "@/context/type";
import React from "react";

const InitalGlobal = {
  page: EPage.LOBBY,
  isHost: false,
  roomData: {
    roomId: "",
    roomName: "",
  },

  updatePage: () => {},
  updateHostStatus: () => {},
  updateRoomData: () => {},
};

const GlobalContext = React.createContext<IGlobal>(InitalGlobal);

export default GlobalContext;
