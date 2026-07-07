type Column = { header: string; align?: "left" | "right" };

export function printTable(columns: Column[], rows: Record<string, string>[]) {
  if (rows.length === 0) return;

  const keys = Object.keys(rows[0]!);
  const widths = keys.map((k, i) => {
    const headerLen = (columns[i]?.header ?? k).length;
    const maxDataLen = rows.reduce((m, r) => Math.max(m, (r[k] ?? "").length), 0);
    return Math.max(headerLen, maxDataLen) + 2;
  });

  const renderRow = (vals: string[]) => {
    const parts = vals.map((v, i) => {
      const w = widths[i]! - 2;
      const a = columns[i]?.align ?? "left";
      return a === "right" ? v.padStart(w) : v.padEnd(w);
    });
    return `│ ${parts.join(" │ ")} │`;
  };

  const sep = (left: string, mid: string, right: string) =>
    left + widths.map((w) => "─".repeat(w)).join(mid) + right;

  console.log(sep("┌", "┬", "┐"));
  console.log(renderRow(columns.map((c) => c.header)));
  console.log(sep("├", "┼", "┤"));
  for (let i = 0; i < rows.length; i++) {
    console.log(renderRow(keys.map((k) => rows[i]![k] ?? "")));
    if (i < rows.length - 1) console.log(sep("├", "┼", "┤"));
  }
  console.log(sep("└", "┴", "┘"));
}
