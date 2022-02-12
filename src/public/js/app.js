const socket = new WebSocket(`ws://${window.location.host}`);
const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");

const makeMessage = (type, payload) => {
    const msg = {type, payload}
    const encoded = JSON.stringify(msg);
    console.log(encoded);
    return encoded;
}


socket.addEventListener("open", (openEvent)=>{
    console.log("connected to Server : ", openEvent);
});

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerHTML = message.data;
    messageList.append(li);
});

socket.addEventListener("close", (closeEvent) =>{
    console.log("what is close event :", closeEvent);
});



const handleSubmit = (event) =>{
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value = "";
}
const handleNickSubmit = (event) =>{
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}


messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit)