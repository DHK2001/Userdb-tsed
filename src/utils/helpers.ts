import bcrypt from "bcrypt";

export async function converBcryptPassword(password: string) {
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

export async function verifyPassword(enteredPassword: string, storedHashedPassword: string) {
  const isMatch = await bcrypt.compare(enteredPassword, storedHashedPassword);
  if (isMatch) {
    return true;
  } else {
    return false;
  }
}
