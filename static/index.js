// let mediaRecoder;
// let recordedChunks = [];
// let localStream = null;
// let ws;
// let videoWs;
// let peerConnection = {};
// let peerId = null;




// document.addEventListener('DOMContentLoaded', ()=> {
//     const videoElement = document.getElementById("self-video");
//     const startBtn = document.getElementById("self-start-btn");
//     const stopBtn = document.getElementById("self-stop-btn");
//     const videoGrid = document.getElementById("video-grid");

//     const startCamera = async () => {
//         try{
//             localStream = await navigator.mediaDevices.getUserMedia({
//                 video: true,
//                 audio: true
//             });
//             videoElement.srcObject = localStream;
            
//             if(videoWs && videoWs.readState == WebSocket.OPEN){
//                 videoWs.send(JSON.stringify({
//                     type: "new-peer",
//                     peerId: peerId
//                 }))
//             }

//             startBtn.disabled = true;
//             stopBtn.disabled = false;
//         } catch (error) {
//             console.error("Error accessing camera:", error);
//             document.getElementById("message").innerHTML += `<p>Error accessing camera: ${error.message}</p>`;
//         }

//     }

//     const stopCamera = () => {
//         if(localStream){
//             localStream.getTracks().forEach(track => track.stop());
//             localStream = null;
//         }
//         videoElement.srcObject = null;

//         startBtn.disabled = false;
//         stopBtn.disabled = true;
        

//         if(videoWs && videoWs.readyState == WebSocket.OPEN) {
//             videoWs.send(JSON.stringify({
//                 type: 'peer-disconnected',
//                 peerId: peerId
//             }));
//         }
//     };

//     startBtn.addEventListener('click', startCamera)
//     stopBtn.addEventListener('click', stopCamera)
// })



// function chatConnect(){
//     ws = new WebSocket("ws://localhost:8080/ws/chat")

//     ws.onopen = function () {
//         console.log("Connected to websocket server");
//         let messageDisplay = document.getElementById("message");
//         messageDisplay.innerHTML += `<p>Connected to websocket server</p>`;
        
//     }

//     ws.onmessage = function (event) {
//         let messageDisplay = document.getElementById("message");
//         messageDisplay.innerHTML += `<p>${event.data}</p>`;
//     }

//     ws.onclose = function () {
//         console.log("Websocket connection closed, retrying");
//         let messageDisplay = document.getElementById("message");
//         messageDisplay.innerHTML += `<p>Websocket connection closed, retrying...</p>`;
//         setTimeout(() => {
//             connect
//         }, 1000);
//     }

//     ws.onerror = function (err) {
//         console.log("Websocket error: ", err);
//         let messageDisplay = document.getElementById("message");
//         messageDisplay.innerHTML += `<p>Error:  ${err}</p>`;
//     }
// }

// function sendMessage() {
//     let input = document.getElementById("message-input");
//     let message = input.value;
//     ws.send(message);
//     input.value = "";
// }

// function videoConnect() {
//     videoWs = new WebSocket("ws://localhost:8080/ws/video");
//     peerId = "Hello";

//     videoWs.onopen = () => {
//         console.log("Connected to video websocket server");
//         document.getElementById("message").innerHTML += `<p>Connected to video websocket server</p>`

//         videoWs.send(JSON.stringify({
//             type: 'new-peer',
//             peerId: peerId
//         }));
//     }
//     video.onmessage = async(event) => {
//         const message = JSON.parse(event.data);

        
//     }
// }

// chatConnect();
// videoConnect();






class VideoStreamer {
    constructor() {
        this.ws = null;
        this.localStream = null;
        this.isHost = false;
        this.peerId = false;
        this.viewers = new Set()

        this.localVideo = document.getElementById('localVideo');
        this.connectBtn = document.getElementById("connectBtn");
        this.startStreamBtn = document.getElementById("startStreamBtn");
        this.stopStreamBtn = document.getElementById("stopStreamBtn");
        this.joinStreamBtn = document.getElementById("joinStreamBtn");
        this.status = document.getElementById("status");
        this.viewersCount = document.getElementById("viewersCount");
        this.remoteVideos = document.getElementById("remoteVideos");

        this.setUpEventListeners();
        this.canvas = null;
        this.canvasContext = null;
        this.videoInterval = null;

    }

    setUpEventListeners(){
        this.connectBtn.addEventListener("click", ()=> this.connect());
        this.startStreamBtn.addEventListener("click", () => this.startStream());
        this.stopStreamBtn.addEventListener("click", ()=> this.stopStream());
        this.joinStreamBtn.addEventListener("click", ()=> this.joinAsViewer());
    }

    connect() {
        const wsProtocol = window.location.protocol === "https:"? "wss:" :"ws:";
        const wsUrl = `${wsProtocol}//${window.location.host}/ws?clienId=${this.generateClientId}`
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
            this.updateStatus("Connected", "connected");
            this.connectBtn.disabled = true;
            this.startStreamBtn.disabled = false;
            this.joinStreamBtn.disabled = false;
        }

        this.ws.onclose = () => {
            this.updateStatus("Disconnected", "disconnected")
            this.connectBtn.disabled = false;
            this.startStreamBtn.disabled = true;
            this.stopStreamBtn.disabled = true;
            this.joinStreamBtn.disabled = true;
        }

        this.ws.onerror = (error) => {
            console.log("Websocket error: ", error)
            this.updateStatus("WebSocket  error: ", error)
        }
        this.ws.onmessage = (event) => {
            this.handleMessage(JSON.parse(event.data))
        }
    }
    generateClientId() {
        this.clientId = "client_" + Math.random.toString().substring(2, 9);
        return this.clientId;
    }

    updateStatus(message, className){
        this.status.textContent = message;
        this.status.className = `status ${className}`
    }

    async startStream() {
        try{
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: {width:640, height: 480, frameRate: 15},
                audio: true
            })
            this.localVideo.srcObject = this.localStream;
            this.isStreaming = true;
            this.ishost = true;

            this.setupCanvas();
            this.startVideoCapture();

            this.startStreamBtn.disabled = true;
            this.stopStreamBtn.disabled = false;
            this.startStreamBtn.classList.add("streaming");
            this.updateStatus("Streaming Live", "connected")
        } catch(err){
            console.log("Error strating stream", err);
            alert("error to start live stream");
        }
    }

    setupCanvas() {
        this.canvas = document.getElementById("canvas");
        this.canvas.width = 320;
        this.canvas.height = 240;
        this.canvasContext = this.canvas.getContext('2d'); 
    }


    startVideocapture() {
        this.videoInterval == setInterval(()=> {
            if(this.isStreaming && this.localStream) {
                this.captureAndSendFrame()
            }
        }, 100);
    }

    captureAndSendFrame() {
        if(!this.localVideo.videoWidth || !this.localVideo.videoHeight) return;
        this.canvasContext.drawImage(this.localVideo, 0, 0, this.canvas.width, this.canvas.height);

        this.canvas.toBlob((blob)=> {
            if(blob && this.ws.readyState == WebSocket.OPEN){
                const reader = new FileReader;
                reader.onload = () => {
                    const message = {
                        type: "video-data",
                        data: {
                            frame: reader.result,
                            timestamp: Date.now()
                        }
                    };
                    this.ws.send(JSON.stringify(message))
                };
                reader.readAsDataURL(blob)
            }

        }, "image/jpeg", 0.7)

    }

    stopStream() {
        if(this.localStream){
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        if(this.videoInterval){
            clearInterval(this.videoInterval);
            this.videoInterval = null;
        }
        this.isStreaming = false;
        this.isHost = false;
        this.localVideo.srcObject = null;

        this.startStreamBtn.disabled = false;
        this.stopStreamBtn.disabled = true;
        this.startStreamBtn.classList.remove("streaming");
        this.updateStatus("stream stopped", "connected");
    }

    joinAsViewer(){
        this.isHost = false;
        this.updateStatus("joined as viewer", "connected");
        this.startStreamBtn.disabled == true;
        this.joinStreamBtn.disabled = true;
    }

    handleMessage(message){
        switch (message.type){
            case "connected":
                this.clientId = message.data.clientId;
                this.isHost = message.data.isHost;
                break;
            case "video-data":
                if (!this.isHost && message.from !== this.clientId){
                    this.displayRemoteVideo(message.from, message.data.frame);
                }
                break;
            case "viewer-joined":
                this.viewers.add(message.from)
                this.updateViewersCount();
                break;

            case "viewer-left":
                this.viewers.dalete(message.from);
                this.updateViewersCount();
                this.removeRemoteVideo(message.from);
                break;
            default:
                console.log("Unknown message type: ", message.type);
        }
    }

    displayRemoteVideo(clientId, frameData) {
        let videoContainer = document.getElementById(`remote-${clientId}`);
        
        if (!videoContainer) {
            videoContainer = document.createElement('div');
            videoContainer.id = `remote-${clientId}`;
            videoContainer.className = 'remote-video';
            
            const img = document.createElement('img');
            img.style.width = '100%';
            img.style.height = '150px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '10px';
            img.style.background = '#000';
            
            const clientLabel = document.createElement('div');
            clientLabel.className = 'client-id';
            clientLabel.textContent = `Stream from: ${clientId}`;
            
            videoContainer.appendChild(img);
            videoContainer.appendChild(clientLabel);
            this.remoteVideos.appendChild(videoContainer);
        }
        
        const img = videoContainer.querySelector('img');
        img.src = frameData;
    }

    removeRemoteVideo(clientId) {
        const videoContainer = document.getElementById(`remote-${clientId}`);
        if (videoContainer) {
            videoContainer.remove();
        }
    }

    updateViewersCount() {
        this.viewersCount.textContent = `Viewers: ${this.viewers.size}`;
    }

}

const videostreamer = new VideoStreamer();