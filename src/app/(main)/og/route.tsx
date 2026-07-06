import { OgFrameHome, getOgImageResponse } from "@/lib/og";

export const alt = "YinCheng's Personal Website";

export async function GET() {
  const imageResponse = await getOgImageResponse();
  return imageResponse(<OgFrameHome />);
}
