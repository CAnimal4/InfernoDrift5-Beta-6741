import { applicationDefault, cert, getApps, initializeApp, type AppOptions } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { createRemoteJWKSet, jwtVerify } from "jose";
import type { ModeId, RunResult } from "../../../packages/afterburn-core/src/index.js";
import type { AuthIdentity, ResultStore } from "./index.js";

export interface FirebaseServerServices {
  verifyFirebaseToken(token: string): Promise<AuthIdentity>;
  resultStore?: ResultStore;
}

const GOOGLE_FIREBASE_KEYS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export function createFirebaseServerServices(): FirebaseServerServices | null {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!projectId) return null;
  const verifyFirebaseToken = async (token: string): Promise<AuthIdentity> => {
    const verified = await jwtVerify(token, GOOGLE_FIREBASE_KEYS, {
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
      algorithms: ["RS256"],
    });
    const uid = verified.payload.sub;
    if (!uid || uid.length > 128 || verified.payload.auth_time === undefined) throw new Error("invalid_firebase_token");
    return { uid, name: typeof verified.payload.name === "string" ? verified.payload.name : undefined };
  };
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  const hasApplicationCredentials = Boolean(serviceAccount || process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.K_SERVICE);
  if (!hasApplicationCredentials) return { verifyFirebaseToken };
  const options: AppOptions = {
    projectId,
    credential: serviceAccount ? cert(JSON.parse(serviceAccount)) : applicationDefault(),
  };
  const app = getApps()[0] ?? initializeApp(options);
  const firestore = getFirestore(app);

  return {
    verifyFirebaseToken,
    resultStore: {
      async commit(playerId: string, result: RunResult) {
        const resultId = `${playerId}_${result.mode}_${result.seed}_${Math.round(result.time * 1000)}_${result.score}`;
        await firestore.collection("afterburnVerifiedResults").doc(resultId).set({
          playerId,
          ...result,
          verified: true,
          createdAt: new Date(),
        });
      },
      async leaderboard(mode: ModeId, limit = 20) {
        const snapshot = await firestore
          .collection("afterburnVerifiedResults")
          .where("mode", "==", mode)
          .orderBy("score", "desc")
          .limit(Math.min(100, limit))
          .get();
        return snapshot.docs.map((entry) => {
          const data = entry.data() as RunResult & { playerId: string };
          return { playerId: data.playerId, result: data };
        });
      },
    },
  };
}
