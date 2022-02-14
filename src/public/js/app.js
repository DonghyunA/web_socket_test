const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const debug = document.getElementById("debug");


const call = document.getElementById("call");

call.hidden =true;
let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

const getCameras = async() => {
    try{
        const devices = navigator.mediaDevices.enumerateDevices();
        console.log(devices);
        const cameras = (await devices).filter(devices => devices.kind == "videoinput")
        const currentCamera = myStream.getVideoTracks()[0];
        cameras.forEach(camera=>{
            const option = document.createElement("option")
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if(currentCamera.label == camera.label){
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        })
        console.log(cameras);
    }catch(e)
    {
        console.log(e);
    }
}

const getMedia = async(deviceId) =>{
    const initialConstrains = {
        audio: true,
        // video: false, //{facingMode:"user"},
        video: {facingMode:"user"},
    };
    const cameraConstrains = {
        audio: true,
        // video: false,//{deviceId: {exact: deviceId}}
        video: {deviceId: {exact: deviceId}}
    }
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId? cameraConstrains : initialConstrains
        )
        debug.innerText = myStream;
        myFace.srcObject = myStream;
        if (!deviceId){
            await getCameras();
        }
        
    }catch(e){
        console.log(e);
    };
}
// getMedia();
const handleMuteClick = () => {
    console.log(myStream.getVideoTracks())
    myStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled
    });
    if(!muted){
        muteBtn.innerHTML = "Unmute";
        muted = true;
    }else{
        muteBtn.innerHTML = "Mute";
        muted = false;
    }
}
const handleCameraClick = () => {
    myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
    if (cameraOff){
        cameraBtn.innerText = "Turn Camera Off"
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On"
        cameraOff = true;
    }

}
const handleCameraChange = async() =>{
    await getMedia(camerasSelect.value);
    if (myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
}
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);


// Welcome
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const initCall = async()=>{
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection()
}
const handleWelcomeSubmit = async(event) => {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall()
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value = "";
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket

socket.on("welcome", async() => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    socket.emit("offer", offer, roomName);
})

socket.on("offer", async(offer) =>{
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);

})

socket.on("answer", answer => {
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", ice => {
    myPeerConnection.addIceCandidate(ice);
})
// RTC code
const handleIce = (data) => {
    socket.emit("ice", data.candidate, roomName);
}

const handleAddStream = (data) =>{
    const peersFace = document.getElementById("peersFace");
    peersFace.srcObject = data.stream;
}
function handleTrack(data) {
    console.log("handle track")
    const peerFace = document.querySelector("#peerFace")
    peerFace.srcObject = data.streams[0]
    }
const makeConnection = () => {
    myPeerConnection = new RTCPeerConnection({
        iceServers:[
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ],
            },
        ],
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    // myPeerConnection.addEventListener("addstream", handleAddStream);
    myPeerConnection.addEventListener("track", handleTrack);
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}