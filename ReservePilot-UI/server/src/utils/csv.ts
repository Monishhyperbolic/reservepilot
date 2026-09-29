export const csvEscape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
export const toCsv = (headers: string[], rows: unknown[][]) => [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
