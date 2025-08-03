import { Hono } from "hono";
import { validator } from "hono/validator";
import db from "../../db/index.js";
import {
  createPostSchema,
  postsTable,
  updatePostSchema,
} from "../../db/schema/post.js";
import { eq } from "drizzle-orm";

const postRouter = new Hono();

postRouter
  .get("/", async (c) => {
    const posts = await db.select().from(postsTable);
    return c.json(
      {
        success: true,
        message: "Posts retrieved successfully",
        data: posts,
      },
      200,
    );
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    const post = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, parseInt(id)));

    return c.json(
      {
        success: true,
        message: `Post with ID: ${id} retrieved successfully`,
        data: post,
      },
      200,
    );
  })
  .post(
    "/",
    validator("json", (value, c) => {
      const parsed = createPostSchema.safeParse(value);

      if (!parsed.success) {
        return c.json(
          {
            success: false,
            message: "Validation error",
            errors: parsed.error.issues,
          },
          401,
        );
      }
      return parsed.data;
    }),
    async (c) => {
      const postData = c.req.valid("json");

      const response = await db.insert(postsTable).values(postData);

      return c.json(
        {
          success: true,
          message: "Post created successfully",
          data: response,
        },
        201,
      );
    },
  )
  .patch(
    "/:id",
    validator("json", (value, c) => {
      const parsed = updatePostSchema.safeParse(value);

      if (!parsed.success) {
        return c.json(
          {
            success: false,
            message: "Validation error",
            errors: parsed.error.issues,
          },
          401,
        );
      }
      return parsed.data;
    }),
    async (c) => {
      const id = c.req.param("id");
      const updateData = c.req.valid("json");

      const response = await db
        .update(postsTable)
        .set(updateData)
        .where(eq(postsTable.id, parseInt(id)));

      return c.json(
        {
          success: true,
          message: `Post with ID: ${id} updated successfully`,
          data: response,
        },
        200,
      );
    },
  )
  .delete("/:id", async (c) => {
    const id = c.req.param("id");

    const response = await db
      .delete(postsTable)
      .where(eq(postsTable.id, parseInt(id)));

    return c.json(
      {
        success: true,
        message: `Post with ID: ${id} deleted successfully`,
        data: response,
      },
      200,
    );
  });

export default postRouter;
