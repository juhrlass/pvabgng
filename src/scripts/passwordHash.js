import bcrypt from "bcrypt";

async function createHash() {
    const password = "password123";
    // Die "salt rounds" bestimmen, wie komplex der Hash ist. 10-12 ist ein guter Wert.
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log("Dein neuer Passwort-Hash ist:");
    console.log(hashedPassword);
}

createHash();