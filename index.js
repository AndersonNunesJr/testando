
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3001;

let ultimaJogada = "O";
let table = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

function verificarSeJogadaÉValida({ x, y, value }) {
  if (x < 0 || x > 2) return false;
  if (y < 0 || y > 2) return false;
  if (value !== "O" && value !== "X") return false;
  if (table[y][x] !== "") return false;
  return true;
}

function marcarNaTabela({ x, y, value }) {
  ultimaJogada = value;
  table[y][x] = value;
}

function verificarSeOJogoAcabou() {
  let isGameOver = false;
  let whoWon;
  if (
    table[0][0] !== "" &&
    table[0][1] !== "" &&
    table[0][2] !== "" &&
    table[1][0] !== "" &&
    table[1][1] !== "" &&
    table[1][2] !== "" &&
    table[2][0] !== "" &&
    table[2][1] !== "" &&
    table[2][2] !== ""
  ) {
    isGameOver = true;
    whoWon = "VELHA";
  }
  if (
    table[0][0] !== "" &&
    table[0][0] === table[0][1] &&
    table[0][1] === table[0][2]
  ) {
    isGameOver = true;
    whoWon = table[0][0];
  }
  if (
    table[1][0] !== "" &&
    table[1][0] === table[1][1] &&
    table[1][1] === table[1][2]
  ) {
    isGameOver = true;
    whoWon = table[1][0];
  }
  if (
    table[2][0] !== "" &&
    table[2][0] === table[2][1] &&
    table[2][1] === table[2][2]
  ) {
    isGameOver = true;
    whoWon = table[2][0];
  }
  if (
    table[0][0] !== "" &&
    table[0][0] === table[1][0] &&
    table[1][0] === table[2][0]
  ) {
    isGameOver = true;
    whoWon = table[0][0];
  }
  if (
    table[0][1] !== "" &&
    table[0][1] === table[1][1] &&
    table[1][1] === table[2][1]
  ) {
    isGameOver = true;
    whoWon = table[0][1];
  }
  if (
    table[0][2] !== "" &&
    table[0][2] === table[1][2] &&
    table[1][2] === table[2][2]
  ) {
    isGameOver = true;
    whoWon = table[0][2];
  }
  if (
    table[0][0] !== "" &&
    table[0][0] === table[1][1] &&
    table[1][1] === table[2][2]
  ) {
    isGameOver = true;
    whoWon = table[0][0];
  }
  if (
    table[0][2] !== "" &&
    table[0][2] === table[1][1] &&
    table[1][1] === table[2][0]
  ) {
    isGameOver = true;
    whoWon = table[0][2];
  }

  const gameOverMessage = isGameOver ? `O jogador ${whoWon} venceu!` : null;
  return [isGameOver, gameOverMessage];
}

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  const playerValue = io.of("/").sockets.size % 2 ? "X" : "O";
  io.to(socket.id).emit("player-value", playerValue);

  socket.on("play", ({ x, y, value }) => {
    if (ultimaJogada === value) {
      io.to(socket.id).emit("play-not-possible");
      return;
    }

    const canPlay = verificarSeJogadaÉValida({ x, y, value });

    if (canPlay) {
      marcarNaTabela({ x, y, value });
      io.emit("play", { x, y, value });

      const [isGameOver, gameOverMessage] = verificarSeOJogoAcabou();
      if(isGameOver) {
        io.emit("game-over", gameOverMessage);
      }

    }
  });
});

server.listen(port, () => {
  console.log(`listening on ${port}`);
});
