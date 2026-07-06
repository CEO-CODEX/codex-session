const createApp = require("./app");
const config = require("./config");

// Safety net: a stray unhandled rejection (e.g. a delayed Baileys
// creds.update write racing with session cleanup) should never take down
// the whole process.
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

const app = createApp();

app.listen(config.port, () => {
  console.log(`Session Store API running on http://localhost:${config.port}`);
});
