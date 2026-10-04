import forge from "@forge/api";
import { storage } from "@forge/api";

export const handler = async (req, res) => {
  // serve the static UI (handled automatically by Forge)
};

export async function getCurrentUser() {
  const { accountId, username, displayName } =
    (await forge.user.getCurrentUser()) || {};
  return { accountId, username, displayName };
}

export async function listRequests() {
  const all = (await storage.get("requests")) || [];
  return all;
}

export async function createRequest(form) {
  const user = await forge.user.getCurrentUser();
  const all = (await storage.get("requests")) || [];
  const newReq = {
    id: Date.now().toString(),
    employeeName: user.displayName,
    username: user.username,
    ...form,
    status: "PENDING"
  };
  all.push(newReq);
  await storage.set("requests", all);
  return newReq;
}

export async function updateRequest({ id, status }) {
  const all = (await storage.get("requests")) || [];
  const updated = all.map(r =>
    r.id === id ? { ...r, status } : r
  );
  await storage.set("requests", updated);
  return { success: true };
}
