// Sets the admin panel password.
//
//   npm run set-admin-password
//
// Asks for a new password, then writes ADMIN_PASSWORD_HASH and a fresh
// SESSION_SECRET into .env. A new secret logs out every existing admin session.
// Restart the server afterwards (`npm run dev` picks up .env changes on its own).

import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";

const MIN_LENGTH = 10;
const ENV_FILE = ".env";

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
// Hide the characters being typed; only line breaks are shown
rl._writeToOutput = (text) => {
  if (text.includes("\n") || text.includes("\r")) process.stdout.write("\n");
};
// Buffers lines, so input that arrives early (e.g. pasted) is not lost
const lines = rl[Symbol.asyncIterator]();

/** Prompts for input without echoing what is typed. */
async function askHidden(question) {
  process.stdout.write(question);
  const { value } = await lines.next();
  return value ?? "";
}

function setEnvValue(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(content)) return content.replace(pattern, line);
  return `${content}${content && !content.endsWith("\n") ? "\n" : ""}${line}\n`;
}

const password = await askHidden("New admin password: ");
if (password.length < MIN_LENGTH) {
  console.error(`Password must be at least ${MIN_LENGTH} characters. Nothing was changed.`);
  process.exit(1);
}
const confirm = await askHidden("Type it again: ");
rl.close();
if (password !== confirm) {
  console.error("The passwords did not match. Nothing was changed.");
  process.exit(1);
}

// Hex only (no "$"), so Next.js's .env variable expansion leaves it intact
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
const passwordHash = `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
const sessionSecret = randomBytes(32).toString("hex");

let env = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";
env = setEnvValue(env, "ADMIN_PASSWORD_HASH", passwordHash);
env = setEnvValue(env, "SESSION_SECRET", sessionSecret);
writeFileSync(ENV_FILE, env);

console.log(`Admin password saved to ${ENV_FILE}. Any admin who was logged in has been logged out.`);
