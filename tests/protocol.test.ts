import test from "node:test";
import assert from "node:assert/strict";
import {
  canUseFreeChat,
  isClarkFounder,
  normalizeUsername,
  parseClientMessage,
  sanitizeDisplayText,
} from "../packages/protocol/src/index";

test("shared protocol sanitizer handles markup, profanity, PII, and severe abuse", () => {
  assert.equal(
    sanitizeDisplayText("<b>nice shit drift</b>"),
    "nice boost drift",
  );
  assert.equal(
    sanitizeDisplayText("email racer@example.com or 555-123-4567"),
    "email [private] or [private]",
  );
  assert.equal(sanitizeDisplayText("h3il hitler"), "[blocked]");
  assert.equal(sanitizeDisplayText("white power"), "[blocked]");
  assert.equal(sanitizeDisplayText("you are trash"), "[blocked]");
  assert.equal(sanitizeDisplayText("go die"), "[blocked]");
  assert.equal(sanitizeDisplayText("f4ggot"), "[blocked]");
  assert.equal(sanitizeDisplayText("n1gger"), "[blocked]");
});

test("shared protocol gates free chat at 13 plus and keeps quick chat available", () => {
  assert.equal(canUseFreeChat(12), false);
  assert.equal(canUseFreeChat(13), true);
  const under13Chat = parseClientMessage({
    type: "chat.send",
    age: 12,
    text: "hello",
  });
  assert.equal(under13Chat.ok, false);
  if (!under13Chat.ok) {
    assert.equal(under13Chat.error, "chat_requires_13_plus");
  }
  assert.equal(
    parseClientMessage({ type: "chat.send", age: 13, text: "hello" }).ok,
    true,
  );
  assert.equal(
    parseClientMessage({ type: "quick.send", text: "Nice drift!" }).ok,
    true,
  );
  assert.equal(
    parseClientMessage({ type: "quick.send", text: "Again?" }).ok,
    true,
  );
  assert.equal(
    parseClientMessage({
      type: "auth.account",
      mode: "auto",
      username: "Drifter",
      password: "secret123",
      age: 13,
    }).ok,
    true,
  );
  assert.equal(
    parseClientMessage({
      type: "auth.account",
      username: "Drifter",
      password: "short",
      age: 13,
    }).ok,
    false,
  );
});

test("username normalization blocks unsafe names without granting Clark admin semantics", () => {
  assert.equal(normalizeUsername("Clark"), "Clark");
  assert.equal(isClarkFounder("Clark"), true);
  assert.equal(isClarkFounder("clark"), false);
  assert.equal(normalizeUsername("h3il hitler"), "");
});

test("shared protocol covers phase 4 backend messages and rejects fake results", () => {
  assert.equal(
    parseClientMessage({
      type: "save.sync",
      schemaVersion: 1,
      payload: { xp: 25, garage: { paint: "#ff4a1f" } },
    }).ok,
    true,
  );
  assert.equal(
    parseClientMessage({
      type: "feedback.submit",
      feedbackType: "bug",
      message: "The arena replay camera clipped through a wall.",
      replyEmail: "",
      diagnostics: { mode: "max-arena" },
    }).ok,
    true,
  );
  assert.equal(
    parseClientMessage({
      type: "reconnect",
      sessionToken: "12345678",
    }).ok,
    true,
  );
  const fakeResult = parseClientMessage({
    type: "results.commit",
    mode: "campaign-survival",
    runId: "local",
    stats: { score: 999999, win: true },
  });
  assert.equal(fakeResult.ok, false);
  if (!fakeResult.ok) {
    assert.equal(fakeResult.error, "authoritative_rejected");
  }
});
