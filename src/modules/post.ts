import { Hono } from "hono";
import { validator } from "hono/validator";
import { asc, count, eq, inArray, ilike, and, or } from "drizzle-orm";
import z from "zod";
import {
  CategoriesEnum,
  createPostSchema,
  postsTable,
  updatePostSchema,
} from "../db/schema/post.js";
import calculatePagination from "../utils/calculatePaginaiton.js";
import db from "../db/index.js";
import auth from "../middleware/auth.js";

const postRouter = new Hono();

postRouter
  .get(
    "/",
    validator("query", (values, c) => {
      let { page = "1", limit = "10", search = "", category } = values;

      if (Array.isArray(page)) page = page[0];
      if (Array.isArray(limit)) limit = limit[0];
      if (Array.isArray(search)) search = search[0];
      if (!Array.isArray(category)) category = [category];

      let parsed;
      if (category[0]) {
        const { data, error } = z
          .array(z.enum(CategoriesEnum.enumValues))
          .safeParse(category);

        if (!data)
          return c.json(
            {
              success: false,
              message: `Invalid category. Valid categories are: ${CategoriesEnum.enumValues.join(", ")}`,
              error,
            },
            400,
          );
        parsed = data;
      }

      return { page, limit, search, category: parsed };
    }),
    async (c) => {
      const {
        page: queryPage,
        limit: queryLimit,
        search,
        category,
      } = c.req.valid("query");
      const { page, limit, offset } = calculatePagination({
        page: queryPage,
        limit: queryLimit,
      });

      const [posts, [{ count: total }]] = await Promise.all([
        db
          .select()
          .from(postsTable)
          .where(
            and(
              inArray(
                postsTable.category,
                category ?? CategoriesEnum.enumValues,
              ),
              or(
                ilike(postsTable.title, `%${search}%`),
                ilike(postsTable.body, `%${search}%`),
              ),
            ),
          )
          .orderBy(asc(postsTable.created_at))
          .limit(limit)
          .offset(offset),
        db.select({ count: count() }).from(postsTable),
      ]);

      return c.json(
        {
          success: true,
          message: "Posts retrieved successfully",
          data: { meta: { total, page, limit }, data: posts },
        },
        200,
      );
    },
  )

  .get("/:id", async (c) => {
    const id = c.req.param("id");

    const [post] = await db
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
    auth,
    validator("json", (value, c) => {
      const parsed = createPostSchema.safeParse(value);

      if (!parsed.success)
        return c.json(
          {
            success: false,
            message: "Validation error",
            errors: parsed.error.issues,
          },
          401,
        );

      return parsed.data;
    }),
    async (c) => {
      const newAccessToken = c.get("newAccessToken");
      const userId = c.get("userId");
      const postData = c.req.valid("json");

      const response = await db
        .insert(postsTable)
        .values({ ...postData, created_by: Number(userId) });

      return c.json(
        {
          success: true,
          message: "Post created successfully",
          data: response,
          newAccessToken: newAccessToken ? newAccessToken : undefined,
        },
        201,
      );
    },
  )

  .patch(
    "/:id",
    auth,
    validator("json", (value, c) => {
      const parsed = updatePostSchema.safeParse(value);

      if (!parsed.success)
        return c.json(
          {
            success: false,
            message: "Validation error",
            errors: parsed.error.issues,
          },
          401,
        );

      return parsed.data;
    }),
    async (c) => {
      const newAccessToken = c.get("newAccessToken");
      const userId = c.get("userId");
      const id = c.req.param("id");
      const updateData = c.req.valid("json");

      const [post] = await db
        .select()
        .from(postsTable)
        .where(eq(postsTable.id, parseInt(id)));

      if (!post)
        return c.json(
          {
            success: false,
            message: `Post with ID: ${id} not found`,
          },
          404,
        );
      if (post.created_by !== Number(userId))
        return c.json(
          {
            success: false,
            message: `You are not authorized to update this post`,
          },
          403,
        );

      const response = await db
        .update(postsTable)
        .set(updateData)
        .where(eq(postsTable.id, parseInt(id)));

      return c.json(
        {
          success: true,
          message: `Post with ID: ${id} updated successfully`,
          data: response,
          newAccessToken: newAccessToken ? newAccessToken : undefined,
        },
        200,
      );
    },
  )

  .delete("/:id", auth, async (c) => {
    const newAccessToken = c.get("newAccessToken");
    const userId = c.get("userId");
    const id = c.req.param("id");

    const [post] = await db
      .select()
      .from(postsTable)
      .where(eq(postsTable.id, parseInt(id)));

    if (!post)
      return c.json(
        {
          success: false,
          message: `Post with ID: ${id} not found`,
        },
        404,
      );
    if (post.created_by !== Number(userId))
      return c.json(
        {
          success: false,
          message: `You are not authorized to update this post`,
        },
        403,
      );

    const response = await db
      .delete(postsTable)
      .where(eq(postsTable.id, parseInt(id)));

    return c.json(
      {
        success: true,
        message: `Post with ID: ${id} deleted successfully`,
        data: response,
        newAccessToken: newAccessToken ? newAccessToken : undefined,
      },
      200,
    );
  });

export default postRouter;
