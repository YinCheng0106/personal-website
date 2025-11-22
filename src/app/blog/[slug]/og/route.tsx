import { join } from "path";
import { readFile } from "fs/promises";
import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return new Response("Not Found", { status: 404 });
  }

  const notoSerifTC_bold = await readFile(
    join(process.cwd(), "public", "fonts", "NotoSerifTC-Bold.ttf"),
  );

  const notoSerifTC_regular = await readFile(
    join(process.cwd(), "public", "fonts", "NotoSerifTC-Regular.ttf"),
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
            height: "50%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "flex-start",
            flexWrap: "nowrap",
            marginTop: 50,
            paddingRight: 100,
          }}
        >
          <span
            style={{
              fontWeight: "bold",
              fontFamily: "serif",
              fontSize: 40,
              fontStyle: "normal",
              color: "white",
              opacity: 0.6,
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            yincheng.app/blog
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            justifyItems: "center",
            width: "100%",
            height: "50%",
            paddingLeft: 100,
            paddingRight: 100,
          }}
        >
          <span
            style={{
              fontWeight: "bold",
              fontFamily: "serif",
              fontSize: 60,
              fontStyle: "normal",
              color: "white",
              marginBottom: 50,
              textAlign: "left",
              flexWrap: "nowrap",
            }}
          >
            {post.title}
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Bold", data: notoSerifTC_bold, weight: 700 },
        { name: "Regular", data: notoSerifTC_regular, weight: 400 },
      ],
    },
  );
}
