import { LoginPayload, LoginResponse } from "@/types/auth";

export async function loginUser(payload: LoginPayload) {
  const body = new URLSearchParams();
  body.append("username", "develabt");
  body.append("password", "r4h4rj4p0b");
  body.append("grant_type", "password");

  const response = await fetch("https://api.lydar.tech/oauth/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}
