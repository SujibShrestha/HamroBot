import dotenv from "dotenv";
dotenv.config();

import { generate } from "./chatbot.js";
import express from "express";
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())

app.get("/", (req, res) => {
  res.send("API is running");
});

/* Chat endpoint */
app.post("/chat", async (req, res) => {
  try {
    const { message,threadId } = req.body;

    if (!message && !threadId) {
      return res.status(400).json({
        error: "Message and ThreadId is required",
      });
    }

    const result = await generate(message,threadId);

    res.status(200).json({
      response: result,
    });

  } catch (error) {
    console.error("Chat error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});