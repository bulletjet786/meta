// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import express from 'express';

interface LatestVersionRequest {
  deviceId: string;
  channel: Channel;
  currentVersion: string;
}

interface LatestVersionResponse {
  shouldUpdate: boolean;
  version: string;
  url: string;
}

enum Channel {
  Stable,
  Preview,
  Testing,
}

const app = express();
app.use(express.json());
const port = 3000;

app.post("/version/latest", (req: express.Request, res: express.Response) => {
  console.log(`version latest request: ${JSON.stringify(req.body)}`);
  res.send({
    shouldUpdate: false,
    version: "0.0.4",
    url: "https://dl.meta.deckz.fun/releases/v0.0.4",
  });
});

app.listen(port, () => {
  console.log(`Version app listening on port ${port}`);
});
