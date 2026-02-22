import { createRouter } from "next-connect";
import database from "/infra/database.js";
import controller from "infra/controller.js";
import authorization from "models/authorization.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(getHandler);

export default router.handler(controller.errorsHandler);

async function getVersionDb() {
  const result = await database.query("SELECT version();");

  const version = result.rows[0].version.split(" ")[1];
  return version;
}

async function getMaxConnectionsDb() {
  const result = await database.query("SHOW max_connections;");
  const { max_connections } = result.rows[0];
  return parseInt(max_connections);
}

async function getConnectionsActiveDb() {
  const databaseName = process.env.POSTGRES_DB;
  const result = await database.query({
    text: "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });
  const connections = result.rows[0].count;
  return connections;
}

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const updated_at = new Date().toISOString();
  const version = await getVersionDb();
  const max_connections = await getMaxConnectionsDb();
  const connections = await getConnectionsActiveDb();

  const status = {
    updated_at,
    dependencies: {
      database: {
        version,
        max_connections,
        opened_connections: connections,
      },
    },
  };

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:status",
    status,
  );
  
  response.status(200).json(secureOutputValues);
}
