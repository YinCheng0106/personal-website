import { readFile } from "fs/promises";
import { join } from "path";
import { createImageResponse } from "takumi-js/response";

const fontDir = join(process.cwd(), "public", "fonts");

const fontsPromise = (async () => {
  const [bold, regular] = await Promise.all([
    readFile(join(fontDir, "NotoSerifTC-Bold.ttf")),
    readFile(join(fontDir, "NotoSerifTC-Regular.ttf")),
  ]);
  return [
    { name: "NotoSerifTC", data: bold, weight: 700 },
    { name: "NotoSerifTC", data: regular, weight: 400 },
  ] as const;
})();

export const OG_SIZE = { width: 1200, height: 630 } as const;

const BG = "#0E0E0E";
const FG = "#FAFAFA";
const MUTED = "rgba(250, 250, 250, 0.55)";
const FAINT = "rgba(250, 250, 250, 0.10)";

const baseLayer = {
  width: "100%",
  height: "100%",
  display: "flex",
  backgroundColor: BG,
  color: FG,
  fontFamily: "NotoSerifTC, serif",
} as const;

export function OgFrameHome() {
  return (
    <div
      style={{
        ...baseLayer,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 60%)",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 220,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        YinCheng
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 36,
          alignItems: "center",
          gap: 18,
          color: MUTED,
          fontSize: 28,
          letterSpacing: "0.32em",
          textTransform: "uppercase",
        }}
      >
        <span style={{ width: 48, height: 1, backgroundColor: MUTED }} />
        <span>Personal Website</span>
        <span style={{ width: 48, height: 1, backgroundColor: MUTED }} />
      </div>
    </div>
  );
}

type AboutFrameProps = {
  avatarSrc: string;
};

export function OgFrameAbout({ avatarSrc }: AboutFrameProps) {
  return (
    <div
      style={{
        ...baseLayer,
        flexDirection: "row",
        alignItems: "center",
        padding: 80,
        backgroundImage:
          "radial-gradient(circle at 85% 50%, rgba(255,255,255,0.07), transparent 55%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          paddingRight: 56,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: MUTED,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          About Me
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 144,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          關於我
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            color: MUTED,
            lineHeight: 1.5,
            maxWidth: 540,
          }}
        >
          認識 YinCheng，了解我的技能、作品與聯絡方式。
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            gap: 14,
          }}
        >
          {["GitHub", "LinkedIn", "Instagram", "Threads", "X"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "10px 20px",
                borderRadius: 9999,
                border: `1px solid ${FAINT}`,
                fontSize: 22,
                color: FG,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          width: 380,
          height: 380,
          borderRadius: 9999,
          overflow: "hidden",
          border: `1px solid ${FAINT}`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc}
          alt="YinCheng"
          width={380}
          height={380}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
}

type BlogFrameProps = {
  title: string;
  description?: string;
  date?: string;
  readingTime?: string;
  url: string;
  titleSize?: number;
};

export function OgFrameBlog({
  title,
  description,
  date,
  readingTime,
  url,
  titleSize = 88,
}: BlogFrameProps) {
  return (
    <div
      style={{
        ...baseLayer,
        flexDirection: "column",
        padding: 72,
        backgroundImage:
          "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.06), transparent 55%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          paddingBottom: 24,
          borderBottom: `1px solid ${FAINT}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 26,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          <span style={{ width: 6, height: 30, backgroundColor: FG }} />
          <span style={{ color: FG, fontWeight: 700 }}>YinCheng</span>
          <span>·</span>
          <span>Journal</span>
        </div>
        {date ? (
          <div style={{ display: "flex", fontSize: 24, color: MUTED }}>
            {date}
          </div>
        ) : null}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: "94%",
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 30,
              fontWeight: 400,
              color: MUTED,
              lineHeight: 1.5,
              maxWidth: "88%",
            }}
          >
            {description}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 24,
          borderTop: `1px solid ${FAINT}`,
        }}
      >
        <div style={{ display: "flex", fontSize: 22, color: MUTED }}>{url}</div>
        {readingTime ? (
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: FG,
              padding: "8px 18px",
              borderRadius: 9999,
              border: `1px solid ${FAINT}`,
            }}
          >
            閱讀時間 · {readingTime}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type ProjectFrameProps = {
  title: string;
  description?: string;
  type?: string;
  language?: string;
  url: string;
  titleSize?: number;
};

const FG_MONO = '"Geist Mono", ui-monospace, monospace';

export function OgFrameProject({
  title,
  description,
  type,
  language,
  url,
  titleSize = 96,
}: ProjectFrameProps) {
  return (
    <div
      style={{
        ...baseLayer,
        flexDirection: "column",
        padding: 72,
        backgroundImage:
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            color: MUTED,
            fontFamily: FG_MONO,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: "#ff5f56",
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: "#ffbd2e",
              }}
            />
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: "#27c93f",
              }}
            />
          </div>
          <span style={{ marginLeft: 8 }}>~/projects</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: MUTED,
            fontFamily: FG_MONO,
          }}
        >
          YinCheng
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginTop: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {type ? (
            <div
              style={{
                display: "flex",
                padding: "8px 18px",
                borderRadius: 8,
                backgroundColor: FAINT,
                color: FG,
                fontSize: 22,
                fontFamily: FG_MONO,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {type}
            </div>
          ) : null}
          {language ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: MUTED,
                fontSize: 22,
                fontFamily: FG_MONO,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 9999,
                  backgroundColor: "#60a5fa",
                }}
              />
              <span>{language}</span>
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: "94%",
          }}
        >
          {title}
        </div>
        {description ? (
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 28,
              color: MUTED,
              lineHeight: 1.5,
              maxWidth: "88%",
            }}
          >
            {description}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingTop: 20,
          borderTop: `1px solid ${FAINT}`,
          fontFamily: FG_MONO,
          fontSize: 22,
          color: MUTED,
        }}
      >
        <span style={{ color: "#27c93f" }}>$</span>
        <span>open https://{url}</span>
      </div>
    </div>
  );
}

export async function getOgImageResponse() {
  const fonts = await fontsPromise;
  return createImageResponse({
    ...OG_SIZE,
    fonts: [...fonts],
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
