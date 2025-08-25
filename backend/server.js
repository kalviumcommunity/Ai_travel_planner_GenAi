// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import bodyParser from "body-parser";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// dotenv.config();

// const app = express();
// const PORT = 5000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Gemini setup
// const genAI = new GoogleGenerativeAI("AIzaSyBoeeXzsyozaJw7DaePQy0Uxh2Y2B8KIT0");
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// // Route
// app.post("/api/plan", async (req, res) => {
//   try {
//     const { destination, days, interests } = req.body;

//     if (!destination || !days) {
//       return res.status(400).json({ error: "Destination and days are required" });
//     }

//     const prompt = `
//     Create a detailed travel itinerary for a trip.
//     Destination: ${destination}
//     Duration: ${days} days
//     Interests: ${interests || "General sightseeing"}
//     Format it day by day with highlights and recommendations.
//     `;

//     const result = await model.generateContent(prompt);
//     const aiText = result.response.text();

//     res.json({ plan: aiText });
//   } catch (err) {
//     console.error("Error generating plan:", err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });


// backend/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/plan", async (req, res) => {
  const { destination, days, interests } = req.body;

  if (!destination || !days) {
    return res.status(400).json({ error: "Destination and days are required" });
  }

  try {
    // Create model instance with parameters
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,   // adds creativity
        topK: 40,          // considers top 40 tokens
        topP: 0.9,         // nucleus sampling (90% prob mass)
        maxOutputTokens: 500, // control length
      },
    });

    // System + User Prompting
    const prompt = `
System Prompt:
You are an AI Travel Planner. 
Always return itineraries in a structured JSON format with days and activities. 
Do not use bullet points, stars, or extra formatting.

User Prompt:
Plan a ${days}-day trip to ${destination}.
User interests: ${interests || "general sightseeing"}.

Output Format (STRICT):
{
  "trip": [
    { "day": 1, "activities": ["...","..."] },
    { "day": 2, "activities": ["...","..."] }
  ]
}
    `;

    // Generate response
    const result = await model.generateContent(prompt);

    const responseText = result.response.text();

    // Token info (rough idea: input + output tokens length)
    const inputTokens = prompt.split(" ").length;
    const outputTokens = responseText.split(" ").length;

    res.json({
      plan: responseText,
      tokens: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate plan" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
