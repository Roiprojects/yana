import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import {
  Download,
  Eye,
  Printer,
  FileText,
  ShieldCheck,
  Phone,
  Building2,
  CreditCard,
  User,
  ChevronRight,
  Info,
  Plane,
  Hotel,
  Users,
  CheckCircle,
} from "lucide-react";

export function TermsPage() {
  const [activeTab, setActiveTab] = useState<string>("app-form");

  const navItems = [
    { id: "app-form", label: "1. Application Form", page: "Page 1" },
    { id: "payment", label: "2. Payment Procedure", page: "Page 2" },
    { id: "cancellation", label: "3. Cancellation Policy", page: "Page 2" },
    { id: "children", label: "4. Charges for Children", page: "Page 2" },
    { id: "airlines", label: "5. Airlines Policy", page: "Page 2" },
    { id: "hotel", label: "6. Hotel Policy", page: "Page 3" },
    { id: "important-notes", label: "7. Important Notes", page: "Page 3" },
    { id: "group-terms", label: "8. Group Tours Terms", page: "Pages 4–5" },
    { id: "additional-terms", label: "9. Additional Terms", page: "Page 6" },
    { id: "declaration", label: "10. Client Declaration", page: "Page 6" },
  ];

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* 1. Hero Section with bright travel background */}
      <div className="print:hidden">
        <PageHeader
          title="Terms & Conditions"
          subtitle="Booking, payment, cancellation and tour-operation terms."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Terms & Conditions" },
          ]}
          image="photo-1469474968028-56623f02e42e"
        />
      </div>

      <Section className="bg-slate-50/70 py-8 md:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">

          {/* Top Actions Banner with Official Document Badges & Action Buttons */}
          <div className="mb-8 print:hidden flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50/90 via-white to-amber-50/40 p-6 md:p-8 shadow-xs">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/90 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200/80">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                <span>OFFICIAL YANA TRAVELS POLICY DOCUMENT</span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-[#0c3c8a]">
                Application Form & Booking Terms (6 Pages)
              </h2>
              <p className="text-xs md:text-sm text-slate-700 max-w-2xl leading-relaxed">
                Transcribed with verbatim accuracy from the official Yana Travels Application Form For Domestic, International & Group Tour document.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="/yana-terms-conditions.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-xs"
              >
                <Eye className="h-4 w-4 text-[#0c3c8a]" /> View Official PDF
              </a>
              <a
                href="/yana-terms-conditions.pdf"
                download="Yana_Travels_Application_Form_Terms.pdf"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0c3c8a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0a3275] transition shadow-xs"
              >
                <Download className="h-4 w-4" /> Download PDF
              </a>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition shadow-xs cursor-pointer"
              >
                <Printer className="h-4 w-4 text-amber-700" /> Print Document
              </button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Desktop Sticky Quick Navigation */}
            <aside className="hidden lg:block print:hidden">
              <div className="sticky top-28 space-y-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between px-3 pt-1 border-b border-slate-100 pb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Table of Contents
                  </p>
                  <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-[#0c3c8a]">
                    6 Pages
                  </span>
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl transition flex items-center justify-between cursor-pointer ${
                        activeTab === item.id
                          ? "bg-sky-50 text-[#0c3c8a] font-bold border-l-4 border-[#0c3c8a]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="truncate pr-1">{item.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 opacity-50 shrink-0" />
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Mobile Horizontal Quick Navigation */}
            <div className="block lg:hidden print:hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase px-2 mb-2">Quick Navigation</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-[#0c3c8a] hover:text-white transition cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-8">

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 1: APPLICATION FORM – DOMESTIC & INTERNATIONAL (PAGE 1)
                  ───────────────────────────────────────────────────────────── */}
              <section id="app-form" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
                {/* Official Office Header on Page 1 */}
                <div className="mb-6 rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/50 via-white to-sky-50/30 p-5 text-center">
                  <h3 className="font-extrabold text-slate-900 text-base md:text-lg tracking-tight">
                    YANA TRAVELS
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    #20, 3rd Floor, S L Plaza, 8th Cross, Sampige Road, Malleshwaram, B - 03
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-700">
                    <span>M: <strong className="text-slate-900">+91 9513588143</strong></span>
                    <span>•</span>
                    <span>E: <a href="mailto:info@yanaindia.com" className="text-[#0c3c8a] hover:underline">info@yanaindia.com</a></span>
                    <span>•</span>
                    <span>W: <a href="https://www.yanaindia.com" target="_blank" rel="noopener noreferrer" className="text-[#0c3c8a] hover:underline">www.yanaindia.com</a></span>
                  </div>
                </div>

                <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 uppercase tracking-wide border border-amber-200">
                      PDF Page 1
                    </span>
                    <h2 className="mt-2 text-2xl font-extrabold text-[#0c3c8a]">
                      APPLICATION FORM – DOMESTIC & INTERNATIONAL
                    </h2>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Personal Details */}
                  <div className="rounded-2xl border border-slate-200 bg-sky-50/20 p-5">
                    <div className="flex items-center justify-between mb-4 border-b border-sky-100 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <User className="h-4 w-4 text-[#0c3c8a]" /> PERSONAL DETAILS
                      </h3>
                      <div className="text-xs font-semibold text-slate-600">
                        Date of Booking: <span className="inline-block border-b border-slate-400 min-w-[100px] text-center font-normal">DD / MM / YYYY</span>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Name :</label>
                        <input type="text" placeholder="Full Name" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Mobile :</label>
                        <input type="text" placeholder="+91 _____" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Email id :</label>
                        <input type="text" placeholder="example@email.com" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Adult :</label>
                        <input type="text" placeholder="Number of Adults" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Child :</label>
                        <input type="text" placeholder="Number of Children" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-700">Address :</label>
                        <input type="text" placeholder="Complete Residential Address" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Tour Details */}
                  <div className="rounded-2xl border border-slate-200 bg-sky-50/20 p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2 border-b border-sky-100 pb-2">
                      <FileText className="h-4 w-4 text-[#0c3c8a]" /> TOUR DETAILS
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Tour Name :</label>
                        <input type="text" placeholder="Tour Name" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Tour Date :</label>
                        <input type="text" placeholder="DD / MM / YYYY" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Boarding From :</label>
                        <input type="text" placeholder="Boarding City / Station" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Meal :</label>
                        <input type="text" placeholder="APAI / MAPAI / CP / EP" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Details */}
                  <div className="rounded-2xl border border-slate-200 bg-sky-50/20 p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2 border-b border-sky-100 pb-2">
                      <Phone className="h-4 w-4 text-[#0c3c8a]" /> EMERGENCY CONTACT DETAILS
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Name :</label>
                        <input type="text" placeholder="Contact Name" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Mobile :</label>
                        <input type="text" placeholder="+91 _____" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Address :</label>
                        <input type="text" placeholder="Contact Address" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 mb-4 flex items-center gap-2 border-b border-amber-200/60 pb-2">
                      <CreditCard className="h-4 w-4 text-amber-800" /> PAYMENT DETAILS
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Total Tour Cost :</label>
                        <input type="text" placeholder="₹" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">GST :</label>
                        <input type="text" placeholder="₹" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Deposit Paid :</label>
                        <input type="text" placeholder="₹" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700">Balance Payment :</label>
                        <input type="text" placeholder="₹" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                      </div>
                    </div>

                    <div className="rounded-xl bg-amber-100/80 p-3.5 text-xs font-bold text-amber-900 border border-amber-200/90 mb-4">
                      (Note: Complete tour cost to be paid 30 days prior to departure of your Domestic Tours and 45 days of your International Tours)
                    </div>

                    <div className="space-y-2 text-xs text-slate-800 mb-4">
                      <p className="font-semibold text-slate-900">Additional Services / Information:</p>
                      <p className="italic text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                        On behalf of the above person(s), I have read and understood the booking conditions mentioned (For Terms & Conditions see Overleaf)
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-amber-200/70 pt-4 text-xs font-semibold text-slate-700">
                      <div>Date: <span className="inline-block border-b border-slate-400 min-w-[120px]"></span></div>
                      <div>Signature: <span className="inline-block border-b border-slate-400 min-w-[180px]"></span></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 2: PAYMENT PROCEDURE (PAGE 2)
                  ───────────────────────────────────────────────────────────── */}
              <section id="payment" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 uppercase tracking-wide border border-amber-200">
                    PDF Page 2
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#0c3c8a]">
                    Payment Procedure:-
                  </h2>
                </div>

                {/* Axis Bank Details Card */}
                <div className="mb-6 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50/80 via-white to-sky-50/30 p-5 md:p-6 shadow-xs">
                  <div className="flex items-center gap-3 mb-3 border-b border-sky-100 pb-2.5">
                    <Building2 className="h-6 w-6 text-[#0c3c8a]" />
                    <h3 className="text-base font-extrabold text-slate-900 tracking-wide">AXIS BANK LTD</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs font-semibold text-slate-800">
                    <div><span className="text-slate-500 font-medium">Name:</span> <strong className="text-slate-900">YANA TRAVELS</strong></div>
                    <div><span className="text-slate-500 font-medium">Account Number:</span> <strong className="text-slate-900">921020007318711</strong></div>
                    <div><span className="text-slate-500 font-medium">Customer ID:</span> <strong className="text-slate-900">904693343</strong></div>
                    <div><span className="text-slate-500 font-medium">IFSC Code:</span> <strong className="text-slate-900">UTIB0000065</strong></div>
                    <div className="sm:col-span-2"><span className="text-slate-500 font-medium">Branch:</span> <strong className="text-slate-900">Basaveshwaranagar</strong></div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Domestic Tours */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-2xs">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-100 px-3 py-1 text-xs font-bold text-[#0c3c8a] border border-sky-200">
                      Domestic Tours
                    </div>
                    <ol className="space-y-3 text-xs leading-relaxed text-slate-800 font-medium list-decimal pl-4">
                      <li>
                        Any confirmation is subjected to an advance deposit of 50% per person, after which the booking is processed.
                      </li>
                      <li>
                        100% balance payment has to be made in advance and must be paid as per the time limit given at the time of confirmation i.e. before 30 days.
                      </li>
                    </ol>
                  </div>

                  {/* International Tours */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-5 shadow-2xs">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200">
                      International Tours
                    </div>
                    <ol className="space-y-3 text-xs leading-relaxed text-slate-800 font-medium list-decimal pl-4">
                      <li>
                        Any confirmation is subjected to an advance deposit of 50% per person, after which the booking is processed.
                      </li>
                      <li>
                        100% balance payment has to be made in advance and must be paid as per the time limit given at the time of confirmation i.e. before 45 days.
                      </li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 3: CANCELLATION POLICY (PAGE 2)
                  ───────────────────────────────────────────────────────────── */}
              <section id="cancellation" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 uppercase tracking-wide border border-amber-200">
                    PDF Page 2
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#0c3c8a]">
                    Cancellation Policy:-
                  </h2>
                </div>

                <div className="mb-5 space-y-2 rounded-2xl bg-rose-50/60 p-4 text-xs font-semibold text-slate-800 border border-rose-200">
                  <p>* Request for cancellation has to be sent to us through Email.</p>
                  <p className="text-rose-800 font-bold">* Once the advance amount is paid, it will not be refunded in any circumstances.</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Domestic Cancellation */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">
                      Domestic Tours
                    </div>
                    <div className="space-y-2.5 text-xs font-semibold">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-700">Before 15 - 21 Days</span>
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-amber-900 font-bold border border-amber-200">50% Refund</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-700">Before 14 Days</span>
                        <span className="rounded-md bg-rose-100 px-2 py-0.5 text-rose-900 font-bold border border-rose-200">No Refund</span>
                      </div>
                    </div>
                  </div>

                  {/* International Cancellation */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-200">
                      International Tours
                    </div>
                    <div className="space-y-2.5 text-xs font-semibold">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="text-slate-700">Before 31 - 45 Days</span>
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-amber-900 font-bold border border-amber-200">50% refund</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-slate-700">Before 30 Days</span>
                        <span className="rounded-md bg-rose-100 px-2 py-0.5 text-rose-900 font-bold border border-rose-200">No Refund</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 4: CHARGES FOR CHILDREN (PAGE 2)
                  ───────────────────────────────────────────────────────────── */}
              <section id="children" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 uppercase tracking-wide border border-amber-200">
                    PDF Page 2
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold text-[#0c3c8a]">
                    Charges for Children:- Domestic Tours & International Tours
                  </h2>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-800 font-medium">
                  <li className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <span>* Below 9 Years depends upon destination policy.</span>
                  </li>
                  <li className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <span>* Above 9 Years adult charges are applicable.</span>
                  </li>
                </ul>
              </section>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 5: AIRLINES POLICY (PAGE 2)
                  ───────────────────────────────────────────────────────────── */}
              <section id="airlines" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 uppercase tracking-wide border border-amber-200">
                    PDF Page 2
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold text-[#0c3c8a] flex items-center gap-2">
                    <Plane className="h-5 w-5 text-[#0c3c8a]" />
                    Airlines Policy:- Domestic Tours & International Tours
                  </h2>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-slate-800 font-medium">
                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <span>* Flight refundable amount will depend on the Airlines.</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <span>
                      * Helicopter services for Amarnath, Vaishnodevi and Kedarnath tickets booking will be done through local booking agents on the request of tourist, if due to any unforced conditions like bad weather/poor visibilities/technical problem etc, helicopter is cancelled, the actual refund made by the helicopter companies to the agents would be refunded back to the tourists immediately once we receive the money.
                    </span>
                  </div>
                </div>
              </section>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 6: HOTEL POLICY (PAGE 3)
                  ───────────────────────────────────────────────────────────── */}
              <section id="hotel" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 uppercase tracking-wide border border-amber-200">
                    PDF Page 3
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold text-[#0c3c8a] flex items-center gap-2">
                    <Hotel className="h-5 w-5 text-[#0c3c8a]" />
                    Hotel Policy:- Domestic Tours & International Tours
                  </h2>
                </div>
                <div className="space-y-3 text-xs leading-relaxed text-slate-800 font-medium">
                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <span>* Hotel/Resorts will be booked according to tourist choice 2*/3*/4*/5* twin sharing /triple sharing with meal plan.</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <span>* Room check in and check out time depends upon hotel rules and before departure we will update you.</span>
                  </div>
                </div>
              </section>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 7: IMPORTANT NOTES (PAGE 3)
                  ───────────────────────────────────────────────────────────── */}
              <section id="important-notes" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 uppercase tracking-wide border border-amber-200">
                    PDF Page 3
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold text-[#0c3c8a] flex items-center gap-2">
                    <Info className="h-5 w-5 text-[#0c3c8a]" />
                    Important Note:-
                  </h2>
                </div>
                <ol className="space-y-3 text-xs leading-relaxed text-slate-800 font-medium list-decimal pl-4">
                  <li className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    * GST Extra on total tour cost for the Domestic Tour Package & GST+TCS Extra on total tour cost for the International Tour Package.
                  </li>
                  <li className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    * For bookings, fill in our registration form and send it to us along with a copy of your Voter Id/Aadhar Card/Passport.
                  </li>
                  <li className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    * Tour timing and itinerary are subject to change. Consequently, it may be revised at any time during the tour with or without notice depending on the exigencies of occasion. We will inform you of these amendments, prior to the start of the tour or on tour. No grievances regarding any itinerary / service change which we are constrained to make will be entertained from the tour participants during or after the tour.
                  </li>
                  <li className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    * Tourists aged above 60 years are to be accompanied by a family member or friend for personal safety and convenience as our tour manager has the responsibility of all guests on tour.
                  </li>
                  <li className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    * We will provide the available documents to claim LTC/LFC if requested at the time of booking. But it does not undertake any responsibility for non reimbursement. The sanction of LTC/LFC will be the whole discretion of the concerned institution/organization.
                  </li>
                </ol>
              </section>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 8: GROUP TOURS TERMS AND CONDITIONS (PAGES 4–5)
                  ───────────────────────────────────────────────────────────── */}
              <section id="group-terms" className="scroll-mt-28 rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/20 via-white to-white p-6 md:p-8 shadow-xs">
                <div className="border-b border-amber-100 pb-4 mb-6">
                  <span className="rounded-md bg-amber-200/90 px-2.5 py-1 text-[11px] font-extrabold text-amber-950 uppercase tracking-wide border border-amber-300">
                    PDF Pages 4–5
                  </span>
                  <h2 className="mt-2 text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Users className="h-6 w-6 text-amber-800" />
                    GROUP TOURS TERMS AND CONDITIONS
                  </h2>
                </div>

                <div className="space-y-3.5 text-xs leading-relaxed text-slate-800 font-medium">
                  {[
                    "Journey by 2+2 Deluxe Bus for the rest of the tour. For most of the tour Company had upgraded the transportation to AC Bus. Some of the tour destinations like hill stations small & non AC vehicle will be provided. For North East & some hilly area only tempo traveller, mini bus, sumo type of mini vehicle are used.",
                    "If the number of passenger are less, tours will arranged in mini bus, tempo traveller or depending on the passengers strength.",
                    "Journey tickets for AC Class / Flights are arranged subject to availability if requested in writing well in advance. In such cases passengers have to pay the extra cost for such services.",
                    "The tourists will be allotted separate rooms for night halt on twin sharing basis. Company had upgraded maximum destinations to AC rooms except hilly area & some religious places.",
                    "If the family is consisting 3 members, a triple bedded room will be given subject to availability in that hotel. Otherwise they will be provided with an extra rollaway bed. If you require another separate room you have to pay 35% extra on the tour cost before start of the tour or the time of booking.",
                    "If you have booked single seat you have to share your room with co passenger on twin or triple sharing basis on your request made with us, unlike that, if you wish to stay single you have to pay 35% extra on the tour cost.",
                    "Room check in and check out time depends upon hotel rules.",
                    "In Chardham route, Baltal and Jomson allotted of rooms will be according to the number of beds in a room/ tents.",
                    "During the group tour, fixed menu basis pure vegetarian South Indian food will be provided by the organization. During train journey customer has to make their own arrangements.",
                    "The tour manager, who is expert in guidance, will accompany you throughout your journey. Along with local guide will be appointed in Historical & Pilgrim places subject to the requirement and availability.",
                    "You have to travel in the same berth / seat which is allotted to you by Indian Railways. Company is not holding any authority like lower berth, side berth etc.",
                    "Seat in the bus will be allotted based on seniority or rotation.",
                    "The person having Waiting list and RAC train tickets at the time of tour has to make his own arrangements. The travels does not bear any responsibility for such tickets.",
                    "Sometimes for your convenience train tickets boarding or reservations station will be changed. In such cases, company will book the tickets without giving any prior notice and the tourists has to bear the additional cost of the tickets.",
                    "All tourists must carry their original ID Cards ( Voter id, Aadhar card, Senior citizen card, Passport, DL ) throughout the journey. If you fail produce age proof, id card YANA Travels is not responsible for the later consequences.",
                    "Senior citizen booked a tour should b accompanied by their family member or a blood relatives is a must.",
                    "Package tours does not mean is covers all the costs/ expenses of the tour. Before booking ensure that what includes and excludes in the package cost. No discussion will be entertained after booking.",
                    "Below 9 Years depends upon destination policy and Above 9 Years adult charges are applicable.",
                    "If the tour is discontinued by political reasons such as war, riot, bundh, lockdown etc / Sudden outbreak of any epidemic and Pandamic / Natural calamities like Cyclone, earth quake, Land slide, Snow fall, Damage of road/bridge, flood, death, misconnection of train/flight , darshan d temples / shrines, any sightseeing sports the tourist have to bear the losses. Yana Travels is not going to compensate it.",
                    "Tour will be confirmed subject to minimum number of fully paid seats booked depending on capacity of the vehicle. In any case, we hold the right to cancel the tour and the same will be informed to you 10 days prior to the actual date of departure. Under such circumstances, you will be given the option of travelling in any other tour or the entire amount paid by you will be refunded. If you have booked onward / return journey tickets by air or AC train cancellation charges towards the same will be deducted from your refund amount.",
                    "Entry fees, mineral water, daily using medicines, taxi, boating, coolie, cable charges, doli, poni, camera charges, food during train journey should borne by the passengers.",
                    "For any complaints, suits, claims, disputes, of what so ever relating to any tour arrangements organized / conducted by Yana Travels and their Associates, the Legal Proceedings related to tours, the court, tribunals and forms are subjected to Bangalore Jurisdiction only."
                  ].map((point, index) => (
                    <div key={index} className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-2xs hover:border-amber-300 transition">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-100 text-[11px] font-bold text-amber-950 border border-amber-200">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 9: ADDITIONAL TERMS (PAGE 6)
                  ───────────────────────────────────────────────────────────── */}
              <section id="additional-terms" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 uppercase tracking-wide border border-amber-200">
                    PDF Page 6
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#0c3c8a]">
                    Additional Terms
                  </h2>
                </div>

                <div className="space-y-3.5 text-xs leading-relaxed text-slate-800 font-medium">
                  {[
                    "As per Central Government rules prevailing Goods and Service Tax applicable for all the tours on total cost.",
                    "Fill up the reservation forms and confirm your bookings by paying advance amount 50% per person by Cash/ NEFT/Cheque. The remaining amount should be paid before 30 days of tour commencement date and if you are failed to do so without any notice the travels has the right to cancel or re-allot your seat to another person & advance paid will not be refunded or adjusted to some other tours or persons.",
                    "Once the advance amount is paid, it will not be refunded in any circumstances. If you have paid the full and final amount, the refund will be as follows. If you have informed before 15 days, excluding the departure date 50% refund. Before 14 Days No refund.",
                    "Flight refundable amount will depend on the Airlines.",
                    "Helicopter services for Amarnath, Vaishnodevi and Kedarnath tickets booking will be done through local booking agents on the request of tourist, if due to any unforced conditions like bad weather/poor visibilities/technical problem etc, helicopter is cancelled, the actual refund made by the helicopter companies to the agents would be refunded back to the tourists immediately once we receive the money.",
                    "Tour timing and itinerary are subject to change. Consequently, it may be revised at any time during the tour with or without notice depending on the exigencies of occasion. We will inform you of these amendments, prior to the start of the tour or on tour. No grievances regarding any itinerary / service change which we are constrained to make will be entertained from the tour participants during or after the tour.",
                    "We will provide the available documents to claim LTC/LFC if requested at the time of booking. But it does not undertake any responsibility for non reimbursement. The sanction of LTC/LFC will be the whole discretion of the concerned institution/organization."
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sky-100 text-[11px] font-bold text-[#0c3c8a] border border-sky-200">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ─────────────────────────────────────────────────────────────
                  SECTION 10: DECLARATION BY THE CLIENT (PAGE 6)
                  ───────────────────────────────────────────────────────────── */}
              <section id="declaration" className="scroll-mt-28 rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/20 via-white to-white p-6 md:p-8 shadow-xs">
                <div className="border-b border-emerald-100 pb-4 mb-6">
                  <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-900 uppercase tracking-wide border border-emerald-200">
                    PDF Page 6
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold text-emerald-950 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-emerald-700" />
                    Declaration by the Client:
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-emerald-200/90 bg-white p-5 text-xs md:text-sm font-medium leading-relaxed text-slate-900 shadow-2xs italic">
                    "I /We have read and accepted the above-mentioned terms & conditions on behalf of the person(s) whose name appears in Booking Form and I am /we are aware that I / we shall be abide by the same. I /We have also read the brochure / tour itinerary and notes there-in along with the 'Tips for Smooth Travel' and I accept the same. I /We have been given the copies of all the above-mentioned documents."
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Name of the Client :</label>
                      <input type="text" placeholder="Client Full Name" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Place :</label>
                      <input type="text" placeholder="Place / City" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Date :</label>
                      <input type="text" placeholder="DD / MM / YYYY" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700">Signature :</label>
                      <input type="text" placeholder="Client Signature" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs" />
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
