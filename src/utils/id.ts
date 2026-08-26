// Simple ID generator (no external uuid dependency needed)
export function v4Style(): string {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  );
}

export function generateId(prefix: string = ''): string {
  const id = v4Style();
  return prefix ? `${prefix}-${id}` : id;
}
