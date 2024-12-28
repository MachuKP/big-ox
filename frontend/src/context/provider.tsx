import { EPage, IRoomData } from "@/context/type";
import React, { useState } from "react";
import GlobalContext from "./reducer/global";

const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [page, setPage] = React.useState<EPage>(EPage.LOBBY);
  const [isHost, setIsHost] = useState(false);
  const [roomData, setRoomData] = useState({ roomName: "", roomId: "" });

  const updatePage = (page: EPage) => {
    setPage(page);
  };
  const updateHostStatus = (status: boolean) => {
    setIsHost(status);
  };
  const updateRoomData = (roomData: IRoomData) => {
    setRoomData(roomData);
  };

  return (
    <GlobalContext.Provider
      value={{
        page,
        isHost,
        roomData,
        updatePage,
        updateHostStatus,
        updateRoomData,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default Provider;
