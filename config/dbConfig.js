const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ PostgreSQL connected successfully.");
  })
  .catch((err) => {
    console.error("❌ Unable to connect to PostgreSQL:", err);
  });

module.exports = sequelize;
