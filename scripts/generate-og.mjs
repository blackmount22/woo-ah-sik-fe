// OG 이미지 생성 스크립트 (1200×630 PNG)
// 실행: node scripts/generate-og.mjs
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// 빌드 실패 방지: OG 생성에 실패해도 next build는 계속 진행
process.on("uncaughtException", (err) => {
  console.error("⚠️  OG 이미지 생성 실패 (빌드는 계속 진행):", err.message);
  process.exit(0);
});
process.on("unhandledRejection", (err) => {
  console.error("⚠️  OG 이미지 생성 실패 (빌드는 계속 진행):", err);
  process.exit(0);
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/og-image.png");

// ── 한국어 폰트 등록 ─────────────────────────────────────────
async function registerKoreanFont() {
  const cacheDir = resolve(__dirname, "fonts");
  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

  const cachedPath = resolve(cacheDir, "NotoSansKR-Bold.ttf");

  // 1) 이미 캐시된 폰트
  if (existsSync(cachedPath)) {
    GlobalFonts.registerFromPath(cachedPath, "Korean");
    console.log("✅ Font loaded from cache");
    return;
  }

  // 2) Windows 시스템 폰트 (맑은 고딕 Bold)
  const sysFont = "C:/Windows/Fonts/malgunbd.ttf";
  if (existsSync(sysFont)) {
    GlobalFonts.registerFromPath(sysFont, "Korean");
    console.log("✅ Font loaded: Malgun Gothic Bold (system)");
    return;
  }

  // 3) macOS 시스템 폰트
  const macFont =
    "/Library/Fonts/AppleSDGothicNeo-Bold.ttf";
  if (existsSync(macFont)) {
    GlobalFonts.registerFromPath(macFont, "Korean");
    console.log("✅ Font loaded: Apple SD Gothic Neo (system)");
    return;
  }

  // 4) 없으면 Noto Sans KR 다운로드 (Google Fonts GitHub)
  const url =
    "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanskr/NotoSansKR%5Bwght%5D.ttf";
  console.log("⬇️  Downloading Noto Sans KR font...");
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(cachedPath, buf);
    GlobalFonts.registerFromPath(cachedPath, "Korean");
    console.log("✅ Noto Sans KR downloaded & registered");
  } catch (err) {
    console.warn("⚠️  폰트 다운로드 실패 (기본 폰트로 진행):", err.message);
  }
}

await registerKoreanFont();

// ── 캔버스 설정 ───────────────────────────────────────────────
const W = 1200;
const H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

const F = (weight, size) =>
  `${weight} ${size}px "Korean", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;

// ── 1. 배경 그라디언트 ────────────────────────────────────────
const bg = ctx.createLinearGradient(0, 0, W, H);
bg.addColorStop(0, "#FFF9F5");
bg.addColorStop(0.5, "#FFE4DA");
bg.addColorStop(1, "#FFF0E6");
ctx.fillStyle = bg;
ctx.fillRect(0, 0, W, H);

// ── 2. 장식 원 ───────────────────────────────────────────────
function circle(x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}
circle(-60, -80,  280, "rgba(255,107,107,0.10)");
circle(W + 80, H + 100, 320, "rgba(255,169,77,0.10)");
circle(60,  100, 130, "rgba(81,207,102,0.07)");
circle(W - 140, 60, 100, "rgba(255,107,107,0.06)");

// ── 3. 좌측 아이콘 박스 ──────────────────────────────────────
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,       x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h,   x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x,     y + h,   x, y + h - r,     r);
  ctx.lineTo(x,     y + r);
  ctx.arcTo(x,     y,       x + r, y,          r);
  ctx.closePath();
}

const iconSize = 180;
const iconX    = 100;
const iconY    = (H - iconSize) / 2;

roundRect(iconX, iconY, iconSize, iconSize, 36);
ctx.fillStyle = "#FF6B6B";
ctx.fill();

// 그릇 몸통
const cx = iconX + iconSize / 2;
const cy = iconY + iconSize / 2;

ctx.fillStyle = "white";
ctx.beginPath();
ctx.arc(cx, cy + 8, 52, 0, Math.PI);
ctx.fill();

// 그릇 개구부
ctx.beginPath();
ctx.ellipse(cx, cy - 20, 52, 14, 0, 0, Math.PI * 2);
ctx.fillStyle = "#FF6B6B";
ctx.fill();
ctx.strokeStyle = "white";
ctx.lineWidth = 6;
ctx.stroke();

// 쌀알 점
ctx.fillStyle = "rgba(255,255,255,0.85)";
for (const [dx, dy] of [[-16, -21], [0, -26], [16, -21]]) {
  ctx.beginPath();
  ctx.arc(cx + dx, cy + dy, 4, 0, Math.PI * 2);
  ctx.fill();
}

// 그릇 받침
roundRect(cx - 24, cy + 58, 48, 8, 4);
ctx.fillStyle = "white";
ctx.fill();
roundRect(cx - 34, cy + 65, 68, 7, 3.5);
ctx.fill();

// ── 4. 우측 텍스트 ───────────────────────────────────────────
const TX = 340;
ctx.textBaseline = "alphabetic";

// 브랜드명
ctx.font      = F("bold", 100);
ctx.fillStyle = "#FF6B6B";
ctx.fillText("우아식", TX, 215);

// 언더라인 악센트
ctx.fillStyle = "#FF6B6B";
ctx.fillRect(TX, 230, 90, 5);

// 영문 부제
ctx.font      = F(600, 26);
ctx.fillStyle = "#FF9999";
ctx.fillText("WooAhSik · Baby Food Planner", TX, 268);

// 메인 설명 (1)
ctx.font      = F("bold", 42);
ctx.fillStyle = "#2D3436";
ctx.fillText("맞춤형 이유식 식단표 자동 생성", TX, 330);

// 메인 설명 (2)
ctx.font      = F(400, 30);
ctx.fillStyle = "#636E72";
ctx.fillText("생년월일 입력 → 단계별 식단표 · 분유량 · 레시피", TX, 384);

// ── 5. 기능 배지 ─────────────────────────────────────────────
const badges = ["분유량 계산", "이유식 식단표", "주간·월간 식단"];
let   bx     = TX;
const bY     = 465;

ctx.font = F(600, 26);

for (const text of badges) {
  const tw = ctx.measureText(text).width;
  const bw = tw + 50;
  const bh = 54;
  const by = bY - bh + 12;

  // 그림자
  ctx.shadowColor   = "rgba(0,0,0,0.07)";
  ctx.shadowBlur    = 8;
  ctx.shadowOffsetY = 2;

  roundRect(bx, by, bw, bh, 27);
  ctx.fillStyle = "white";
  ctx.fill();

  ctx.shadowColor   = "transparent";
  ctx.shadowBlur    = 0;
  ctx.shadowOffsetY = 0;

  roundRect(bx, by, bw, bh, 27);
  ctx.strokeStyle = "#F0E6DE";
  ctx.lineWidth   = 2;
  ctx.stroke();

  ctx.fillStyle = "#FF6B6B";
  ctx.fillText(text, bx + 25, bY);

  bx += bw + 18;
}

// ── 6. URL + 무료 뱃지 ───────────────────────────────────────
ctx.font      = F(400, 26);
ctx.fillStyle = "#BBBBBB";
ctx.fillText("wooahsik.com", TX, H - 44);

const freeText = "완전 무료";
ctx.font       = F("bold", 22);
const ftw      = ctx.measureText(freeText).width;
roundRect(W - ftw - 80, H - 76, ftw + 40, 42, 21);
ctx.fillStyle = "#FF6B6B";
ctx.fill();
ctx.fillStyle = "white";
ctx.fillText(freeText, W - ftw - 60, H - 47);

// ── 7. 저장 ──────────────────────────────────────────────────
const buffer = canvas.toBuffer("image/png");
writeFileSync(OUT, buffer);
console.log(`✅ OG image saved → public/og-image.png`);
