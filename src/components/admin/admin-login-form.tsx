
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginValues = z.infer<typeof loginSchema>;

const fieldClass =
  "w-full rounded-lg border border-border-soft bg-white px-3.5 py-2.5 text-sm outline-none focus-visible:border-primary";

export function AdminLoginForm() {
  const [notice, setNotice] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setNotice(null);
    try {
      await api.login(values.email, values.password);
      const next = searchParams.get("next") ?? "/admin";
      navigate(next.startsWith("/admin") ? next : "/admin");
    } catch (err) {
      const msg = (err as Error).message || "Login failed";
      if (msg.toLowerCase().includes("not found") || msg.includes("404")) {
        setNotice(
          "Backend authentication service is unavailable. Please verify the Express server is running on port 4000.",
        );
      } else {
        setNotice(msg);
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4 rounded-xl border border-border-soft bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-1.5 block text-sm font-semibold" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={fieldClass}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-danger">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label
          className="mb-1.5 block text-sm font-semibold"
          htmlFor="password"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          className={fieldClass}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
        )}
      </div>

      {notice && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {notice}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
