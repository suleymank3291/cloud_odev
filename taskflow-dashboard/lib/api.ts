// ─── API katmanı — tüm backend çağrıları buradan yapılır ─────────────────────
const BASE_URL = "http://localhost:3001";

// ── Tipler ────────────────────────────────────────────────────────────────────
export type Category = "iş" | "kişisel" | "okul" | "sağlık";
export type Priority = "düşük" | "orta" | "yüksek" | "kritik";
export type Status   = "yapılacak" | "devam-ediyor" | "tamamlandı";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  category: Category;
  priority: Priority;
  status: Status;
  tags: string[];
  deadline: string | null;
  createdAt: string;
}

export interface Stats {
  total: number;
  byStatus: Record<Status, number>;
  byCategory: Record<Category, number>;
  deadlineThisWeek: number;
  criticalCount: number;
  completionRate: string;
  weekRange: { start: string; end: string };
}

// ── Yardımcı ─────────────────────────────────────────────────────────────────
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.data as T;
}

// ── Task endpointleri ─────────────────────────────────────────────────────────
export async function getTasks(params?: {
  category?: Category;
  priority?: Priority;
  status?: Status;
}): Promise<Task[]> {
  const qs = params
    ? "?" + new URLSearchParams(params as Record<string, string>).toString()
    : "";
  const res = await fetch(`${BASE_URL}/tasks${qs}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data as Task[];
}

export const getTask    = (id: number)              => request<Task>(`/tasks/${id}`);
export const createTask = (body: Partial<Task>)     => request<Task>("/tasks", { method: "POST", body: JSON.stringify(body) });
export const updateTask = (id: number, body: Partial<Task>) =>
  request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteTask = (id: number) =>
  fetch(`${BASE_URL}/tasks/${id}`, { method: "DELETE" }).then((r) => r.json());

// ── Stats endpointi ───────────────────────────────────────────────────────────
export async function getStats(): Promise<Stats> {
  const res = await fetch(`${BASE_URL}/stats`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data as Stats;
}
