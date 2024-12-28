import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import GlobalContext from "@/context/reducer/global";
import { cn } from "@/lib/utils";
import {
  CreateRoomResponse,
  OrderType,
  SocketRequest,
  SocketResponse,
  SymbolType,
  TextColorType,
} from "@/types/game-type";
import { EPage } from "@/context/type";
import { NOTATIONS, RULES } from "@/types/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Dropdown from "@/components/dropdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CircleUserRound, HelpCircle } from "lucide-react";
import useSocket from "@/api/use-socket";

const GameRoom = () => {
  const { socket } = useSocket();
  const { updatePage, updateRoomData, updateHostStatus, isHost, roomData } =
    useContext(GlobalContext);

  const [boardLayout, setBoardLayout] = useState<
    [SymbolType | "", OrderType | ""][][]
  >([
    [
      ["", ""],
      ["", ""],
      ["", ""],
    ],
    [
      ["", ""],
      ["", ""],
      ["", ""],
    ],
    [
      ["", ""],
      ["", ""],
      ["", ""],
    ],
  ]);
  const [order, setOrder] = useState(OrderType.ONE as string);
  const [isYourTurn, setIsYourTurn] = useState(false);
  const [symbol, setSymbol] = useState(SymbolType.X);
  const [time, setTime] = useState("");
  const [oppTime, setOppTime] = useState("");
  const [winner, setWinner] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [hasTwoPlayer, setHasTwoPlayer] = useState(false);

  useEffect(() => {
    if (socket) {
      socket.on("connect", () => {
        console.log("Connected to the server");
      });
      if (isHost && roomData.roomName) {
        const payload = { room_name: roomData.roomName };
        socket.emit("createGame", payload);
        socket.once(
          "gameCreated",
          (response: { boardDetail: CreateRoomResponse }) => {
            console.log("Host's game state:", response);
            updateRoomData({
              roomId: response.boardDetail.room_id,
              roomName: roomData.roomName,
            });
            setIsYourTurn(
              response.boardDetail.host_symbol ===
                response.boardDetail.current_turn
            );
            setSymbol(response.boardDetail.host_symbol);
            setTime(response.boardDetail.host_time);
            setOppTime(response.boardDetail.opp_time);
          }
        );
        socket.on("gameReady", () => {
          setHasTwoPlayer(true);
        });
      } else if (!isHost && roomData.roomId) {
        socket.emit("joinGame", roomData.roomId);
        socket.on("joinedGame", (response: { boardDetail: SocketResponse }) => {
          console.log("Client's game state:", response);
          setBoardLayout(response.boardDetail.board);
          setIsYourTurn(
            response.boardDetail.host_symbol !==
              response.boardDetail.current_turn
          );
          setSymbol(getOppositeSymbol(response.boardDetail.host_symbol));
          setTime(response.boardDetail.opp_time);
          setOppTime(response.boardDetail.host_time);
          setWinner(response.boardDetail.winner);
          setHasTwoPlayer(true);
          if (response.boardDetail.winner) setIsOpenModal(true);
        });
      }
      socket.on("opponentMove", (response: { boardDetail: SocketResponse }) => {
        console.log("Opponent's game state:", response);
        setBoardLayout(response.boardDetail.board);
        setOppTime(
          isHost
            ? response.boardDetail.opp_time
            : response.boardDetail.host_time
        );
        setIsYourTurn(true);
        setWinner(response.boardDetail.winner);
        if (response.boardDetail.winner) setIsOpenModal(true);
      });

      socket.on("gameEnded", (response: { winner: string }) => {
        console.log("The winner is:", response.winner);
        setWinner(response.winner);
        if (response.winner) setIsOpenModal(true);
      });

      socket.on(
        "gameRestarted",
        (response: { boardDetail: SocketResponse }) => {
          console.log("New game state:", response);
          const hostSymbol = response.boardDetail.host_symbol;
          setBoardLayout(response.boardDetail.board);
          setTime(
            isHost
              ? response.boardDetail.host_time
              : response.boardDetail.opp_time
          );
          setOppTime(
            isHost
              ? response.boardDetail.opp_time
              : response.boardDetail.host_time
          );
          setSymbol(isHost ? hostSymbol : getOppositeSymbol(hostSymbol));
          setIsYourTurn(
            isHost
              ? hostSymbol === response.boardDetail.current_turn
              : hostSymbol !== response.boardDetail.current_turn
          );
          setIsOpenModal(false);
          setWinner("");
        }
      );

      socket.on("roomClosed", (error) => {
        alert(error.message);
        updatePage(EPage.LOBBY);
      });

      return () => {
        // if host is disconnected, the room will be closed
        setHasTwoPlayer(false);
        socket?.removeAllListeners();
      };
    }
  }, [socket]);

  const getOppositeSymbol = (symbol: SymbolType) => {
    return symbol === SymbolType.O ? SymbolType.X : SymbolType.O;
  };

  const updateBoardLayout = useCallback(
    (symbol: SymbolType, x: number, y: number, order: OrderType) => {
      const copyboardLayout = [...boardLayout];
      copyboardLayout[x][y] = [symbol, order];
      setBoardLayout(copyboardLayout);
    },
    [boardLayout]
  );

  const handleClickQuit = () => {
    if (isHost) updateHostStatus(false);
    updatePage(EPage.LOBBY);
  };

  const handleClickRestart = () => {
    socket?.emit("restartGame");
  };

  const handleCancelModal = () => {
    setIsOpenModal(false);
  };

  const isMarkable = useCallback(
    (x: number, y: number, order: string) => {
      if (
        (!boardLayout[x][y][0] ||
          parseInt(boardLayout[x][y][1]) < parseInt(order)) &&
        parseInt(time) >= parseInt(order)
      )
        return true;
      return false;
    },
    [boardLayout, time]
  );

  const handleOnPlay = useCallback(
    (symbol: SymbolType, x: number, y: number, order: OrderType) => {
      if (!isMarkable(x, y, order)) return;

      updateBoardLayout(symbol, x, y, order);
      const request: SocketRequest = {
        host_id: roomData.roomId,
        symbol: symbol,
        order: order,
        position: [x, y],
      };
      setTime((prev) => {
        const prevInt = parseInt(prev);
        const orderInt = parseInt(order);
        return (prevInt - orderInt).toString();
      });
      setIsYourTurn(false);
      if (socket && request) {
        socket.emit("playerMove", request);
      }
    },
    [isMarkable, updateBoardLayout, socket, roomData.roomId]
  );

  const handleClickSkip = useCallback(() => {
    setIsYourTurn(false);
    if (socket) {
      socket.emit("skipMove", roomData.roomId);
    }
  }, [socket, roomData.roomId]);

  const mapColor = useMemo(
    () => ({
      "1": TextColorType.GREEN,
      "5": TextColorType.YELLOW,
      "15": TextColorType.ORANGE,
      "25": TextColorType.RED,
    }),
    []
  );

  const renderBoard = useMemo(() => {
    return boardLayout.map((row, i) =>
      row.map((cell, j) => (
        <div
          key={`${i}-${j}`}
          className={cn(
            "w-[100px] h-[100px] bg-slate-200 hover:bg-slate-100 rounded-md flex items-center justify-center text-6xl font-bold",
            `${mapColor[cell[1] as keyof typeof mapColor]}`
          )}
          onClick={() => handleOnPlay(symbol, i, j, order as OrderType)}
        >
          {cell[0]}
        </div>
      ))
    );
  }, [boardLayout, handleOnPlay, symbol, order, mapColor]);

  return (
    <div>
      <Card className="mb-8 p-10 flex flex-col">
        <div className="mb-4 flex bg-secondary px-2 py-1 shrink rounded-2xl self-start">
          <CircleUserRound className="mr-2" color="white" />
          <p className="text-slate-50 text-sm">
            Opponent's time{" "}
            <span className="font-bold text-base">{oppTime}</span>
          </p>
        </div>
        <div className="flex flex-wrap justify-around">
          <div className="flex justify-center relative">
            <div className="grid grid-cols-3 gap-4">{renderBoard}</div>
            {(!isYourTurn || !hasTwoPlayer || winner) && (
              <div className="absolute w-[360px] h-full flex items-center cursor-not-allowed">
                <div className="w-full h-[80px] bg-slate-600 opacity-20 rounded-md text-slate-50 text-lg font-bold flex justify-center items-center">
                  {winner
                    ? "Waiting for host to restart the game"
                    : "Waiting for another player"}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col mt-10">
            <p>
              You play as{" "}
              <span className="font-bold text-xl ml-2 text-secondary">
                {symbol}
              </span>
            </p>
            <p className="mb-3">
              Your remain time{" "}
              <span className="font-bold text-xl ml-2 text-secondary">
                {time}
              </span>
            </p>
            <Dropdown
              dropdownItems={NOTATIONS}
              dropdownValue={order}
              setDropdownValue={setOrder}
            />
            <Popover>
              <PopoverTrigger className="flex mt-3 ">
                <HelpCircle />
                <span className="ml-2 font-bold">Rules</span>
              </PopoverTrigger>
              <PopoverContent className="bg-[#fff] shadow">
                <div className="rounded-md">{RULES}</div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Card>
      <div className="flex flex-wrap gap-2 justify-end">
        {winner && isHost && (
          <Button variant="outline" onClick={handleClickRestart}>
            Restart
          </Button>
        )}
        {time === "0" && (
          <Button
            variant="ghost"
            disabled={!isYourTurn}
            onClick={handleClickSkip}
          >
            Skip
          </Button>
        )}
        <Button onClick={handleClickQuit}>Quit</Button>
      </div>
      <Dialog open={isOpenModal} onOpenChange={handleCancelModal}>
        <DialogContent className="sm:max-w-[425px] bg-slate-50">
          <DialogHeader>
            <DialogTitle>Game Result</DialogTitle>
            <DialogDescription>
              {symbol === winner ? "Victory!" : "Defeated"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-wrap gap-3">
            <Button onClick={handleCancelModal}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GameRoom;
