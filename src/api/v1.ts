import { Hono } from "hono";
import postRouter from "../modules/posts/post.router.js";

const v1Router = new Hono();

v1Router.get("/", (c) => {
  return c.text("Hello from API v1!");
});
v1Router.route("/posts", postRouter);

export default v1Router;
