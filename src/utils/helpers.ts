import bcrypt from "bcrypt";

export async function converBcryptPassword(password: string) {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}
