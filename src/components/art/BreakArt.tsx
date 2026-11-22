import { useId, type ComponentType } from "react";
import type { ThemeId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BreakArtProps {
  theme: ThemeId;
  className?: string;
}

type SceneProps = { prefix: string };

const SCENES: Record<ThemeId, ComponentType<SceneProps>> = {
  cozy: CozyScene,
  night: NightScene,
  nature: NatureScene,
};

export function BreakArt({ theme, className }: BreakArtProps) {
  const prefix = useId().replace(/:/g, "");
  const Scene = SCENES[theme];

  return (
    <svg
      viewBox="0 0 640 320"
      preserveAspectRatio="xMidYMid slice"
      className={cn("block h-full w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      <Scene prefix={prefix} />
    </svg>
  );
}

function CozyScene({ prefix }: SceneProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${prefix}-cozy-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c1a12" />
          <stop offset="0.62" stopColor="#5c3320" />
          <stop offset="1" stopColor="#8a4d2a" />
        </linearGradient>
        <linearGradient id={`${prefix}-cozy-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe6bc" />
          <stop offset="0.48" stopColor="#f6ab68" />
          <stop offset="1" stopColor="#c8673a" />
        </linearGradient>
        <radialGradient id={`${prefix}-cozy-sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff7dc" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#ffd98f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb36b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${prefix}-cozy-bed`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7e3c8" />
          <stop offset="1" stopColor="#d8b68d" />
        </linearGradient>
        <linearGradient id={`${prefix}-cozy-blanket`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8c9a3" />
          <stop offset="1" stopColor="#c79b70" />
        </linearGradient>
        <linearGradient id={`${prefix}-cozy-pot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a56c44" />
          <stop offset="1" stopColor="#6f4328" />
        </linearGradient>
        <radialGradient id={`${prefix}-cozy-vignette`} cx="0.52" cy="0.45" r="0.78">
          <stop offset="0.45" stopColor="#120a06" stopOpacity="0" />
          <stop offset="1" stopColor="#120a06" stopOpacity="0.62" />
        </radialGradient>
        <radialGradient id={`${prefix}-cozy-warm`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffcf8f" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ffcf8f" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="640" height="320" fill={`url(#${prefix}-cozy-wall)`} />

      {/* Window and evening sky */}
      <g>
        <rect x="288" y="18" width="324" height="238" rx="10" fill="#1b100b" />
        <rect x="298" y="28" width="304" height="218" rx="6" fill={`url(#${prefix}-cozy-sky)`} />
        <circle cx="492" cy="108" r="82" fill={`url(#${prefix}-cozy-sun)`} />
        <circle cx="492" cy="108" r="27" fill="#fff1cc" opacity="0.92" />
        <path
          d="M298 190 C 344 166 386 190 428 176 C 474 160 520 188 602 168 L602 246 L298 246 Z"
          fill="#a75d37"
          opacity="0.72"
        />
        <path
          d="M298 210 C 354 192 408 218 468 202 C 526 188 566 210 602 200 L602 246 L298 246 Z"
          fill="#713b25"
          opacity="0.85"
        />
        <rect x="446" y="28" width="6" height="218" fill="#2a1910" opacity="0.9" />
        <rect x="298" y="140" width="304" height="6" fill="#2a1910" opacity="0.9" />
        <rect
          x="288"
          y="18"
          width="324"
          height="238"
          rx="10"
          fill="none"
          stroke="#3a2317"
          strokeWidth="11"
        />
        <path
          d="M298 28 L602 28"
          stroke="#f6c58f"
          strokeWidth="1.5"
          opacity="0.28"
        />
      </g>

      {/* Sheer curtains */}
      <path
        d="M286 14 C 264 74 272 150 250 258 L304 258 C 294 158 300 74 312 14 Z"
        fill="#f8e5c8"
        opacity="0.16"
      />
      <path
        d="M618 14 C 638 80 630 166 644 258 L590 258 C 602 156 596 76 588 14 Z"
        fill="#f8e5c8"
        opacity="0.12"
      />

      {/* Warm light spill */}
      <path
        d="M318 34 L610 34 L300 306 L150 306 Z"
        fill="#ffe2b0"
        opacity="0.06"
      />
      <circle cx="380" cy="210" r="190" fill={`url(#${prefix}-cozy-warm)`} />

      {/* Bed */}
      <g>
        <rect x="-40" y="238" width="468" height="116" rx="30" fill="#452818" />
        <path
          d="M-40 232 C 36 212 154 210 248 222 C 322 232 382 246 428 262 L428 320 L-40 320 Z"
          fill={`url(#${prefix}-cozy-bed)`}
        />
        <path
          d="M-40 266 C 58 248 164 252 264 266 C 330 276 380 288 412 300 L412 320 L-40 320 Z"
          fill={`url(#${prefix}-cozy-blanket)`}
        />
        <path
          d="M-28 272 C 66 260 152 266 236 280"
          stroke="#d2ae83"
          strokeWidth="3"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M-20 292 C 70 282 148 288 222 300"
          stroke="#bd936a"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
        <ellipse cx="92" cy="242" rx="70" ry="31" fill="#fbf0dd" />
        <ellipse cx="92" cy="246" rx="53" ry="18" fill="#f5e4ca" opacity="0.85" />
        <path
          d="M32 236 C 52 224 84 222 108 230"
          stroke="#e6cfae"
          strokeWidth="2"
          fill="none"
          opacity="0.8"
        />

        {/* Sleeping cat, curled */}
        <g transform="translate(292 250)">
          <path
            d="M-62 24 C -70 2 -50 -14 -24 -14 C 2 -14 22 -2 24 16 C 26 32 10 42 -16 42 C -44 42 -60 38 -62 24 Z"
            fill="#241610"
          />
          <circle cx="20" cy="-2" r="16" fill="#241610" />
          <path d="M10 -14 L6 -28 L20 -19 Z" fill="#241610" />
          <path d="M28 -14 L36 -26 L40 -12 Z" fill="#241610" />
          <path
            d="M-56 26 C -40 18 -22 22 -10 30"
            stroke="#3b261a"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M-30 14 C -20 10 -10 12 0 18"
            stroke="#3b261a"
            strokeWidth="2"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M14 -1 C 18 -3 22 -3 26 -1"
            stroke="#6b4a33"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M4 2 L-2 4 M30 2 L36 4"
            stroke="#6b4a33"
            strokeWidth="1"
            opacity="0.7"
          />
        </g>

        {/* Second cat, asleep on the blanket */}
        <g transform="translate(392 276) scale(0.72)">
          <path
            d="M-52 18 C -58 0 -40 -12 -18 -12 C 4 -12 20 -2 22 12 C 24 26 10 34 -12 34 C -36 34 -50 30 -52 18 Z"
            fill="#2c1b12"
          />
          <circle cx="18" cy="-4" r="14" fill="#2c1b12" />
          <path d="M10 -14 L6 -26 L18 -18 Z" fill="#2c1b12" />
          <path d="M26 -14 L32 -25 L36 -12 Z" fill="#2c1b12" />
          <path
            d="M-46 20 C -32 12 -16 16 -6 24"
            stroke="#46301f"
            strokeWidth="3"
            fill="none"
          />
        </g>
      </g>

      {/* Plant */}
      <g transform="translate(58 196)">
        <path
          d="M0 74 C -4 34 0 4 10 -30"
          stroke="#3d2a1c"
          strokeWidth="5"
          fill="none"
        />
        <path
          d="M6 32 C -20 12 -30 -8 -20 -24 C -4 -18 4 2 6 32 Z"
          fill="#3f5a32"
        />
        <path
          d="M10 12 C 34 -4 46 -24 36 -40 C 18 -32 10 -10 10 12 Z"
          fill="#4c6b3c"
        />
        <path
          d="M4 -8 C -16 -28 -14 -48 0 -56 C 12 -42 12 -22 4 -8 Z"
          fill="#587a45"
        />
        <path
          d="M12 -28 C 30 -48 48 -50 56 -38 C 44 -24 26 -20 12 -28 Z"
          fill="#6b8f52"
        />
        <path d="M-28 60 L44 60 L34 124 L-18 124 Z" fill={`url(#${prefix}-cozy-pot)`} />
        <path d="M-30 58 L46 58 L42 70 L-26 70 Z" fill="#b27a4e" />
      </g>

      {/* Dust motes */}
      <g fill="#ffe8c4" opacity="0.55">
        <circle cx="352" cy="92" r="1.6" />
        <circle cx="392" cy="128" r="1.2" />
        <circle cx="448" cy="72" r="1.8" />
        <circle cx="512" cy="156" r="1.4" />
        <circle cx="336" cy="178" r="1.1" />
        <circle cx="548" cy="108" r="1.5" />
        <circle cx="576" cy="188" r="1.2" />
      </g>

      <rect width="640" height="320" fill={`url(#${prefix}-cozy-vignette)`} />
    </>
  );
}

function NightScene({ prefix }: SceneProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${prefix}-night-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#100a20" />
          <stop offset="0.6" stopColor="#1d1136" />
          <stop offset="1" stopColor="#2b184a" />
        </linearGradient>
        <linearGradient id={`${prefix}-night-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a0e3a" />
          <stop offset="0.52" stopColor="#38206a" />
          <stop offset="1" stopColor="#6b3d9e" />
        </linearGradient>
        <radialGradient id={`${prefix}-night-moon-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e9dcff" stopOpacity="0.65" />
          <stop offset="0.5" stopColor="#a98cff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#7c5cff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${prefix}-night-city`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#211340" />
          <stop offset="1" stopColor="#0e0820" />
        </linearGradient>
        <linearGradient id={`${prefix}-night-frame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c1a4a" />
          <stop offset="1" stopColor="#160d2a" />
        </linearGradient>
        <radialGradient id={`${prefix}-night-vignette`} cx="0.5" cy="0.44" r="0.8">
          <stop offset="0.4" stopColor="#08040f" stopOpacity="0" />
          <stop offset="1" stopColor="#08040f" stopOpacity="0.72" />
        </radialGradient>
        <radialGradient id={`${prefix}-night-purple`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.3" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="640" height="320" fill={`url(#${prefix}-night-wall)`} />

      {/* Window and city night */}
      <g>
        <rect x="164" y="16" width="458" height="244" rx="10" fill="#0d0719" />
        <rect x="174" y="26" width="438" height="224" rx="6" fill={`url(#${prefix}-night-sky)`} />
        <circle cx="506" cy="86" r="100" fill={`url(#${prefix}-night-moon-glow)`} />
        <circle cx="506" cy="86" r="31" fill="#f2e7ff" opacity="0.94" />
        <circle cx="520" cy="78" r="29" fill="#2a1852" />

        {/* Stars */}
        <g fill="#e7dcff">
          <circle cx="220" cy="66" r="1.6" opacity="0.85" />
          <circle cx="266" cy="104" r="1.1" opacity="0.6" />
          <circle cx="316" cy="58" r="1.8" opacity="0.8" />
          <circle cx="366" cy="120" r="1.2" opacity="0.55" />
          <circle cx="418" cy="52" r="1.4" opacity="0.75" />
          <circle cx="468" cy="140" r="1" opacity="0.5" />
          <circle cx="560" cy="54" r="1.5" opacity="0.7" />
          <circle cx="586" cy="130" r="1.1" opacity="0.55" />
          <circle cx="242" cy="150" r="1" opacity="0.45" />
          <circle cx="338" cy="160" r="1.3" opacity="0.5" />
        </g>

        {/* Distant city */}
        <g fill={`url(#${prefix}-night-city)`}>
          <rect x="174" y="178" width="38" height="72" />
          <rect x="216" y="158" width="30" height="92" />
          <rect x="250" y="188" width="44" height="62" />
          <rect x="298" y="168" width="26" height="82" />
          <rect x="328" y="196" width="48" height="54" />
          <rect x="380" y="176" width="34" height="74" />
          <rect x="418" y="190" width="42" height="60" />
          <rect x="464" y="164" width="28" height="86" />
          <rect x="496" y="186" width="46" height="64" />
          <rect x="546" y="172" width="32" height="78" />
          <rect x="582" y="194" width="30" height="56" />
        </g>
        <g fill="#ffd98a" opacity="0.8">
          <rect x="184" y="188" width="3" height="4" />
          <rect x="194" y="202" width="3" height="4" />
          <rect x="226" y="170" width="3" height="4" />
          <rect x="234" y="186" width="3" height="4" />
          <rect x="260" y="198" width="3" height="4" />
          <rect x="272" y="212" width="3" height="4" />
          <rect x="306" y="180" width="3" height="4" />
          <rect x="314" y="198" width="3" height="4" />
          <rect x="340" y="208" width="3" height="4" />
          <rect x="356" y="220" width="3" height="4" />
          <rect x="390" y="188" width="3" height="4" />
          <rect x="400" y="206" width="3" height="4" />
          <rect x="430" y="202" width="3" height="4" />
          <rect x="442" y="218" width="3" height="4" />
          <rect x="474" y="178" width="3" height="4" />
          <rect x="482" y="196" width="3" height="4" />
          <rect x="508" y="198" width="3" height="4" />
          <rect x="520" y="214" width="3" height="4" />
          <rect x="556" y="186" width="3" height="4" />
          <rect x="566" y="204" width="3" height="4" />
          <rect x="592" y="206" width="3" height="4" />
        </g>

        {/* Window frame */}
        <rect x="382" y="26" width="7" height="224" fill={`url(#${prefix}-night-frame)`} />
        <rect x="174" y="146" width="438" height="7" fill={`url(#${prefix}-night-frame)`} />
        <rect
          x="164"
          y="16"
          width="458"
          height="244"
          rx="10"
          fill="none"
          stroke="#2a1846"
          strokeWidth="12"
        />
        <path
          d="M174 26 L612 26"
          stroke="#8b6bc4"
          strokeWidth="1.5"
          opacity="0.32"
        />
      </g>

      {/* Sill */}
      <rect x="150" y="258" width="486" height="18" rx="5" fill="#2c1b4b" />
      <rect x="150" y="258" width="486" height="4" rx="2" fill="#4a2f78" opacity="0.8" />
      <rect x="150" y="276" width="486" height="44" fill="#150c28" opacity="0.7" />

      {/* Cat on the sill */}
      <g transform="translate(344 258)">
        <path
          d="M-10 0 C -38 -2 -42 -24 -30 -40 C -25 -49 -14 -48 -12 -39"
          fill="none"
          stroke="#0b0616"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M-20 0 C -25 -28 -14 -50 3 -54 C 18 -57 31 -46 33 -28 C 35 -12 31 0 31 0 Z"
          fill="#0b0616"
        />
        <circle cx="19" cy="-64" r="17" fill="#0b0616" />
        <path d="M6 -74 L2 -91 L19 -80 Z" fill="#0b0616" />
        <path d="M27 -76 L36 -91 L38 -72 Z" fill="#0b0616" />
        <path
          d="M-18 -2 C -21 -27 -12 -48 3 -52"
          stroke="#9b7bff"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M31 -74 C 35 -69 35 -59 33 -53"
          stroke="#9b7bff"
          strokeWidth="2"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M12 -64 C 15 -66 19 -66 22 -64"
          stroke="#7f5ce0"
          strokeWidth="1.5"
          fill="none"
          opacity="0.8"
        />
      </g>

      {/* Plant silhouette on the left */}
      <g transform="translate(212 258)" fill="#0d0719">
        <path d="M0 40 L50 40 L42 86 L8 86 Z" />
        <path
          d="M24 42 C 24 16 12 0 0 -10 C 18 -6 28 12 30 42 Z"
          fill="#140c26"
        />
        <path
          d="M26 38 C 34 10 50 -2 64 -4 C 54 14 42 30 30 40 Z"
          fill="#120a22"
        />
        <path
          d="M20 36 C 6 18 -2 0 0 -18 C 14 -2 24 16 26 36 Z"
          fill="#160d2b"
        />
      </g>

      {/* Curtains */}
      <path
        d="M150 10 C 132 76 138 164 118 266 L178 266 C 170 168 176 78 186 10 Z"
        fill="#1b0f31"
        opacity="0.7"
      />
      <path
        d="M636 10 C 650 84 644 174 656 266 L604 266 C 614 166 608 82 600 10 Z"
        fill="#1b0f31"
        opacity="0.6"
      />

      {/* Ambient glow */}
      <circle cx="120" cy="300" r="170" fill={`url(#${prefix}-night-purple)`} />
      <circle cx="520" cy="110" r="150" fill={`url(#${prefix}-night-moon-glow)`} opacity="0.5" />

      <rect width="640" height="320" fill={`url(#${prefix}-night-vignette)`} />
    </>
  );
}

function NatureScene({ prefix }: SceneProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${prefix}-nature-wall`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#15261a" />
          <stop offset="0.62" stopColor="#2b452a" />
          <stop offset="1" stopColor="#47643a" />
        </linearGradient>
        <linearGradient id={`${prefix}-nature-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef6c9" />
          <stop offset="0.5" stopColor="#b8d98d" />
          <stop offset="1" stopColor="#6f9d58" />
        </linearGradient>
        <radialGradient id={`${prefix}-nature-sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fbffd9" stopOpacity="0.95" />
          <stop offset="0.42" stopColor="#e8f7ae" stopOpacity="0.5" />
          <stop offset="1" stopColor="#c7e88a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${prefix}-nature-frame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#435334" />
          <stop offset="1" stopColor="#26331f" />
        </linearGradient>
        <linearGradient id={`${prefix}-nature-pot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b07a4f" />
          <stop offset="1" stopColor="#7b4f30" />
        </linearGradient>
        <radialGradient id={`${prefix}-nature-vignette`} cx="0.5" cy="0.45" r="0.8">
          <stop offset="0.42" stopColor="#081006" stopOpacity="0" />
          <stop offset="1" stopColor="#081006" stopOpacity="0.62" />
        </radialGradient>
        <radialGradient id={`${prefix}-nature-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#d9f0a6" stopOpacity="0.3" />
          <stop offset="1" stopColor="#d9f0a6" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="640" height="320" fill={`url(#${prefix}-nature-wall)`} />

      {/* Window and garden */}
      <g>
        <rect x="240" y="16" width="382" height="240" rx="10" fill="#1b2718" />
        <rect x="250" y="26" width="362" height="220" rx="6" fill={`url(#${prefix}-nature-sky)`} />
        <circle cx="506" cy="96" r="94" fill={`url(#${prefix}-nature-sun)`} />
        <circle cx="506" cy="96" r="26" fill="#fbffdc" opacity="0.9" />

        {/* Garden foliage */}
        <g opacity="0.95">
          <circle cx="286" cy="190" r="54" fill="#5d8a49" />
          <circle cx="338" cy="168" r="62" fill="#6f9d58" />
          <circle cx="404" cy="192" r="58" fill="#507b41" />
          <circle cx="470" cy="168" r="64" fill="#7cab61" />
          <circle cx="540" cy="194" r="58" fill="#5f8c4b" />
          <circle cx="596" cy="170" r="62" fill="#6f9d58" />
          <circle cx="320" cy="222" r="50" fill="#446b39" />
          <circle cx="430" cy="228" r="54" fill="#3f6535" />
          <circle cx="540" cy="230" r="48" fill="#4a723d" />
        </g>
        <g fill="#a9c87f" opacity="0.55">
          <ellipse cx="312" cy="142" rx="20" ry="9" transform="rotate(-24 312 142)" />
          <ellipse cx="368" cy="126" rx="24" ry="10" transform="rotate(-12 368 126)" />
          <ellipse cx="456" cy="132" rx="26" ry="11" transform="rotate(14 456 132)" />
          <ellipse cx="520" cy="146" rx="22" ry="9" transform="rotate(-18 520 146)" />
          <ellipse cx="574" cy="126" rx="20" ry="8" transform="rotate(20 574 126)" />
        </g>

        {/* Window frame */}
        <rect x="428" y="26" width="7" height="220" fill={`url(#${prefix}-nature-frame)`} />
        <rect x="250" y="138" width="362" height="7" fill={`url(#${prefix}-nature-frame)`} />
        <rect
          x="240"
          y="16"
          width="382"
          height="240"
          rx="10"
          fill="none"
          stroke="#35442a"
          strokeWidth="12"
        />
        <path
          d="M250 26 L612 26"
          stroke="#cfe9a5"
          strokeWidth="1.5"
          opacity="0.4"
        />
      </g>

      {/* Sill */}
      <rect x="226" y="256" width="402" height="18" rx="5" fill="#3b4a2e" />
      <rect x="226" y="256" width="402" height="4" rx="2" fill="#6b8254" opacity="0.8" />
      <rect x="226" y="274" width="402" height="46" fill="#1a2415" opacity="0.7" />

      {/* Cat lying on the sill */}
      <g transform="translate(438 256)">
        <path
          d="M-74 6 C -78 -8 -60 -19 -34 -19 C -6 -19 18 -11 26 4 C 32 15 24 25 4 25 L-58 25 C -68 25 -74 17 -74 6 Z"
          fill="#c08b5c"
        />
        <circle cx="31" cy="-13" r="16" fill="#c08b5c" />
        <path d="M20 -25 L16 -39 L31 -29 Z" fill="#b57f52" />
        <path d="M39 -25 L47 -37 L49 -23 Z" fill="#b57f52" />
        <path
          d="M-64 4 C -44 -3 -22 1 0 8"
          stroke="#9a6740"
          strokeWidth="3"
          fill="none"
          opacity="0.55"
        />
        <path
          d="M-42 -14 C -38 -8 -38 0 -40 6"
          stroke="#a97449"
          strokeWidth="3"
          opacity="0.55"
        />
        <path
          d="M-24 -16 C -20 -10 -20 -2 -22 4"
          stroke="#a97449"
          strokeWidth="3"
          opacity="0.55"
        />
        <path
          d="M28 -11 C 32 -13 36 -13 40 -11"
          stroke="#7a4f30"
          strokeWidth="1.6"
          fill="none"
        />
        <path
          d="M33 -7 L41 -7 M33 -4 L41 -4"
          stroke="#7a4f30"
          strokeWidth="1"
          opacity="0.8"
        />
        <path
          d="M-70 8 C -60 2 -48 2 -38 8"
          stroke="#d8ad7f"
          strokeWidth="2"
          fill="none"
          opacity="0.45"
        />
      </g>

      {/* Hanging plant */}
      <g transform="translate(74 10)">
        <path d="M0 0 L54 0 L48 34 L6 34 Z" fill={`url(#${prefix}-nature-pot)`} />
        <path d="M-2 0 L56 0 L54 8 L0 8 Z" fill="#c08b5c" />
        <g stroke="#4f7d3f" strokeWidth="2.5" fill="none">
          <path d="M14 34 C 8 58 12 78 4 96" />
          <path d="M30 34 C 34 62 28 84 38 108" />
          <path d="M44 34 C 50 56 46 76 54 92" />
        </g>
        <g fill="#6f9d58">
          <ellipse cx="6" cy="58" rx="10" ry="5" transform="rotate(-30 6 58)" />
          <ellipse cx="10" cy="78" rx="9" ry="4.5" transform="rotate(24 10 78)" />
          <ellipse cx="30" cy="66" rx="10" ry="5" transform="rotate(32 30 66)" />
          <ellipse cx="32" cy="88" rx="9" ry="4.5" transform="rotate(-20 32 88)" />
          <ellipse cx="46" cy="54" rx="10" ry="5" transform="rotate(-28 46 54)" />
          <ellipse cx="50" cy="76" rx="9" ry="4.5" transform="rotate(22 50 76)" />
        </g>
      </g>

      {/* Plants on the left */}
      <g transform="translate(270 208)">
        <path
          d="M0 48 C -6 22 -2 2 8 -16"
          stroke="#3f5a32"
          strokeWidth="4"
          fill="none"
        />
        <path d="M6 18 C -16 2 -24 -14 -14 -28 C 0 -20 8 -2 6 18 Z" fill="#4f7d3f" />
        <path d="M10 4 C 30 -10 42 -26 32 -40 C 16 -32 10 -12 10 4 Z" fill="#6f9d58" />
        <path d="M4 -12 C -12 -30 -10 -46 2 -52 C 14 -40 12 -22 4 -12 Z" fill="#5d8a49" />
        <path d="M-24 46 L40 46 L32 102 L-16 102 Z" fill={`url(#${prefix}-nature-pot)`} />
        <path d="M-26 44 L42 44 L38 54 L-22 54 Z" fill="#c08b5c" />
      </g>

      {/* Plant on the right */}
      <g transform="translate(570 206)">
        <path
          d="M0 50 C 4 24 0 6 -8 -12"
          stroke="#3f5a32"
          strokeWidth="4"
          fill="none"
        />
        <path d="M-6 20 C -28 6 -34 -10 -24 -24 C -8 -16 -2 2 -6 20 Z" fill="#4f7d3f" />
        <path d="M-10 6 C -32 -8 -36 -26 -26 -38 C -12 -28 -8 -10 -10 6 Z" fill="#5d8a49" />
        <path d="M-2 -10 C 16 -26 34 -26 42 -14 C 30 0 12 4 -2 -10 Z" fill="#7cab61" />
        <path d="M-22 48 L34 48 L26 100 L-14 100 Z" fill={`url(#${prefix}-nature-pot)`} />
        <path d="M-24 46 L36 46 L32 56 L-20 56 Z" fill="#c08b5c" />
      </g>

      {/* Light rays and dust */}
      <path
        d="M300 30 L590 30 L280 300 L120 300 Z"
        fill="#eaf7c0"
        opacity="0.08"
      />
      <circle cx="330" cy="230" r="180" fill={`url(#${prefix}-nature-glow)`} />
      <g fill="#f3ffd2" opacity="0.55">
        <circle cx="330" cy="92" r="1.7" />
        <circle cx="378" cy="128" r="1.2" />
        <circle cx="438" cy="76" r="1.8" />
        <circle cx="500" cy="160" r="1.4" />
        <circle cx="352" cy="182" r="1.1" />
        <circle cx="552" cy="104" r="1.5" />
      </g>

      <rect width="640" height="320" fill={`url(#${prefix}-nature-vignette)`} />
    </>
  );
}
