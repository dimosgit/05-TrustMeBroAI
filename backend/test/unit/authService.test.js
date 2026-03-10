import assert from "node:assert/strict";
import test from "node:test";
import { createTestApp } from "../helpers/createTestApp.js";

async function computePrimaryToolName({ services, profileId, taskId, selectedPriority }) {
  const session = await services.sessionService.createAnonymousSession({
    profileId,
    taskId,
    selectedPriority,
    wizardDurationSeconds: 15
  });

  const compute = await services.recommendationService.computeForSession({
    sessionId: session.session_id
  });

  return compute.primary_tool.tool_name;
}

test("deterministic scoring vectors choose expected primary tool for each priority", async () => {
  const { services } = createTestApp();

  const bestQuality = await computePrimaryToolName({
    services,
    profileId: 1,
    taskId: 1,
    selectedPriority: "Best quality"
  });
  assert.equal(bestQuality, "Lambda PDF");

  const fastest = await computePrimaryToolName({
    services,
    profileId: 1,
    taskId: 1,
    selectedPriority: "Fastest results"
  });
  assert.equal(fastest, "Beta PDF");

  const easiest = await computePrimaryToolName({
    services,
    profileId: 1,
    taskId: 1,
    selectedPriority: "Easiest to use"
  });
  assert.equal(easiest, "Beta PDF");

  const lowestPrice = await computePrimaryToolName({
    services,
    profileId: 1,
    taskId: 1,
    selectedPriority: "Lowest price"
  });
  assert.equal(lowestPrice, "Beta PDF");
});

test("tie-breaker prefers selected-profile match before alphabetical order", async () => {
  const { services, repositories } = createTestApp();

  const alpha = repositories.data.tools.find((tool) => tool.tool_name === "Alpha PDF");
  const lambda = repositories.data.tools.find((tool) => tool.tool_name === "Lambda PDF");
  const beta = repositories.data.tools.find((tool) => tool.tool_name === "Beta PDF");

  alpha.quality = 4;
  alpha.speed = 4;
  alpha.ease_of_use = 4;
  alpha.pricing_tier = "freemium";
  alpha.target_users = ["Business"];

  lambda.quality = 4;
  lambda.speed = 4;
  lambda.ease_of_use = 4;
  lambda.pricing_tier = "freemium";
  lambda.target_users = ["Developer"];

  beta.quality = 2;
  beta.speed = 2;
  beta.ease_of_use = 2;
  beta.pricing_tier = "paid_high";

  const winner = await computePrimaryToolName({
    services,
    profileId: 1,
    taskId: 1,
    selectedPriority: "Best quality"
  });

  assert.equal(winner, "Alpha PDF");
});

test("tie-breaker falls back to alphabetical order when score and profile match tie", async () => {
  const { services, repositories } = createTestApp();

  const alpha = repositories.data.tools.find((tool) => tool.tool_name === "Alpha PDF");
  const lambda = repositories.data.tools.find((tool) => tool.tool_name === "Lambda PDF");
  const beta = repositories.data.tools.find((tool) => tool.tool_name === "Beta PDF");

  alpha.quality = 4;
  alpha.speed = 4;
  alpha.ease_of_use = 4;
  alpha.pricing_tier = "freemium";
  alpha.target_users = ["Business"];

  lambda.quality = 4;
  lambda.speed = 4;
  lambda.ease_of_use = 4;
  lambda.pricing_tier = "freemium";
  lambda.target_users = ["Business"];

  beta.quality = 1;
  beta.speed = 1;
  beta.ease_of_use = 1;
  beta.pricing_tier = "paid_high";

  const winner = await computePrimaryToolName({
    services,
    profileId: 1,
    taskId: 1,
    selectedPriority: "Best quality"
  });

  assert.equal(winner, "Alpha PDF");
});

test("category fallback expansion fills alternatives when primary category has fewer than three tools", async () => {
  const { services, repositories } = createTestApp();

  const lambda = repositories.data.tools.find((tool) => tool.tool_name === "Lambda PDF");
  lambda.record_status = "inactive";

  const session = await services.sessionService.createAnonymousSession({
    profileId: 1,
    taskId: 1,
    selectedPriority: "Best quality",
    wizardDurationSeconds: 11
  });

  const compute = await services.recommendationService.computeForSession({
    sessionId: session.session_id
  });

  assert.equal(compute.alternative_tools.length, 2);
  const toolCategory = new Map(repositories.data.tools.map((tool) => [tool.tool_name, tool.category]));
  const hasResearchFallback = compute.alternative_tools.some(
    (tool) => toolCategory.get(tool.tool_name) === "Research"
  );
  assert.equal(hasResearchFallback, true);
});
