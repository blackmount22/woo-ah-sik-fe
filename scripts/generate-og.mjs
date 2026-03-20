// OG 이미지 생성 스크립트 (1200×630 PNG)
// 실행: node scripts/generate-og.mjs
import { createCanvas } from "@napi-rs/canvas";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../public/og-image.png");

const W = 1200;
const H = 630;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext("2d");

// ── 1. 배경 그라디언트 ──────────────────────────────
const bg = ctx.createLinearGradient(0, 0, W, H);
bg.addColorStop(0, "#FFF9F5");
bg.addColorStop(0.5, "#FFE4DA");
bg.addColorStop(1, "#FFF0E6");
ctx.fillStyle = bg;
ctx.fillRect(0, 0, W, H);

// ── 2. 장식 원 ──────────────────────────────────────
function circle(x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}
circle(-60, -80, 280, "rgba(255,107,107,0.10)");
circle(W + 80, H + 100, 320, "rgba(255,169,77,0.10)");
circle(60, 100, 130, "rgba(81,207,102,0.07)");
circle(W - 140, 60, 100, "rgba(255,107,107,0.06)");

// ── 3. 좌측 아이콘 박스 ─────────────────────────────
function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// 아이콘 배경 (빨간 박스)
const iconSize = 180;
const iconX = 100;
const iconY = (H - iconSize) / 2;
roundRect(iconX, iconY, iconSize, iconSize, 36);
ctx.fillStyle = "#FF6B6B";
ctx.fill();

// 아이콘 내부 — 그릇 + 숟가락 SVG 스타일
const cx = iconX + iconSize / 2;
const cy = iconY + iconSize / 2;

// 그릇 몸통
ctx.fillStyle = "white";
ctx.beginPath();
ctx.arc(cx, cy + 8, 52, 0, Math.PI);
ctx.fill();

// 그릇 개구부 (타원)
ctx.beginPath();
ctx.ellipse(cx, cy - 20, 52, 14, 0, 0, Math.PI * 2);
ctx.fillStyle = "#FF6B6B";
ctx.fill();
ctx.strokeStyle = "white";
ctx.lineWidth = 6;
ctx.stroke();

// 쌀알 점
for (const [dx, dy] of [[-16, -21], [0, -26], [16, -21]]) {
  ctx.beginPath();
  ctx.arc(cx + dx, cy + dy, 4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fill();
}

// 그릇 받침
roundRect(cx - 24, cy + 58, 48, 8, 4);
ctx.fillStyle = "white";
ctx.fill();
roundRect(cx - 34, cy + 65, 68, 7, 3.5);
ctx.fill();

// ── 4. 우측 텍스트 ──────────────────────────────────
const TX = 340;

// 브랜드명
ctx.textBaseline = "alphabetic";
ctx.font = `bold 100px "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", "맑은 고딕", sans-serif`;
ctx.fillStyle = "#FF6B6B";
ctx.fillText("우아식", TX, 215);

// 언더라인 악센트
ctx.fillStyle = "#FF6B6B";
ctx.fillRect(TX, 230, 90, 5);

// 영문 서브타이틀 (작게)
ctx.font = `600 26px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
ctx.fillStyle = "#FF9999";
ctx.fillText("WooAhSik · Baby Food Planner", TX, 268);

// 메인 설명
ctx.font = `bold 42px "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", "맑은 고딕", sans-serif`;
ctx.fillStyle = "#2D3436";
ctx.fillText("맞춤형 이유식 식단표 자동 생성", TX, 330);

ctx.font = `30px "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", "맑은 고딕", sans-serif`;
ctx.fillStyle = "#636E72";
ctx.fillText("생년월일 입력 → 단계별 식단표 · 분유량 · 레시피", TX, 384);

// ── 5. 기능 배지 ────────────────────────────────────
const badges = ["🍼 분유량 계산", "🥣 이유식 식단", "📋 주간 식단표"];
let bx = TX;
const bY = 460;
ctx.font = `600 26px "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", "맑은 고딕", sans-serif`;

for (const badge of badges) {
  const tw = ctx.measureText(badge).width;
  const bw = tw + 50;
  const bh = 56;

  // 그림자
  ctx.shadowColor = "rgba(0,0,0,0.06)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  roundRect(bx, bY - bh + 12, bw, bh, 28);
  ctx.fillStyle = "white";
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  roundRect(bx, bY - bh + 12, bw, bh, 28);
  ctx.strokeStyle = "#F0E6DE";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#2D3436";
  ctx.fillText(badge, bx + 25, bY);

  bx += bw + 18;
}

// ── 6. URL + 무료 뱃지 ──────────────────────────────
ctx.font = `26px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
ctx.fillStyle = "#BBBBBB";
ctx.fillText("wooahsik.com", TX, H - 44);

// 무료 뱃지
const freeText = "✓ 완전 무료";
const ftw = ctx.measureText(freeText).width;
roundRect(W - ftw - 80, H - 76, ftw + 40, 40, 20);
ctx.fillStyle = "#FF6B6B";
ctx.fill();
ctx.font = `bold 22px "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
ctx.fillStyle = "white";
ctx.fillText(freeText, W - ftw - 60, H - 48);

// ── 7. 저장 ─────────────────────────────────────────
const buffer = canvas.toBuffer("image/png");
writeFileSync(OUT, buffer);
console.log(`✅ OG image saved → public/og-image.png`);
