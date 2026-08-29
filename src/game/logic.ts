export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  spawned?: boolean;
  merged?: boolean;
}

export interface Ghost {
  id: number;
  value: number;
  row: number; // destination cell (where it is absorbed)
  col: number;
}

export type Dir = "up" | "down" | "left" | "right";

export interface MoveResult {
  next: Tile[];
  ghosts: Ghost[];
  moved: boolean;
  gained: number;
  merges: { row: number; col: number; value: number }[];
}

let uid = 1;
export const nextId = () => uid++;

export const SIZE = 4;
export const WIN_VALUE = 2048;

export const STORAGE = {
  best: "kedbyte2048.best",
  muted: "kedbyte2048.muted",
};

export function applyMove(tiles: Tile[], dir: Dir): MoveResult {
  const next: Tile[] = [];
  const ghosts: Ghost[] = [];
  const merges: { row: number; col: number; value: number }[] = [];
  let moved = false;
  let gained = 0;

  const horizontal = dir === "left" || dir === "right";
  const reverse = dir === "right" || dir === "down";

  for (let line = 0; line < SIZE; line++) {
    const lineTiles = tiles
      .filter((t) => (horizontal ? t.row === line : t.col === line))
      .sort((a, b) => (horizontal ? a.col - b.col : a.row - b.row));
    if (reverse) lineTiles.reverse();

    let write = 0;
    let last: Tile | null = null;
    let lastMerged = false;

    for (const t of lineTiles) {
      const pos = reverse ? SIZE - 1 - write : write;
      const nr = horizontal ? line : pos;
      const nc = horizontal ? pos : line;

      if (last && last.value === t.value && !lastMerged) {
        last.value *= 2;
        last.merged = true;
        lastMerged = true;
        gained += last.value;
        merges.push({ row: last.row, col: last.col, value: last.value });
        ghosts.push({ id: t.id, value: t.value, row: last.row, col: last.col });
        moved = true;
      } else {
        if (t.row !== nr || t.col !== nc) moved = true;
        const placed: Tile = { id: t.id, value: t.value, row: nr, col: nc };
        next.push(placed);
        last = placed;
        lastMerged = false;
        write++;
      }
    }
  }

  return { next, ghosts, moved, gained, merges };
}

export function emptyCells(tiles: Tile[]): { row: number; col: number }[] {
  const taken = new Set(tiles.map((t) => t.row * SIZE + t.col));
  const out: { row: number; col: number }[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!taken.has(r * SIZE + c)) out.push({ row: r, col: c });
    }
  }
  return out;
}

export function spawnTile(tiles: Tile[]): { tiles: Tile[]; tile: Tile | null } {
  const cells = emptyCells(tiles);
  if (cells.length === 0) return { tiles, tile: null };
  const cell = cells[Math.floor(Math.random() * cells.length)];
  const tile: Tile = {
    id: nextId(),
    value: Math.random() < 0.9 ? 2 : 4,
    row: cell.row,
    col: cell.col,
    spawned: true,
  };
  return { tiles: [...tiles, tile], tile };
}

export function seedBoard(): Tile[] {
  let tiles: Tile[] = [];
  tiles = spawnTile(tiles).tiles;
  tiles = spawnTile(tiles).tiles;
  return tiles;
}

export function canMoveAny(tiles: Tile[]): boolean {
  if (tiles.length < SIZE * SIZE) return true;
  const grid: number[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (const t of tiles) grid[t.row][t.col] = t.value;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

export function maxTile(tiles: Tile[]): number {
  return tiles.reduce((m, t) => Math.max(m, t.value), 0);
}

export function tileClass(value: number): string {
  if (value <= 4096) return `t${value}`;
  return "t4096";
}

export function digitsClass(value: number): string {
  const d = String(value).length;
  if (d <= 2) return "";
  if (d === 3) return "d3";
  if (d === 4) return "d4";
  return "d5";
}
