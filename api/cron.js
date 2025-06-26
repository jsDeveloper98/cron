import main from "../src";

// api/cron.js
export default async function handler(req, res) {
  // Only GETs allowed
  // if (req.method !== "GET") {
  //   return res.status(405).send("Method Not Allowed");
  // }

  try {
    // --- your “every-5-min” logic here ---
    console.log("Cron ran at", new Date().toISOString());
    // e.g. await doSomeWork();

    main();
    // ----------------------------------------

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Cron error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}
