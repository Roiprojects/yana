import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Download, Eye, FileText, CheckCircle2, ShieldCheck, Phone, Mail, Building2, CreditCard, Calendar, User, ChevronRight, Menu } from "lucide-react";

export function TermsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const navItems = [
    { id: "app-form", label: "Application Form" },
    { id: "payment", label: "Payment Procedure" },
    { id: "cancellation", label: "Cancellation Policy" },
    { id: "children", label: "Charges for Children" },
    { id: "airlines", label: "Airlines Policy" },
    { id: "hotel", label: "Hotel Policy" },
    { id: "important-notes", label: "Important Notes" },
    { id: "group-terms", label: "Group Tours Terms" },
    { id: "additional-terms", label: "Additional Terms" },
    { id: "declaration", label: "Client Declaration" },
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

  return (
    <>
      {/* 2. Hero section - Bright travel background */}
      <PageHeader
        title="Terms & Conditions"
        subtitle="Booking, payment, cancellation and tour-operation terms."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Terms & Conditions" },
        ]}
        image="photo-1469474968028-56623f02e42e"
      />

      <Section className="bg-slate-50/60 py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">

          {/* Top Actions Banner with PDF Download & View */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50/90 via-white to-amber-50/40 p-6 md:p-8 shadow-sm">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-3 py-1 text-xs font-bold text-amber-900 border border-amber-200/60">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                <span>OFFICIAL YANA TRAVELS POLICY DOCUMENT</span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
                Application Form & Booking Terms (6 Pages)
              </h2>
              <p className="text-xs md:text-sm text-slate-600 max-w-2xl">
                Sourced directly from the official Yana Travels Application Form For Domestic, International & Group Tour document.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href="/yana-terms-conditions.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-xs"
              >
                <Eye className="h-4 w-4 text-primary" /> View Official PDF
              </a>
              <a
                href="/yana-terms-conditions.pdf"
                download="Yana_Travels_Application_Form_Terms.pdf"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs font-bold text-white hover:bg-primary-hover transition shadow-md hover:shadow-lg"
              >
                <Download className="h-4 w-4" /> Download PDF Brochure
              </a>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
            {/* Desktop Sticky Quick Navigation */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 pt-1">
                  Table of Contents
                </p>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl transition flex items-center justify-between ${
                        activeTab === item.id
                          ? "bg-sky-50 text-primary font-bold border-l-4 border-primary"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Mobile Collapsible Quick Jump Bar */}
            <div className="block lg:hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase px-2 mb-2">Quick Navigation</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-primary hover:text-white transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-10">

              {/* 3. Section 1: Application Form – Page 1 */}
              <section id="app-form" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    PDF Page 1
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#0c3c8a]">
                    Application Form – Domestic & International
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Personal Details */}
                  <div className="rounded-2xl border border-slate-100 bg-sky-50/30 p-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" /> Personal Details
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Date of Booking:</label>
                        <input type="text" placeholder="DD/MM/YYYY" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Name:</label>
                        <input type="text" placeholder="Full Name" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Mobile:</label>
                        <input type="text" placeholder="+91 _____" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Email id:</label>
                        <input type="text" placeholder="info@example.com" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Adult Count:</label>
                        <input type="text" placeholder="0" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Child Count:</label>
                        <input type="text" placeholder="0" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <label className="block text-xs font-semibold text-slate-500">Address:</label>
                        <input type="text" placeholder="Complete Residential Address" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Tour Details */}
                  <div className="rounded-2xl border border-slate-100 bg-sky-50/30 p-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Tour Details
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Tour Name:</label>
                        <input type="text" placeholder="e.g. Chardham Yatra" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Tour Date:</label>
                        <input type="text" placeholder="DD/MM/YYYY" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Boarding From:</label>
                        <input type="text" placeholder="e.g. Bengaluru / Hubli" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Meal Plan:</label>
                        <input type="text" placeholder="APAI / MAPAI / CP" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Details */}
                  <div className="rounded-2xl border border-slate-100 bg-sky-50/30 p-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> Emergency Contact Details
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Emergency Name:</label>
                        <input type="text" placeholder="Name" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Mobile:</label>
                        <input type="text" placeholder="+91 _____" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Address:</label>
                        <input type="text" placeholder="Address" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="rounded-2xl border border-slate-100 bg-amber-50/40 p-5">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-amber-700" /> Payment Details
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Total Tour Cost:</label>
                        <input type="text" placeholder="₹" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">GST:</label>
                        <input type="text" placeholder="₹" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Deposit Paid:</label>
                        <input type="text" placeholder="₹" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500">Balance Payment:</label>
                        <input type="text" placeholder="₹" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-2xs" />
                      </div>
                    </div>

                    <div className="rounded-xl bg-amber-100/70 p-3.5 text-xs font-bold text-amber-900 border border-amber-200/80 mb-4">
                      (Note: Complete tour cost to be paid 30 days prior to departure of your Domestic Tours and 45 days of your International Tours)
                    </div>

                    <div className="space-y-2 text-xs text-slate-700">
                      <p className="font-semibold text-slate-800">Additional Services / Information:</p>
                      <p className="italic text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                        On behalf of the above person(s), I have read and understood the booking conditions mentioned (For Terms & Conditions see Overleaf)
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-amber-200/60 pt-4 text-xs font-semibold text-slate-600">
                      <div>Date: _______________</div>
                      <div>Signature: ___________________________</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. Section 2: Payment Procedure – Page 2 */}
              <section id="payment" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    PDF Page 2
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#0c3c8a]">
                    Payment Procedure
                  </h2>
                </div>

                {/* Axis Bank Details Card */}
                <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-sky-50/40 p-5 md:p-6 shadow-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold text-slate-900">AXIS BANK LTD</h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs font-semibold text-slate-700">
                    <div><span className="text-slate-400">Name:</span> YANA TRAVELS</div>
                    <div><span className="text-slate-400">Account Number:</span> 921020007318711</div>
                    <div><span className="text-slate-400">Customer ID:</span> 904693343</div>
                    <div><span className="text-slate-400">IFSC Code:</span> UTIB0000065</div>
                    <div className="sm:col-span-2"><span className="text-slate-400">Branch:</span> Basaveshwaranagar</div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Domestic Tours */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-900">
                      Domestic Tours
                    </div>
                    <ul className="space-y-3 text-xs leading-relaxed text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">1)</span>
                        <span>Any confirmation is subjected to an advance deposit of 50% per person, after which the booking is processed.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-primary">2)</span>
                        <span>100% balance payment has to be made in advance and must be paid as per the time limit given at the time of confirmation i.e. before 30 days.</span>
                      </li>
                    </ul>
                  </div>

                  {/* International Tours */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                      International Tours
                    </div>
                    <ul className="space-y-3 text-xs leading-relaxed text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-amber-700">1)</span>
                        <span>Any confirmation is subjected to an advance deposit of 50% per person, after which the booking is processed.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-amber-700">2)</span>
                        <span>100% balance payment has to be made in advance and must be paid as per the time limit given at the time of confirmation i.e. before 45 days.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 5. Section 3: Cancellation Policy – Page 2 */}
              <section id="cancellation" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    PDF Page 2
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#0c3c8a]">
                    Cancellation Policy
                  </h2>
                </div>

                <div className="mb-5 space-y-2 rounded-xl bg-slate-50 p-4 text-xs font-medium text-slate-700 border border-slate-200">
                  <p>* Request for cancellation has to be sent to us through Email.</p>
                  <p className="font-bold text-rose-700">* Once the advance amount is paid, it will not be refunded in any circumstances.</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* Domestic Cancellation */}
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5">
                    <h3 className="mb-3 font-bold text-rose-900 text-sm">Domestic Tours</h3>
                    <div className="space-y-2 text-xs font-semibold">
                      <div className="flex justify-between border-b border-rose-100 pb-2">
                        <span className="text-slate-600">Before 15 - 21 Days</span>
                        <span className="text-amber-700 font-bold">50% Refund</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-600">Before 14 Days</span>
                        <span className="text-rose-700 font-bold">No Refund</span>
                      </div>
                    </div>
                  </div>

                  {/* International Cancellation */}
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5">
                    <h3 className="mb-3 font-bold text-rose-900 text-sm">International Tours</h3>
                    <div className="space-y-2 text-xs font-semibold">
                      <div className="flex justify-between border-b border-rose-100 pb-2">
                        <span className="text-slate-600">Before 31 - 45 Days</span>
                        <span className="text-amber-700 font-bold">50% Refund</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-600">Before 30 Days</span>
                        <span className="text-rose-700 font-bold">No Refund</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 6. Section 4: Charges for Children – Page 2 */}
              <section id="children" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    PDF Page 2
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold text-[#0c3c8a]">
                    Charges for Children:- Domestic Tours & International Tours
                  </h2>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>* Below 9 Years depends upon destination policy.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>* Above 9 Years adult charges are applicable.</span>
                  </li>
                </ul>
              </section>

              {/* 7. Section 5: Airlines Policy – Page 2 */}
              <section id="airlines" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    PDF Page 2
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold text-[#0c3c8a]">
                    Airlines Policy:- Domestic Tours & International Tours
                  </h2>
                </div>
                <ul className="space-y-3 text-xs leading-relaxed text-slate-700 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>* Flight refundable amount will depend on the Airlines.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>* Helicopter services for Amarnath, Vaishnodevi and Kedarnath tickets booking will be done through local booking agents on the request of tourist, if due to any unforced conditions like bad weather/poor visibilities/technical problem etc, helicopter is cancelled, the actual refund made by the helicopter companies to the agents would be refunded back to the tourists immediately once we receive the money.</span>
                  </li>
                </ul>
              </section>

              {/* 8. Section 6: Hotel Policy – Page 3 */}
              <section id="hotel" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    PDF Page 3
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold text-[#0c3c8a]">
                    Hotel Policy:- Domestic Tours & International Tours
                  </h2>
                </div>
                <ul className="space-y-3 text-xs leading-relaxed text-slate-700 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>* Hotel/Resorts will be booked according to tourist choice 2*/3*/4*/5* twin sharing /triple sharing with meal plan.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <span>* Room check in and check out time depends upon hotel rules and before departure we will update you.</span>
                  </li>
                </ul>
              </section>

              {/* 9. Section 7: Important Notes – Page 3 */}
              <section id="important-notes" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    PDF Page 3
                  </span>
                  <h2 className="mt-2 text-xl font-extrabold text-[#0c3c8a]">
                    Important Note:-
                  </h2>
                </div>
                <ol className="space-y-3 text-xs leading-relaxed text-slate-700 font-medium list-decimal pl-4">
                  <li>GST Extra on total tour cost for the Domestic Tour Package & GST+TCS Extra on total tour cost for the International Tour Package.</li>
                  <li>For bookings, fill in our registration form and send it to us along with a copy of your Voter Id/Aadhar Card/Passport.</li>
                  <li>Tour timing and itinerary are subject to change. Consequently, it may be revised at any time during the tour with or without notice depending on the exigencies of occasion. We will inform you of these amendments, prior to the start of the tour or on tour. No grievances regarding any itinerary / service change which we are constrained to make will be entertained from the tour participants during or after the tour.</li>
                  <li>Tourists aged above 60 years are to be accompanied by a family member or friend for personal safety and convenience as our tour manager has the responsibility of all guests on tour.</li>
                  <li>We will provide the available documents to claim LTC/LFC if requested at the time of booking. But it does not undertake any responsibility for non reimbursement. The sanction of LTC/LFC will be the whole discretion of the concerned institution/organization.</li>
                </ol>
              </section>

              {/* 10. Section 8: Group Tours Terms and Conditions – Pages 4–5 */}
              <section id="group-terms" className="scroll-mt-28 rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/20 via-white to-white p-6 md:p-8 shadow-sm">
                <div className="border-b border-amber-100 pb-4 mb-6">
                  <span className="rounded-md bg-amber-200/80 px-2.5 py-1 text-[11px] font-extrabold text-amber-900 uppercase tracking-wide">
                    PDF Pages 4–5
                  </span>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">
                    GROUP TOURS TERMS AND CONDITIONS
                  </h2>
                </div>

                <div className="space-y-4 text-xs leading-relaxed text-slate-800 font-medium">
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
                    <div key={index} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-100 text-[11px] font-bold text-amber-900">
                        ■
                      </span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 11. Section 9: Additional Terms – Page 6 */}
              <section id="additional-terms" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <div className="border-b border-slate-100 pb-4 mb-6">
                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    PDF Page 6
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold text-[#0c3c8a]">
                    Additional Terms
                  </h2>
                </div>

                <div className="space-y-3.5 text-xs leading-relaxed text-slate-700 font-medium">
                  {[
                    "As per Central Government rules prevailing Goods and Service Tax applicable for all the tours on total cost.",
                    "Fill up the reservation forms and confirm your bookings by paying advance amount 50% per person by Cash/ NEFT/Cheque. The remaining amount should be paid before 30 days of tour commencement date and if you are failed to do so without any notice the travels has the right to cancel or re-allot your seat to another person & advance paid will not be refunded or adjusted to some other tours or persons.",
                    "Once the advance amount is paid, it will not be refunded in any circumstances. If you have paid the full and final amount, the refund will be as follows. If you have informed before 15 days, excluding the departure date 50% refund. Before 14 Days No refund.",
                    "Flight refundable amount will depend on the Airlines.",
                    "Helicopter services for Amarnath, Vaishnodevi and Kedarnath tickets booking will be done through local booking agents on the request of tourist, if due to any unforced conditions like bad weather/poor visibilities/technical problem etc, helicopter is cancelled, the actual refund made by the helicopter companies to the agents would be refunded back to the tourists immediately once we receive the money.",
                    "Tour timing and itinerary are subject to change. Consequently, it may be revised at any time during the tour with or without notice depending on the exigencies of occasion. We will inform you of these amendments, prior to the start of the tour or on tour. No grievances regarding any itinerary / service change which we are constrained to make will be entertained from the tour participants during or after the tour.",
                    "We will provide the available documents to claim LTC/LFC if requested at the time of booking. But it does not undertake any responsibility for non reimbursement. The sanction of LTC/LFC will be the whole discretion of the concerned institution/organization."
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sky-100 text-[11px] font-bold text-primary">
                        ■
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 12. Section 10: Client Declaration – Page 6 */}
              <section id="declaration" className="scroll-mt-28 rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/30 via-white to-white p-6 md:p-8 shadow-sm">
                <div className="border-b border-emerald-100 pb-4 mb-6">
                  <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                    PDF Page 6
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold text-emerald-950">
                    Declaration by the Client
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-emerald-200/80 bg-white p-5 text-xs md:text-sm font-medium leading-relaxed text-slate-800 shadow-2xs italic">
                    "I /We have read and accepted the above-mentioned terms & conditions on behalf of the person(s) whose name appears in Booking Form and I am /we are aware that I / we shall be abide by the same. I /We have also read the brochure / tour itinerary and notes there-in along with the 'Tips for Smooth Travel' and I accept the same. I /We have been given the copies of all the above-mentioned documents."
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500">Name of the Client:</label>
                      <input type="text" placeholder="Client Name" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500">Place:</label>
                      <input type="text" placeholder="Place" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500">Date:</label>
                      <input type="text" placeholder="DD/MM/YYYY" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500">Signature:</label>
                      <input type="text" placeholder="Client Signature" readOnly className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700" />
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
