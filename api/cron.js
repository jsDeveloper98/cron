// api/cron.js
export default async function handler(req, res) {
  // Your “every-5-min” logic goes here.
  console.log("Cron ran at", new Date().toISOString());
  // e.g., fetch some API, update a database, etc.

  res.status(200).json({ success: true });
}
