import express from "express";
import http from "http";
import WebSocket from "ws";
const app = express();

app.set('view engine', 'pug');
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"))
app.get("/*", (req, res) => res.redirect("/"))


const server = http.createServer(app);

const wss = new WebSocket.Server({server});
const sockets = [];
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon"
    console.log("connected to browser");
    socket.on("message", (msg)=>{
        const message = JSON.parse(msg);
        switch(message.type){
            case "new_message":
                sockets.forEach((sock)=>sock.send(`${socket["nickname"]}: ${message.payload}`));
                break;
            case "nickname":
                socket["nickname"] = message.payload;
                break;
        }
    
    });
});
server.listen(3000);