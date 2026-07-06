import { readFile } from "fs/promises";
import { join } from "path";
import { OgFrameAbout, getOgImageResponse } from "@/lib/og";

const avatarPromise = (async () => {
  const buffer = await readFile(
    join(process.cwd(), "public", "me", "avatar.jpg"),
  );
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
})();

export const alt = "關於 YinCheng";

export async function GET() {
  const [imageResponse, avatarSrc] = await Promise.all([
    getOgImageResponse(),
    avatarPromise,
  ]);
  return imageResponse(<OgFrameAbout avatarSrc={avatarSrc} />);
}
