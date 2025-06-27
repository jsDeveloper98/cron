const main = require("./src/index.js");

// // api/cron.js
// const test = async function handler(req, res) {
//   // Only GETs allowed
//   // if (req.method !== "GET") {
//   //   return res.status(405).send("Method Not Allowed");
//   // }

//   console.log("sfjdsgfdsgfsdfggsdfgsdfg");

//   try {
//     // --- your “every-5-min” logic here ---
//     console.log("Cron ran at", new Date().toISOString());
//     // e.g. await doSomeWork();

//     main(res);
//   } catch (err) {
//     console.error("Cron error:", err);
//     return res
//       .status(500)
//       .json({ success: false, message: "Internal Server Error" });
//   }
// };

// test();

// api/cron.js
module.exports = async function handler(req, res) {
  // Only GETs allowed
  // if (req.method !== "GET") {
  //   return res.status(405).send("Method Not Allowed");
  // }

  console.log("sfjdsgfdsgfsdfggsdfgsdfg");

  try {
    // --- your “every-5-min” logic here ---
    console.log("Cron ran at", new Date().toISOString());
    // e.g. await doSomeWork();

    main(res);
  } catch (err) {
    console.error("Cron error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
