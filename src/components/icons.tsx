interface IconProps {
  className?: string;
}

export function LogoKedbyte({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
      <path
        d="M24 3 L42 13.5 V34.5 L24 45 L6 34.5 V13.5 Z"
        stroke="#ffc93c"
        strokeWidth="2.6"
        strokeLinejoin="round"
        fill="rgba(255,201,60,0.08)"
      />
      <path d="M19 15 V33" stroke="#ffe9b0" strokeWidth="3.4" strokeLinecap="round" />
      <path
        d="M30 15 L20.5 23.5 L30 33"
        stroke="#e8541d"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LogoTile({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
      <rect x="3" y="3" width="19" height="19" rx="3" fill="#3b2f1c" />
      <rect x="26" y="3" width="19" height="19" rx="3" fill="#b36410" />
      <rect x="3" y="26" width="19" height="19" rx="3" fill="#e8541d" />
      <rect x="26" y="26" width="19" height="19" rx="3" fill="#ffc93c" />
      <text
        x="35.5"
        y="41.5"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fontFamily="'Space Grotesk',sans-serif"
        fill="#241700"
      >
        8
      </text>
    </svg>
  );
}

export function IconSound({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
      <path d="M16.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

export function IconMute({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
      <path d="M17 9l5 6M22 9l-5 6" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlay({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M7 4l13 8-13 8V4z" />
    </svg>
  );
}

export function IconRestart({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
      <path d="M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUndo({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M9 14L4 9l5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" strokeLinecap="round" />
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M3 11l9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h5v-6h4v6h5V10" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCrown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M3 7l4.5 4L12 4l4.5 7L21 7l-1.6 11H4.6L3 7z" />
    </svg>
  );
}

export function IconTrophy({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M6 3h12v2h3v3c0 2.8-2 5-4.6 5.4A6 6 0 0 1 13 16.9V19h3v2H8v-2h3v-2.1a6 6 0 0 1-3.4-3.5C5 13 3 10.8 3 8V5h3V3zm-1 4v1c0 1.5.9 2.7 2.2 3.2C7.1 10 7 8.6 7 7V7H5zm14 0h-2v4.2c1.3-.5 2.2-1.7 2.2-3.2V7z" />
    </svg>
  );
}

export function IconArrow({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 4l8 9h-5v7H9v-7H4l8-9z" />
    </svg>
  );
}

export function IconGithub({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}
