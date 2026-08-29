import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyMove,
  seedBoard,
  spawnTile,
  canMoveAny,
  maxTile,
  tileClass,
  digitsClass,
  SIZE,
  WIN_VALUE,
  STORAGE,
} from "./game/logic";
import type { Tile, Ghost, Dir } from "./game/logic";
import { sfx, setAudioMuted, unlockAudio } from "./game/audio";
import { MenuOverlay, WinOverlay, GameOverOverlay } from "./components/Overlays";
import {
  LogoKedbyte,
  LogoTile,
  IconSound,
  IconMute,
  IconRestart,
  IconUndo,
  IconCrown,
  IconGithub,
  IconArrow,
} from "./components/icons";

type Status = "menu" | "playing" | "won" | "over";

interface Burst {
  id: number;
  row: number;
  col: number;
  value: number;
  parts: { dx: number; dy: number; color: string }[];
}

const STATUS_META: Record<Status, { label: string; color: string }> = {
  menu: { label: "ATTRACT", color: "#a08b6d" },
  playing: { label: "LIVE", color: "#ffc93c" },
  won: { label: "FORGED", color: "#3ee6d2" },
  over: { label: "LOCKED", color: "#ff4b33" },
};

const BURST_COLORS = ["#ffc93c", "#ffb020", "#ff7a2f", "#e8541d", "#ffe9b0"];

function loadBest(): number {
  try {
    return Math.max(0, parseInt(localStorage.getItem(STORAGE.best) ?? "0", 10) || 0);
  } catch {
    return 0;
  }
}

function useAnimatedNumber(target: number): number {
  const [display, setDisplay] = useState(target);
  const currentRef = useRef(target);
  useEffect(() => {
    const from = currentRef.current;
    if (from === target) return;
    const start = performance.now();
    const dur = 380;
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      const v = Math.round(from + (target - from) * eased);
      currentRef.current = v;
      setDisplay(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return display;
}

const cellPos = (row: number, col: number) => ({
  top: `calc(var(--gap) + ${row} * (var(--gap) + var(--cell)))`,
  left: `calc(var(--gap) + ${col} * (var(--gap) + var(--cell)))`,
});

export default function App() {
  const [status, setStatus] = useState<Status>("menu");
  const [tiles, setTiles] = useState<Tile[]>(() => seedBoard());
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(loadBest);
  const [undoSnap, setUndoSnap] = useState<{ tiles: Tile[]; score: number; moves: number } | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [shaking, setShaking] = useState(false);
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE.muted) === "1";
    } catch {
      return false;
    }
  });

  const statusRef = useRef<Status>("menu");
  const busyRef = useRef(false);
  const runIdRef = useRef(0);
  const hasWonRef = useRef(false);
  const keepGoingRef = useRef(false);
  const runStartBestRef = useRef(loadBest());
  const burstIdRef = useRef(1);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const scoreShown = useAnimatedNumber(score);
  const topTile = useMemo(() => maxTile(tiles), [tiles]);

  useEffect(() => {
    setAudioMuted(muted);
    try {
      localStorage.setItem(STORAGE.muted, muted ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [muted]);

  /* persist best whenever score climbs */
  useEffect(() => {
    if (score > best) {
      setBest(score);
      try {
        localStorage.setItem(STORAGE.best, String(score));
      } catch {
        /* ignore */
      }
    }
  }, [score, best]);

  const setStatusBoth = useCallback((s: Status) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  /* ---------------- core move ---------------- */

  const move = useCallback(
    (dir: Dir) => {
      if (statusRef.current !== "playing" || busyRef.current) return;
      unlockAudio();
      const res = applyMove(tiles, dir);
      if (!res.moved) {
        sfx.bump();
        return;
      }

      busyRef.current = true;
      const runId = runIdRef.current;
      setUndoSnap({ tiles: tiles.map((t) => ({ ...t })), score, moves });
      sfx.slide();
      setTiles(res.next);
      setGhosts(res.ghosts);

      if (res.gained > 0) {
        const maxMerge = Math.max(...res.merges.map((m) => m.value));
        setScore((s) => s + res.gained);
        sfx.merge(maxMerge);
        const newBursts: Burst[] = res.merges.map((m) => ({
          id: burstIdRef.current++,
          row: m.row,
          col: m.col,
          value: m.value,
          parts: Array.from({ length: 10 }, () => {
            const a = Math.random() * Math.PI * 2;
            const d = 34 + Math.random() * 60;
            return {
              dx: Math.cos(a) * d,
              dy: Math.sin(a) * d,
              color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
            };
          }),
        }));
        setBursts((b) => [...b.slice(-8), ...newBursts]);
        window.setTimeout(() => {
          setBursts((b) => b.filter((x) => !newBursts.some((n) => n.id === x.id)));
        }, 750);
        if (maxMerge >= 128) {
          setShaking(true);
          window.setTimeout(() => setShaking(false), 330);
        }
      }

      window.setTimeout(() => {
        if (runIdRef.current !== runId) return;
        setGhosts([]);
        const grown = spawnTile(res.next);
        setTiles(grown.tiles);
        setMoves((m) => m + 1);
        if (grown.tile) sfx.spawn();
        busyRef.current = false;

        const mt = maxTile(grown.tiles);
        if (mt >= WIN_VALUE && !hasWonRef.current) {
          hasWonRef.current = true;
          window.setTimeout(() => {
            if (runIdRef.current === runId && statusRef.current === "playing") {
              setStatusBoth("won");
              sfx.win();
            }
          }, 420);
        }
        if (!canMoveAny(grown.tiles)) {
          window.setTimeout(() => {
            if (runIdRef.current === runId && statusRef.current === "playing") {
              setStatusBoth("over");
              sfx.over();
            }
          }, 500);
        }
      }, 135);
    },
    [tiles, score, moves, setStatusBoth]
  );

  /* ---------------- flow actions ---------------- */

  const newGame = useCallback(() => {
    unlockAudio();
    runIdRef.current++;
    busyRef.current = false;
    hasWonRef.current = false;
    keepGoingRef.current = false;
    runStartBestRef.current = best;
    setTiles(seedBoard());
    setGhosts([]);
    setBursts([]);
    setScore(0);
    setMoves(0);
    setUndoSnap(null);
    setStatusBoth("playing");
    sfx.start();
  }, [setStatusBoth, best]);

  const toMenu = useCallback(() => {
    runIdRef.current++;
    busyRef.current = false;
    setStatusBoth("menu");
  }, [setStatusBoth]);

  const keepGoing = useCallback(() => {
    keepGoingRef.current = true;
    setStatusBoth("playing");
    sfx.select();
  }, [setStatusBoth]);

  const undo = useCallback(() => {
    if (statusRef.current !== "playing" || busyRef.current || !undoSnap) return;
    setTiles(undoSnap.tiles);
    setScore(undoSnap.score);
    setMoves(undoSnap.moves);
    setGhosts([]);
    setUndoSnap(null);
    sfx.undo();
  }, [undoSnap]);

  /* ---------------- keyboard ---------------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      const dirMap: Record<string, Dir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
        W: "up",
        S: "down",
        A: "left",
        D: "right",
      };
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(k)) e.preventDefault();
      unlockAudio();
      if (k === "m" || k === "M") {
        setMuted((m) => !m);
        return;
      }
      if (statusRef.current === "menu" && (k === " " || k === "Enter")) {
        newGame();
        return;
      }
      if (statusRef.current === "over" && (k === " " || k === "Enter" || k === "r" || k === "R")) {
        newGame();
        return;
      }
      if (k === "r" || k === "R") {
        newGame();
        return;
      }
      if (k === "z" || k === "Z") {
        undo();
        return;
      }
      const dir = dirMap[k];
      if (dir) move(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, newGame, undo]);

  /* ---------------- swipe ---------------- */

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 26) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
    else move(dy > 0 ? "down" : "up");
  };

  /* ---------------- ambient embers ---------------- */

  const embers = useMemo(() => {
    const chars = ["2", "4", "8", "16", "32", "64", "128", "256", "512", "1024", "2048"];
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      char: chars[i % chars.length],
      left: Math.random() * 100,
      size: 8 + Math.random() * 15,
      dur: 16 + Math.random() * 18,
      delay: -Math.random() * 30,
      o: 0.04 + Math.random() * 0.07,
    }));
  }, []);

  const meta = STATUS_META[status];
  const isNewBest =
    score > 0 && score > runStartBestRef.current && (status === "over" || status === "won");

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* ambient layers */}
      <div className="bg-stage" aria-hidden />
      <div className="bg-grid" aria-hidden />
      <div className="ember-field" aria-hidden>
        {embers.map((e) => (
          <span
            key={e.id}
            className="ember"
            style={{
              left: `${e.left}%`,
              fontSize: e.size,
              animationDuration: `${e.dur}s`,
              animationDelay: `${e.delay}s`,
              ["--o" as string]: e.o,
            }}
          >
            {e.char}
          </span>
        ))}
      </div>
      <div className="bg-noise" aria-hidden />
      <div className="bg-sweep" aria-hidden />
      <div className="bg-vignette" aria-hidden />
      <div className="bg-scanlines" aria-hidden />

      <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-1 flex-col px-3 pb-6 pt-4 sm:px-6">
        {/* marquee header */}
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <LogoTile className="wiggle h-9 w-9 drop-shadow-[0_0_10px_rgba(255,201,60,0.7)]" />
            <div>
              <h1 className="font-arcade text-[14px] leading-none text-[#f5e9d6] sm:text-[17px]">
                NEON <span className="text-[#ffc93c]">2048</span>
              </h1>
              <p className="mt-1.5 text-[10px] font-semibold tracking-[0.3em] text-[#6f5c42]">
                KEDBYTE ARCADE · CARTRIDGE 04
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="hidden items-center gap-2 border border-[#2b1f10] bg-[#171009] px-2.5 py-1.5 sm:flex">
              <LogoKedbyte className="h-6 w-6" />
              <div className="leading-none">
                <div className="font-arcade text-[8px] tracking-[0.14em] text-[#ffc93c]">KEDBYTE</div>
                <div className="mt-1 text-[8px] font-bold tracking-[0.28em] text-[#6f5c42]">ARCADE DIVISION</div>
              </div>
            </div>
            <a
              href="https://github.com/dexter02-crypt"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile"
              className="icon-btn icon-btn-square"
            >
              <IconGithub className="h-4 w-4" />
            </a>
          </div>
        </header>

        {/* HUD */}
        <div className="mb-3 grid grid-cols-4 gap-2">
          <div className="border border-[#2b1f10] bg-[#171009] px-2 py-2 text-center">
            <div className="panel-title">SCORE</div>
            <div key={score} className="score-pop font-arcade mt-1 text-[13px] text-[#ffb020] sm:text-[15px]">
              {scoreShown}
            </div>
          </div>
          <div className="border border-[#2b1f10] bg-[#171009] px-2 py-2 text-center">
            <div className="panel-title">BEST</div>
            <div className="font-arcade mt-1 flex items-center justify-center gap-1 text-[13px] text-[#3ee6d2] sm:text-[15px]">
              <IconCrown className="h-3.5 w-3.5" />
              {best}
            </div>
          </div>
          <div className="border border-[#2b1f10] bg-[#171009] px-2 py-2 text-center">
            <div className="panel-title">MOVES</div>
            <div className="font-arcade mt-1 text-[13px] text-[#f5e9d6] sm:text-[15px]">{moves}</div>
          </div>
          <div className="border border-[#2b1f10] bg-[#171009] px-2 py-2 text-center">
            <div className="panel-title">TOP</div>
            <div className="font-arcade mt-1 text-[13px] text-[#ffc93c] sm:text-[15px]">{topTile}</div>
          </div>
        </div>

        {/* controls row */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className="font-arcade inline-flex items-center gap-1.5 border px-2 py-1.5 text-[8px]"
              style={{ color: meta.color, borderColor: `${meta.color}55`, background: "#171009" }}
            >
              <span className="blink-soft inline-block h-1.5 w-1.5" style={{ background: meta.color }} />
              {meta.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="icon-btn"
              onClick={undo}
              disabled={!undoSnap || status !== "playing"}
              aria-label="Undo move"
            >
              <IconUndo className="h-4 w-4" />
              UNDO
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={newGame}
              disabled={status === "menu"}
              aria-label="New game"
            >
              <IconRestart className="h-4 w-4" />
              NEW
            </button>
            <button
              type="button"
              className="icon-btn icon-btn-square"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <IconMute className="h-4 w-4" /> : <IconSound className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* board */}
        <div className="mx-auto w-full max-w-[460px]">
          <div
            ref={boardRef}
            className={`board-frame relative aspect-square select-none ${shaking ? "do-shake" : ""}`}
            style={{ touchAction: "none" }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* slots */}
            {Array.from({ length: SIZE * SIZE }, (_, i) => {
              const r = Math.floor(i / SIZE);
              const c = i % SIZE;
              return <div key={i} className="slot" style={cellPos(r, c)} />;
            })}

            {/* ghosts (absorbed tiles) */}
            {ghosts.map((g) => (
              <div
                key={`g-${g.id}`}
                className={`tile tile-ghost ${tileClass(g.value)} ${digitsClass(g.value)}`}
                style={cellPos(g.row, g.col)}
              >
                {g.value}
              </div>
            ))}

            {/* tiles */}
            {tiles.map((t) => (
              <div
                key={t.id}
                className={`tile ${tileClass(t.value)} ${digitsClass(t.value)}${t.spawned ? " tile-spawn" : ""}${t.merged ? " tile-merged" : ""}`}
                style={cellPos(t.row, t.col)}
              >
                {t.value}
              </div>
            ))}

            {/* merge bursts */}
            {bursts.map((b) => (
              <div
                key={b.id}
                className="pointer-events-none absolute z-[4]"
                style={{
                  top: `calc(var(--gap) + ${b.row} * (var(--gap) + var(--cell)) + var(--cell) / 2)`,
                  left: `calc(var(--gap) + ${b.col} * (var(--gap) + var(--cell)) + var(--cell) / 2)`,
                }}
              >
                {b.parts.map((p, i) => (
                  <span
                    key={i}
                    className="burst-p"
                    style={{
                      color: p.color,
                      background: p.color,
                      ["--dx" as string]: `${p.dx}px`,
                      ["--dy" as string]: `${p.dy}px`,
                    }}
                  />
                ))}
                <span className="burst-text" style={{ color: "#ffe9b0" }}>
                  +{b.value}
                </span>
              </div>
            ))}

            {/* watermark */}
            <div className="font-arcade pointer-events-none absolute bottom-1 right-2 z-[3] text-[7px] text-[#a08b6d] opacity-40">
              KEDBYTE ©
            </div>

            {/* overlays */}
            {status === "menu" && <MenuOverlay best={best} onStart={newGame} />}
            {status === "won" && (
              <WinOverlay score={score} moves={moves} onKeepGoing={keepGoing} onNewGame={newGame} />
            )}
            {status === "over" && (
              <GameOverOverlay
                score={score}
                best={best}
                moves={moves}
                maxTile={topTile}
                isNewBest={isNewBest}
                onNewGame={newGame}
                onMenu={toMenu}
              />
            )}
          </div>
        </div>

        {/* mobile pad */}
        <div className="pad-zone mx-auto mt-5 w-60 grid-cols-3 gap-2">
          <span />
          <PadBtn label="Slide up" onDir={() => move("up")} rotate="" />
          <span />
          <PadBtn label="Slide left" onDir={() => move("left")} rotate="-rotate-90" />
          <button
            type="button"
            className="pad-btn"
            aria-label="New game"
            onClick={() => {
              unlockAudio();
              newGame();
            }}
          >
            <IconRestart className="h-5 w-5" />
          </button>
          <PadBtn label="Slide right" onDir={() => move("right")} rotate="rotate-90" />
          <span />
          <PadBtn label="Slide down" onDir={() => move("down")} rotate="rotate-180" />
          <span />
        </div>

        {/* control guide */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-[#6f5c42]">
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className="keycap">ARROWS</span>
            <span className="keycap">WASD</span> slide
          </span>
          <span className="flex items-center gap-1.5">
            <span className="keycap">Z</span> undo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="keycap">R</span> new run
          </span>
          <span className="flex items-center gap-1.5">
            <span className="keycap">M</span> sound
          </span>
          <span className="flex items-center gap-1.5 sm:hidden">
            <span className="keycap">SWIPE</span> slide
          </span>
        </div>

        <footer className="mt-auto pt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <LogoKedbyte className="h-4 w-4 opacity-80" />
            <span className="font-arcade text-[9px] tracking-[0.16em] text-[#ffc93c]">KEDBYTE</span>
            <span className="text-[8px] font-bold tracking-[0.3em] text-[#6f5c42]">ARCADE DIVISION</span>
          </div>
          <p className="mt-2 text-[11px] tracking-wide text-[#4d3d28]">
            © 2026 Kedbyte · NEON 2048 — a hand-built merge puzzle · no engines, just math &amp; glow
          </p>
        </footer>
      </div>
    </div>
  );
}

function PadBtn({ label, onDir, rotate }: { label: string; onDir: () => void; rotate: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="pad-btn"
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        e.preventDefault();
        unlockAudio();
        onDir();
      }}
    >
      <IconArrow className={`h-5 w-5 ${rotate}`} />
    </button>
  );
}


