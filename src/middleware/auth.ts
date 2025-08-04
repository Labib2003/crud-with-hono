import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";
import { getCookie } from "hono/cookie";
import env from "../config/env.js";

type Env = {
  Variables: {
    userId: string;
    newAccessToken?: string;
  };
};

const auth = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const accessToken = authHeader?.split(" ")[1];

  let decoded: jwt.JwtPayload | undefined;

  if (accessToken) {
    try {
      decoded = jwt.verify(
        accessToken,
        env.jwt.accessTokenSecret,
      ) as jwt.JwtPayload;

      // access token is valid exit middleware
      c.set("userId", decoded.sub!);
      return await next();
    } catch (err: any) {
      if (err.name !== "TokenExpiredError")
        return c.json({ success: false, message: "Invalid token" }, 401);
    }
  }

  const refreshToken = getCookie(c, "refresh_token");
  if (!refreshToken) {
    return c.json({ success: false, message: "No refresh token" }, 401);
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      env.jwt.refreshTokenSecret,
    ) as jwt.JwtPayload;

    const newAccessToken = jwt.sign(
      { sub: payload.sub },
      env.jwt.accessTokenSecret,
      {
        expiresIn: "1m",
      },
    );

    c.set("userId", payload.sub!);
    c.set("newAccessToken", newAccessToken);

    return await next();
  } catch {
    return c.json(
      { success: false, message: "Invalid refresh token, re-authenticate" },
      401,
    );
  }
});

export default auth;
