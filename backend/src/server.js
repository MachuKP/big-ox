const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const db = require("../db/connection");
const {
  createRoom,
  joinRoom,
  updateGameData,
  deleteRoom,
  getGameData,
  restartGame,
} = require("./helper");

const app = express();

const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const generateRoomName = (roomId) => {
  return `${roomId}_room`;
};

app.get("/rooms", (req, res) => {
  const query = `SELECT * FROM rooms`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching rooms:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Create Game
  socket.on("createGame", (data) => {
    const roomName = generateRoomName(socket.id);
    socket.join(roomName);
    createRoom({ id: roomName, name: data.room_name }, (boardDetail) => {
      if (boardDetail) {
        boardDetail.room_id = roomName;
        // send to self
        socket.emit("gameCreated", { boardDetail });
      } else {
        terminateRoom(socket, "Error is occured. Please try again.");
      }
    });
  });

  // Join Game
  socket.on("joinGame", (room_id) => {
    // Check if room id is existed
    if (socket.adapter.rooms.has(room_id)) {
      socket.join(room_id);
      joinRoom(room_id, (err) => {
        if (err) terminateRoom(socket, "Error is occured. Please try again.");
      });
      console.log(`Player ${socket.id} joined room: ${room_id}`);
      getGameData(room_id, (boardDetail) => {
        if (boardDetail) {
          socket.emit("joinedGame", { boardDetail });
          // io.to(room).emit(event) send to everyone in the room
          // send to everyone in the room except sender same
          // socket.broadcast.emit(event) use to send to everyone except self
          socket.to(room_id).emit("gameReady");
        } else {
          terminateRoom(socket, "Error is occured. Please try again.");
        }
      });
    } else {
      terminateRoom(socket, "This room is not existed.");
    }
  });

  socket.on("playerMove", (data) => {
    updateGameData(data, (boardDetail) => {
      if (boardDetail) {
        // send to everyone in the room except sender
        socket.to(data.host_id).emit("opponentMove", { boardDetail });
        if (boardDetail.winner)
          socket.emit("gameEnded", { winner: boardDetail.winner });
      } else {
        terminateRoom(socket, "Error is occured. Please try again.");
      }
    });
  });

  socket.on("skipMove", (host_id) => {
    const skipData = {
      host_id: host_id,
      symbol: null,
      order: null,
      position: null,
    };
    updateGameData(skipData, (boardDetail) => {
      if (boardDetail) {
        socket.to(host_id).emit("opponentMove", { boardDetail });
      } else {
        terminateRoom(socket, "Error is occured. Please try again.");
      }
    });
  });

  socket.on("restartGame", () => {
    restartGame(generateRoomName(socket.id), (err) => {
      if (err)
        return terminateRoom(socket, "Error is occured. Please try again.");

      getGameData(generateRoomName(socket.id), (boardDetail) => {
        if (boardDetail) {
          io.to(generateRoomName(socket.id)).emit("gameRestarted", {
            boardDetail,
          });
        } else {
          terminateRoom(socket, "Error is occured. Please try again.");
        }
      });
    });
  });

  socket.on("disconnecting", () => {
    const rooms = Array.from(socket.rooms).filter(
      (roomId) => roomId !== socket.id
    );
    db.run(
      `UPDATE rooms SET player_number = 1 WHERE id = ?`,
      [rooms[0]],
      (err) => {
        if (err) {
          console.error("Error updating room:", err.message);
        } else {
          console.log("Room updated successfully.");
        }
      }
    );
  });

  socket.on("disconnect", () => {
    console.log(`Player disconnected: ${socket.id}`);
    const query = `SELECT id FROM rooms WHERE id = ?`;

    db.get(query, [generateRoomName(socket.id)], (err, row) => {
      if (err) {
        console.error("Error querying room:", err.message);
        return;
      }

      if (row) {
        const roomId = row.id;

        terminateRoom(
          socket,
          "The host has disconnected. You have been removed from the room."
        );

        deleteRoom(roomId);
      }
    });
  });
});

const terminateRoom = (socket, message) => {
  // send to everyone in room
  io.in(socket.id).emit("roomClosed", {
    message: message,
  });
  io.in(socket.id).socketsLeave(socket.id);
};

server.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});

const shutdown = () => {
  console.log("\nShutting down server...");

  // Close database connection
  db.close((err) => {
    if (err) {
      console.error("Error closing the database:", err.message);
    } else {
      console.log("Database connection closed.");
    }

    // Stop the server
    server.close(() => {
      console.log("Server stopped.");
      process.exit(0);
    });
  });
};

process.on("SIGINT", shutdown); // Triggered by Ctrl+C
process.on("SIGTERM", shutdown); // Triggered by process managers
