import { Form, useActionData } from "react-router";
import { Mail, Lock, LogIn, QrCode, AlertCircle } from "lucide-react";
import bcrypt from "bcryptjs";
import { getDb } from "~/.server/db";
import { createSessionCookie, clearSessionCookie } from "~/.server/auth";

interface ActionData {
  error?: string;
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const action = formData.get("_action");

  if (action === "logout") {
    return new Response(null, {
      status: 302,
      headers: {
        "Set-Cookie": clearSessionCookie(),
        Location: "/login",
      },
    });
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const db = getDb();
  const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  const user = users[0];

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return { error: "Invalid email or password" };
  }

  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": createSessionCookie(user.id),
      Location: "/dashboard",
    },
  });
}

export default function Login() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50 to-gray-100 p-4">
      <div className="relative w-full max-w-md">
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-300 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
              <QrCode className="w-7 h-7 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold text-base-content">
              Army<span className="text-red-600">QR</span>Code
            </h1>
            <p className="text-base-content/50 text-sm mt-1">
              Sign in to your account
            </p>
          </div>

          {actionData?.error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-5">
            <div>
              <label className="text-sm font-medium text-base-content/70 mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10"
                  strokeWidth={2}
                />
                <input
                  name="email"
                  type="email"
                  className="input input-bordered w-full pl-11"
                  placeholder="admin@armysecurity.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-base-content/70 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10"
                  strokeWidth={2}
                />
                <input
                  name="password"
                  type="password"
                  className="input input-bordered w-full pl-11"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-army w-full justify-center py-6 text-base"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
