import { Hono } from "hono";
import { validator } from "hono/validator";
import { createUserValidator, usersTable } from "../db/schema/user.js";
import { hashPassword, verifyPasswordHash } from "../utils/password.js";
import db from "../db/index.js";
import authValidator from "../customValidators/auth.validator.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

const authRouter = new Hono();

authRouter
  .post(
    "/signup",
    validator("json", async (values, c) => {
      const { data, error } = createUserValidator.safeParse(values);

      if (!data)
        return c.json(
          {
            success: false,
            message: "Validation error",
            error,
          },
          400,
        );

      data.password = await hashPassword(data.password);
      return data;
    }),
    async (c) => {
      const data = c.req.valid("json");

      try {
        const response = await db.insert(usersTable).values(data);

        return c.json(
          {
            success: true,
            message: "User created successfully",
            data: response,
          },
          200,
        );
      } catch (error) {
        return c.json(
          {
            success: false,
            message: "Error creating user",
            error: error,
          },
          500,
        );
      }
    },
  )

  .post(
    "/login",
    validator("json", (values, c) => {
      const { data, error } = authValidator.loginSchema.safeParse(values);

      if (!data)
        return c.json(
          {
            success: false,
            message: "Validation error",
            error,
          },
          400,
        );

      return data;
    }),
    async (c) => {
      const data = c.req.valid("json");

      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, data.email));
      if (!user)
        return c.json(
          {
            success: false,
            message: "User not found",
          },
          404,
        );

      const validPassword = await verifyPasswordHash(
        user.password,
        data.password,
      );
      if (!validPassword)
        return c.json(
          {
            success: false,
            message: "Invalid password",
          },
          401,
        );

      const accessToken = jwt.sign(
        { sub: user.id },
        env.jwt.accessTokenSecret,
        { expiresIn: "1m" },
      );
      const refreshToken = jwt.sign(
        { sub: user.id },
        env.jwt.refreshTokenSecret,
        {
          expiresIn: "2m",
        },
      );

      c.header(
        "Set-Cookie",
        `refresh_token=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict; Secure`,
      );

      return c.json(
        {
          success: true,
          message: "Login successful",
          accessToken,
        },
        200,
      );
    },
  );

export default authRouter;
