import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});
type LoginValues = z.infer<typeof loginSchema>;

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary";

export function AdminLoginForm() {
  const [notice, setNotice] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@yanatravels.com",
      password: "",
    },
  });

  function autoFillCredentials() {
    setValue("email", "admin@yanatravels.com");
    setValue("password", "admin123");
    setNotice(null);
  }

  async function onSubmit(values: LoginValues) {
    setNotice(null);
    try {
      await api.login(values.email.trim(), values.password);
      const next = searchParams.get("next") ?? "/admin";
      navigate(next.startsWith("/admin") ? next : "/admin");
    } catch (err) {
      const msg = (err as Error).message || "Login failed";
      if (
        msg.toLowerCase().includes("not found") ||
        msg.includes("404") ||
        msg.includes("4000")
      ) {
        setNotice(
          "Backend authentication service is taking a moment to respond. Please try again.",
        );
      } else if (msg.toLowerCase().includes("invalid") || msg.includes("401")) {
        setNotice(
          "Invalid email or password. Default is admin@yanatravels.com / admin123.",
        );
      } else {
        setNotice(msg);
      }
    }
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600" htmlFor="email">
            Admin Email
          </label>
          <input
            id="email"
            type="email"
            className={fieldClass}
            placeholder="admin@yanatravels.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            className={fieldClass}
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
          )}
        </div>

        {notice && (
          <p className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-medium text-rose-700">
            {notice}
          </p>
        )}

        <Button
          type="submit"
          className="w-full h-11 rounded-xl font-bold"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Authenticating…" : "Sign in to Dashboard"}
        </Button>
      </form>

      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-center">
        <p className="text-xs text-amber-900 font-medium">
          Default Admin Login: <span className="font-bold">admin@yanatravels.com</span> / <span className="font-bold">admin123</span>
        </p>
        <button
          type="button"
          onClick={autoFillCredentials}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100/50"
        >
          <KeyRound className="h-3 w-3 text-amber-600" />
          Click to auto-fill credentials
        </button>
      </div>
    </div>
  );
}
