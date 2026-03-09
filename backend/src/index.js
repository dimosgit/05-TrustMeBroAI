import "dotenv/config";
import express from "express";
import cors from "cors";
import { query, pool, closePool } from "./db.js";
import { pickMockRecommendation } from "./recommendation.js";
import {
  mockProfiles,
  mockTasks,
  mockPriorities,
  mockTools,
  createMockSession,
  getMockSessionWithTaskName,
  getMockToolsByNames,
  storeMockRecommendation
} from "./mockData.js";

const app = express();
const port = Number(process.env.PORT || 8080);
const useMockData = process.env.USE_MOCK_DATA === "true";

if (!useMockData && !pool) {
  console.error("DATABASE_URL is required when USE_MOCK_DATA is not enabled");
  process.exit(1);
}

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5174")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json());

app.get(
  "/api/health",
  asyncHandler(async (_req, res) => {
    if (useMockData) {
      return res.json({ status: "ok", mode: "mock" });
    }

    await query("SELECT 1");
    return res.json({ status: "ok", mode: "database" });
  })
);

app.get(
  "/api/tools",
  asyncHandler(async (_req, res) => {
    if (useMockData) {
      return res.json(mockTools.filter((tool) => tool.is_active));
    }

    const result = await query(
      `SELECT id, name, category, pricing_type, pricing_label, website_url, description, strengths, weaknesses
       FROM tools
       WHERE is_active = true
       ORDER BY name ASC`
    );

    return res.json(result.rows);
  })
);

app.get(
  "/api/tasks",
  asyncHandler(async (_req, res) => {
    if (useMockData) {
      return res.json(mockTasks);
    }

    const result = await query("SELECT id, name, description, category FROM tasks ORDER BY id ASC");
    return res.json(result.rows);
  })
);

app.get(
  "/api/profiles",
  asyncHandler(async (_req, res) => {
    if (useMockData) {
      return res.json(mockProfiles);
    }

    const result = await query("SELECT id, name, description FROM profiles ORDER BY id ASC");
    return res.json(result.rows);
  })
);

app.get(
  "/api/priorities",
  asyncHandler(async (_req, res) => {
    if (useMockData) {
      return res.json(mockPriorities);
    }

    const result = await query("SELECT id, name, description FROM priorities ORDER BY id ASC");
    return res.json(result.rows);
  })
);

app.post(
  "/api/session",
  asyncHandler(async (req, res) => {
    const { email = null, profile_id, task_id, budget, experience_level, selected_priorities = [] } = req.body;

    if (!profile_id || !task_id || !budget || !experience_level) {
      return res.status(400).json({ message: "Missing required session fields" });
    }

    if (!Array.isArray(selected_priorities)) {
      return res.status(400).json({ message: "selected_priorities must be an array" });
    }

    if (useMockData) {
      const inserted = createMockSession({
        email,
        profile_id,
        task_id,
        budget,
        experience_level,
        selected_priorities
      });
      return res.status(201).json(inserted);
    }

    const result = await query(
      `INSERT INTO user_sessions (email, profile_id, task_id, budget, experience_level, selected_priorities)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [email, profile_id, task_id, budget, experience_level, JSON.stringify(selected_priorities)]
    );

    return res.status(201).json(result.rows[0]);
  })
);

app.post(
  "/api/recommendation",
  asyncHandler(async (req, res) => {
    const { user_session_id } = req.body;

    if (!user_session_id) {
      return res.status(400).json({ message: "user_session_id is required" });
    }

    let session;

    if (useMockData) {
      session = getMockSessionWithTaskName(user_session_id);
    } else {
      const sessionResult = await query(
        `SELECT us.id, us.budget, us.experience_level, us.selected_priorities, t.name AS task_name
         FROM user_sessions us
         JOIN tasks t ON t.id = us.task_id
         WHERE us.id = $1`,
        [user_session_id]
      );
      session = sessionResult.rows[0];
    }

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const selectedPriorities = Array.isArray(session.selected_priorities) ? session.selected_priorities : [];

    const mock = pickMockRecommendation({
      task: session.task_name,
      priorities: selectedPriorities,
      budget: session.budget,
      experience: session.experience_level
    });

    let tools;
    if (useMockData) {
      tools = getMockToolsByNames([mock.primary, ...mock.alternatives]);
    } else {
      const toolLookup = await query(
        `SELECT id, name, category, pricing_label, description, strengths, weaknesses, website_url
         FROM tools
         WHERE name = ANY($1::text[])`,
        [[mock.primary, ...mock.alternatives]]
      );
      tools = toolLookup.rows;
    }

    const byName = new Map(tools.map((tool) => [tool.name, tool]));
    const primaryTool = byName.get(mock.primary);
    const alternativeTools = mock.alternatives.map((name) => byName.get(name)).filter(Boolean);

    if (!primaryTool) {
      return res.status(500).json({ message: "Primary tool not available in data source" });
    }

    if (useMockData) {
      storeMockRecommendation({
        user_session_id: session.id,
        primary_tool_id: primaryTool.id,
        alternative_tool_ids: alternativeTools.map((tool) => tool.id),
        explanation: mock.explanation
      });
    } else {
      await query(
        `INSERT INTO recommendations (user_session_id, primary_tool_id, alternative_tool_ids, explanation)
         VALUES ($1, $2, $3, $4)`,
        [session.id, primaryTool.id, JSON.stringify(alternativeTools.map((tool) => tool.id)), mock.explanation]
      );
    }

    return res.json({
      session_id: session.id,
      primary_tool: primaryTool,
      alternative_tools: alternativeTools,
      explanation: mock.explanation
    });
  })
);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port} (${useMockData ? "mock mode" : "database mode"})`);
});

process.on("SIGTERM", async () => {
  await closePool();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await closePool();
  process.exit(0);
});
