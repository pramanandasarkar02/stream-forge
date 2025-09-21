let mediaRecoder;
let recordedChunks = [];
let localStream = null;
let ws;
let videoWs;
let peerConnection = {};
let peerId = null;




document.addEventListener('DOMContentLoaded', ()=> {
    const videoElement = document.getElementById("self-video");
    const startBtn = document.getElementById("self-start-btn");
    const stopBtn = document.getElementById("self-stop-btn");
    const videoGrid = document.getElementById("video-grid");

    const startCamera = async () => {
        try{
            localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            videoElement.srcObject = localStream;
            
            if(videoWs && videoWs.readState == WebSocket.OPEN){
                videoWs.send(JSON.stringify({
                    type: "new-peer",
                    peerId: peerId
                }))
            }

            startBtn.disabled = true;
            stopBtn.disabled = false;
        } catch (error) {
            console.error("Error accessing camera:", error);
            document.getElementById("message").innerHTML += `<p>Error accessing camera: ${error.message}</p>`;
        }

    }

    const stopCamera = () => {
        if(localStream){
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }
        videoElement.srcObject = null;

        startBtn.disabled = false;
        stopBtn.disabled = true;
        

        if(videoWs && videoWs.readyState == WebSocket.OPEN) {
            videoWs.send(JSON.stringify({
                type: 'peer-disconnected',
                peerId: peerId
            }));
        }
    };

    startBtn.addEventListener('click', startCamera)
    stopBtn.addEventListener('click', stopCamera)
})



function chatConnect(){
    ws = new WebSocket("ws://localhost:8080/ws/chat")

    ws.onopen = function () {
        console.log("Connected to websocket server");
        let messageDisplay = document.getElementById("message");
        messageDisplay.innerHTML += `<p>Connected to websocket server</p>`;
        
    }

    ws.onmessage = function (event) {
        let messageDisplay = document.getElementById("message");
        messageDisplay.innerHTML += `<p>${event.data}</p>`;
    }

    ws.onclose = function () {
        console.log("Websocket connection closed, retrying");
        let messageDisplay = document.getElementById("message");
        messageDisplay.innerHTML += `<p>Websocket connection closed, retrying...</p>`;
        setTimeout(() => {
            connect
        }, 1000);
    }

    ws.onerror = function (err) {
        console.log("Websocket error: ", err);
        let messageDisplay = document.getElementById("message");
        messageDisplay.innerHTML += `<p>Error:  ${err}</p>`;
    }
}

function sendMessage() {
    let input = document.getElementById("message-input");
    let message = input.value;
    ws.send(message);
    input.value = "";
}

function videoConnect() {
    videoWs = new WebSocket("ws://localhost:8080/ws/video");
    peerId = "Hello";

    videoWs.onopen = () => {
        console.log("Connected to video websocket server");
        document.getElementById("message").innerHTML += `<p>Connected to video websocket server</p>`

        videoWs.send(JSON.stringify({
            type: 'new-peer',
            peerId: peerId
        }));
    }
    video.onmessage = async(event) => {
        const message = JSON.parse(event.data);

        
    }
}

chatConnect();
videoConnect();


