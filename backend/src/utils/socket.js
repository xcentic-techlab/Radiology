let io = null;

export function initSocket(serverIo) {
  io = serverIo;
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    socket.on("joinRoom", ({ room }) => {
      socket.join(room);
    });

    socket.on("leaveRoom", ({ room }) => {
      socket.leave(room);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}

export function emitToRoom(room, event, payload){
  if(!io) return;
  io.to(room).emit(event, payload);
}

export function emitGlobal(event, payload){
  if(!io) return;
  io.emit(event, payload);
}
