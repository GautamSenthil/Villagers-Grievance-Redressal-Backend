const express = require("express");
const textToSpeech = require("@google-cloud/text-to-speech");
const router = express.Router();

// Initialize Google Cloud Text-to-Speech client with ENV vars
const client = new textToSpeech.TextToSpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GOOGLE_PROJECT_ID,
});

console.log("🔐 Key first line:", process.env.GOOGLE_PRIVATE_KEY.split('\\n')[0]);
console.log("🛠️ Parsed key first line:", process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n').split('\n')[0]);

// Endpoint for converting text to speech
router.post("/speak", async (req, res) => {
  const { text } = req.body;  // Get the text from the request body

  // Check if text is provided
  if (!text || text.trim() === "") {
    return res.status(400).send("Text is required");
  }

  const request = {
    input: { text },  // The text to be converted into speech
    voice: {
      languageCode: "ta-IN",  // Tamil language code
      name: "ta-IN-Wavenet-A", // Voice name (choose a Tamil voice here)
    },
    audioConfig: {
      audioEncoding: "MP3", // The audio format to return
    },
  };

  try {
    // Request speech synthesis from Google Cloud Text-to-Speech API
    const [response] = await client.synthesizeSpeech(request);
    res.set("Content-Type", "audio/mpeg");  // Set response type to audio
    res.send(response.audioContent);  // Send the audio content to the client
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).send("Failed to generate speech");
  }
});

module.exports = router;
