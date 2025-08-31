
require("dotenv").config();

const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Test DB connection
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully.");

    // Sync models to DB (create/alter tables as needed) - dev use only!
    await sequelize.sync({ alter: true });
    console.log("✅ All models synchronized.");

    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to start server or connect to DB:", error);
    process.exit(1);
  }
})();
