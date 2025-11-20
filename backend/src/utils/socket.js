let io = null;

export function initSocket(serverIo) {
  io = serverIo;
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // optionally join rooms by department or user id
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

// send to room
export function emitToRoom(room, event, payload){
  if(!io) return;
  io.to(room).emit(event, payload);
}

// send globally
export function emitGlobal(event, payload){
  if(!io) return;
  io.emit(event, payload);
}
