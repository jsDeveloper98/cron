// api/index.js
export default function handler(req, res) {
  // Only GETs allowed
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  res.status(200).setHeader("Content-Type", "text/html; charset=utf-8")
    .send(`<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Welcome</title>
  <style>
    body { margin:0; height:100vh; display:flex;
           align-items:center; justify-content:center;
           font-family:sans-serif; background:#f5f5f5; }
    .welcome-box {
      padding:2rem; background:white;
      border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);
      text-align:center;
    }
    .welcome-box h1 { margin:0 0 1rem; font-size:1.5rem; }
    .welcome-box p { margin:0; color:#555; }
  </style>
</head><body>
  <div class="welcome-box">
    <h1>👋 Welcome!</h1>
    <p>This endpoint runs your scheduler every 5 minutes.</p>
  </div>
</body></html>`);
}
