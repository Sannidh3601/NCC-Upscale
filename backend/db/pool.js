import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Neon
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 60000,
});

pool.on("connect", () => {
  console.log("Connected to Neon PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected pool error:", err.message);
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Database connection successful");
    return true;
  } catch (err) {
    console.error("Database connection failed:", err.message);
    return false;
  }
}

export default pool;