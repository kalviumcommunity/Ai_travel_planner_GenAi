import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Gemini setup
const genAI = new GoogleGenerativeAI("AIzaSyBoeeXzsyozaJw7DaePQy0Uxh2Y2B8KIT0");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Route
app.post("/api/plan", async (req, res) => {
  try {
    const { destination, days, interests } = req.body;

    if (!destination || !days) {
      return res.status(400).json({ error: "Destination and days are required" });
    }

    const prompt = `
    Create a detailed travel itinerary for a trip.
    Destination: ${destination}
    Duration: ${days} days
    Interests: ${interests || "General sightseeing"}
    Format it day by day with highlights and recommendations.
    `;

    const result = await model.generateContent(prompt);
    const aiText = result.response.text();

    res.json({ plan: aiText });
  } catch (err) {
    console.error("Error generating plan:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
