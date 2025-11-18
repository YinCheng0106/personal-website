import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl;

  if (url.pathname == "/bot") {
    return NextResponse.redirect(
      new URL(
        "https://discord.com/oauth2/authorize?client_id=914150570250625044&permissions=1759214307376375&integration_type=0&scope=applications.commands+bot",
        request.url,
      ),
      301,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/bot"],
};
