import { Hono } from "hono";

const postRouter = new Hono();

postRouter
  .get("/", (c) => {
    return c.text("List of posts");
  })
  .get("/:id", (c) => {
    const id = c.req.param("id");

    return c.text(`Details of post with ID: ${id}`);
  })
  .post("/", (c) => {
    const postData = c.req.json();

    return c.json({
      message: "Post created successfully",
      data: postData,
    });
  })
  .patch("/:id", (c) => {
    const id = c.req.param("id");
    const updateData = c.req.json();

    return c.json({
      message: `Post with ID: ${id} updated successfully`,
      data: updateData,
    });
  })
  .delete("/:id", (c) => {
    const id = c.req.param("id");

    return c.json({
      message: `Post with ID: ${id} deleted successfully`,
    });
  });

export default postRouter;
