import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("Trying to run migrations", async () => {
        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(response.status).toBe(403);

        const responseBody = await response.json();

        expect(responseBody).toEqual({
          action:
            "Verifique se o seu usuário possui a feature 'create:migration'.",
          message: "Você não possui permissão para executar esta ação.",
          name: "ForbiddenError",
          status_code: 403,
        });
      });
    });
  });

  describe("Default user", () => {
    test("Trying to run migrations", async () => {
      const defaultUser = await orchestrator.createUser();
      await orchestrator.activateUser(defaultUser.id);
      const sessionObject = await orchestrator.createSession(defaultUser.id);

      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "POST",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action:
          "Verifique se o seu usuário possui a feature 'create:migration'.",
        message: "Você não possui permissão para executar esta ação.",
        name: "ForbiddenError",
        status_code: 403,
      });
    });
  });

  describe("Privileged user", () => {
    describe("Running pending migrations", () => {
      test("With `create:migration`", async () => {
        const privilegedUser = await orchestrator.createUser();
        await orchestrator.activateUser(privilegedUser.id);
        await orchestrator.addFeaturesToUser(privilegedUser.id, [
          "create:migration",
        ]);
        const sessionObject = await orchestrator.createSession(
          privilegedUser.id,
        );

        const response = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
            headers: {
              Cookie: `session_id=${sessionObject.token}`,
            },
          },
        );
        expect(response.status).toBe(200);

        const responseBody = await response.json();

        expect(Array.isArray(responseBody)).toBe(true);
      });
    });
  });
});
