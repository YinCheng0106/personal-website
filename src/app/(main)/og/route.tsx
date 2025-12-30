import { readFile } from "fs/promises";
import { ImageResponse } from "next/og";
import { join } from "path";

export const alt = "YinCheng's Personal Website";

export async function GET() {
  const notoSerifTC = await readFile(
    join(process.cwd(), "public", "fonts", "NotoSerifTC-Bold.ttf"),
  );
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: "#0E0E0E",
          backgroundSize: "100% 100%",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "nowrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            justifyItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <span
            style={{
              fontWeight: "bold",
              fontFamily: "serif",
              fontSize: 120,
              fontStyle: "normal",
              color: "white",
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            YinCheng
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Serif",
          data: notoSerifTC,
          style: "normal",
          weight: 600,
        },
      ],
    },
  );
}
