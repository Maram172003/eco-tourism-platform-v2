const DB_NAME    = "eco-offer-images";
const STORE_NAME = "images";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function saveOfferImages(offerId: string, dataUrls: string[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(JSON.stringify(dataUrls), `images_${offerId}`);
    store.put(dataUrls[0] ?? "", `cover_${offerId}`);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}

export async function getOfferImages(offerId: string): Promise<string[] | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, "readonly")
                  .objectStore(STORE_NAME)
                  .get(`images_${offerId}`);
    req.onsuccess = () => {
      const val = req.result;
      resolve(val ? (JSON.parse(val) as string[]) : null);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getOfferCover(offerId: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, "readonly")
                  .objectStore(STORE_NAME)
                  .get(`cover_${offerId}`);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror   = () => reject(req.error);
  });
}

export async function removeOfferImages(offerId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx    = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(`images_${offerId}`);
    store.delete(`cover_${offerId}`);
    tx.oncomplete = () => resolve();
    tx.onerror    = () => reject(tx.error);
  });
}
