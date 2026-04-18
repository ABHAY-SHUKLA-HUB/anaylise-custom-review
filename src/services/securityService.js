const crypto = require("crypto");

const SECRET = process.env.APP_SECRET || "dev-only-secret-change-me";

function getKey() {
  return crypto.createHash("sha256").update(SECRET).digest();
}

function encryptSecret(value) {
  if (!value) return "";
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptSecret(payload) {
  if (!payload) return "";
  const [ivHex, encryptedHex] = payload.split(":");
  if (!ivHex || !encryptedHex) return "";

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    getKey(),
    Buffer.from(ivHex, "hex")
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

function maskSecret(value) {
  if (!value) return "";
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}...${value.slice(-3)}`;
}

module.exports = {
  encryptSecret,
  decryptSecret,
  maskSecret,
};
