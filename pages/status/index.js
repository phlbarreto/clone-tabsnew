import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <h2>Dependências: </h2>
      <DatabaseInfo />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updateAtText = "Carregando...";

  if (!isLoading && data) {
    updateAtText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return (
    <div style={{ marginLeft: 1 + "rem" }}>
      Última atualização: {updateAtText}
    </div>
  );
}

function DatabaseInfo() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  const database = {
    maxConnections: "Carregando...",
    openedConnectios: "Carregando...",
  };

  if (!isLoading && data) {
    const databaseResult = data.dependencies.database;
    database.version = databaseResult.version;
    database.maxConnections = databaseResult.max_connections;
    database.openedConnectios = databaseResult.opened_connections;
  }

  return (
    <div style={{ marginLeft: 1.5 + "rem" }}>
      <h3>Banco de dados:</h3>
      <div style={{ marginLeft: 1.5 + "rem" }}>
        {database.version !== null && (
          <p>Versão do Postgres: {database.version}</p>
        )}
        <p>Conexões disponíveis: {database.maxConnections}</p>
        <p>Conexões abertas: {database.openedConnectios}</p>
      </div>
    </div>
  );
}
