import dotenv from "dotenv";
dotenv.config();

import { generate } from "./chatbot.js";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

/* Chat endpoint */
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const result = await generate(message);

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