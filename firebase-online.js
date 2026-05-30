import {
  FIREBASE_BACKEND_MODE,
  FIREBASE_CHAT_LIMIT,
  FIREBASE_LEADERBOARD_MODE,
  createFirebaseLobbyCode,
  getFirebaseBadges,
  getFirebaseCredentialBadges,
  isFirebaseCredentialUsername,
  mapFirebaseError,
  normalizeFirebaseLobbyCode,
  normalizeFirebaseUsername,
  normalizeFirebaseUsernameKey,
  sanitizeFirebaseText,
  validateFirebaseAccountCredentials,
  validateFirebaseFeedback,
  validateFirebaseLobbyCode,
  validateFirebaseScore,
  validateFirebaseUsername,
} from "./firebase-online-core.js?v=20260526-safety-sync-v1";

const FIREBASE_SDK_VERSION = "10.13.2";
const FIREBASE_SDK_BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;
const CHAT_ROOM_ID = "lobby";
const LOBBY_COLLECTION_ID = "lobbies";
const DIAGNOSTICS_DOC_ID = "client-smoke";
const CHAT_HISTORY_LIMIT = 40;
// One-time visible chat cleanup after moderation testing on 2026-05-23.
// New messages continue normally; older docs remain protected by Firestore rules.
const CHAT_VISIBLE_AFTER = "2026-05-23T23:52:05Z";
const FRIEND_QUERY_LIMIT = 50;
const CHAT_COOLDOWN_MS = 1700;
const FIREBASE_LOBBY_MAX_PLAYERS = 8;
const FIREBASE_LIVE_MODES = new Set([
  "infernodriftmax1",
  "max-arena",
  "battle-arena",
  "time-trial",
]);
const FIREBASE_LIVE_PLAYER_LIMIT = 8;
const SPECIAL_BADGE_CONTAMINATED_XP_THRESHOLD = 90_000;
const FIREBASE_TEST_ACCOUNT_NAME_BLOCKLIST = new Set([
  "ajhdfiumhziwuehrmz",
  "akfjicoajsodifjmoi",
  "sajoumzjeimxuhen",
]);

function isFirebaseTestLikeAccountName(value = "") {
  const normalized = String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
  const compact = normalized.replace(/[^a-z0-9]/g, "");
  if (!compact) return false;
  if (FIREBASE_TEST_ACCOUNT_NAME_BLOCKLIST.has(compact)) return true;
  if (/(^|[^a-z])(test|teest|smoke|fresh|runner|pilot)([^a-z]|$)/i.test(normalized))
    return true;
  if (/^(test|teest|smoke|fresh|runner|pilot)[a-z0-9_-]*$/i.test(compact)) return true;
  return compact.length >= 14 && /^[a-z]+$/.test(compact);
}
const FIREBASE_LIVE_STATE_LIMIT = 12000;

let sdkPromise = null;

function nowIso() {
  return new Date().toISOString();
}

const DM_INBOX_SEEN_STORAGE_PREFIX = "infernoDrift4.dmInboxSeen.v1.";

function getDmInboxSeenStorageKey(uid = state.uid) {
  return `${DM_INBOX_SEEN_STORAGE_PREFIX}${String(uid || "guest")}`;
}

function readDmInboxSeenIds(uid = state.uid) {
  try {
    const raw = globalThis.localStorage?.getItem(getDmInboxSeenStorageKey(uid));
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function writeDmInboxSeenIds(ids, uid = state.uid) {
  try {
    const trimmed = [...ids].filter(Boolean).slice(-240);
    globalThis.localStorage?.setItem(
      getDmInboxSeenStorageKey(uid),
      JSON.stringify(trimmed),
    );
  } catch {
    // Local storage is optional; live inbox messages still notify this session.
  }
}

function rememberDmInboxMessages(messages = [], uid = state.uid) {
  const seen = readDmInboxSeenIds(uid);
  let changed = false;
  (Array.isArray(messages) ? messages : []).forEach((message) => {
    if (!message?.id) return;
    if (!seen.has(message.id)) {
      seen.add(message.id);
      changed = true;
    }
  });
  if (changed) writeDmInboxSeenIds(seen, uid);
}

function withTimeout(promise, timeoutMs, errorCode) {
  let timer = 0;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(errorCode)), timeoutMs);
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableLobbyVersionError(error) {
  const code = String(error?.code || "").toLowerCase();
  const message = String(error?.message || error || "").toLowerCase();
  return (
    code.includes("aborted") ||
    code.includes("conflict") ||
    message.includes("stored version") ||
    message.includes("required base version") ||
    message.includes("aborted") ||
    message.includes("transaction")
  );
}

function stripUndefinedForFirestore(value) {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.map((item) => {
      const clean = stripUndefinedForFirestore(item);
      return clean === undefined ? null : clean;
    });
  }
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    const clean = stripUndefinedForFirestore(item);
    if (clean !== undefined) output[key] = clean;
  }
  return output;
}

async function loadFirebaseSdk() {
  if (!sdkPromise) {
    sdkPromise = Promise.all([
      import(`${FIREBASE_SDK_BASE}/firebase-app.js`),
      import(`${FIREBASE_SDK_BASE}/firebase-auth.js`),
      import(`${FIREBASE_SDK_BASE}/firebase-firestore.js`),
    ]).then(([app, auth, firestore]) => ({ app, auth, firestore }));
  }
  return sdkPromise;
}

function getEffectiveFirebaseBadges(username = "", profile = {}) {
  return [
    ...new Set([
      ...(Array.isArray(profile.badges) ? profile.badges : []),
      ...getFirebaseBadges(username),
    ]),
  ];
}

function getProfileProgressRepairHint(profile = {}) {
  const progress = profile?.progress;
  if (!hasObsoleteSpecialBadgeRepairMarker(progress)) return null;
  return stripUndefinedForFirestore({
    specialBadgeProgressSource: progress.specialBadgeProgressSource,
    specialBadgeRepairVersion: progress.specialBadgeRepairVersion,
    specialBadgeProgressRepairedAt: progress.specialBadgeProgressRepairedAt,
    specialBadgeProgressBaselineXp: progress.specialBadgeProgressBaselineXp,
    publicProfileTotalXp: getProgressionXpValue(progress),
  });
}

function removeObsoleteSpecialBadgeRepairMarkers(progression = {}) {
  const clean = { ...(progression || {}) };
  delete clean.specialBadgeRepairVersion;
  delete clean.specialBadgeProgressRepairedAt;
  delete clean.specialBadgeProgressBaselineXp;
  delete clean.specialBadgeProgressEarnedAfterRepair;
  delete clean.specialBadgeProgressSource;
  return clean;
}

function repairSavePayloadWithProfileMarker(payload = null, profile = {}) {
  if (!payload || typeof payload !== "object") return payload;
  const progression = payload.progressionV2;
  if (!progression || typeof progression !== "object") return payload;
  const profileHint = getProfileProgressRepairHint(profile);
  const progressHasMarker = hasObsoleteSpecialBadgeRepairMarker(progression);
  if (!progressHasMarker && !profileHint) {
    return payload;
  }
  const cleanProgression = removeObsoleteSpecialBadgeRepairMarkers(progression);
  const rawXp = getProgressionXpValue(progression);
  if (rawXp >= SPECIAL_BADGE_CONTAMINATED_XP_THRESHOLD) {
    return {
      ...payload,
      progressionV2: {
        ...cleanProgression,
        xp: 0,
        totalXp: 0,
        accountProgressRepair: {
          source: "special-badge-tainted-xp-blocked",
          blockedTotalXp: rawXp,
          markerSource: progressHasMarker ? "progress-payload" : "public-profile",
          requiresReview: true,
        },
      },
    };
  }
  return {
    ...payload,
    progressionV2: cleanProgression,
  };
}

function isBlockedTaintedRepairPayload(payload = null) {
  const progression = payload?.progressionV2;
  return Boolean(
    progression?.accountProgressRepair?.source ===
      "special-badge-tainted-xp-blocked" &&
      getProgressionXpValue(progression) === 0 &&
      Math.max(0, Number(progression?.accountProgressRepair?.blockedTotalXp) || 0) >
        0,
  );
}

function makeUserPayload(uid, profile = {}) {
  const rawUsername = normalizeFirebaseUsername(
    profile.username || profile.displayName || "Guest Racer",
  );
  const usernameValidation = validateFirebaseUsername(rawUsername);
  const username = usernameValidation.ok
    ? usernameValidation.username
    : isFirebaseCredentialUsername(rawUsername)
      ? rawUsername
    : "Guest_Racer";
  const badges = getEffectiveFirebaseBadges(username, profile);
  return {
    id: uid,
    uid,
    username,
    badge: badges[0] || "",
    badges,
    account: !profile.isGuest,
    guest: Boolean(profile.isGuest),
    moderator: false,
    role: "player",
    backendMode: FIREBASE_BACKEND_MODE,
    progressRepairHint: getProfileProgressRepairHint(profile),
  };
}

function getSavePayloadXp(payload = {}) {
  return Math.max(
    0,
    Math.floor(
      Number(payload?.progressionV2?.totalXp ?? payload?.progressionV2?.xp) ||
        0,
    ),
  );
}

function chooseBestSavePayload(...payloads) {
  return payloads
    .filter((payload) => payload && typeof payload === "object")
    .sort((a, b) => getSavePayloadXp(b) - getSavePayloadXp(a))[0];
}

function chooseTrustedAccountSeedPayload(existingPayload = null, savePayload = null) {
  if (!existingPayload || typeof existingPayload !== "object") {
    return savePayload && typeof savePayload === "object" ? savePayload : null;
  }
  if (!savePayload || typeof savePayload !== "object") return existingPayload;
  return mergeFirebaseSavePayload(existingPayload, savePayload);
}

function uniqueArrayValues(...values) {
  return [
    ...new Set(
      values.flatMap((value) => (Array.isArray(value) ? value : [])),
    ),
  ];
}

function getPayloadUpdatedAt(payload = {}) {
  const raw =
    payload?.saveMeta?.updatedAtMs ??
    payload?.saveMeta?.updatedAtClient ??
    payload?.progressionV2?.updatedAtMs ??
    payload?.progressionV2?.updatedAtClient ??
    payload?.updatedAtClient;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const parsed = Date.parse(String(raw || ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function chooseLatestSavePayload(existingPayload = {}, incomingPayload = {}) {
  const existingTime = getPayloadUpdatedAt(existingPayload);
  const incomingTime = getPayloadUpdatedAt(incomingPayload);
  if (!incomingTime && existingTime) return existingPayload;
  if (!incomingTime) return incomingPayload || existingPayload;
  if (!existingTime) return incomingPayload;
  if (incomingTime > existingTime) return incomingPayload;
  if (existingTime > incomingTime) return existingPayload;
  return incomingPayload || existingPayload;
}

function mergeFirebaseChallenge(existing = {}, incoming = {}) {
  if (!existing || typeof existing !== "object") return incoming;
  if (!incoming || typeof incoming !== "object") return existing;
  if (existing.seed && incoming.seed && existing.seed !== incoming.seed) {
    return incoming;
  }
  return {
    ...incoming,
    progress: Math.max(Number(existing.progress) || 0, Number(incoming.progress) || 0),
    complete: Boolean(existing.complete || incoming.complete),
  };
}

function mergeFirebaseDailySparks(existing = {}, incoming = {}) {
  if (!existing || typeof existing !== "object") return incoming;
  if (!incoming || typeof incoming !== "object") return existing;
  if (existing.seed && incoming.seed && existing.seed !== incoming.seed) {
    return incoming;
  }
  const itemsById = new Map();
  [...(Array.isArray(existing.items) ? existing.items : []), ...(Array.isArray(incoming.items) ? incoming.items : [])].forEach((item) => {
    if (!item?.id) return;
    const previous = itemsById.get(item.id) || {};
    itemsById.set(item.id, {
      ...previous,
      ...item,
      progress: Math.max(Number(previous.progress) || 0, Number(item.progress) || 0),
      claimed: Boolean(previous.claimed || item.claimed),
      completed: Boolean(previous.completed || item.completed),
      modeIds: uniqueArrayValues(previous.modeIds, item.modeIds).slice(0, 8),
    });
  });
  return {
    ...(incoming || existing),
    seed: incoming.seed || existing.seed,
    items: [...itemsById.values()],
  };
}

function hasObsoleteSpecialBadgeRepairMarker(progression = {}) {
  return Boolean(
    progression?.specialBadgeProgressSource === "special-badge-xp-repair" ||
      progression?.specialBadgeProgressRepairedAt ||
      Number.isFinite(Number(progression?.specialBadgeProgressBaselineXp)),
  );
}

function getProgressionXpValue(progression = {}) {
  return Math.max(
    0,
    Math.floor(Number(progression?.totalXp ?? progression?.xp) || 0),
  );
}

function getTrustedFirebaseProgressionXp(progression = {}) {
  const xp = getProgressionXpValue(progression);
  return hasObsoleteSpecialBadgeRepairMarker(progression) &&
    xp >= SPECIAL_BADGE_CONTAMINATED_XP_THRESHOLD
    ? null
    : xp;
}

function getMergedFirebaseProgressionXp(existing = {}, incoming = {}) {
  const trustedValues = [
    getTrustedFirebaseProgressionXp(existing),
    getTrustedFirebaseProgressionXp(incoming),
  ].filter((value) => Number.isFinite(value));
  if (trustedValues.length) return Math.max(...trustedValues);
  return 0;
}

export function mergeFirebaseProgression(existing = {}, incoming = {}) {
  const latestProgression = chooseLatestSavePayload(
    { progressionV2: existing },
    { progressionV2: incoming },
  ).progressionV2 || incoming || existing;
  const xp = getMergedFirebaseProgressionXp(existing, incoming);
  const dailyGift =
    existing.dailyGift?.seed && existing.dailyGift.seed === incoming.dailyGift?.seed
      ? {
          ...(latestProgression.dailyGift || {}),
          claimed: Boolean(existing.dailyGift.claimed || incoming.dailyGift.claimed),
          claimedAt:
            [existing.dailyGift.claimedAt, incoming.dailyGift.claimedAt]
              .filter(Boolean)
              .sort()
              .at(-1) || "",
        }
      : latestProgression.dailyGift;
  const merged = {
    ...existing,
    ...incoming,
    xp,
    totalXp: xp,
    embers: Math.max(0, Math.floor(Number(latestProgression.embers) || 0)),
    medals: { ...(existing.medals || {}), ...(incoming.medals || {}) },
    personalBests: {
      ...(existing.personalBests || {}),
      ...(incoming.personalBests || {}),
    },
    ghostSamples: {
      ...(existing.ghostSamples || {}),
      ...(incoming.ghostSamples || {}),
    },
    unlockedRewards: uniqueArrayValues(
      existing.unlockedRewards,
      incoming.unlockedRewards,
    ),
    ownedCosmetics: uniqueArrayValues(
      existing.ownedCosmetics,
      incoming.ownedCosmetics,
    ),
    claimedLevelRewards: uniqueArrayValues(
      existing.claimedLevelRewards,
      incoming.claimedLevelRewards,
    ),
    seenModeIntros: {
      ...(existing.seenModeIntros || {}),
      ...(incoming.seenModeIntros || {}),
    },
    tutorialComplete: Boolean(existing.tutorialComplete || incoming.tutorialComplete),
    dailySparks: mergeFirebaseDailySparks(existing.dailySparks, incoming.dailySparks),
    dailyGift,
    dailyGiftSalt: latestProgression.dailyGiftSalt,
    daily: mergeFirebaseChallenge(existing.daily, incoming.daily),
    weekly: mergeFirebaseChallenge(existing.weekly, incoming.weekly),
    rewardLog: uniqueArrayValues(incoming.rewardLog, existing.rewardLog).slice(0, 12),
    recentRewards: uniqueArrayValues(
      incoming.recentRewards,
      existing.recentRewards,
    ).slice(0, 12),
    updatedAtClient: latestProgression.updatedAtClient,
    updatedAtMs: latestProgression.updatedAtMs,
  };
  delete merged.specialBadgeRepairVersion;
  delete merged.specialBadgeProgressRepairedAt;
  delete merged.specialBadgeProgressBaselineXp;
  delete merged.specialBadgeProgressEarnedAfterRepair;
  delete merged.specialBadgeProgressSource;
  return merged;
}

export function mergeFirebaseSavePayload(
  existingPayload = null,
  incomingPayload = null,
  { replaceProgression = false } = {},
) {
  if (!existingPayload || typeof existingPayload !== "object")
    return incomingPayload;
  if (!incomingPayload || typeof incomingPayload !== "object")
    return existingPayload;
  if (replaceProgression) return incomingPayload;
  const existingProgression = existingPayload.progressionV2 || {};
  const incomingProgression = incomingPayload.progressionV2 || {};
  const mergedProgression = mergeFirebaseProgression(
    existingProgression,
    incomingProgression,
  );
  const bestShell = chooseBestSavePayload(existingPayload, incomingPayload) || incomingPayload;
  const latestShell = chooseLatestSavePayload(existingPayload, incomingPayload) || incomingPayload;
  if (latestShell.progressionV2 && Number.isFinite(Number(latestShell.progressionV2.embers))) {
    mergedProgression.embers = Math.max(
      0,
      Math.floor(Number(latestShell.progressionV2.embers) || 0),
    );
  }
  return {
    ...bestShell,
    saveMeta: latestShell.saveMeta || incomingPayload.saveMeta || existingPayload.saveMeta,
    settings: { ...(existingPayload.settings || {}), ...(latestShell.settings || {}) },
    customization: latestShell.customization || incomingPayload.customization || existingPayload.customization,
    garage: latestShell.garage || incomingPayload.garage || existingPayload.garage,
    maxTeamCustomization:
      latestShell.maxTeamCustomization ||
      incomingPayload.maxTeamCustomization ||
      existingPayload.maxTeamCustomization,
    controlBindings:
      latestShell.controlBindings ||
      incomingPayload.controlBindings ||
      existingPayload.controlBindings,
    progressionV2: mergedProgression,
  };
}

function mapChatDoc(snapshot) {
  const data = snapshot.data() || {};
  const createdAt = data.createdAt?.toDate?.();
  const roomInvite =
    data.roomInvite && typeof data.roomInvite === "object"
      ? {
          code: normalizeFirebaseLobbyCode(data.roomInvite.code),
          mode: data.roomInvite.mode || "",
          playlist: data.roomInvite.playlist || "",
          teamSize: Number(data.roomInvite.teamSize) || 0,
          size: Number(data.roomInvite.size) || 0,
          firebaseLobby: Boolean(data.roomInvite.firebaseLobby),
        }
      : null;
  return {
    id: snapshot.id,
    from: data.username || "Player",
    userId: data.uid || "",
    badge: Array.isArray(data.badges) ? data.badges[0] || "" : "",
    moderator: false,
    text: data.text || "",
    quick: data.type === "quick",
    channel: data.channel || "lobby",
    direct: data.type === "direct",
    toUserId: data.toUid || "",
    toUsername: data.toUsername || "",
    roomInvite,
    roomCode: roomInvite?.code || "",
    roomMode: roomInvite?.mode || "",
    at: createdAt ? createdAt.toISOString() : data.createdAtClient || nowIso(),
  };
}

function isVisibleChatMessage(message = {}) {
  const cutoff = Date.parse(CHAT_VISIBLE_AFTER);
  if (!Number.isFinite(cutoff)) return true;
  const timestamp = Date.parse(String(message.at || ""));
  if (!Number.isFinite(timestamp)) return true;
  return timestamp >= cutoff;
}

function mapLeaderboardDoc(snapshot) {
  const data = snapshot.data() || {};
  const guest = Boolean(data.guest);
  const badges = getEffectiveFirebaseBadges(data.username || "Player", data);
  return {
    id: snapshot.id,
    userId: data.uid || "",
    username: data.username || "Player",
    badge: badges[0] || "",
    xp: Math.max(0, Math.floor(Number(data.score || 0))),
    totalXp: Math.max(0, Math.floor(Number(data.score || 0))),
    mode: data.mode || FIREBASE_LEADERBOARD_MODE,
    playlist: "Firebase",
    source: "server",
    scope: "Total XP",
    verified: false,
    account: data.account !== false && !guest,
    guest,
  };
}

function requestKey(fromUid, toUid) {
  return [String(fromUid || ""), String(toUid || "")].sort().join("_");
}

function getLobbyPlayerTeam(index = 0, teamSize = 1) {
  const safeTeamSize = Math.max(1, Math.min(3, Math.floor(Number(teamSize) || 1)));
  return Math.floor(Math.max(0, index) / safeTeamSize) % 2 === 0
    ? "blue"
    : "red";
}

function mapLobbyDoc(snapshot) {
  const data = snapshot.data() || {};
  const players = Array.isArray(data.players)
    ? data.players.slice(0, FIREBASE_LOBBY_MAX_PLAYERS).map((player, index) => ({
        id: player.uid || player.id || "",
        uid: player.uid || player.id || "",
        username: player.username || "Player",
        badge: Array.isArray(player.badges) ? player.badges[0] || "" : "",
        badges: Array.isArray(player.badges) ? player.badges : [],
        team:
          player.team === "red" || player.team === "blue"
            ? player.team
            : getLobbyPlayerTeam(index, data.teamSize),
        host: player.uid === data.hostUid || player.id === data.hostUid,
        firebaseLobby: true,
      }))
    : [];
  return {
    id: snapshot.id,
    code: data.code || snapshot.id,
    mode: data.mode || "max-arena",
    playlist: data.playlist || "firebase-lobby",
    teamSize: Number(data.teamSize) || 2,
    size: Number(data.size) || FIREBASE_LOBBY_MAX_PLAYERS,
    botFill: data.botFill !== false,
    bots: Array.isArray(data.liveState?.bots) ? data.liveState.bots.length : 0,
    private: true,
    live: Boolean(data.live || data.liveState),
    firebaseLobby: true,
    backendMode: FIREBASE_BACKEND_MODE,
    hostUid: data.hostUid || "",
    hostUsername: data.hostUsername || "",
    players,
    liveHostUid: data.liveHostUid || data.hostUid || "",
    liveSeq: Math.max(0, Math.floor(Number(data.liveSeq || 0))),
    liveUpdatedAt: data.liveUpdatedAt || "",
    liveState:
      data.liveState && typeof data.liveState === "object"
        ? data.liveState
        : null,
    livePlayers:
      data.livePlayers && typeof data.livePlayers === "object"
        ? data.livePlayers
        : {},
  };
}

function isLiveLobbyMode(mode) {
  return FIREBASE_LIVE_MODES.has(String(mode || ""));
}

function trimLivePayload(value, fallback = {}) {
  const text = JSON.stringify(value ?? fallback);
  if (text.length <= FIREBASE_LIVE_STATE_LIMIT) return value ?? fallback;
  return fallback;
}

function sanitizeLiveCosmetics(input = null) {
  if (!input || typeof input !== "object") return null;
  return Object.fromEntries(
    Object.entries(input)
      .slice(0, 18)
      .map(([key, value]) => [
        String(key).slice(0, 32),
        String(value || "").slice(0, 48),
      ]),
  );
}

function sanitizeLivePlayerSnapshot(input = {}, uid = "") {
  const n = (value, fallback = 0, digits = 2) => {
    const number = Number(value);
    return Number.isFinite(number) ? Number(number.toFixed(digits)) : fallback;
  };
  return trimLivePayload(
    {
      id: String(input.id || uid).slice(0, 80),
      uid: String(input.uid || uid).slice(0, 80),
      username: normalizeFirebaseUsername(input.username || "Player"),
      team: ["blue", "red", "neutral"].includes(input.team)
        ? input.team
        : "neutral",
      x: n(input.x),
      y: n(input.y),
      z: n(input.z),
      heading: n(input.heading, 0, 4),
      speed: Math.max(0, Math.min(260, Math.round(Number(input.speed) || 0))),
      boost: Boolean(input.boost),
      drift: Boolean(input.drift),
      airborne: Boolean(input.airborne),
      backflip: Boolean(input.backflip),
      backflipProgress: Math.max(0, Math.min(1, n(input.backflipProgress, 0, 3))),
      barrelRoll: Boolean(input.barrelRoll),
      barrelRollProgress: Math.max(0, Math.min(1, n(input.barrelRollProgress, 0, 3))),
      demolished: Boolean(input.demolished),
      health: Math.max(0, Math.min(999, Math.round(Number(input.health) || 0))),
      score: Math.max(0, Math.floor(Number(input.score) || 0)),
      progress: Math.max(0, Number(n(input.progress))),
      checkpoint: Math.max(0, Math.floor(Number(input.checkpoint) || 0)),
      cosmetics: sanitizeLiveCosmetics(input.cosmetics),
      at: nowIso(),
    },
    {
      id: String(uid).slice(0, 80),
      uid: String(uid).slice(0, 80),
      username: "Player",
      team: "neutral",
      x: 0,
      y: 0,
      z: 0,
      heading: 0,
      speed: 0,
      at: nowIso(),
    },
  );
}

function sanitizeLiveStateSnapshot(input = {}) {
  if (!input || typeof input !== "object") return null;
  const n = (value, fallback = 0, digits = 2) => {
    const number = Number(value);
    return Number.isFinite(number) ? Number(number.toFixed(digits)) : fallback;
  };
  const sanitizeCar = (car = {}) => ({
    id: String(car.id || car.uid || car.botId || "").slice(0, 80),
    username: String(car.username || car.name || "Player").slice(0, 24),
    team: ["blue", "red", "neutral"].includes(car.team) ? car.team : "neutral",
    x: n(car.x),
    y: n(car.y),
    z: n(car.z),
    heading: n(car.heading, 0, 4),
    speed: Math.max(0, Math.min(260, Math.round(Number(car.speed) || 0))),
    boost: Boolean(car.boost),
    airborne: Boolean(car.airborne),
    backflip: Boolean(car.backflip),
    backflipProgress: Math.max(0, Math.min(1, n(car.backflipProgress, 0, 3))),
    barrelRoll: Boolean(car.barrelRoll),
    barrelRollProgress: Math.max(0, Math.min(1, n(car.barrelRollProgress, 0, 3))),
    demolished: Boolean(car.demolished),
    health: Math.max(0, Math.min(999, Math.round(Number(car.health) || 0))),
    role: String(car.role || "").slice(0, 24),
    cosmetics: sanitizeLiveCosmetics(car.cosmetics),
  });
  return trimLivePayload(
    {
      mode: String(input.mode || "").slice(0, 40),
      hostUid: String(input.hostUid || "").slice(0, 80),
      seq: Math.max(0, Math.floor(Number(input.seq || 0))),
      clock: Math.max(0, Number(n(input.clock))),
      timeLeft: Math.max(0, Number(n(input.timeLeft))),
      score: input.score && typeof input.score === "object" ? input.score : {},
      players: Array.isArray(input.players)
        ? input.players.slice(0, FIREBASE_LIVE_PLAYER_LIMIT).map(sanitizeCar)
        : [],
      bots: Array.isArray(input.bots)
        ? input.bots.slice(0, 12).map(sanitizeCar)
        : [],
      max:
        input.max && typeof input.max === "object"
          ? {
              ball: input.max.ball
                ? {
                    x: n(input.max.ball.x),
                    y: n(input.max.ball.y, 4.2),
                    z: n(input.max.ball.z),
                    vx: n(input.max.ball.vx),
                    vy: n(input.max.ball.vy),
                    vz: n(input.max.ball.vz),
                  }
                : null,
              blueScore: Math.max(
                0,
                Math.floor(Number(input.max.blueScore) || 0),
              ),
              redScore: Math.max(
                0,
                Math.floor(Number(input.max.redScore) || 0),
              ),
            }
          : null,
      battle:
        input.battle && typeof input.battle === "object"
          ? {
              blueScore: Math.max(
                0,
                Math.floor(Number(input.battle.blueScore) || 0),
              ),
              redScore: Math.max(
                0,
                Math.floor(Number(input.battle.redScore) || 0),
              ),
              blueFlag: input.battle.blueFlag || null,
              redFlag: input.battle.redFlag || null,
              message: String(input.battle.message || "").slice(0, 80),
            }
          : null,
      timeTrial:
        input.timeTrial && typeof input.timeTrial === "object"
          ? {
              progress: Math.max(0, Number(n(input.timeTrial.progress))),
              target: Math.max(0, Number(n(input.timeTrial.target))),
              bestPlayer: String(input.timeTrial.bestPlayer || "").slice(0, 24),
            }
          : null,
      updatedAtClient: nowIso(),
    },
    null,
  );
}

function sanitizeLivePlayerId(value = "") {
  return String(value || "")
    .trim()
    .slice(0, 80);
}

export function createFirebaseOnlineService({ config = {}, onEvent } = {}) {
  const state = {
    mode: FIREBASE_BACKEND_MODE,
    configured: false,
    initialized: false,
    available: false,
    authenticated: false,
    uid: "",
    username: "",
    isGuest: false,
    projectId: String(config?.projectId || ""),
    authStatus: "idle",
    firestoreStatus: "idle",
    chatStatus: "idle",
    leaderboardStatus: "idle",
    friendsStatus: "idle",
    diagnosticsStatus: "idle",
    lastError: "",
    chatListenerActive: false,
    fallbackOffline: false,
  };
  const internals = {
    sdk: null,
    app: null,
    auth: null,
    db: null,
    userProfile: null,
    unsubscribers: [],
    chatRoomIds: new Set(),
    dmChatUnsubscribe: null,
    dmInboxUnsubscribe: null,
    dmThreadUnsubscribers: new Map(),
    accountUnsubscribers: [],
    lobbyUnsubscribe: null,
    lobbyCode: "",
    lastChatAt: 0,
  };

  function emit(type, payload = {}) {
    if (typeof onEvent === "function") onEvent({ type, ...payload });
  }

  function fail(error, fallbackCode = "firebase_error") {
    const code = mapFirebaseError(error) || fallbackCode;
    state.lastError = code;
    return code;
  }

  function getStatus() {
    return {
      ...state,
      user: internals.userProfile
        ? makeUserPayload(state.uid, internals.userProfile)
        : null,
    };
  }

  function requireReady() {
    if (!state.available || !internals.db || !internals.auth) {
      throw new Error(state.lastError || "firebase_unavailable");
    }
  }

  async function init({ timeoutMs = 8000 } = {}) {
    state.configured = Boolean(
      config?.projectId && config?.apiKey && config?.authDomain,
    );
    state.projectId = String(config?.projectId || "not-configured");
    if (!state.configured) {
      state.available = false;
      state.lastError = "firebase_not_configured";
      return getStatus();
    }
    if (state.initialized) return getStatus();
    state.authStatus = "checking-online";
    state.firestoreStatus = "checking-online";
    try {
      await withTimeout(
        (async () => {
          const sdk = await loadFirebaseSdk();
          const app =
            sdk.app.getApps().find((entry) => entry.name === "[DEFAULT]") ||
            sdk.app.initializeApp(config);
          internals.sdk = sdk;
          internals.app = app;
          internals.auth = sdk.auth.getAuth(app);
          internals.db = sdk.firestore.getFirestore(app);
          sdk.auth.onAuthStateChanged(internals.auth, async (user) => {
            if (!user) {
              state.authenticated = false;
              state.uid = "";
              internals.userProfile = null;
              stopAccountSubscriptions();
              return;
            }
            state.uid = user.uid;
            state.authenticated = true;
            await loadUserProfile(user.uid).catch(() => undefined);
            subscribeAccountState();
          });
        })(),
        timeoutMs,
        "firebase_timeout",
      );
      state.initialized = true;
      state.available = true;
      state.authStatus = "firebase-available";
      state.firestoreStatus = "ready";
      state.lastError = "";
      return getStatus();
    } catch (error) {
      state.initialized = false;
      state.available = false;
      state.authStatus = "firebase-unavailable";
      state.firestoreStatus = "unavailable";
      fail(error, "firebase_unavailable");
      return getStatus();
    }
  }

  async function loadUserProfile(uid = state.uid) {
    requireReady();
    const { firestore } = internals.sdk;
    const ref = firestore.doc(internals.db, "users", uid);
    const snapshot = await firestore.getDoc(ref);
    internals.userProfile = snapshot.exists() ? snapshot.data() : null;
    if (internals.userProfile) {
      state.username = normalizeFirebaseUsername(
        internals.userProfile.username || internals.userProfile.displayName,
      );
      state.isGuest = Boolean(internals.userProfile.isGuest);
    }
    return internals.userProfile;
  }

  async function writeUserProfile(uid, profile, { merge = true } = {}) {
    const { firestore } = internals.sdk;
    await firestore.setDoc(firestore.doc(internals.db, "users", uid), profile, {
      merge,
    });
    internals.userProfile = { ...(internals.userProfile || {}), ...profile };
    state.uid = uid;
    state.username = normalizeFirebaseUsername(profile.username);
    state.isGuest = Boolean(profile.isGuest);
    state.authenticated = true;
    return internals.userProfile;
  }

  function subscribeAccountState() {
    if (!state.uid || state.isGuest) return;
    const { firestore } = internals.sdk;
    stopAccountSubscriptions();
    const uid = state.uid;
    let initialProgressSnapshot = true;
    const progressRef = firestore.doc(internals.db, "progress", uid);
    const unsubscribeProgress = firestore.onSnapshot(
      progressRef,
      (snapshot) => {
        if (initialProgressSnapshot) {
          initialProgressSnapshot = false;
          return;
        }
        if (!snapshot.exists() || uid !== state.uid) return;
        const save = snapshot.data() || {};
        emit("profile.snapshot", {
          user: makeUserPayload(uid, internals.userProfile || {}),
          save,
          preferAccountLocal: false,
          realtime: true,
        });
      },
      (error) => {
        fail(error, "progress_listener_failed");
      },
    );
    internals.accountUnsubscribers.push(unsubscribeProgress);

    let initialFriendsSnapshot = true;
    const emitFriendsSnapshot = async ({ notify = false } = {}) => {
      if (uid !== state.uid) return;
      const snapshot = await refreshFriends({ emitSnapshot: false }).catch(
        () => null,
      );
      if (!snapshot || uid !== state.uid) return;
      emit("friends.snapshot", {
        ...snapshot,
        realtime: true,
        notify,
      });
    };
    const friendsRef = firestore.collection(
      internals.db,
      "friends",
      uid,
      "items",
    );
    const unsubscribeFriends = firestore.onSnapshot(
      friendsRef,
      () => {
        const notify = !initialFriendsSnapshot;
        initialFriendsSnapshot = false;
        emitFriendsSnapshot({ notify });
      },
      (error) => {
        fail(error, "friends_listener_failed");
      },
    );
    internals.accountUnsubscribers.push(unsubscribeFriends);

    let initialIncomingSnapshot = true;
    const incomingQuery = firestore.query(
      firestore.collection(internals.db, "friendRequests"),
      firestore.where("toUid", "==", uid),
      firestore.limit(FRIEND_QUERY_LIMIT),
    );
    const unsubscribeIncoming = firestore.onSnapshot(
      incomingQuery,
      () => {
        const notify = !initialIncomingSnapshot;
        initialIncomingSnapshot = false;
        emitFriendsSnapshot({ notify });
      },
      (error) => {
        fail(error, "friend_request_listener_failed");
      },
    );
    internals.accountUnsubscribers.push(unsubscribeIncoming);

    let initialOutgoingSnapshot = true;
    const outgoingQuery = firestore.query(
      firestore.collection(internals.db, "friendRequests"),
      firestore.where("fromUid", "==", uid),
      firestore.limit(FRIEND_QUERY_LIMIT),
    );
    const unsubscribeOutgoing = firestore.onSnapshot(
      outgoingQuery,
      () => {
        const notify = !initialOutgoingSnapshot;
        initialOutgoingSnapshot = false;
        emitFriendsSnapshot({ notify });
      },
      (error) => {
        fail(error, "friend_request_listener_failed");
      },
    );
    internals.accountUnsubscribers.push(unsubscribeOutgoing);
  }

  function firebaseEmailForUsernameValidation(validation) {
    const emailKey = validation.usernameLower
      .replace(/\s+/g, ".")
      .replace(/[^a-z0-9._-]/g, "-");
    return `id4.${emailKey}@infernodrift4.firebaseapp.com`;
  }

  async function ensureFirebaseAccountDocs({
    user,
    validation,
    age,
    badges,
    savePayload,
    seedClientSave = false,
    timeoutMs = 8000,
    authMode = "signed-in",
  }) {
    const { firestore } = internals.sdk;
    const usernameRef = firestore.doc(
      internals.db,
      "usernames",
      validation.usernameLower,
    );
    const repair = {
      authMode,
      usernameClaim: "unchanged",
      profile: "merged",
      progress: "unchanged",
      staleUsernameClaim: false,
    };
    await withTimeout(
      firestore.runTransaction(internals.db, async (transaction) => {
        const usernameDoc = await transaction.get(usernameRef);
        const userRef = firestore.doc(internals.db, "users", user.uid);
        const progressRef = firestore.doc(internals.db, "progress", user.uid);
        const userDoc = await transaction.get(userRef);
        const progressDoc = await transaction.get(progressRef);
        const existingProfile = userDoc.exists() ? userDoc.data() || {} : {};
        const existingPayload = progressDoc.exists()
          ? progressDoc.data()?.payload
          : null;
        const cleanExistingPayload = repairSavePayloadWithProfileMarker(
          existingPayload,
          existingProfile,
        );
        const cleanSavePayload = repairSavePayloadWithProfileMarker(
          savePayload,
          existingProfile,
        );
        const bestPayload = seedClientSave
          ? chooseTrustedAccountSeedPayload(cleanExistingPayload, cleanSavePayload)
          : chooseTrustedAccountSeedPayload(cleanExistingPayload);
        const safeBestPayload = stripUndefinedForFirestore(bestPayload);
        const baseProfile = {
          uid: user.uid,
          username: validation.username,
          usernameLower: validation.usernameLower,
          displayName: validation.username,
          isGuest: false,
          badges,
          age: Number.isFinite(Number(age)) ? Math.round(Number(age)) : null,
          createdAt: firestore.serverTimestamp(),
          lastSeenAt: firestore.serverTimestamp(),
          stats: {},
          settings: {},
          cosmetics: {},
          loadouts: {},
          progress: safeBestPayload?.progressionV2 || {},
        };
        if (!usernameDoc.exists()) {
          transaction.set(
            usernameRef,
            {
              uid: user.uid,
              username: validation.username,
              usernameLower: validation.usernameLower,
              createdAt: firestore.serverTimestamp(),
            },
            { merge: false },
          );
          repair.usernameClaim = "created";
        } else if (usernameDoc.data()?.uid !== user.uid) {
          repair.usernameClaim = "stale";
          repair.staleUsernameClaim = true;
        }
        transaction.set(userRef, baseProfile, { merge: true });
        if (safeBestPayload) {
          transaction.set(
            progressRef,
            {
              uid: user.uid,
              username: validation.username,
              payload: safeBestPayload,
              updatedAt: firestore.serverTimestamp(),
            },
            { merge: true },
          );
          repair.progress = progressDoc.exists() ? "merged" : "created";
        }
      }),
      timeoutMs,
      "auth_timeout",
    );
    return repair;
  }

  async function signInAccount({
    username,
    password,
    age,
    savePayload = null,
    timeoutMs = 8000,
    allowLegacyAutoCreate = false,
  } = {}) {
    const validation = validateFirebaseAccountCredentials(username, password);
    if (!validation.ok) throw new Error(validation.error);
    if (String(password || "").length < 6) throw new Error("weak_password");
    await init({ timeoutMs });
    requireReady();
    state.authStatus = "signing-in";
    const { auth, firestore } = internals.sdk;
    const email = firebaseEmailForUsernameValidation(validation);
    const usernameRef = firestore.doc(
      internals.db,
      "usernames",
      validation.usernameLower,
    );
    let credential = null;
    let authMode = "signed-in";
    let signInCode = "";
    try {
      credential = await withTimeout(
        auth.signInWithEmailAndPassword(internals.auth, email, password),
        timeoutMs,
        "auth_timeout",
      );
    } catch (error) {
      signInCode = mapFirebaseError(error) || "invalid_credentials";
    }
    if (!credential) {
      const existingUsername = await withTimeout(
        firestore.getDoc(usernameRef),
        timeoutMs,
        "auth_timeout",
      );
      if (existingUsername.exists() && !allowLegacyAutoCreate) {
        throw new Error(signInCode || "invalid_credentials");
      }
      try {
        credential = await withTimeout(
          auth.createUserWithEmailAndPassword(internals.auth, email, password),
          timeoutMs,
          "auth_timeout",
        );
        authMode = allowLegacyAutoCreate
          ? "legacy_account_created"
          : "created";
      } catch (error) {
        const code = mapFirebaseError(error);
        if (code === "username_taken" && signInCode) {
          throw new Error("invalid_credentials");
        }
        throw new Error(code || signInCode || "invalid_credentials");
      }
    }
    const user = credential.user;
    const badges = getFirebaseCredentialBadges(
      validation.username,
      password,
    );
    const repair = await ensureFirebaseAccountDocs({
      user,
      validation,
      age,
      badges,
      savePayload,
      seedClientSave: Boolean(allowLegacyAutoCreate),
      timeoutMs,
      authMode,
    });
    await auth
      .updateProfile(user, { displayName: validation.username })
      .catch(() => undefined);
    await loadUserProfile(user.uid);
    state.authStatus = "signed-in";
    let progress = await getProgress();
    if (progress?.payload) {
      const syncedPayload = await syncProgress(progress.payload, { silent: true });
      if (syncedPayload && typeof syncedPayload === "object") {
        progress = { ...progress, payload: syncedPayload };
      } else {
        progress = await getProgress();
      }
    }
    subscribeAccountState();
    return {
      user: makeUserPayload(user.uid, internals.userProfile),
      sessionToken: user.uid,
      save: progress?.payload ? { payload: progress.payload } : null,
      profile: internals.userProfile,
      repair,
    };
  }

  async function signInGuest({
    username = "Guest_Racer",
    age = null,
    savePayload = null,
    timeoutMs = 8000,
  } = {}) {
    await init({ timeoutMs });
    requireReady();
    state.authStatus = "signing-in";
    const { auth, firestore } = internals.sdk;
    const credential = await withTimeout(
      auth.signInAnonymously(internals.auth),
      timeoutMs,
      "auth_timeout",
    );
    const user = credential.user;
    const usernameValidation = validateFirebaseUsername(username);
    const displayName = usernameValidation.ok
      ? usernameValidation.username
      : `Guest_${user.uid.slice(0, 8)}`;
    const profile = {
      uid: user.uid,
      username: displayName,
      usernameLower: normalizeFirebaseUsernameKey(displayName),
      displayName,
      isGuest: true,
      badges: ["Guest"],
      age: Number.isFinite(Number(age)) ? Math.round(Number(age)) : null,
      createdAt: firestore.serverTimestamp(),
      lastSeenAt: firestore.serverTimestamp(),
      stats: {},
      settings: {},
      cosmetics: {},
      loadouts: {},
      progress: savePayload?.progressionV2 || {},
    };
    await writeUserProfile(user.uid, profile);
    await auth.updateProfile(user, { displayName }).catch(() => undefined);
    if (savePayload) await syncProgress(savePayload, { silent: true });
    subscribeAccountState();
    state.authStatus = "guest-online";
    return {
      user: makeUserPayload(user.uid, internals.userProfile),
      sessionToken: user.uid,
      save: savePayload ? { payload: savePayload } : null,
      profile,
    };
  }

  async function getProgress(uid = state.uid) {
    requireReady();
    if (!uid) return null;
    const { firestore } = internals.sdk;
    const snapshot = await firestore.getDoc(
      firestore.doc(internals.db, "progress", uid),
    );
    return snapshot.exists() ? snapshot.data() : null;
  }

  async function syncProgress(payload, { silent = false, replace = false } = {}) {
    requireReady();
    if (!state.uid || !payload) return false;
    const { firestore } = internals.sdk;
    const progressRef = firestore.doc(internals.db, "progress", state.uid);
    const existingProgress = await firestore.getDoc(progressRef).catch(() => null);
    const existingPayload = existingProgress?.exists()
      ? existingProgress.data()?.payload
      : null;
    const cleanExistingPayload = repairSavePayloadWithProfileMarker(
      existingPayload,
      internals.userProfile || {},
    );
    const cleanPayload = repairSavePayloadWithProfileMarker(
      payload,
      internals.userProfile || {},
    );
    if (
      isBlockedTaintedRepairPayload(cleanPayload) &&
      (!cleanExistingPayload || isBlockedTaintedRepairPayload(cleanExistingPayload))
    ) {
      state.leaderboardStatus = "repair-needed";
      return cleanPayload;
    }
    const mergedPayload = stripUndefinedForFirestore(
      replace && !isBlockedTaintedRepairPayload(cleanPayload)
        ? cleanPayload
        : mergeFirebaseSavePayload(cleanExistingPayload, cleanPayload),
    );
    const xp = Math.max(
      0,
      Math.floor(
        Number(
          mergedPayload?.progressionV2?.totalXp ??
            mergedPayload?.progressionV2?.xp,
        ) ||
          0,
      ),
    );
    await firestore.setDoc(
      progressRef,
      stripUndefinedForFirestore({
        uid: state.uid,
        username: state.username,
        payload: mergedPayload,
        campaign: {
          worldIndex: mergedPayload.worldIndex,
          levelIndex: mergedPayload.levelIndex,
        },
        unlocks: mergedPayload.progressionV2?.unlocks || {},
        cosmetics: mergedPayload.customization || {},
        stats: mergedPayload.progressionV2 || {},
        settings: mergedPayload.settings || {},
        updatedAt: firestore.serverTimestamp(),
      }),
      { merge: true },
    );
    await firestore.setDoc(
      firestore.doc(internals.db, "users", state.uid),
      stripUndefinedForFirestore({
        progress: mergedPayload.progressionV2 || {},
        stats: mergedPayload.progressionV2 || {},
        settings: mergedPayload.settings || {},
        cosmetics: mergedPayload.customization || {},
        loadouts: mergedPayload.garage || {},
        lastSeenAt: firestore.serverTimestamp(),
      }),
      { merge: true },
    );
    if (!state.isGuest && !internals.userProfile?.isGuest) {
      if (isFirebaseTestLikeAccountName(state.username)) {
        state.leaderboardStatus = "hidden-test-account";
      } else {
        await submitLeaderboard({
          score: xp,
          mode: FIREBASE_LEADERBOARD_MODE,
        }).catch((error) => {
          state.leaderboardStatus = "failed";
          fail(error, "leaderboard_sync_failed");
        });
      }
    }
    if (!silent) emit("save.synced", { payload: mergedPayload });
    return mergedPayload;
  }

  async function refreshLeaderboard({ mode = FIREBASE_LEADERBOARD_MODE } = {}) {
    requireReady();
    const { firestore } = internals.sdk;
    state.leaderboardStatus = "loading";
    const scoresRef = firestore.collection(
      internals.db,
      "leaderboards",
      mode,
      "scores",
    );
    const rows = await firestore.getDocs(
      firestore.query(
        scoresRef,
        firestore.orderBy("score", "desc"),
        firestore.limit(25),
      ),
    );
    const leaderboard = rows.docs
      .map(mapLeaderboardDoc)
      .filter((row) => !isFirebaseTestLikeAccountName(row.username));
    let playerRow = state.uid
      ? leaderboard.find((row) => row.userId === state.uid) || null
      : null;
    if (state.uid && !playerRow) {
      const ownScore = await firestore.getDoc(
        firestore.doc(internals.db, "leaderboards", mode, "scores", state.uid),
      );
      playerRow = ownScore.exists() ? mapLeaderboardDoc(ownScore) : null;
    }
    if (playerRow && isFirebaseTestLikeAccountName(playerRow.username)) {
      playerRow = null;
    }
    state.leaderboardStatus = "ready";
    emit("leaderboard.snapshot", { leaderboard, playerRow });
    return { leaderboard, playerRow };
  }

  async function submitLeaderboard(row = {}) {
    requireReady();
    if (!state.uid) return false;
    if (state.isGuest || internals.userProfile?.isGuest) return false;
    const validation = validateFirebaseScore(row);
    if (!validation.ok) throw new Error(validation.error);
    const { firestore } = internals.sdk;
    const scoreRef = firestore.doc(
      internals.db,
      "leaderboards",
      validation.mode,
      "scores",
      state.uid,
    );
    const basePayload = {
      uid: state.uid,
      username: state.username || "Player",
      badges: getEffectiveFirebaseBadges(
        state.username || "Player",
        internals.userProfile,
      ),
      score: validation.score,
      mode: validation.mode,
      carClass: row.carClass || "",
      runId: row.runId || `client-${state.uid}`,
      clientVersion: "InfernoDrift4 static",
      verified: false,
      createdAt: firestore.serverTimestamp(),
    };
    try {
      await firestore.setDoc(
        scoreRef,
        {
          ...basePayload,
          account: true,
          guest: false,
        },
        { merge: true },
      );
    } catch (error) {
      if (!/permission|insufficient/i.test(String(error?.message || ""))) {
        throw error;
      }
      await firestore.setDoc(scoreRef, basePayload, { merge: true });
    }
    return true;
  }

  function unsubscribeRealtime() {
    internals.unsubscribers.splice(0).forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch {
        // Listener was already closed.
      }
    });
    internals.chatRoomIds.clear();
    internals.dmChatUnsubscribe = null;
    internals.dmInboxUnsubscribe = null;
    internals.dmThreadUnsubscribers.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch {
        // Listener was already closed.
      }
    });
    internals.dmThreadUnsubscribers.clear();
    state.chatListenerActive = false;
    state.chatStatus = "idle";
    stopAccountSubscriptions();
    stopLobbySubscription();
  }

  function stopAccountSubscriptions() {
    internals.accountUnsubscribers.splice(0).forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch {
        // Listener was already closed.
      }
    });
  }

  function stopLobbySubscription() {
    if (!internals.lobbyUnsubscribe) return;
    try {
      internals.lobbyUnsubscribe();
    } catch {
      // Listener was already closed.
    }
    internals.lobbyUnsubscribe = null;
    internals.lobbyCode = "";
  }

  function subscribeLobby(code) {
    const validation = validateFirebaseLobbyCode(code);
    if (!validation.ok || internals.lobbyCode === validation.code) return;
    stopLobbySubscription();
    const { firestore } = internals.sdk;
    const ref = firestore.doc(
      internals.db,
      LOBBY_COLLECTION_ID,
      validation.code,
    );
    internals.lobbyCode = validation.code;
    internals.lobbyUnsubscribe = firestore.onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          emit("room.left", { code: validation.code, reason: "room_closed" });
          stopLobbySubscription();
          return;
        }
        emit("room.snapshot", {
          room: mapLobbyDoc({
            id: snapshot.id,
            data: () => snapshot.data() || {},
          }),
        });
      },
      (error) => {
        fail(error, "lobby_listener_failed");
        emit("system.error", { message: state.lastError });
      },
    );
  }

  function subscribeDirectMessages() {
    // Direct-message notifications now use the owner-scoped dmInboxes path.
    // A collection-group listener over every "messages" collection also scans
    // dmInboxes for other users, which Firestore correctly rejects.
    return;
  }

  function subscribeDirectMessageInbox() {
    const { firestore } = internals.sdk;
    if (internals.dmInboxUnsubscribe || !state.uid) return;
    let initialSnapshot = true;
    const messagesRef = firestore.collection(
      internals.db,
      "dmInboxes",
      state.uid,
      "messages",
    );
    const q = firestore.query(
      messagesRef,
      firestore.orderBy("createdAt", "desc"),
      firestore.limit(CHAT_HISTORY_LIMIT),
    );
    const unsubscribe = firestore.onSnapshot(
      q,
      (snapshot) => {
        if (initialSnapshot) {
          initialSnapshot = false;
          const seenIds = readDmInboxSeenIds();
          const catchUpMessages = snapshot.docs
            .map(mapChatDoc)
            .filter((message) => {
              if (!isVisibleChatMessage(message)) return false;
              if (!message.direct || message.userId === state.uid) return false;
              return message.id && !seenIds.has(message.id);
            });
          if (catchUpMessages.length) {
            const grouped = new Map();
            catchUpMessages.forEach((message) => {
              const key = String(message.userId || message.from || "dm");
              const group = grouped.get(key) || {
                ...message,
                count: 0,
                latestText: "",
              };
              group.count += 1;
              if (!group.latestText) group.latestText = message.text || "";
              grouped.set(key, group);
            });
            grouped.forEach((group) => {
              emit("chat.dmDigest", {
                id: `dm-digest-${group.userId || group.from}-${Date.now()}`,
                from: group.from,
                userId: group.userId,
                direct: true,
                channel: "friend",
                count: group.count,
                text:
                  group.count === 1
                    ? `You got 1 message from ${group.from}.`
                    : `You got ${group.count} messages from ${group.from}.`,
                preview: group.latestText,
                at: group.at,
              });
            });
            rememberDmInboxMessages(catchUpMessages);
          }
          return;
        }
        snapshot.docChanges().forEach((change) => {
          if (change.type !== "added") return;
          const message = mapChatDoc(change.doc);
          if (!isVisibleChatMessage(message)) return;
          if (!message.direct || message.userId === state.uid) return;
          if (readDmInboxSeenIds().has(message.id)) return;
          rememberDmInboxMessages([message]);
          emit("chat.message", message);
        });
      },
      (error) => {
        state.chatStatus = "dm-inbox-listener-failed";
        console.warn("InfernoDrift4 DM inbox listener unavailable", error);
      },
    );
    internals.dmInboxUnsubscribe = unsubscribe;
    internals.unsubscribers.push(unsubscribe);
  }

  function subscribeDirectThreadMessages(peerUid = "") {
    const cleanPeerUid = String(peerUid || "").trim();
    if (!state.uid || !cleanPeerUid || cleanPeerUid === state.uid) return;
    const roomId = `dm-${requestKey(state.uid, cleanPeerUid)}`;
    if (internals.dmThreadUnsubscribers.has(roomId)) return;
    const { firestore } = internals.sdk;
    let initialSnapshot = true;
    const messagesRef = firestore.collection(
      internals.db,
      "chatRooms",
      roomId,
      "messages",
    );
    const q = firestore.query(
      messagesRef,
      firestore.orderBy("createdAt", "desc"),
      firestore.limit(CHAT_HISTORY_LIMIT),
    );
    const unsubscribe = firestore.onSnapshot(
      q,
      (snapshot) => {
        if (initialSnapshot) {
          initialSnapshot = false;
          return;
        }
        snapshot.docChanges().forEach((change) => {
          if (change.type !== "added") return;
          const message = mapChatDoc(change.doc);
          if (!isVisibleChatMessage(message)) return;
          if (!message.direct || message.userId === state.uid) return;
          emit("chat.message", message);
        });
      },
      (error) => {
        state.chatStatus = "dm-thread-listener-failed";
        console.warn("InfernoDrift4 DM thread listener unavailable", error);
      },
    );
    internals.dmThreadUnsubscribers.set(roomId, unsubscribe);
  }

  async function subscribeChat({ roomId = CHAT_ROOM_ID } = {}) {
    requireReady();
    const cleanRoomId = String(roomId || CHAT_ROOM_ID).slice(0, 120);
    if (internals.chatRoomIds.has(cleanRoomId)) {
      if (cleanRoomId === CHAT_ROOM_ID) {
        subscribeDirectMessages();
        subscribeDirectMessageInbox();
      }
      return;
    }
    const { firestore } = internals.sdk;
    const messagesRef = firestore.collection(
      internals.db,
      "chatRooms",
      cleanRoomId,
      "messages",
    );
    const q = firestore.query(
      messagesRef,
      firestore.orderBy("createdAt", "desc"),
      firestore.limit(CHAT_HISTORY_LIMIT),
    );
    let initialSnapshot = true;
    const unsubscribe = firestore.onSnapshot(
      q,
      (snapshot) => {
        state.chatStatus = "ready";
        state.chatListenerActive = true;
        if (initialSnapshot) {
          initialSnapshot = false;
          const messages = snapshot.docs
            .map(mapChatDoc)
            .filter(isVisibleChatMessage)
            .reverse();
          emit("chat.history", { messages });
          return;
        }
        snapshot.docChanges().forEach((change) => {
          if (change.type !== "added") return;
          const message = mapChatDoc(change.doc);
          if (!isVisibleChatMessage(message)) return;
          emit("chat.message", message);
        });
      },
      (error) => {
        state.chatStatus = "failed";
        state.chatListenerActive = false;
        console.warn("InfernoDrift4 chat listener unavailable", error);
      },
    );
    internals.unsubscribers.push(unsubscribe);
    internals.chatRoomIds.add(cleanRoomId);
    if (cleanRoomId === CHAT_ROOM_ID) {
      subscribeDirectMessages();
      subscribeDirectMessageInbox();
    }
    state.chatStatus = "listening";
    state.chatListenerActive = true;
  }

  async function sendChat({
    text,
    age = null,
    quick = false,
    directTo = null,
    roomInvite = null,
  } = {}) {
    requireReady();
    if (!state.uid) throw new Error("sign_in_required");
    const now = Date.now();
    if (!quick && now - internals.lastChatAt < CHAT_COOLDOWN_MS) {
      throw new Error("chat_rate_limited");
    }
    if (!quick && (!Number.isFinite(Number(age)) || Number(age) < 13)) {
      throw new Error("chat_requires_13_plus");
    }
    const clean = sanitizeFirebaseText(text, FIREBASE_CHAT_LIMIT);
    if (!clean.ok) throw new Error(clean.error);
    const { firestore } = internals.sdk;
    const roomId = directTo?.uid
      ? `dm-${requestKey(state.uid, directTo.uid)}`
      : CHAT_ROOM_ID;
    const cleanInvite = roomInvite?.code
      ? {
          code: normalizeFirebaseLobbyCode(roomInvite.code),
          mode: String(roomInvite.mode || "").slice(0, 40),
          playlist: String(roomInvite.playlist || "").slice(0, 40),
          teamSize: Math.max(0, Math.min(3, Number(roomInvite.teamSize) || 0)),
          size: Math.max(
            0,
            Math.min(FIREBASE_LOBBY_MAX_PLAYERS, Number(roomInvite.size) || 0),
          ),
          firebaseLobby: true,
        }
      : null;
    const messagePayload = {
      uid: state.uid,
      username: state.username || "Player",
      badges: internals.userProfile?.badges || [],
      text: clean.text,
      channel: directTo?.uid ? "friend" : "lobby",
      type: quick ? "quick" : directTo?.uid ? "direct" : "chat",
      toUid: directTo?.uid || "",
      toUsername: directTo?.username || "",
      moderationFlags: [],
      createdAt: firestore.serverTimestamp(),
      createdAtClient: nowIso(),
      ...(cleanInvite ? { roomInvite: cleanInvite } : {}),
    };
    const messageRef = await firestore.addDoc(
      firestore.collection(internals.db, "chatRooms", roomId, "messages"),
      messagePayload,
    );
    if (directTo?.uid) {
      subscribeDirectThreadMessages(directTo.uid);
      await firestore.setDoc(
        firestore.doc(
          internals.db,
          "dmInboxes",
          directTo.uid,
          "messages",
          messageRef.id,
        ),
        {
          ...messagePayload,
          sourceRoomId: roomId,
          sourceMessageId: messageRef.id,
        },
        { merge: false },
      ).catch((error) => {
        state.chatStatus = "dm-inbox-write-failed";
        fail(error, "dm_inbox_write_failed");
      });
    }
    internals.lastChatAt = now;
    state.chatStatus = "sent";
    return true;
  }

  async function createLobby(options = {}) {
    requireReady();
    if (!state.uid) throw new Error("sign_in_required");
    const { firestore } = internals.sdk;
    const teamSize = Math.max(1, Math.min(3, Number(options.teamSize) || 1));
    const player = {
      uid: state.uid,
      username: state.username || "Player",
      badges: internals.userProfile?.badges || [],
      team: getLobbyPlayerTeam(0, teamSize),
    };
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const code = createFirebaseLobbyCode();
      const ref = firestore.doc(internals.db, LOBBY_COLLECTION_ID, code);
      const existing = await firestore.getDoc(ref);
      if (existing.exists()) continue;
      const lobby = {
        code,
        hostUid: state.uid,
        hostUsername: state.username || "Player",
        mode: String(options.mode || "max-arena").slice(0, 40),
        playlist: String(options.playlist || "firebase-lobby").slice(0, 40),
        teamSize,
        size: FIREBASE_LOBBY_MAX_PLAYERS,
        botFill: teamSize === 1 ? false : options.botFill !== false,
        private: true,
        live: false,
        backendMode: FIREBASE_BACKEND_MODE,
        players: [player],
        createdAt: firestore.serverTimestamp(),
        updatedAt: firestore.serverTimestamp(),
      };
      await firestore.setDoc(ref, lobby, { merge: false });
      const room = mapLobbyDoc({ id: code, data: () => lobby });
      subscribeLobby(code);
      emit("room.snapshot", { room });
      return room;
    }
    throw new Error("room_create_failed");
  }

  async function joinLobby(code) {
    requireReady();
    if (!state.uid) throw new Error("sign_in_required");
    const validation = validateFirebaseLobbyCode(code);
    if (!validation.ok) throw new Error(validation.error);
    const { firestore } = internals.sdk;
    const ref = firestore.doc(
      internals.db,
      LOBBY_COLLECTION_ID,
      validation.code,
    );
    let joinedRoom = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const snapshot = await firestore.getDoc(ref);
        if (!snapshot.exists()) throw new Error("room_not_found");
        const data = snapshot.data() || {};
        const players = Array.isArray(data.players) ? data.players : [];
        const existing = players.find((player) => player.uid === state.uid);
        const nextPlayers = existing
          ? players
          : [
              ...players,
              {
                uid: state.uid,
                username: state.username || "Player",
                badges: internals.userProfile?.badges || [],
                team: getLobbyPlayerTeam(players.length, data.teamSize),
              },
            ];
        if (nextPlayers.length > FIREBASE_LOBBY_MAX_PLAYERS) {
          throw new Error("room_full");
        }
        await firestore.updateDoc(ref, {
          players: nextPlayers,
          updatedAt: firestore.serverTimestamp(),
        });
        joinedRoom = mapLobbyDoc({
          id: snapshot.id,
          data: () => ({ ...data, players: nextPlayers }),
        });
        break;
      } catch (error) {
        if (attempt < 2 && isRetryableLobbyVersionError(error)) {
          await waitMs(120 + attempt * 180);
          continue;
        }
        throw error;
      }
    }
    if (!joinedRoom) throw new Error("room_join_failed");
    subscribeLobby(validation.code);
    emit("room.snapshot", { room: joinedRoom });
    return joinedRoom;
  }

  async function leaveLobby(code = internals.lobbyCode) {
    requireReady();
    if (!state.uid) throw new Error("sign_in_required");
    const validation = validateFirebaseLobbyCode(code);
    if (!validation.ok) return false;
    const { firestore } = internals.sdk;
    const ref = firestore.doc(
      internals.db,
      LOBBY_COLLECTION_ID,
      validation.code,
    );
    await firestore.runTransaction(internals.db, async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists()) return;
      const data = snapshot.data() || {};
      const players = Array.isArray(data.players) ? data.players : [];
      if (!players.some((entry) => entry.uid === state.uid)) return;
      const nextPlayers = players.filter((entry) => entry.uid !== state.uid);
      const nextLivePlayers =
        data.livePlayers && typeof data.livePlayers === "object"
          ? { ...data.livePlayers }
          : {};
      delete nextLivePlayers[state.uid];
      const currentLiveHost = String(data.liveHostUid || data.hostUid || "");
      transaction.set(
        ref,
        {
          players: nextPlayers,
          livePlayers: nextLivePlayers,
          liveHostUid:
            currentLiveHost === state.uid
              ? nextPlayers[0]?.uid || ""
              : currentLiveHost,
          liveUpdatedAt: nowIso(),
          updatedAt: firestore.serverTimestamp(),
        },
        { merge: true },
      );
    });
    emit("room.left", { code: validation.code, reason: "left" });
    stopLobbySubscription();
    return true;
  }

  async function updateLobbyLiveState(
    code,
    { player = null, state: liveState = null, stalePlayerIds = [] } = {},
  ) {
    requireReady();
    if (!state.uid) throw new Error("sign_in_required");
    const validation = validateFirebaseLobbyCode(code);
    if (!validation.ok) throw new Error(validation.error);
    const { firestore } = internals.sdk;
    const ref = firestore.doc(
      internals.db,
      LOBBY_COLLECTION_ID,
      validation.code,
    );
    const cleanPlayer = player
      ? sanitizeLivePlayerSnapshot(
          {
            ...player,
            uid: state.uid,
            id: state.uid,
            username: state.username || player.username || "Player",
          },
          state.uid,
        )
      : null;
    const cleanState = sanitizeLiveStateSnapshot(liveState);
    const updates = [
      "live",
      true,
      "liveUpdatedAt",
      nowIso(),
      "updatedAt",
      firestore.serverTimestamp(),
    ];
    if (cleanPlayer) {
      updates.push(new firestore.FieldPath("livePlayers", state.uid), cleanPlayer);
    }
    if (cleanState) {
      updates.push("liveState", cleanState);
      updates.push("liveHostUid", state.uid);
      updates.push("liveSeq", Math.max(1, Number(cleanState.seq || 0)));
    }
    const staleIds = Array.isArray(stalePlayerIds)
      ? stalePlayerIds.map(sanitizeLivePlayerId).filter((uid) => uid && uid !== state.uid)
      : [];
    staleIds.slice(0, FIREBASE_LIVE_PLAYER_LIMIT).forEach((uid) => {
      updates.push(
        new firestore.FieldPath("livePlayers", uid),
        firestore.deleteField(),
      );
    });
    if (!cleanPlayer && !cleanState && staleIds.length === 0) return null;
    await firestore.updateDoc(ref, ...updates);
    return null;
  }

  async function submitFeedback(payload = {}) {
    requireReady();
    if (!state.uid) throw new Error("sign_in_required");
    const validation = validateFirebaseFeedback(payload.message);
    if (!validation.ok) throw new Error(validation.error);
    const { firestore } = internals.sdk;
    await firestore.addDoc(firestore.collection(internals.db, "feedback"), {
      uid: state.uid,
      username: state.username || "Player",
      message: validation.text,
      feedbackType: payload.feedbackType || payload.type || "other",
      diagnostics: payload.diagnostics || null,
      clientVersion: "InfernoDrift4 static",
      userAgent:
        typeof navigator !== "undefined"
          ? navigator.userAgent.slice(0, 180)
          : "",
      replyEmail: payload.age13OrOlder ? payload.replyEmail || "" : "",
      status: "new",
      createdAt: firestore.serverTimestamp(),
    });
    return {
      delivery: "stored_firebase",
      emailConfigured: false,
      emailError: "",
      message: validation.text,
    };
  }

  async function findUserByUsername(username) {
    requireReady();
    const validation = validateFirebaseUsername(username);
    if (!validation.ok) throw new Error(validation.error);
    const { firestore } = internals.sdk;
    const claim = await firestore.getDoc(
      firestore.doc(internals.db, "usernames", validation.usernameLower),
    );
    if (!claim.exists()) throw new Error("account_not_found");
    const uid = claim.data()?.uid;
    const userDoc = await firestore.getDoc(
      firestore.doc(internals.db, "users", uid),
    );
    if (!uid || !userDoc.exists()) throw new Error("account_not_found");
    return makeUserPayload(uid, userDoc.data());
  }

  async function requestFriend(username) {
    requireReady();
    if (!state.uid) throw new Error("sign_in_required");
    const target = await findUserByUsername(username);
    if (target.uid === state.uid) throw new Error("friend_self_rejected");
    const { firestore } = internals.sdk;
    const id = requestKey(state.uid, target.uid);
    if (normalizeFirebaseUsernameKey(target.username) === "clark") {
      const batch = firestore.writeBatch(internals.db);
      batch.set(
        firestore.doc(internals.db, "friends", state.uid, "items", target.uid),
        {
          uid: target.uid,
          username: target.username,
          createdAt: firestore.serverTimestamp(),
          status: "accepted",
        },
        { merge: true },
      );
      batch.set(
        firestore.doc(internals.db, "friends", target.uid, "items", state.uid),
        {
          uid: state.uid,
          username: state.username,
          createdAt: firestore.serverTimestamp(),
          status: "accepted",
        },
        { merge: true },
      );
      await batch.commit();
      const reward = await awardFounderFriendProgress();
      await refreshFriends();
      return { username: target.username, status: "accepted", reward };
    }
    await firestore.setDoc(
      firestore.doc(internals.db, "friendRequests", id),
      {
        fromUid: state.uid,
        fromUsername: state.username,
        toUid: target.uid,
        toUsername: target.username,
        status: "pending",
        createdAt: firestore.serverTimestamp(),
        updatedAt: firestore.serverTimestamp(),
      },
      { merge: true },
    );
    await refreshFriends();
    return { username: target.username, status: "sent" };
  }

  async function awardFounderFriendProgress() {
    const currentProgress = await getProgress().catch(() => null);
    const currentPayload =
      currentProgress?.payload && typeof currentProgress.payload === "object"
        ? currentProgress.payload
        : {};
    const currentProgression =
      currentPayload.progressionV2 &&
      typeof currentPayload.progressionV2 === "object"
        ? currentPayload.progressionV2
        : {};
    const alreadyClaimed =
      currentProgression.founderFriendXpClaimed ||
      (Array.isArray(currentProgression.rewardLog) &&
        currentProgression.rewardLog.some(
          (entry) => entry?.modeId === "founder-friend",
        ));
    if (alreadyClaimed) return null;
    const totalXp = getSavePayloadXp(currentPayload) + 1000;
    const payload = structuredClone(currentPayload);
    payload.progressionV2 = {
      ...currentProgression,
      xp: totalXp,
      totalXp,
      founderFriendXpClaimed: true,
      rewardLog: [
        {
          modeId: "founder-friend",
          label: "Founder Friend",
          medal: "Bonus",
          xp: 1000,
          reward: "Founder Friend +1000 XP",
          at: new Date().toISOString(),
        },
        ...(Array.isArray(currentProgression.rewardLog)
          ? currentProgression.rewardLog
          : []),
      ].slice(0, 12),
    };
    await syncProgress(payload, { silent: true });
    return {
      reason: "founder_friend",
      label: "Founder Friend",
      xp: 1000,
      totalXp,
      payload,
    };
  }

  async function acceptFriend(requestId) {
    requireReady();
    if (!state.uid || !requestId) throw new Error("sign_in_required");
    const { firestore } = internals.sdk;
    const ref = firestore.doc(internals.db, "friendRequests", requestId);
    const snapshot = await firestore.getDoc(ref);
    if (!snapshot.exists()) throw new Error("request_not_found");
    const request = snapshot.data();
    if (request.toUid !== state.uid) throw new Error("permission_denied");
    const batch = firestore.writeBatch(internals.db);
    batch.set(ref, {
      ...request,
      status: "accepted",
      updatedAt: firestore.serverTimestamp(),
    });
    batch.set(
      firestore.doc(
        internals.db,
        "friends",
        request.toUid,
        "items",
        request.fromUid,
      ),
      {
        uid: request.fromUid,
        username: request.fromUsername,
        createdAt: firestore.serverTimestamp(),
        status: "accepted",
      },
      { merge: true },
    );
    batch.set(
      firestore.doc(
        internals.db,
        "friends",
        request.fromUid,
        "items",
        request.toUid,
      ),
      {
        uid: request.toUid,
        username: request.toUsername,
        createdAt: firestore.serverTimestamp(),
        status: "accepted",
      },
      { merge: true },
    );
    await batch.commit();
    await refreshFriends();
    return { username: request.fromUsername, status: "accepted" };
  }

  async function refreshFriends({ emitSnapshot = true } = {}) {
    requireReady();
    if (!state.uid)
      return { friends: [], incomingRequests: [], outgoingRequests: [] };
    const { firestore } = internals.sdk;
    state.friendsStatus = "loading";
    const friendsSnapshot = await firestore.getDocs(
      firestore.query(
        firestore.collection(internals.db, "friends", state.uid, "items"),
        firestore.limit(FRIEND_QUERY_LIMIT),
      ),
    );
    const incomingSnapshot = await firestore.getDocs(
      firestore.query(
        firestore.collection(internals.db, "friendRequests"),
        firestore.where("toUid", "==", state.uid),
        firestore.limit(FRIEND_QUERY_LIMIT),
      ),
    );
    const outgoingSnapshot = await firestore.getDocs(
      firestore.query(
        firestore.collection(internals.db, "friendRequests"),
        firestore.where("fromUid", "==", state.uid),
        firestore.limit(FRIEND_QUERY_LIMIT),
      ),
    );
    const friends = friendsSnapshot.docs.map((doc) => ({
      id: doc.id,
      userId: doc.data().uid || doc.id,
      username: doc.data().username || "Player",
      online: false,
      status: doc.data().status || "accepted",
    }));
    friends.forEach((friend) => subscribeDirectThreadMessages(friend.userId));
    const incomingRequests = incomingSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((request) => request.status === "pending");
    const outgoingRequests = outgoingSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((request) => request.status === "pending");
    state.friendsStatus = "ready";
    const snapshot = {
      friends,
      incomingRequests,
      outgoingRequests,
      recentPlayers: [],
    };
    if (emitSnapshot) emit("friends.snapshot", snapshot);
    return snapshot;
  }

  async function runDiagnostics({ timeoutMs = 8000 } = {}) {
    const status = await init({ timeoutMs });
    if (!status.available)
      return { ok: false, error: status.lastError, status };
    requireReady();
    const { firestore } = internals.sdk;
    state.diagnosticsStatus = "running";
    try {
      const user = internals.auth.currentUser;
      if (!user) {
        await signInGuest({
          username: "DiagGuest",
          timeoutMs,
          savePayload: null,
        });
      }
      const ref = firestore.doc(
        internals.db,
        "diagnostics",
        `${state.uid || DIAGNOSTICS_DOC_ID}`,
      );
      await firestore.setDoc(
        ref,
        {
          uid: state.uid,
          username: state.username || "DiagGuest",
          backendMode: FIREBASE_BACKEND_MODE,
          at: firestore.serverTimestamp(),
          client: "InfernoDrift4 static",
        },
        { merge: true },
      );
      const roundTrip = await firestore.getDoc(ref);
      state.diagnosticsStatus = roundTrip.exists() ? "ok" : "failed";
      return {
        ok: roundTrip.exists(),
        auth: Boolean(internals.auth.currentUser),
        firestore: roundTrip.exists(),
        status: getStatus(),
      };
    } catch (error) {
      state.diagnosticsStatus = "failed";
      return { ok: false, error: fail(error), status: getStatus() };
    }
  }

  async function logout() {
    await leaveLobby().catch(() => undefined);
    unsubscribeRealtime();
    if (internals.auth) {
      await internals.sdk.auth.signOut(internals.auth).catch(() => undefined);
    }
    state.authenticated = false;
    state.uid = "";
    state.username = "";
    state.isGuest = false;
    state.authStatus = "idle";
    internals.userProfile = null;
  }

  return {
    getStatus,
    init,
    signInAccount,
    signInGuest,
    logout,
    getProgress,
    syncProgress,
    refreshLeaderboard,
    submitLeaderboard,
    createLobby,
    joinLobby,
    leaveLobby,
    updateLobbyLiveState,
    subscribeChat,
    unsubscribeRealtime,
    sendChat,
    submitFeedback,
    findUserByUsername,
    requestFriend,
    acceptFriend,
    refreshFriends,
    runDiagnostics,
  };
}
