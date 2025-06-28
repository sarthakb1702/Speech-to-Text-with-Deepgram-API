const button = document.getElementById("record");
const textarea = document.getElementById("transcript");

let recording = false;
let mediaRecorder;
let socket;

button.addEventListener("click", () => {
  if (!recording) {
    startRecording();
    button.textContent = "Stop Recording";
  } else {
    stopRecording();
    button.textContent = "Start Recording";
  }
});

async function startRecording() {
  recording = true;
  textarea.value = "";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Microphone access granted");

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: "audio/webm; codecs=opus"
    });

    console.log("MediaRecorder mimeType is:", mediaRecorder.mimeType);

    socket = new WebSocket(`ws://localhost:8080`);

    socket.onopen = () => {
      console.log("Connected to local proxy server");
      mediaRecorder.start(250);
      console.log("MediaRecorder started");

      mediaRecorder.ondataavailable = (e) => {
        console.log("Audio chunk size:", e.data.size);
        if (socket.readyState === WebSocket.OPEN) {
          console.log("Sending audio chunk to server");
          socket.send(e.data);
        }
      };
    };

    socket.onmessage = (message) => {
      console.log("Message from server:", message.data);
      try {
        const data = JSON.parse(message.data);
        const transcript = data.channel?.alternatives[0]?.transcript;
        if (transcript) {
          textarea.value += transcript + "\n";
        }
      } catch (err) {
        console.error("Failed to parse server message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => console.log("Proxy socket closed");
  } catch (err) {
    console.error("Could not access microphone:", err);
    alert("Microphone permission is required for transcription.");
  }
}

function stopRecording() {
  recording = false;
  mediaRecorder.stop();
  socket.close();
  console.log("Recording stopped");
}
