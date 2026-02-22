import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);
      const responseBody = await response.json();
      const parseUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parseUpdatedAt);
      expect(responseBody.dependencies.database).not.toHaveProperty("version");
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });

  describe("Default user", () => {
    test("Retrieving current system status", async () => {
      const defaultUser = await orchestrator.createUser();
      await orchestrator.activateUser(defaultUser.id);
      const sessionObject = await orchestrator.createSession(defaultUser.id);

      const response = await fetch("http://localhost:3000/api/v1/status", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      const parseUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parseUpdatedAt);
      expect(responseBody.dependencies.database).not.toHaveProperty("version");
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });

  describe("Privileged user", () => {
    test("Retrieving current system status", async () => {
      const privilegedUser = await orchestrator.createUser();
      await orchestrator.activateUser(privilegedUser.id);
      await orchestrator.addFeaturesToUser(privilegedUser.id, [
        "read:status:all",
      ]);
      const sessionObject = await orchestrator.createSession(privilegedUser.id);

      const response = await fetch("http://localhost:3000/api/v1/status", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);
      const responseBody = await response.json();
      const parseUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parseUpdatedAt);
      expect(responseBody.dependencies.database.version).toBe("18.0");
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });
});
