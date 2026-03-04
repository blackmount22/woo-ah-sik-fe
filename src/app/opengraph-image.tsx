import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "우아식 - 우리아이식단";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF9F5 0%, #FFE8E0 50%, #FFF0E6 100%)",
          fontFamily: "'Apple SD Gothic Neo','Malgun Gothic',sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 장식 원들 */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255,107,107,0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,169,77,0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 60,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(81,207,102,0.06)",
            display: "flex",
          }}
        />

        {/* 메인 콘텐츠 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
          }}
        >
          {/* 아기 얼굴 + 로고 조합 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
            }}
          >
            {/* 아기 캐릭터 얼굴 */}
            <div
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "#FFEAA7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                boxShadow: "0 8px 30px rgba(255,169,77,0.2)",
              }}
            >
              {/* 볼 터치 왼쪽 */}
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  top: 95,
                  width: 30,
                  height: 20,
                  borderRadius: "50%",
                  background: "rgba(255,107,107,0.3)",
                  display: "flex",
                }}
              />
              {/* 볼 터치 오른쪽 */}
              <div
                style={{
                  position: "absolute",
                  right: 14,
                  top: 95,
                  width: 30,
                  height: 20,
                  borderRadius: "50%",
                  background: "rgba(255,107,107,0.3)",
                  display: "flex",
                }}
              />
              {/* 얼굴 표정 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {/* 눈 */}
                <div style={{ display: "flex", gap: 32 }}>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#2D3436",
                      display: "flex",
                    }}
                  />
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: "#2D3436",
                      display: "flex",
                    }}
                  />
                </div>
                {/* 웃는 입 */}
                <div
                  style={{
                    width: 36,
                    height: 18,
                    borderRadius: "0 0 50px 50px",
                    background: "#FF6B6B",
                    marginTop: 6,
                    display: "flex",
                  }}
                />
              </div>
              {/* 머리카락 (앞머리) */}
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  left: 40,
                  width: 80,
                  height: 40,
                  borderRadius: "50% 50% 0 0",
                  background: "#B8865C",
                  display: "flex",
                }}
              />
            </div>

            {/* 우 로고 마크 (그릇+포크+숟가락 아이콘) */}
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 28,
                background: "#FF6B6B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 30px rgba(255,107,107,0.3)",
                overflow: "hidden",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="120"
                height="120"
                viewBox="0 0 192 192"
              >
                {/* 그릇 몸통 */}
                <path d="M 60 44 C 58 70 71 85 96 87 C 121 85 134 70 132 44 Z" fill="white"/>
                {/* 그릇 개구부 */}
                <ellipse cx="96" cy="44" rx="36" ry="9" fill="#FF6B6B"/>
                {/* 그릇 테두리 */}
                <ellipse cx="96" cy="44" rx="36" ry="9" fill="none" stroke="white" strokeWidth="5"/>
                {/* 쌀 점 */}
                <circle cx="86" cy="43" r="3" fill="white" opacity="0.75"/>
                <circle cx="96" cy="40" r="2.5" fill="white" opacity="0.75"/>
                <circle cx="106" cy="43" r="3" fill="white" opacity="0.75"/>
                {/* 그릇 받침 */}
                <rect x="84" y="85" width="24" height="5" rx="2.5" fill="white"/>
                <rect x="77" y="89" width="38" height="4" rx="2" fill="white"/>
                {/* 가로줄기 */}
                <line x1="44" y1="126" x2="148" y2="126" stroke="white" strokeWidth="6.5" strokeLinecap="round"/>
                {/* 세로줄기 */}
                <line x1="96" y1="126" x2="96" y2="168" stroke="white" strokeWidth="6.5" strokeLinecap="round"/>
                {/* 포크 살 */}
                <line x1="53" y1="126" x2="51" y2="108" stroke="white" strokeWidth="5" strokeLinecap="round"/>
                <line x1="65" y1="126" x2="63" y2="104" stroke="white" strokeWidth="5" strokeLinecap="round"/>
                <line x1="77" y1="126" x2="75" y2="108" stroke="white" strokeWidth="5" strokeLinecap="round"/>
                {/* 숟가락 머리 */}
                <ellipse cx="129" cy="112" rx="16" ry="12" fill="white"/>
              </svg>
            </div>
          </div>

          {/* 타이틀 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: "#FF6B6B",
                letterSpacing: "-1px",
              }}
            >
              우아식
            </span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: "#636E72",
              }}
            >
              우리 아이의 건강한 식단을 추천해드려요
            </span>
          </div>

          {/* 하단 배지들 */}
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            {["🍼 분유량 계산", "🥣 이유식 식단", "📋 주간 식단표"].map(
              (text) => (
                <div
                  key={text}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 50,
                    background: "white",
                    border: "2px solid #F0E6DE",
                    fontSize: 20,
                    fontWeight: 600,
                    color: "#2D3436",
                    display: "flex",
                  }}
                >
                  {text}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
