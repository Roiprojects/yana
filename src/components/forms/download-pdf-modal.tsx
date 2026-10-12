import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  CheckCircle2,
  Loader2,
  User,
  Mail,
  Phone,
  FileDown,
} from "lucide-react";
import {
  enquiryFormSchema,
  type EnquiryFormValues,
} from "@/lib/schemas/enquiry";
import { api } from "@/lib/api/client";

import type { PackageDetail } from "@/lib/types/tour";

const errorClass = "mt-1 text-[11px] font-medium text-red-500";

export function DownloadPdfModal({
  pkg,
  pdfUrl,
  onClose,
}: {
  pkg: PackageDetail;
  pdfUrl?: string | null;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const form = useForm<EnquiryFormValues>({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: {
      type: "general",
      destinationInterest: `PDF Brochure Download: ${pkg.title}`,
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  // close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function onSubmit(values: EnquiryFormValues) {
    setSubmitError(null);
    setDownloading(true);

    try {
      // 1. Save lead details into DB via submitEnquiry
      const result = await api.submitEnquiry({
        ...values,
        type: "general",
        destinationInterest: `PDF Download - ${pkg.title}`,
        message: `User downloaded itinerary PDF for package: ${pkg.title}`,
      });

      if (!result.ok && result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof EnquiryFormValues, { message });
        }
        setSubmitError(result.error ?? "Please check form fields.");
        setDownloading(false);
        return;
      }

      // 2. Download custom PDF brochure if attached, otherwise generate dynamic PDF
      if (pdfUrl && pdfUrl.trim().length > 0) {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `${pkg.title.replace(/[^a-zA-Z0-9]/g, "_")}_Brochure.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const { generatePackagePdf } = await import("@/lib/pdf-generator");
        await generatePackagePdf(pkg);
      }

      // Close modal after brief delay
      setTimeout(() => {
        onClose();
      }, 800);
    } catch {
      setSubmitError("Failed to submit details. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Download brochure form"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] bg-white">
        {/* Full card background image */}
        <div
          className="absolute inset-0 bg-cover bg-top bg-no-repeat"
          style={{ backgroundImage: `url('/brand/enquiry-modal-team.png')` }}
          aria-hidden
        />
        {/* Scrim overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-black/40"
          aria-hidden
        />

        {/* Modal content */}
        <div className="relative z-10 p-6 sm:p-8">
          {/* Top-right close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 hover:scale-110"
            aria-label="Close download modal"
          >
            <X className="h-5 w-5 drop-shadow" />
          </button>

          <div>
            {/* Header Title */}
            <div className="rounded-2xl bg-white/55 p-3.5 text-center shadow-sm backdrop-blur-[2px] border border-white/70">
              <div className="flex items-center justify-center gap-2 text-[#0b66e4]">
                <FileDown className="h-6 w-6" />
                <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl drop-shadow-sm">
                  Download Itinerary PDF
                </h2>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-800">
                Please enter your details to download the complete brochure for <span className="text-[#0b66e4]">{pkg.title}</span>.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="mt-5 space-y-3.5"
            >
              {/* Name */}
              <div>
                <div className="relative flex items-center rounded-xl border border-white/60 bg-white/30 shadow-sm backdrop-blur-[2px] transition-colors focus-within:border-[#0b66e4] focus-within:bg-white/60 focus-within:ring-2 focus-within:ring-[#0b66e4]/25">
                  <input
                    id="download-name"
                    className="w-full bg-transparent px-4 py-3 pr-11 text-sm font-semibold text-gray-900 placeholder:text-gray-900 placeholder:opacity-100 outline-none"
                    placeholder="Enter Your Name *"
                    {...register("name")}
                  />
                  <User className="pointer-events-none absolute right-3.5 h-5 w-5 text-gray-900" />
                </div>
                {errors.name && (
                  <p className={errorClass}>{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <div className="relative flex items-center rounded-xl border border-white/60 bg-white/30 shadow-sm backdrop-blur-[2px] transition-colors focus-within:border-[#0b66e4] focus-within:bg-white/60 focus-within:ring-2 focus-within:ring-[#0b66e4]/25">
                  <input
                    id="download-email"
                    type="email"
                    className="w-full bg-transparent px-4 py-3 pr-11 text-sm font-semibold text-gray-900 placeholder:text-gray-900 placeholder:opacity-100 outline-none"
                    placeholder="Enter Email ID *"
                    {...register("email")}
                  />
                  <Mail className="pointer-events-none absolute right-3.5 h-5 w-5 text-gray-900" />
                </div>
                {errors.email && (
                  <p className={errorClass}>{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <div className="relative flex items-center rounded-xl border border-white/60 bg-white/30 shadow-sm backdrop-blur-[2px] transition-colors focus-within:border-[#0b66e4] focus-within:bg-white/60 focus-within:ring-2 focus-within:ring-[#0b66e4]/25">
                  <div className="flex shrink-0 items-center gap-1.5 border-r border-slate-600/30 py-3 pl-3.5 pr-2.5 text-xs font-bold text-gray-900 select-none">
                    <span className="text-base leading-none">🇮🇳</span>
                    <span className="text-[10px] text-gray-900">▾</span>
                    <span className="pl-1 text-sm font-bold text-gray-900">+91</span>
                  </div>
                  <input
                    id="download-phone"
                    inputMode="tel"
                    className="w-full bg-transparent px-3 py-3 pr-11 text-sm font-semibold text-gray-900 placeholder:text-gray-900 placeholder:opacity-100 outline-none"
                    placeholder="Enter Phone Number *"
                    {...register("phone")}
                  />
                  <Phone className="pointer-events-none absolute right-3.5 h-5 w-5 text-gray-900" />
                </div>
                {errors.phone && (
                  <p className={errorClass}>{errors.phone.message}</p>
                )}
              </div>

              {submitError && (
                <p className="rounded-xl bg-red-50/90 px-3.5 py-2 text-xs font-bold text-red-600">
                  {submitError}
                </p>
              )}

              {/* Submit & Download Button */}
              <button
                type="submit"
                disabled={isSubmitting || downloading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0b66e4] to-[#0052cc] py-3.5 text-base font-bold text-white shadow-xl transition-all duration-200 hover:shadow-2xl hover:scale-[1.01] disabled:opacity-70"
              >
                {isSubmitting || downloading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing & Downloading…</span>
                  </>
                ) : (
                  <>
                    <FileDown className="h-5 w-5" />
                    <span>Submit & Download PDF</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
