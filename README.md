# Real-Time Speech-to-Text Transcription with Deepgram

This project is a web-based real-time speech-to-text application using the Deepgram API. It captures microphone audio from the user’s browser, sends it through a Node.js WebSocket proxy, converts the audio stream to Deepgram’s expected format with FFmpeg, and displays live transcriptions.

## Features

✅ Browser-based microphone recording  
✅ Real-time transcription with Deepgram’s streaming API  
✅ WebSocket proxy server for local audio forwarding  
✅ Audio conversion handled seamlessly with FFmpeg  
✅ Simple and clean user interface  

---

## Requirements

- Node.js (18+ recommended)  
- FFmpeg installed and added to PATH  
- Deepgram account + API key  
- Modern web browser (Chrome, Edge, or Firefox)

---

## Installation

1. Clone this repository  
   ```bash
   git clone https://github.com/yourusername/speech-to-text-deepgram.git
   cd speech-to-text-deepgram
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Add your Deepgram API key to a .env file:
   ```bash
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   ```
4.Start the server
  ```
  node server.js
  ```
5.Open http://localhost:3000 in your browser.
