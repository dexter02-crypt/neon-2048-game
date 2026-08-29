import type { ReactNode } from "react";
import { WIN_VALUE } from "../game/logic";
import { IconCrown, IconHome, IconPlay, IconRestart, IconTrophy, LogoKedbyte } from "./icons";

function Shell({ onPrimary, children }: { onPrimary?: () => void; children: ReactNode }) {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto bg-[rgba(8,5,2,0.84)] p-3 backdrop-blur-[2px]"
      onClick={onPrimary}
    >
      <div
        className="overlay-card my-auto flex w-full max-w-[340px] flex-col gap-4 border-2 border-[#3a2a17] bg-[#140d06] p-5 shadow-[0_0_50px_rgba(0,0,0,0.7),0_0_34px_rgba(255,176,32,0.08)]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

const stop = (fn: () => void) => (e: React.MouseEvent) => {
  e.stopPropagation();
  fn();
};

/* ---------------- menu ---------------- */

interface MenuProps {
  best: number;
  onStart: () => void;
}

export function MenuOverlay({ best, onStart }: MenuProps) {
  return (
    <Shell onPrimary={onStart}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2.5">
          <LogoKedbyte className="h-8 w-8 drop-shadow-[0_0_10px_rgba(255,201,60,0.5)]" />
          <div className="text-left leading-tight">
            <div className="font-arcade text-[10px] tracking-[0.18em] text-[#ffc93c]">KEDBYTE</div>
            <div className="mt-0.5 text-[9px] font-bold tracking-[0.44em] text-[#e8541d]">PRESENTS</div>
          </div>
        </div>
        <div className="mx-auto mt-3 h-px w-28 bg-[#3a2a17]" />
        <div className="font-arcade blink-soft mt-3 text-[8px] tracking-[0.24em] text-[#e8541d]">
          NEON ARCADE · CARTRIDGE 04
        </div>
        <h1 className="font-arcade title-neon-gold mt-4 text-[30px] leading-none sm:text-[36px]">2048</h1>
        <p className="mt-3 text-[11px] font-semibold tracking-[0.32em] text-[#a08b6d]">
          SLIDE · MERGE · TRANSCEND
        </p>
      </div>

      <button type="button" className="btn-arcade btn-gold w-full" onClick={stop(onStart)}>
        <IconPlay className="h-3.5 w-3.5" />
        START PUZZLE
      </button>

      {best > 0 && (
        <div className="flex items-center justify-center gap-2 border border-[#2b1f10] bg-[#171009] px-3 py-2.5 text-[11px] text-[#a08b6d]">
          <IconCrown className="h-4 w-4 text-[#ffc93c]" />
          <span>ALL-TIME BEST</span>
          <span className="font-arcade text-[11px] text-[#ffc93c]">{best}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 border border-[#2b1f10] bg-[#171009] p-3 text-[11px] text-[#a08b6d]">
        <div className="flex items-center gap-1.5">
          <span className="keycap">◀</span>
          <span className="keycap">▲</span>
          <span>slide</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="keycap">SWIPE</span>
          <span>on touch</span>
        </div>
        <div className="col-span-2 flex items-center gap-1.5">
          <span className="keycap">Z</span>
          <span>undo</span>
          <span className="mx-1 text-[#3a2a17]">·</span>
          <span className="keycap">R</span>
          <span>new run</span>
        </div>
      </div>

      <div className="text-center text-[11px] leading-relaxed text-[#6f5c42]">
        Equal tiles fuse when they collide.
        <br />
        Forge the blazing <span className="font-arcade text-[10px] text-[#ffc93c]">{WIN_VALUE}</span> tile to win.
      </div>
    </Shell>
  );
}

/* ---------------- win ---------------- */

interface WinProps {
  score: number;
  moves: number;
  onKeepGoing: () => void;
  onNewGame: () => void;
}

export function WinOverlay({ score, moves, onKeepGoing, onNewGame }: WinProps) {
  return (
    <Shell onPrimary={onKeepGoing}>
      <div className="text-center">
        <IconTrophy className="wiggle mx-auto h-12 w-12 text-[#ffc93c] drop-shadow-[0_0_16px_rgba(255,201,60,0.7)]" />
        <h2
          className="font-arcade mt-3 text-[20px] leading-tight text-[#ffc93c] sm:text-[23px]"
          style={{ textShadow: "0 0 20px rgba(255,201,60,0.55), 3px 3px 0 rgba(12,7,3,0.9)" }}
        >
          2048 FORGED
        </h2>
        <p className="mt-2 text-[11px] tracking-[0.2em] text-[#a08b6d]">
          THE LEGENDARY TILE IS YOURS
        </p>
      </div>

      <div className="grid grid-cols-2 divide-x-2 divide-[#2b1f10] border-2 border-[#2b1f10] bg-[#171009]">
        <div className="px-4 py-3 text-center">
          <div className="panel-title">SCORE</div>
          <div className="font-arcade mt-1.5 text-xl text-[#ffb020]">{score}</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="panel-title">MOVES</div>
          <div className="font-arcade mt-1.5 text-xl text-[#3ee6d2]">{moves}</div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button type="button" className="btn-arcade btn-gold w-full" onClick={stop(onKeepGoing)}>
          <IconPlay className="h-3.5 w-3.5" />
          KEEP GOING
        </button>
        <button type="button" className="btn-arcade btn-dark w-full" onClick={stop(onNewGame)}>
          <IconRestart className="h-3.5 w-3.5" />
          NEW RUN
        </button>
      </div>

      <div className="text-center text-[11px] text-[#6f5c42]">
        Beyond 2048 lies the white-hot <span className="font-arcade text-[9px] text-[#f5e9d6]">4096</span>…
      </div>
    </Shell>
  );
}

/* ---------------- game over ---------------- */

interface OverProps {
  score: number;
  best: number;
  moves: number;
  maxTile: number;
  isNewBest: boolean;
  onNewGame: () => void;
  onMenu: () => void;
}

export function GameOverOverlay({ score, best, moves, maxTile, isNewBest, onNewGame, onMenu }: OverProps) {
  return (
    <Shell onPrimary={onNewGame}>
      <div className="text-center">
        <h2
          className="font-arcade text-[22px] leading-tight text-[#ff4b33] sm:text-[25px]"
          style={{ textShadow: "0 0 18px rgba(255,75,51,0.55), 3px 3px 0 rgba(12,7,3,0.9)" }}
        >
          GRID LOCKED
        </h2>
        <p className="mt-2 text-[11px] tracking-[0.22em] text-[#6f5c42]">NO MOVES REMAIN</p>
        {isNewBest && (
          <div className="badge-pop mx-auto mt-3 inline-block -rotate-3 border-2 border-[#ffe08a] bg-[#ffc93c] px-3 py-1.5 font-arcade text-[9px] text-[#3a2a00] shadow-[0_0_24px_rgba(255,201,60,0.5)]">
            ★ NEW RECORD ★
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 divide-x-2 divide-[#2b1f10] border-2 border-[#2b1f10] bg-[#171009]">
        <div className="px-4 py-3 text-center">
          <div className="panel-title">SCORE</div>
          <div className="font-arcade mt-1.5 text-xl text-[#ffb020]">{score}</div>
        </div>
        <div className="px-4 py-3 text-center">
          <div className="panel-title">BEST</div>
          <div className="font-arcade mt-1.5 flex items-center justify-center gap-1.5 text-xl text-[#3ee6d2]">
            <IconCrown className="h-4 w-4" />
            {best}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="border border-[#2b1f10] bg-[#171009] px-3 py-2">
          <div className="panel-title">TOP TILE</div>
          <div className="font-arcade mt-1 text-sm text-[#ffc93c]">{maxTile}</div>
        </div>
        <div className="border border-[#2b1f10] bg-[#171009] px-3 py-2">
          <div className="panel-title">MOVES</div>
          <div className="font-arcade mt-1 text-sm text-[#f5e9d6]">{moves}</div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button type="button" className="btn-arcade btn-gold w-full" onClick={stop(onNewGame)}>
          <IconRestart className="h-3.5 w-3.5" />
          TRY AGAIN
        </button>
        <button type="button" className="btn-arcade btn-dark w-full" onClick={stop(onMenu)}>
          <IconHome className="h-3.5 w-3.5" />
          BACK TO MENU
        </button>
      </div>

      <div className="text-center text-[11px] text-[#6f5c42]">
        <span className="keycap">R</span> to run it back
      </div>
    </Shell>
  );
}
