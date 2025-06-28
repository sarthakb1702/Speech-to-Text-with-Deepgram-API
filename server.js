import express from "express";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import { createClient } from "@deepgram/sdk";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

dotenv.config();

console.log("Using Deepgram key:", process.env.DEEPGRAM_API_KEY);

const app = express();
const port = 3000;

app.use(express.static("public"));

const wss = new WebSocketServer({ port: 8080 });

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

wss.on("connection", (clientSocket) => {
  console.log("Client connected");

  // buffer incoming WebM chunks
  const webmStream = new PassThrough();

  // decode to PCM with ffmpeg
  const pcmStream = new PassThrough();
  ffmpeg(webmStream)
    .inputFormat("webm")
    .audioCodec("pcm_s16le")
    .audioFrequency(16000)
    .format("s16le")
    .on("start", () => console.log("FFmpeg started"))
    .on("error", (err) => console.error("FFmpeg error:", err))
    .on("end", () => console.log("FFmpeg finished"))
    .pipe(pcmStream);

  // connect Deepgram
  const deepgramLive = deepgram.listen.live({
    model: "general-enhanced",
    language: "en",
    punctuate: true,
    encoding: "linear16",
    sample_rate: 16000,
    interim_results: true,
  });

  deepgramLive.on("open", () => {
    console.log("Connected to Deepgram");
  });

  deepgramLive.on("transcriptReceived", (data) => {
    console.log("Transcript from Deepgram:", JSON.stringify(data));
    clientSocket.send(JSON.stringify(data));
  });

  deepgramLive.on("error", (err) => {
    console.error("Deepgram error:", err);
  });

  deepgramLive.on("close", () => {
    console.log("Deepgram stream closed");
  });

  // pipe the PCM output from ffmpeg into Deepgram
  pcmStream.on("data", (chunk) => {
    if (deepgramLive.getReadyState() === 1) {
      deepgramLive.send(chunk);
    }
  });

  // when browser sends data, push to ffmpeg
  clientSocket.on("message", (data) => {
    console.log("Received WebM chunk of size:", data.length);
    webmStream.write(data);
  });

  clientSocket.on("close", () => {
    console.log("Client disconnected");
    webmStream.end();
    deepgramLive.finish();
  });
});

app.listen(port, () => {
  console.log(`HTTP server running on http://localhost:${port}`);
  console.log(`WebSocket proxy running on ws://localhost:8080`);
});
