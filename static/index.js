let mediaRecoder;
let recordedChunks = [];


document.addEventListener('DOMContentLoaded', ()=> {
    const videoElement = document.getElementById("self-video");
    const startBtn = document.getElementById("self-start-btn");
    const stopBtn = document.getElementById("self-stop-btn");
    const downloadBtn = document.getElementById("download-btn");



    const startCamera = async () => {
        try{
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            videoElement.srcObject = stream;
            // mediaRecoder = new MediaRecorder(stream)

            // send the video stream to the backend 



            startBtn.disabled = true;
            stopBtn.disabled = false;
        } catch (error) {

        }

    }

    const stopCamera = () => {
        if (videoElement.srcObject) {
          videoElement.srcObject.getTracks().forEach(track => track.stop());
          videoElement.srcObject = null;
        }
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }

    startBtn.addEventListener('click', startCamera)
    stopBtn.addEventListener('click', stopCamera)
})



let ws;
let videoWs;
function chatConnect(){
    ws = new WebSocket("ws://localhost:8080/ws")

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

}

chatConnect();
videoConnect();

