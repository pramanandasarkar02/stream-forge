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