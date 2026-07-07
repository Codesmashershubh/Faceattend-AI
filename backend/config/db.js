const mongoose = require("mongoose");

async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI is not set in .env");

    await mongoose.connect(uri, {
      // Render's free web service is a single small instance, so a handful of
      // pooled connections is plenty and keeps us well under MongoDB Atlas's
      // free M0 connection cap even across restarts/redeploys.
      maxPoolSize: 5,
      // Fail fast instead of hanging if Atlas is unreachable, so a bad
      // MONGO_URI or network hiccup surfaces immediately in Render logs.
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
    });
    console.log("[db] MongoDB connected:", mongoose.connection.host);
  } catch (err) {
    console.error("[db] Connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
