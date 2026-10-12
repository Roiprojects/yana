import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/globals.css";

import { PublicLayout } from "@/components/layout/public-layout";
import { AdminLayout } from "@/components/layout/admin-layout";
import { RequireAdmin } from "@/components/layout/require-admin";

import { HomePage } from "@/pages/home";
import { PackagesPage } from "@/pages/packages";
import { PackageDetailPage } from "@/pages/package-detail";
import { ServicesPage } from "@/pages/services";
import { AboutPage } from "@/pages/about";
import { ContactPage } from "@/pages/contact";
import { BrochurePage } from "@/pages/brochure";
import { TermsPage } from "@/pages/terms";
import { PrivacyPolicyPage } from "@/pages/privacy-policy";
import { GroupToursPage } from "@/pages/group-tours";
import { DomesticGroupToursPage } from "@/pages/group-tours/domestic";
import { InternationalGroupToursPage } from "@/pages/group-tours/international";
import { KitchenStaffToursPage } from "@/pages/group-tours/kitchen-staff";
import { CustomizedToursPage } from "@/pages/customized-tours";
import { DomesticCustomizedToursPage } from "@/pages/customized-tours/domestic";
import { InternationalCustomizedToursPage } from "@/pages/customized-tours/international";
import { NotFoundPage } from "@/pages/not-found";

import { AdminLoginPage } from "@/pages/admin/login";
import { AdminDashboardPage } from "@/pages/admin/dashboard";
import { AdminPackagesPage } from "@/pages/admin/packages";
import { NewPackagePage } from "@/pages/admin/package-new";
import { EditPackagePage } from "@/pages/admin/package-edit";
import { AdminEnquiriesPage } from "@/pages/admin/enquiries";
import { AdminCategoriesPage } from "@/pages/admin/categories";
import { AdminHomePage } from "@/pages/admin/home";
import { AdminDestinationsPage } from "@/pages/admin/destinations";
import { AdminThemesPage } from "@/pages/admin/themes";
import { AdminHeroPage } from "@/pages/admin/hero";
import { AdminGalleryPage } from "@/pages/admin/gallery";
import { AdminTestimonialsPage } from "@/pages/admin/testimonials";
import { AdminContactPage } from "@/pages/admin/contact";
import { AdminServicesPage } from "@/pages/admin/services";
import { AdminAboutPage } from "@/pages/admin/about";
import { AdminAdminsPage } from "@/pages/admin/admins";
import { AdminBrochurePage } from "@/pages/admin/brochure";
import { AdminCustomizedToursPage } from "@/pages/admin/customized-tours";
import { AdminDeparturesPage } from "@/pages/admin/departures";
import { AdminGroupToursPage } from "@/pages/admin/group-tours";
import { AdminItineraryPage } from "@/pages/admin/itinerary";
import { AdminSeoPage } from "@/pages/admin/seo";
import { AdminSettingsPage } from "@/pages/admin/settings";
import { AdminPasswordPage } from "@/pages/admin/password";
import { AdminFaqsPage } from "@/pages/admin/faqs";
import { ScrollToTop } from "@/components/scroll-to-top";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf6ef] p-6 text-center text-deep">
          <div className="max-w-md rounded-3xl border border-[#eadfcf] bg-white p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-deep">Yana Travels</h1>
            <p className="mt-3 text-sm text-text-secondary">
              Something unexpected happened while loading this page.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="mt-6 inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/packages/:slug" element={<PackageDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/brochure" element={<BrochurePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/group-tours" element={<GroupToursPage />} />
          <Route
            path="/group-tours/domestic"
            element={<DomesticGroupToursPage />}
          />
          <Route
            path="/group-tours/international"
            element={<InternationalGroupToursPage />}
          />
          <Route
            path="/group-tours/kitchen-staff"
            element={<KitchenStaffToursPage />}
          />
          <Route path="/customized-tours" element={<CustomizedToursPage />} />
          <Route
            path="/customized-tours/domestic"
            element={<DomesticCustomizedToursPage />}
          />
          <Route
            path="/customized-tours/international"
            element={<InternationalCustomizedToursPage />}
          />
        </Route>

        {/* Admin auth */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin panel (protected) */}
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="packages" element={<AdminPackagesPage />} />
          <Route path="packages/new" element={<NewPackagePage />} />
          <Route path="packages/:id/edit" element={<EditPackagePage />} />
          <Route path="enquiries" element={<AdminEnquiriesPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="home" element={<AdminHomePage />} />
          <Route path="destinations" element={<AdminDestinationsPage />} />
          <Route path="themes" element={<AdminThemesPage />} />
          <Route path="hero" element={<AdminHeroPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="testimonials" element={<AdminTestimonialsPage />} />
          <Route path="contact" element={<AdminContactPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="about" element={<AdminAboutPage />} />
          <Route path="admins" element={<AdminAdminsPage />} />
          <Route path="brochure" element={<AdminBrochurePage />} />
          <Route
            path="customized-tours"
            element={<AdminCustomizedToursPage />}
          />
          <Route path="departures" element={<AdminDeparturesPage />} />
          <Route path="group-tours" element={<AdminGroupToursPage />} />
          <Route path="itinerary" element={<AdminItineraryPage />} />
          <Route path="seo" element={<AdminSeoPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="account/password" element={<AdminPasswordPage />} />
          <Route path="faqs" element={<AdminFaqsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
