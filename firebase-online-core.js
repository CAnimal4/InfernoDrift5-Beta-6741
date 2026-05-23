export const FIREBASE_USERNAME_PATTERN =
  /^(?!.* {2})[A-Za-z0-9][A-Za-z0-9 _-]{1,18}[A-Za-z0-9]$/;
export const FIREBASE_CHAT_LIMIT = 300;
export const FIREBASE_FEEDBACK_LIMIT = 2500;
export const FIREBASE_SCORE_LIMIT = 1_000_000;
export const FIREBASE_LEADERBOARD_MODE = "all-modes";
export const FIREBASE_BACKEND_MODE = "firebase";
export const FIREBASE_LOBBY_CODE_PATTERN = /^[A-Z0-9]{4,8}$/;
const FIREBASE_LOBBY_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const FIREBASE_SYSTEM_USERNAME_KEYS = new Set(["chatgptcodex"]);

const BLOCKED_TERMS = [
  /(?:^|[^a-z])(?:n|m)[\W_]*[i1!l|][\W_]*g[\W_]*g[\W_]*(?:e|3)?[\W_]*(?:r|a)(?:[^a-z]|$)/i,
  /(?:^|[^a-z])f[\W_]*[a4@][\W_]*g[\W_]*g?[\W_]*(?:o|0)[\W_]*t(?:[^a-z]|$)/i,
  /(?:^|[^a-z])(?:t[\W_]*r[\W_]*[a4@][\W_]*n[\W_]*n[\W_]*y|d[\W_]*y[\W_]*k[\W_]*(?:e|3)|h[\W_]*(?:o|0)[\W_]*m[\W_]*(?:o|0))(?:[^a-z]|$)/i,
  /(?:^|[^a-z])(?:k[\W_]*y[\W_]*s|kill[\W_]*(?:yourself|urself|your[\W_]*self)|hurt[\W_]*(?:yourself|urself|your[\W_]*self)|go[\W_]*(?:die|hurt[\W_]*yourself|hurt[\W_]*urself))(?:[^a-z]|$)/i,
  /(?:^|[^a-z])f[\W_]*(?:u[\W_]*|s[\W_]*)?c[\W_]*k(?:[^a-z]|$)/i,
  /(?:^|[^a-z])(?:b[\W_]*[i1!l|][\W_]*t[\W_]*c[\W_]*h|[a4@][\W_]*s[\W_]*s[\W_]*h[\W_]*(?:o|0)[\W_]*l[\W_]*(?:e|3)|c[\W_]*u[\W_]*n[\W_]*t|d[\W_]*[i1!l|][\W_]*c[\W_]*k)(?:[^a-z]|$)/i,
  /(?:^|[^a-z])(?:r[\W_]*[a4@][\W_]*p[\W_]*(?:e|3)|s[\W_]*(?:e|3)[\W_]*x|p[\W_]*(?:o|0)[\W_]*r[\W_]*n|n[\W_]*u[\W_]*d[\W_]*(?:e|3)[\W_]*s?|h[\W_]*(?:o|0)[\W_]*r[\W_]*n[\W_]*y)(?:[^a-z]|$)/i,
  /h[\W_]*(?:e|3)[\W_]*[i1!l|][\W_]*l[\W_]*h[\W_]*[i1!l|][\W_]*t[\W_]*l[\W_]*(?:e|3)[\W_]*r/i,
  /h[\W_]*[i1!l|][\W_]*t[\W_]*l[\W_]*(?:e|3)[\W_]*r/i,
  /n[\W_]*[a4@][\W_]*z[\W_]*[i1!l|]/i,
  /white[\W_]*power/i,
  /g[\W_]*[a4@][\W_]*s[\W_]*(?:the[\W_]*)?j[\W_]*(?:e|3)[\W_]*w[\W_]*s?/i,
  /j[\W_]*(?:e|3)[\W_]*w[\W_]*(?:r[\W_]*[a4@][\W_]*t|p[\W_]*[i1!l|][\W_]*g|t[\W_]*r[\W_]*[a4@][\W_]*s[\W_]*h)/i,
  /(?:all[\W_]*)?(?:j[\W_]*(?:e|3)[\W_]*w[\W_]*s?|m[\W_]*u[\W_]*s[\W_]*l[\W_]*[i1!l|][\W_]*m[\W_]*s?|b[\W_]*l[\W_]*[a4@][\W_]*c[\W_]*k[\W_]*s?|g[\W_]*[a4@][\W_]*y[\W_]*s?|t[\W_]*r[\W_]*[a4@][\W_]*n[\W_]*s)[\W_]*(?:are|r)[\W_]*(?:evil|dirty|gross|inferior)/i,
  /(?:you|u)[\W_]*(?:are|r)[\W_]*(?:trash|garbage|worthless|ugly|[a4@][\W_]*l[\W_]*(?:o|0)[\W_]*s[\W_]*(?:e|3)[\W_]*r)/i,
  /(?:you|u)[\W_]*(?:suck|should[\W_]*quit)/i,
  /no[\W_]*(?:one|1)[\W_]*likes[\W_]*(?:you|u)/i,
  /(?:send|share|tell|give|text|dm|message|call)[\W_]*(?:me[\W_]*)?(?:your[\W_]*)?(?:password|address|phone|number|email|real[\W_]*name|school|where[\W_]*you[\W_]*live)/i,
  /(?:what|where)[\W_]*(?:is|s|are|r)?[\W_]*(?:your[\W_]*)?(?:password|address|phone|number|email|real[\W_]*name|school|where[\W_]*you[\W_]*live)/i,
  /where[\W_]*(?:do[\W_]*)?(?:you|u)[\W_]*live/i,
  /\b(?:admin|moderator|mod)\b/i,
];

const MILD_REPLACEMENTS = [
  { pattern: /(^|[^a-z0-9])d[\W_]*[a4@][\W_]*m[\W_]*n(?=$|[^a-z0-9])/gi, replacement: "dang" },
  { pattern: /(^|[^a-z0-9])h[\W_]*(?:e|3)[\W_]*l[\W_]*l(?=$|[^a-z0-9])/gi, replacement: "heck" },
  { pattern: /(^|[^a-z0-9])c[\W_]*r[\W_]*[a4@][\W_]*p(?=$|[^a-z0-9])/gi, replacement: "stuff" },
  { pattern: /(^|[^a-z0-9])s[\W_]*h[\W_]*[i1!l|][\W_]*t(?=$|[^a-z0-9])/gi, replacement: "stuff" },
];

const FIREBASE_CREDENTIAL_BADGES = [
  {
    username: "Tosh_the_Sigma",
    password: "iamthesigma",
    badge: "Rizzler",
  },
  {
    username: "Joshua",
    password: "footballcards",
    badge: "Advanced Player",
  },
  {
    username: "MODERATOR",
    password: "thefoxjumpedoverthelazyriver",
    badge: "MOD",
  },
];

function deobfuscate(value = "") {
  return String(value)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[4@]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[7+]/g, "t")
    .replace(/[*]+/g, " ")
    .replace(/[^\w\s-]/g, " ")
    .replace(/([a-z])\1{2,}/g, "$1$1")
    .replace(/\s+/g, " ")
    .trim();
}

function moderationVariants(value = "") {
  const normalized = deobfuscate(value);
  const compact = normalized.replace(/[\W_]+/g, "");
  const squashed = compact.replace(/([a-z])\1+/g, "$1");
  const noSeparator = String(value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[4@]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[7+]/g, "t")
    .replace(/[^a-z0-9]/g, "");
  return [normalized, compact, squashed, noSeparator].filter(Boolean);
}

function hasBlockedContent(value = "") {
  return moderationVariants(value).some((variant) =>
    BLOCKED_TERMS.some((pattern) => pattern.test(variant)),
  );
}

export function normalizeFirebaseUsername(value = "") {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function normalizeFirebaseUsernameKey(value = "") {
  return normalizeFirebaseUsername(value).toLowerCase();
}

function normalizeFirebaseSystemUsernameKey(value = "") {
  return normalizeFirebaseUsername(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function validateFirebaseUsername(value = "") {
  const username = normalizeFirebaseUsername(value);
  const lower = username.toLowerCase();
  if (FIREBASE_SYSTEM_USERNAME_KEYS.has(normalizeFirebaseSystemUsernameKey(username))) {
    return {
      ok: false,
      error: "username_reserved",
      username,
      usernameLower: lower,
    };
  }
  if (!FIREBASE_USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error: "username_invalid",
      username,
      usernameLower: lower,
    };
  }
  if (hasBlockedContent(username)) {
    return {
      ok: false,
      error: "username_rejected",
      username,
      usernameLower: lower,
    };
  }
  return { ok: true, username, usernameLower: lower };
}

function hasFirebaseCredentialAccess(username = "", password = "") {
  const cleanUsername = normalizeFirebaseUsername(username);
  const rawPassword = String(password || "");
  return FIREBASE_CREDENTIAL_BADGES.some(
    (entry) =>
      cleanUsername === entry.username && rawPassword === entry.password,
  );
}

export function isFirebaseCredentialUsername(username = "") {
  const cleanUsername = normalizeFirebaseUsername(username);
  return FIREBASE_CREDENTIAL_BADGES.some(
    (entry) => cleanUsername === entry.username,
  );
}

export function validateFirebaseAccountCredentials(
  value = "",
  password = "",
) {
  const validation = validateFirebaseUsername(value);
  if (validation.ok) return validation;
  const username = normalizeFirebaseUsername(value);
  const lower = username.toLowerCase();
  if (
    validation.error === "username_rejected" &&
    FIREBASE_USERNAME_PATTERN.test(username) &&
    hasFirebaseCredentialAccess(username, password) &&
    !FIREBASE_SYSTEM_USERNAME_KEYS.has(
      normalizeFirebaseSystemUsernameKey(username),
    )
  ) {
    return {
      ok: true,
      username,
      usernameLower: lower,
      credentialOverride: true,
    };
  }
  if (
    validation.error === "username_rejected" &&
    isFirebaseCredentialUsername(username)
  ) {
    return {
      ok: false,
      error: "invalid_credentials",
      username,
      usernameLower: lower,
    };
  }
  return validation;
}

export function usernameToFirebaseEmail(username = "") {
  const validation = validateFirebaseUsername(username);
  if (!validation.ok) throw new Error(validation.error);
  const emailKey = validation.usernameLower
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._-]/g, "-");
  return `id4.${emailKey}@infernodrift4.firebaseapp.com`;
}

export function getFirebaseBadges(username = "") {
  if (username === "Clark") return ["Founder"];
  if (username === "JFine") return ["Advanced Player"];
  return [];
}

export function getFirebaseCredentialBadges(username = "", password = "") {
  const badges = getFirebaseBadges(username);
  const cleanUsername = String(username || "").trim();
  const rawPassword = String(password || "");
  for (const entry of FIREBASE_CREDENTIAL_BADGES) {
    if (cleanUsername === entry.username && rawPassword === entry.password) {
      return badges.includes(entry.badge) ? badges : [...badges, entry.badge];
    }
  }
  return badges;
}

export function sanitizeFirebaseText(value = "", limit = FIREBASE_CHAT_LIMIT) {
  let text = String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
  if (!text) return { ok: false, error: "empty_text", text: "" };
  if (hasBlockedContent(text)) {
    return { ok: false, error: "text_rejected", text: "" };
  }
  for (const { pattern, replacement } of MILD_REPLACEMENTS) {
    text = text.replace(pattern, `$1${replacement}`);
  }
  return { ok: true, text };
}

export function validateFirebaseScore(row = {}) {
  const rawScore = row.score ?? row.xp ?? row.totalXp;
  const numericScore = Number(rawScore);
  const score = Math.floor(numericScore);
  const mode = String(row.mode || FIREBASE_LEADERBOARD_MODE)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .slice(0, 40);
  if (
    rawScore === undefined ||
    !Number.isFinite(numericScore) ||
    score < 0 ||
    score > FIREBASE_SCORE_LIMIT
  ) {
    return { ok: false, error: "score_rejected", score, mode };
  }
  return { ok: true, score, mode: mode || FIREBASE_LEADERBOARD_MODE };
}

export function validateFirebaseFeedback(message = "") {
  const text = String(message || "").trim();
  if (!text) return { ok: false, error: "empty_feedback" };
  if (text.length > FIREBASE_FEEDBACK_LIMIT) {
    return { ok: false, error: "feedback_too_long" };
  }
  const clean = sanitizeFirebaseText(text, FIREBASE_FEEDBACK_LIMIT);
  if (!clean.ok) return { ok: false, error: "feedback_rejected" };
  return { ok: true, text: clean.text };
}

export function normalizeFirebaseLobbyCode(value = "") {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

export function validateFirebaseLobbyCode(value = "") {
  const code = normalizeFirebaseLobbyCode(value);
  if (!FIREBASE_LOBBY_CODE_PATTERN.test(code)) {
    return { ok: false, error: "room_not_found", code };
  }
  return { ok: true, code };
}

export function createFirebaseLobbyCode({
  random = globalThis.crypto,
  length = 5,
} = {}) {
  const size = Math.max(4, Math.min(8, Math.floor(Number(length) || 5)));
  const bytes = new Uint8Array(size);
  if (random?.getRandomValues) random.getRandomValues(bytes);
  else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (byte) => {
    return FIREBASE_LOBBY_CODE_ALPHABET[
      byte % FIREBASE_LOBBY_CODE_ALPHABET.length
    ];
  }).join("");
}

export function mapFirebaseError(error) {
  const code = String(
    error?.code || error?.message || error || "firebase_error",
  )
    .replace(/^Firebase:\s*/i, "")
    .replace(/[()]/g, "")
    .toLowerCase();
  if (code.includes("network") || code.includes("unavailable")) {
    return "firebase_unavailable";
  }
  if (
    code.includes("invalid-credential") ||
    code.includes("invalid_login_credentials") ||
    code.includes("wrong-password")
  ) {
    return "invalid_credentials";
  }
  if (code.includes("email-already-in-use")) return "username_taken";
  if (code.includes("user-not-found")) return "account_not_found";
  if (code.includes("weak-password")) return "weak_password";
  if (code.includes("permission-denied")) return "permission_denied";
  if (code.includes("username_taken")) return "username_taken";
  return code.replace(/[^a-z0-9_ -]/g, "").replace(/\s+/g, "_");
}
