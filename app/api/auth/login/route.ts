import { NextRequest, NextResponse } from "next/server";
import { validateAuthorCredentials, createSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }

    if (validateAuthorCredentials(email, password)) {
      const cookie = createSessionCookie({
        sub: email,
        role: "author",
        name: "Chico Montecristi",
      });

      const res = NextResponse.json({ ok: true, role: "author" });
      res.headers.set("Set-Cookie", cookie);
      return res;
    }

    // Wrong credentials — same error for both wrong email and wrong password
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
