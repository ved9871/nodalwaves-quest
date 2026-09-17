// cPanel / Passenger startup file for NodalQuest.
// cPanel's "Setup Node.js App" runs this file. It loads the built ESM server
// bundle (dist/index.js), which reads .env and starts Express on process.env.PORT.
// Set the app's "Application startup file" to: app.cjs
import("./dist/index.js").catch((err) => {
  console.error("[startup] Failed to start server:", err);
  process.exit(1);
});
