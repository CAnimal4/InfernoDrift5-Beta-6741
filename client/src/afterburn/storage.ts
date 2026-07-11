import { defaultSave, sanitizeSave, type ProfileStore, type SaveV1 } from "../../../packages/afterburn-core/src/index";

type FirebaseModule = typeof import("./firebase");
type ActiveFirebase = {
  api: FirebaseModule;
  session: NonNullable<Awaited<ReturnType<FirebaseModule["openFirebaseSession"]>>>;
};

export const AFTERBURN_SAVE_KEY = "infernodrift.afterburn.v1";
const LEGACY_KEYS = ["infernodrift4.save", "infernodrift4.save.v2", "infernodrift5.save"];

export class LocalProfileStore implements ProfileStore {
  async load(): Promise<SaveV1> {
    const veteran = LEGACY_KEYS.some((key) => localStorage.getItem(key) !== null);
    try {
      const raw = localStorage.getItem(AFTERBURN_SAVE_KEY);
      const save = raw ? sanitizeSave(JSON.parse(raw), veteran) : defaultSave(veteran);
      if (navigator.webdriver && !raw) {
        save.settings.quality = "low";
        save.settings.reducedMotion = true;
        save.settings.cameraShake = 0;
        save.settings.masterVolume = 0;
      }
      return save;
    } catch {
      return defaultSave(veteran);
    }
  }

  async save(value: SaveV1): Promise<void> {
    localStorage.setItem(AFTERBURN_SAVE_KEY, JSON.stringify(sanitizeSave(value)));
  }
}

export class AfterburnProfileStore implements ProfileStore {
  private readonly local = new LocalProfileStore();
  private readonly firebase: Promise<ActiveFirebase | null>;

  constructor() {
    const configured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_APP_ID);
    this.firebase = configured
      ? import("./firebase")
          .then(async (api): Promise<ActiveFirebase | null> => {
            const session = api.firebaseConfigured() ? await api.openFirebaseSession() : null;
            return session ? { api, session } : null;
          })
          .catch(() => null)
      : Promise.resolve(null);
  }

  async load(): Promise<SaveV1> {
    const local = await this.local.load();
    const firebase = await this.firebase;
    if (!firebase) return local;
    try {
      const cloud = await firebase.api.loadCloudProfile(firebase.session);
      if (!cloud) {
        await firebase.api.saveCloudProfile(firebase.session, local);
        return local;
      }
      const selected = profileWeight(cloud) > profileWeight(local) ? cloud : local;
      if (selected === local) await firebase.api.saveCloudProfile(firebase.session, local);
      else await this.local.save(cloud);
      return selected;
    } catch {
      return local;
    }
  }

  async save(value: SaveV1): Promise<void> {
    await this.local.save(value);
    const firebase = await this.firebase;
    if (firebase) await firebase.api.saveCloudProfile(firebase.session, value).catch(() => undefined);
  }

  async getIdToken(): Promise<string | null> {
    const firebase = await this.firebase;
    return firebase ? firebase.session.user.getIdToken() : null;
  }
}

function profileWeight(save: SaveV1): number {
  return save.reputation * 100 + save.credits + save.contractsCompleted * 10_000 + save.chassis.length * 1_000;
}
