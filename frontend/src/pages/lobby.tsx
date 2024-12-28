// import Modal from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import GlobalContext from "@/context/reducer/global";
import { EPage } from "@/context/type";
import { ListRestart } from "lucide-react";
import { ChangeEvent, useContext, useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { getAllRooms } from "@/api/rooms";
import { RoomListResponse } from "@/types/game-type";

const Lobby = () => {
  const { updatePage, updateHostStatus, updateRoomData } =
    useContext(GlobalContext);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomList, setRoomList] = useState<RoomListResponse[]>([]);

  useEffect(() => {
    fetchRoom();
  }, []);

  const fetchRoom = async () => {
    try {
      const response = await getAllRooms();
      setRoomList(response);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };

  const handleClickJoin = (roomId: string, roomName: string) => {
    updateRoomData({
      roomId: roomId,
      roomName: roomName,
    });
    updatePage(EPage.GAME_ROOM);
  };

  const handleClickCreateRoom = () => {
    setIsOpenModal(true);
  };

  const handleCancelModal = () => {
    setIsOpenModal(false);
  };

  const handleConfirmModal = () => {
    setIsOpenModal(false);
    updateHostStatus(true);
    const roomData = {
      roomName: roomName,
      roomId: "",
    };
    updateRoomData(roomData);
    updatePage(EPage.GAME_ROOM);
  };

  return (
    <div>
      <div>
        <div className="mb-5 flex justify-between">
          <h1 className="font-bold text-xl">Lobby</h1>
          <div className="p-[2px] hover:bg-gray rounded-sm">
            <ListRestart
              className="cursor-pointer"
              onClick={() => fetchRoom()}
            />
          </div>
        </div>
        <Card className="p-5 mb-5">
          <Table>
            <TableCaption>Click JOIN to play with your friend</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead className="w-[200px] text-center">Player</TableHead>
                <TableHead className="w-[100px] text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomList.length ? (
                roomList.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell className="text-center">
                      {room.player_number} / 2
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        disabled={room.player_number === 2}
                        onClick={() => handleClickJoin(room.id, roomName)}
                      >
                        JOIN
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="w-full flex justify-center">
                      Room Not Found
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
        <div className="flex justify-end">
          <Button onClick={handleClickCreateRoom} variant="outline">
            Create Room
          </Button>
        </div>
      </div>
      <Dialog open={isOpenModal} onOpenChange={handleCancelModal}>
        <DialogContent className="sm:max-w-[425px] bg-slate-50">
          <DialogHeader>
            <DialogTitle>Create Room</DialogTitle>
            <DialogDescription>
              Name your room and wait for your friend to join it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="roomname" className="text-right">
              Roomname
            </Label>
            <Input
              id="roomname"
              placeholder="Room Name"
              className="col-span-3"
              onChange={handleChangeInput}
            />
          </div>
          <DialogFooter className="flex-wrap gap-3">
            <Button variant="ghost" onClick={handleCancelModal}>
              Cancel
            </Button>
            <Button disabled={!roomName} onClick={handleConfirmModal}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Lobby;
