require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

(async () => {
  try {
    // Test DB connection
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully.");

    // Sync models to DB (dev only!)
    await sequelize.sync({ alter: true });
    console.log("✅ All models synchronized.");

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Deployed URL: ${BASE_URL}`);
    });
  } catch (error) {
    console.error("❌ Unable to start server or connect to DB:", error);
    process.exit(1);
  }
})();
