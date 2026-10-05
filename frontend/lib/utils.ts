export function v4uuidLike(): string {
  return "id-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
}

// Alias kept short for import ergonomics in components.
export const v4 = v4uuidLike;
