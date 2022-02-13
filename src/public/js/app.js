const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");


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
        const cameras = (await devices).filter(devices => devices.kind == "audioinput")
        const currentCamera = myStream.getAudioTracks()[0];
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
        video: false, //{facingMode:"user"},
        // video: {facingMode:"user"},
    };
    const cameraConstrains = {
        audio:true,
        video: false,//{deviceId: {exact: deviceId}}
        // video: {deviceId: {exact: deviceId}}
    }
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId? cameraConstrains : initialConstrains
        )
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
    console.log(myStream.getAudioTracks())
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
    console.log(myStream.getAudioTracks())
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
// RTC code

const makeConnection = () => {
    myPeerConnection = new RTCPeerConnection();
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));
}