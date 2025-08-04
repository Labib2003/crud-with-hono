const env = {
  app: {
    port: process.env.PORT ?? 3000,
  },
  jwt: {
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET ?? "access_token_secret",
    refreshTokenSecret:
      process.env.REFRESH_TOKEN_SECRET ?? "refresh_token_secret",
  },
};

export default env;
