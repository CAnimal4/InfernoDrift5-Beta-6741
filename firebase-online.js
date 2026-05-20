import {
  FIREBASE_BACKEND_MODE,
  FIREBASE_CHAT_LIMIT,
  FIREBASE_LEADERBOARD_MODE,
  createFirebaseLobbyCode,
  getFirebaseBadges,
  mapFirebaseError,
  normalizeFirebaseLobbyCode,
  normalizeFirebaseUsername,
  normalizeFirebaseUsernameKey,
  sanitizeFirebaseText,
  usernameToFirebaseEmail,
  validateFirebaseFeedback,
  validateFirebaseLobbyCode,
  validateFirebaseScore,
  validateFirebaseUsername,
} from "./firebase-online-core.js";

const FIREBASE_SDK_VERSION = "10.13.2";
const FIREBASE_SDK_BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}`;
const CHAT_ROOM_ID = "lobby";
const LOBBY_COLLECTION_ID = "lobbies";
const DIAGNOSTICS_DOC_ID = "client-smoke";
const CHAT_HISTORY_LIMIT = 40;
const FRIEND_QUERY_LIMIT = 50;
const CHAT_COOLDOWN_MS = 1700;
const FIREBASE_LOBBY_MAX_PLAYERS = 8;

let sdkPromise = null;

function nowIso() {
  return new Date().toISOString();
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

function makeUserPayload(uid, profile = {}) {
  const rawUsername = normalizeFirebaseUsername(
    profile.username || profile.displayName || "Guest Racer",
  );
  const usernameValidation = validateFirebaseUsername(rawUsername);
  const username = usernameValidation.ok
    ? usernameValidation.username
    : "Guest_Racer";
  const badges = Array.isArray(profile.badges)
    ? profile.badges
    : getFirebaseBadges(username);
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

function mapLeaderboardDoc(snapshot) {
  const data = snapshot.data() || {};
  return {
    id: snapshot.id,
    userId: data.uid || "",
    username: data.username || "Player",
    badge: Array.isArray(data.badges) ? data.badges[0] || "" : "",
    xp: Math.max(0, Math.floor(Number(data.score || 0))),
    totalXp: Math.max(0, Math.floor(Number(data.score || 0))),
    mode: data.mode || FIREBASE_LEADERBOARD_MODE,
    playlist: "Firebase",
    source: "server",
    scope: "Total XP",
    verified: false,
  };
}

function requestKey(fromUid, toUid) {
  return [String(fromUid || ""), String(toUid || "")].sort().join("_");
}

function mapLobbyDoc(snapshot) {
  const data = snapshot.data() || {};
  const players = Array.isArray(data.players)
    ? data.players.slice(0, FIREBASE_LOBBY_MAX_PLAYERS).map((player) => ({
        id: player.uid || player.id || "",
        uid: player.uid || player.id || "",
        username: player.username || "Player",
        badge: Array.isArray(player.badges) ? player.badges[0] || "" : "",
        badges: Array.isArray(player.badges) ? player.badges : [],
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
    bots: 0,
    private: true,
    live: false,
    firebaseLobby: true,
    backendMode: FIREBASE_BACKEND_MODE,
    hostUid: data.hostUid || "",
    hostUsername: data.hostUsername || "",
    players,
  };
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
              return;
            }
            state.uid = user.uid;
            state.authenticated = true;
            await loadUserProfile(user.uid).catch(() => undefined);
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

  async function signInAccount({
    username,
    password,
    age,
    savePayload = null,
    timeoutMs = 8000,
  } = {}) {
    const validation = validateFirebaseUsername(username);
    if (!validation.ok) throw new Error(validation.error);
    if (String(password || "").length < 6) throw new Error("weak_password");
    await init({ timeoutMs });
    requireReady();
    state.authStatus = "signing-in";
    const { auth, firestore } = internals.sdk;
    const email = usernameToFirebaseEmail(validation.username);
    const usernameRef = firestore.doc(
      internals.db,
      "usernames",
      validation.usernameLower,
    );
    const existingUsername = await withTimeout(
      firestore.getDoc(usernameRef),
      timeoutMs,
      "auth_timeout",
    );
    let credential = null;
    if (existingUsername.exists()) {
      try {
        credential = await withTimeout(
          auth.signInWithEmailAndPassword(internals.auth, email, password),
          timeoutMs,
          "auth_timeout",
        );
      } catch (error) {
        throw new Error(mapFirebaseError(error) || "invalid_credentials");
      }
    } else {
      try {
        credential = await withTimeout(
          auth.createUserWithEmailAndPassword(internals.auth, email, password),
          timeoutMs,
          "auth_timeout",
        );
      } catch (error) {
        const code = mapFirebaseError(error);
        if (code !== "username_taken") {
          throw new Error(code);
        }
        try {
          credential = await withTimeout(
            auth.signInWithEmailAndPassword(internals.auth, email, password),
            timeoutMs,
            "auth_timeout",
          );
        } catch (signInError) {
          throw new Error(
            mapFirebaseError(signInError) || "invalid_credentials",
          );
        }
      }
    }
    const user = credential.user;
    const badges = getFirebaseBadges(validation.username);
    await firestore.runTransaction(internals.db, async (transaction) => {
      const usernameDoc = await transaction.get(usernameRef);
      if (usernameDoc.exists() && usernameDoc.data()?.uid !== user.uid) {
        throw new Error("username_taken");
      }
      const userRef = firestore.doc(internals.db, "users", user.uid);
      const progressRef = firestore.doc(internals.db, "progress", user.uid);
      const progressDoc = await transaction.get(progressRef);
      const existingPayload = progressDoc.exists()
        ? progressDoc.data()?.payload
        : null;
      const bestPayload = chooseBestSavePayload(existingPayload, savePayload);
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
        progress: bestPayload?.progressionV2 || {},
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
      }
      transaction.set(userRef, baseProfile, { merge: true });
      if (bestPayload) {
        transaction.set(
          progressRef,
          {
            uid: user.uid,
            username: validation.username,
            payload: bestPayload,
            updatedAt: firestore.serverTimestamp(),
          },
          { merge: true },
        );
      }
    });
    await auth
      .updateProfile(user, { displayName: validation.username })
      .catch(() => undefined);
    await loadUserProfile(user.uid);
    state.authStatus = "signed-in";
    const progress = await getProgress();
    return {
      user: makeUserPayload(user.uid, internals.userProfile),
      sessionToken: user.uid,
      save: progress?.payload ? { payload: progress.payload } : null,
      profile: internals.userProfile,
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

  async function syncProgress(payload, { silent = false } = {}) {
    requireReady();
    if (!state.uid || !payload) return false;
    const { firestore } = internals.sdk;
    const xp = Math.max(
      0,
      Math.floor(
        Number(payload?.progressionV2?.totalXp ?? payload?.progressionV2?.xp) ||
          0,
      ),
    );
    await firestore.setDoc(
      firestore.doc(internals.db, "progress", state.uid),
      {
        uid: state.uid,
        username: state.username,
        payload,
        campaign: {
          worldIndex: payload.worldIndex,
          levelIndex: payload.levelIndex,
        },
        unlocks: payload.progressionV2?.unlocks || {},
        cosmetics: payload.customization || {},
        stats: payload.progressionV2 || {},
        settings: payload.settings || {},
        updatedAt: firestore.serverTimestamp(),
      },
      { merge: true },
    );
    await firestore.setDoc(
      firestore.doc(internals.db, "users", state.uid),
      {
        progress: payload.progressionV2 || {},
        stats: payload.progressionV2 || {},
        settings: payload.settings || {},
        cosmetics: payload.customization || {},
        loadouts: payload.garage || {},
        lastSeenAt: firestore.serverTimestamp(),
      },
      { merge: true },
    );
    await submitLeaderboard({ score: xp, mode: FIREBASE_LEADERBOARD_MODE });
    if (!silent) emit("save.synced", { payload });
    return true;
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
    const leaderboard = rows.docs.map(mapLeaderboardDoc);
    const playerRow = state.uid
      ? leaderboard.find((row) => row.userId === state.uid) || null
      : null;
    state.leaderboardStatus = "ready";
    emit("leaderboard.snapshot", { leaderboard, playerRow });
    return { leaderboard, playerRow };
  }

  async function submitLeaderboard(row = {}) {
    requireReady();
    if (!state.uid) return false;
    const validation = validateFirebaseScore(row);
    if (!validation.ok) throw new Error(validation.error);
    const { firestore } = internals.sdk;
    await firestore.setDoc(
      firestore.doc(
        internals.db,
        "leaderboards",
        validation.mode,
        "scores",
        state.uid,
      ),
      {
        uid: state.uid,
        username: state.username || "Player",
        badges: internals.userProfile?.badges || [],
        score: validation.score,
        mode: validation.mode,
        carClass: row.carClass || "",
        runId: row.runId || `client-${state.uid}`,
        clientVersion: "InfernoDrift4 static",
        verified: false,
        createdAt: firestore.serverTimestamp(),
      },
      { merge: true },
    );
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
    state.chatListenerActive = false;
    state.chatStatus = "idle";
  }

  async function subscribeChat({ roomId = CHAT_ROOM_ID } = {}) {
    requireReady();
    const { firestore } = internals.sdk;
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
        const messages = snapshot.docs.map(mapChatDoc).reverse();
        state.chatStatus = "ready";
        state.chatListenerActive = true;
        emit("chat.history", { messages });
      },
      (error) => {
        state.chatStatus = "failed";
        fail(error, "chat_listener_failed");
      },
    );
    internals.unsubscribers.push(unsubscribe);
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
    await firestore.addDoc(
      firestore.collection(internals.db, "chatRooms", roomId, "messages"),
      {
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
      },
    );
    internals.lastChatAt = now;
    state.chatStatus = "sent";
    return true;
  }

  async function createLobby(options = {}) {
    requireReady();
    if (!state.uid) throw new Error("sign_in_required");
    const { firestore } = internals.sdk;
    const player = {
      uid: state.uid,
      username: state.username || "Player",
      badges: internals.userProfile?.badges || [],
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
        teamSize: Math.max(1, Math.min(3, Number(options.teamSize) || 2)),
        size: FIREBASE_LOBBY_MAX_PLAYERS,
        botFill: options.botFill !== false,
        private: true,
        live: false,
        backendMode: FIREBASE_BACKEND_MODE,
        players: [player],
        createdAt: firestore.serverTimestamp(),
        updatedAt: firestore.serverTimestamp(),
      };
      await firestore.setDoc(ref, lobby, { merge: false });
      const room = mapLobbyDoc({ id: code, data: () => lobby });
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
    await firestore.runTransaction(internals.db, async (transaction) => {
      const snapshot = await transaction.get(ref);
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
            },
          ];
      if (nextPlayers.length > FIREBASE_LOBBY_MAX_PLAYERS) {
        throw new Error("room_full");
      }
      transaction.set(
        ref,
        {
          players: nextPlayers,
          updatedAt: firestore.serverTimestamp(),
        },
        { merge: true },
      );
      joinedRoom = mapLobbyDoc({
        id: snapshot.id,
        data: () => ({ ...data, players: nextPlayers }),
      });
    });
    emit("room.snapshot", { room: joinedRoom });
    return joinedRoom;
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

  async function refreshFriends() {
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
    const incomingRequests = incomingSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((request) => request.status === "pending");
    const outgoingRequests = outgoingSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((request) => request.status === "pending");
    state.friendsStatus = "ready";
    emit("friends.snapshot", {
      friends,
      incomingRequests,
      outgoingRequests,
      recentPlayers: [],
    });
    return { friends, incomingRequests, outgoingRequests };
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
