import { Hono } from "hono";
import { validator } from "hono/validator";
import db from "../../db/index.js";
import { createPostSchema, postsTable } from "../../db/schema/post.js";

const postRouter = new Hono();

postRouter
  .get("/", (c) => {
    return c.text("List of posts");
  })
  .get("/:id", (c) => {
    const id = c.req.param("id");

    return c.text(`Details of post with ID: ${id}`);
  })
  .post(
    "/",
    validator("json", (value, c) => {
      const parsed = createPostSchema.safeParse(value);

      if (!parsed.success) {
        return c.json(
          { message: "Validation error", errors: parsed.error.issues },
          401,
        );
      }
      return parsed.data;
    }),
    async (c) => {
      const postData = c.req.valid("json");

      const response = await db.insert(postsTable).values(postData);

      return c.json({
        message: "Post created successfully",
        data: response,
      });
    },
  )
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
