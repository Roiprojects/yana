import {
  LayoutDashboard,
  Images,
  Home,
  Info,
  Users2,
  Sparkles,
  Package,
  Tags,
  MapPin,
  ListOrdered,
  CalendarDays,
  Wrench,
  ImageIcon,
  FileText,
  Contact,
  Inbox,
  Quote,
  HelpCircle,
  Settings,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = { label: string; href: string; icon: LucideIcon };
export type AdminNavGroup = { heading: string; items: AdminNavItem[] };

/** The 22 admin modules from docs/ADMIN_ARCHITECTURE.md, grouped for the sidebar. */
export const adminNav: AdminNavGroup[] = [
  {
    heading: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    heading: "Site content",
    items: [
      { label: "Hero Banners", href: "/admin/hero", icon: Images },
      { label: "Home Page", href: "/admin/home", icon: Home },
      { label: "Curated Themes", href: "/admin/themes", icon: Sparkles },
      { label: "About Us", href: "/admin/about", icon: Info },
      { label: "Services", href: "/admin/services", icon: Wrench },
      { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
      { label: "Brochure & PDFs", href: "/admin/brochure", icon: FileText },
      { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
    ],
  },
  {
    heading: "Tours & packages",
    items: [
      { label: "Group Tours", href: "/admin/group-tours", icon: Users2 },
      {
        label: "Customized Tours",
        href: "/admin/customized-tours",
        icon: Sparkles,
      },
      { label: "Tour Packages", href: "/admin/packages", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: Tags },
      { label: "Destinations", href: "/admin/destinations", icon: MapPin },
      { label: "Itineraries", href: "/admin/itinerary", icon: ListOrdered },
      { label: "Departures", href: "/admin/departures", icon: CalendarDays },
    ],
  },
  {
    heading: "Leads & contact",
    items: [
      { label: "Enquiries", href: "/admin/enquiries", icon: Inbox },
      { label: "Contact Info", href: "/admin/contact", icon: Contact },
    ],
  },
  {
    heading: "System",
    items: [
      { label: "Website Settings", href: "/admin/settings", icon: Settings },
      {
        label: "Change Password",
        href: "/admin/account/password",
        icon: KeyRound,
      },
    ],
  },
];
