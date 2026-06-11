import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Task Planner backend is running.");
});

app.post("/generate-task-breakdown", async (req, res) => {
  try {
    const { taskName, taskDescription, priority, deadline } = req.body;

    const response = await client.responses.create({
      model: "gpt-5.4-mini",
      input: `
You are an AI task planning assistant.

Create a unique, practical step-by-step plan based on the task details below.

Task Name:
${taskName}

Task Description:
${taskDescription || "No description provided"}

Priority:
${priority}

Deadline:
${deadline || "No deadline"}

Requirements:
- Return 6 to 8 numbered steps.
- Make the plan specific to the task description.
- Include the first action the user should take.
- Mention any preparation needed.
- Mention how to check progress.
- Keep each step short and clear.
`
    });

    res.json({
      breakdown: response.output_text
    });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({
      error: "Failed to generate AI task breakdown."
    });
  }
});

app.listen(3000, () => {
  console.log("AI server running on http://localhost:3000");
});