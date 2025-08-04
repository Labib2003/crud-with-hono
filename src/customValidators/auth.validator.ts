import z from "zod";

const loginSchema = z.strictObject({
  email: z.email(),
  password: z.string(),
});

const authValidator = {
  loginSchema,
};
export default authValidator;
