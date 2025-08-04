import { Hono } from "hono";
import postRouter from "../modules/post.js";
import authRouter from "../modules/auth.js";

const v1Router = new Hono();

v1Router.get("/", (c) => {
  return c.text("Hello from API v1!");
});
v1Router.route("/posts", postRouter);
v1Router.route("/auth", authRouter);

export default v1Router;
