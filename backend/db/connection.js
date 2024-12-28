const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "game.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS rooms (
         id TEXT PRIMARY KEY,
         name TEXT NOT NULL,
         player_number INTEGER NOT NULL
       )`,
    (err) => {
      if (err) {
        console.error("Error creating 'rooms' table:", err.message);
      } else {
        console.log("'rooms' table created successfully.");
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS board_details (
         room_id TEXT NOT NULL,
         board TEXT NOT NULL,
         host_symbol TEXT NOT NULL,
         current_turn TEXT NOT NULL,
         host_time INTEGER NOT NULL,
         opp_time INTEGER NOT NULL,
         FOREIGN KEY (room_id) REFERENCES rooms (id)
       )`,
    (err) => {
      if (err) {
        console.error("Error creating 'board_details' table:", err.message);
      } else {
        console.log("'board_details' table created successfully.");
      }
    }
  );
});

module.exports = db;
