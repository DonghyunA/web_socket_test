const socket = io();

const welcome = document.getElementById("welcome");
const nickForm = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

const addMessage = (message) => {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerHTML = message;
    ul.appendChild(li);
}

const handleMessageSubmit = (event) => {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value
    socket.emit("new_message", input.value, roomName, ()=>{
        addMessage(`you: ${value}`);
    });
    input.value = ""
}
const handleNicknameSubmit = (event) => {
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
} 
const showRoom = () => {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgform = room.querySelector("#msg");
    const nameform = room.querySelector("#name");
    msgform.addEventListener("submit", handleMessageSubmit)
    nameform.addEventListener("submit", handleNicknameSubmit)
}
const handleRoomSubmit = (event) => {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    console.log(input.value);
    socket.emit("enter_room", input.value, showRoom);
    roomName = input.value;
    input.value = ""
}
nickForm.addEventListener("submit", handleRoomSubmit);
socket.on("welcome", (user, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}(${newCount})`;
    addMessage(`${user} joined!`);
});
socket.on("bye", (user, newCount)=>{
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}(${newCount})`;
    addMessage(`${user} left ㅠㅠ`);
})
socket.on("new_message", addMessage);
socket.on("room_change", (rooms)=>{
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0){
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerHTML = room;
        roomList.append(li);
    })
})