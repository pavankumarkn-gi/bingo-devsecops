const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const rooms = new Map();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  io.on("connection", (socket) => {
    socket.on("join-room", ({ room, name }) => {
      socket.join(room);
      if (!rooms.has(room)) {
        rooms.set(room, { players: [], calledNumbers: [] });
      }
      const roomData = rooms.get(room);
      const existingPlayer = roomData.players.find((p) => p.id === socket.id);
      if (!existingPlayer) {
        roomData.players.push({ id: socket.id, name });
      }

      io.to(room).emit("update-players", roomData.players);
      io.to(room).emit("update-called-numbers", roomData.calledNumbers);
      io.to(room).emit("chat-message", {
        user: "System",
        text: `${name} joined room ${room}`
      });
    });

    socket.on("call-number", ({ room, number }) => {
      const roomData = rooms.get(room);
      if (roomData && !roomData.calledNumbers.includes(number)) {
        roomData.calledNumbers.push(number);
        io.to(room).emit("update-called-numbers", roomData.calledNumbers);
      }
    });

    socket.on("send-message", ({ room, user, text }) => {
      io.to(room).emit("chat-message", { user, text });
    });

    socket.on("disconnect", () => {
      for (const [room, data] of rooms.entries()) {
        const index = data.players.findIndex((p) => p.id === socket.id);
        if (index !== -1) {
          const removed = data.players.splice(index, 1)[0];
          io.to(room).emit("update-players", data.players);
          io.to(room).emit("chat-message", {
            user: "System",
            text: `${removed.name} left the room.`
          });
          if (data.players.length === 0) {
            rooms.delete(room);
          }
          break;
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Bingo server ready on http://localhost:${port}`);
  });
});
