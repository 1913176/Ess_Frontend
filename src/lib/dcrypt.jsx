import bcrypt from "bcryptjs";

async function dcrypt(password) {
  const saltRounds = 12;
  const decryption = await bcrypt.hash(password, saltRounds);
  console.log(decryption);
  return decryption;
}

export default dcrypt;
