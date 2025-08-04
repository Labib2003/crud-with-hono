import { serve } from "@hono/node-server";
import app from "./app.js";
import env from "./config/env.js";

serve(
  {
    fetch: app.fetch,
    port: Number(env.app.port),
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
