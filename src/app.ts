import { Hono } from "hono";
import v1Router from "./api/v1.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.route("/api/v1", v1Router);

export default app;
