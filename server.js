const express = require("express");
const http = require("http");

const defaultNcDb = "pg://localhost:5432?u=postgres&p=7043&d=better-auth";
const configuredNcDb = (process.env.NC_DB || "").trim();

// Normalize common Postgres schemes and protect against empty/invalid NC_DB.
const normalizedNcDb = (configuredNcDb || defaultNcDb).replace(
  /^postgres(?:ql)?:\/\//i,
  "pg://",
);
process.env.NC_DB = normalizedNcDb.startsWith("pg://")
  ? normalizedNcDb
  : defaultNcDb;

const { Noco } = require("nocodb");
const app = express();
const server = http.createServer(app);

async function startServer() {
  await Noco.init({}, server, app);

  // Noco boots its own internal Express app; mount it on our HTTP server app.
  if (Noco._httpServer) {
    app.use(Noco._httpServer);
  }

  server.listen(8080, () => {
    console.log("NocoDB is running on http://localhost:8080/dashboard");
    console.log(`NC_DB: ${process.env.NC_DB}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start NocoDB:", error);
  process.exit(1);
});
