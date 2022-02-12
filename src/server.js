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
const do_connect = (socket) => {
    console.log(socket);
}
wss.on("connection", do_connect)
server.listen(3000);