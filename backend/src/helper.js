const db = require("../db/connection");

const checkWinner = (boardLayout) => {
  if (
    (boardLayout[0][1][0] === boardLayout[1][1][0] &&
      boardLayout[1][1][0] === boardLayout[2][1][0]) ||
    (boardLayout[0][0][0] === boardLayout[1][1][0] &&
      boardLayout[1][1][0] === boardLayout[2][2][0]) ||
    (boardLayout[0][2][0] === boardLayout[1][1][0] &&
      boardLayout[1][1][0] === boardLayout[2][0][0]) ||
    (boardLayout[1][0][0] === boardLayout[1][1][0] &&
      boardLayout[1][1][0] === boardLayout[1][2][0])
  ) {
    return boardLayout[1][1][0];
  } else if (
    (boardLayout[0][0][0] === boardLayout[0][1][0] &&
      boardLayout[0][0][0] === boardLayout[0][2][0]) ||
    (boardLayout[0][0][0] === boardLayout[1][0][0] &&
      boardLayout[0][0][0] === boardLayout[2][0][0])
  ) {
    return boardLayout[0][0][0];
  } else if (
    (boardLayout[2][2][0] === boardLayout[0][2][0] &&
      boardLayout[2][2][0] === boardLayout[1][2][0]) ||
    (boardLayout[2][2][0] === boardLayout[2][0][0] &&
      boardLayout[2][2][0] === boardLayout[2][1][0])
  ) {
    return boardLayout[2][2][0];
  }
  return "";
};

const TEMPLATE_BOARD = [
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
];

const FIRST_PLAYER_SYSBOL = "X";
const FIRST_PLAYER_TIME = 55;
const SECOND_PLAYER_TIME = 60;

const getRandomSymbol = () => {
  return Math.floor(Math.random() * 2) ? "X" : "O";
};

const setUpNewGame = () => {
  const hostSymbol = getRandomSymbol();
  const hostTime =
    hostSymbol === FIRST_PLAYER_SYSBOL ? FIRST_PLAYER_TIME : SECOND_PLAYER_TIME;
  const oppTime =
    hostSymbol === FIRST_PLAYER_SYSBOL ? SECOND_PLAYER_TIME : FIRST_PLAYER_TIME;
  const boardString = JSON.stringify(TEMPLATE_BOARD);
  return {
    hostSymbol,
    hostTime,
    oppTime,
    boardString,
  };
};

const createRoom = (room, callback) => {
  const { id, name } = room;

  db.serialize(() => {
    db.run(
      `INSERT INTO rooms (id, name, player_number) VALUES (?, ?, ?)`,
      [id, name, 1],
      (err) => {
        if (err) {
          console.error("Error inserting room:", err.message);
          callback(null);
        } else {
          console.log("Room inserted successfully.");
        }
      }
    );

    const { boardString, hostSymbol, hostTime, oppTime } = setUpNewGame();

    db.run(
      `INSERT INTO board_details (room_id, board, host_symbol, current_turn, host_time, opp_time) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, boardString, hostSymbol, FIRST_PLAYER_SYSBOL, hostTime, oppTime],
      (err) => {
        if (err) {
          console.error("Error inserting board detail:", err.message);
          callback(null);
        } else {
          console.log("Board detail inserted successfully.");

          const response = {
            board: TEMPLATE_BOARD,
            host_symbol: hostSymbol,
            current_turn: FIRST_PLAYER_SYSBOL,
            host_time: hostTime.toString(),
            opp_time: oppTime.toString(),
            winner: "",
            room_id: "",
          };
          callback(response);
        }
      }
    );
  });
};

const joinRoom = (id, callback) => {
  const query = `UPDATE rooms SET player_number = 2 WHERE id = ?`;

  db.run(query, [id], (err) => {
    if (err) {
      console.error("Error updating room:", err.message);
      callback(err);
    } else {
      console.log("Room updated successfully.");
      callback(null);
    }
  });
};

const updateGameData = (data, callback) => {
  const { host_id, symbol, order, position } = data;
  const query = `SELECT board, host_symbol, current_turn, host_time, opp_time FROM board_details WHERE room_id = ?`;
  db.get(query, [host_id], (err, row) => {
    if (err) {
      console.error("Error fetching board:", err.message);
      callback(null);
    } else {
      if (row) {
        const board = JSON.parse(row.board);
        let hostTime = row.host_time;
        let oppTime = row.opp_time;
        if (symbol && order && position) {
          board[position[0]][position[1]] = [symbol, order];
          if (row.host_symbol === symbol) {
            hostTime -= parseInt(order);
          } else {
            oppTime -= parseInt(order);
          }
        }
        const currentTurn = row.current_turn === "X" ? "O" : "X";
        const boardString = JSON.stringify(board);
        db.run(
          `UPDATE board_details SET board = ?, current_turn = ?, host_time = ?, opp_time = ? WHERE room_id = ?`,
          [boardString, currentTurn, hostTime, oppTime, host_id],
          (err) => {
            if (err) {
              console.error("Error updating board detail:", err.message);
              callback(null);
            } else {
              console.log("Board detail updated successfully.");
              let winner = checkWinner(board);
              if (hostTime < 0) {
                winner = row.host_symbol === "X" ? "O" : "X";
              }
              if (oppTime < 0) {
                winner = row.host_symbol;
              }
              const response = {
                board: board,
                current_turn: currentTurn,
                host_time: hostTime.toString(),
                opp_time: oppTime.toString(),
                winner: winner,
              };
              callback(response);
            }
          }
        );
      }
    }
  });
};

const getGameData = (roomId, callback) => {
  const query = `SELECT board, host_symbol, current_turn, host_time, opp_time FROM board_details WHERE room_id = ?`;

  db.get(query, [roomId], (err, row) => {
    if (err) {
      console.error("Error fetching board:", err.message);
      callback(null);
    } else {
      if (row) {
        const board = JSON.parse(row.board);
        const response = {
          board: board,
          host_symbol: row.host_symbol,
          current_turn: row.current_turn,
          host_time: row.host_time.toString(),
          opp_time: row.opp_time.toString(),
          winner: checkWinner(board),
        };
        callback(response);
      } else {
        callback(null);
      }
    }
  });
};

const restartGame = (roomId, callback) => {
  const query = `UPDATE board_details SET board = ?, host_symbol = ?, current_turn = ?, host_time = ?, opp_time = ?  WHERE room_id = ?`;

  const { boardString, hostSymbol, hostTime, oppTime } = setUpNewGame();

  db.run(
    query,
    [boardString, hostSymbol, FIRST_PLAYER_SYSBOL, hostTime, oppTime, roomId],
    (err) => {
      if (err) {
        console.error("Error updating room:", err.message);
        callback(err);
      } else {
        console.log("Room updated successfully.");
        callback(null);
      }
    }
  );
};

const deleteRoom = (roomId) => {
  db.serialize(() => {
    db.run("DELETE FROM rooms WHERE id = ?", [roomId], (err) => {
      if (err) {
        console.error("Error deleting room:", err.message);
      } else {
        console.log(`Room ${roomId} deleted.`);
      }
    });

    db.run("DELETE FROM board_details WHERE room_id = ?", [roomId], (err) => {
      if (err) {
        console.error("Error deleting board details:", err.message);
      } else {
        console.log(`Board details for room ${roomId} deleted.`);
      }
    });
  });
};

module.exports = {
  createRoom,
  getGameData,
  joinRoom,
  updateGameData,
  deleteRoom,
  restartGame,
};
