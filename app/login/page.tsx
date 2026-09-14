"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const supabase = createClient();

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        setError(
          loginError.message || "Invalid email or password."
        );
        return;
      }

      // Login successful
      router.push("/form");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-5 bg-black text-white">

      <div className="w-full max-w-md">

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/z-logo.png"
              alt="Zipher"
              className="w-24 h-24 object-contain"
            />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-center">
            Welcome to Zipher
          </h1>

          <p className="text-sm text-gray-400 text-center mt-2 mb-8">
            Login to continue
          </p>

          {/* Login Form */}
          <form
            onSubmit={handleLogin}
            className="space-y-5"
          >

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm mb-2 text-gray-300"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 outline-none text-white placeholder-gray-500 focus:border-red-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm mb-2 text-gray-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3.5 outline-none text-white placeholder-gray-500 focus:border-red-500 transition"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-red-600 py-3.5 font-semibold transition hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

        </div>

      </div>

    </main>
  );
}