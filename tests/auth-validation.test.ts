import test from "node:test";
import assert from "node:assert/strict";
import { loginSchema, registerSchema } from "../src/lib/auth/validation";

test("registration normalizes email and accepts supported language", () => {
  const value = registerSchema.parse({ name: "  Ananya Rao  ", email: " Student@Example.COM ", password: "charaka1", preferredLanguage: "mr" });
  assert.equal(value.email, "student@example.com");
  assert.equal(value.name, "Ananya Rao");
  assert.equal(value.preferredLanguage, "mr");
});

test("registration rejects a weak password", () => {
  const value = registerSchema.safeParse({ name: "Ananya", email: "a@example.com", password: "onlyletters", preferredLanguage: "en" });
  assert.equal(value.success, false);
});

test("login rejects malformed email", () => {
  assert.equal(loginSchema.safeParse({ email: "not-an-email", password: "anything" }).success, false);
});
