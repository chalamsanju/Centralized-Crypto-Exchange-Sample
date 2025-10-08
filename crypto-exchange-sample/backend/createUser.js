const bcrypt = require("bcryptjs");

async function generateHash() {
  const password = "12345"; // your login password
  const hashed = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashed);
}

generateHash();
