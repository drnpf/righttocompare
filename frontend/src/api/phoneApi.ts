import { Phone } from "../types/phoneTypes";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api/phones`;

export async function getAllPhones(): Promise<Phone[]> {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error("Failed to fetch phones");
  }
  return res.json();
}

export async function createPhone(phone: Phone, token: string): Promise<Phone> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(phone),
  });

  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg);
  }
  return res.json();
}

export async function updatePhone(id: string, phone: Partial<Phone>, token: string): Promise<Phone> {
  const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(phone),
  });

  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg);
  }
  return res.json();
}

export async function deletePhone(id: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const msg = await safeError(res);
    throw new Error(msg);
  }
}

async function safeError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
