import { hash, verify } from "@node-rs/argon2";

export const hashPassword = async (password: string): Promise<string> => {
  return hash(password, {
    memoryCost: 19456, // Memory cost parameter for Argon2
    timeCost: 2, // Time cost parameter for Argon2
    outputLen: 32, // Length of the output hash
    parallelism: 1, // Degree of parallelism
  });
};

export const verifyPasswordHash = async (
  hashedPassword: string,
  password: string,
): Promise<boolean> => {
  return verify(hashedPassword, password);
};
