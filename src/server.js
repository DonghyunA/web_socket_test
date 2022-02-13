import express from "express";
import http from "http";
import {Server} from "socket.io"
import { instrument } from "@socket.io/admin-ui";
// import WebSocket from "ws";
const app = express();

app.set('view engine', 'pug');
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"))
app.get("/*", (req, res) => res.redirect("/"))


const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
    cors: {
      origin: ["https://admin.socket.io"],
      credentials: true
    }
  });
  instrument(wsServer, {
    auth: false
  });
const getPublicRooms = () => {
    const sids = wsServer.sockets.adapter.sids;
    const rooms = wsServer.sockets.adapter.rooms;

    const publicRooms = [];
    rooms.forEach((_,key) => {
        if (sids.get(key) === undefined){
            publicRooms.push(key)
        }
    })
    return publicRooms
}
const countRoom = (roomName) =>{
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}
wsServer.on("connection", socket => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
        console.log(`socket event : ${event}`);
    });
    socket.on("enter_room", (roomName, done)=>{
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", getPublicRooms());
    });
    socket.on("disconnecting", ()=>{
        socket.rooms.forEach(room => {
            socket.to(room).emit("bye", socket.nickname, countRoom(room)-1);
        });
    })
    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room_change", getPublicRooms());
    })
    socket.on("new_message", (msg, room, done)=>{
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    })
    socket.on("nickname", nickname => {
        socket["nickname"] = nickname;
    })
})



// const wss = new WebSocket.Server({server});

// const sockets = [];
// wss.on("connection", (socket) => {
//     sockets.push(socket);
//     socket["nickname"] = "Anon"
//     console.log("connected to browser");
//     socket.on("message", (msg)=>{
//         const message = JSON.parse(msg);
//         switch(message.type){
//             case "new_message":
//                 sockets.forEach((sock)=>sock.send(`${socket["nickname"]}: ${message.payload}`));
//                 break;
//             case "nickname":
//                 socket["nickname"] = message.payload;
//                 break;
//         }
    
//     });
// });
httpServer.listen(3000);