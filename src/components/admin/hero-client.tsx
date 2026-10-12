
import { type AdminHeroRow } from "@/lib/types/admin";
import { useModuleItems } from "@/lib/hooks/use-module-items";
import { CrudManager, type FieldDef } from "@/components/admin/crud-manager";

const fields: FieldDef[] = [
  {
    name: "title",
    label: "Headline Quote / Title",
    type: "textarea",
    placeholder:
      "TRAVELING - IT LEAVES YOU SPEECHLESS, THEN TURNS YOU INTO A STORY TELLER",
  },
  {
    name: "subtitle",
    label: "Subtitle",
    type: "text",
    placeholder: "Tailor-made itineraries, group departures, and luxury travel",
  },
  {
    name: "video_url",
    label: "Hero Video URL (Desktop MP4 / Reel)",
    type: "video",
    placeholder: "/hero/homepage-hero-real-16x9.mp4",
  },
  {
    name: "mobile_video_url",
    label: "Hero Video URL (Mobile MP4 9x16)",
    type: "video",
    placeholder: "/hero/homepage-hero-real-9x16.mp4",
  },
  { name: "image_url", label: "Hero Background / Fallback Image", type: "image" },
  {
    name: "cta_primary_text",
    label: "Button Text",
    type: "text",
    defaultValue: "Explore Packages",
  },
  {
    name: "cta_primary_link",
    label: "Button Link",
    type: "text",
    defaultValue: "/packages",
  },
];

const DEFAULT_HERO_SLIDES: AdminHeroRow[] = [
  {
    id: "hero-slide-1",
    title: "TRAVELING — IT LEAVES YOU SPEECHLESS, THEN TURNS YOU INTO A STORY TELLER",
    subtitle: "Tailor-made itineraries, group departures & luxury travel across India and the world.",
    video_url: "/hero/homepage-hero-real-16x9.mp4",
    mobile_video_url: "/hero/homepage-hero-real-9x16.mp4",
    image_url: "/hero/homepage-hero-real-16x9-poster.jpg",
    cta_primary_text: "Explore Packages",
    cta_primary_link: "/packages",
    is_active: true,
    sort_order: 1,
  },
  {
    id: "hero-slide-2",
    title: "DISCOVER THE WORLD WITH YANA TRAVELS",
    subtitle: "From the Himalayas to Europe — let us craft the perfect journey for you.",
    video_url: "/hero-footage/raw/34-paris-eiffel-drone.mp4",
    mobile_video_url: "/hero/homepage-hero-real-9x16.mp4",
    image_url: "/themes/theme-international.jpg",
    cta_primary_text: "Group Tours",
    cta_primary_link: "/group-tours",
    is_active: true,
    sort_order: 2,
  },
  {
    id: "hero-slide-3",
    title: "YOUR DREAM DESTINATION IS CLOSER THAN YOU THINK",
    subtitle: "Expert guidance, seamless bookings, and unforgettable experiences since 2005.",
    video_url: "/hero-footage/raw/35-dubai-burj-drone.mp4",
    mobile_video_url: "/hero/homepage-hero-real-9x16.mp4",
    image_url: "/themes/theme-mountains.jpg",
    cta_primary_text: "Customized Tours",
    cta_primary_link: "/customized-tours",
    is_active: true,
    sort_order: 3,
  },
];

export function HeroClient() {
  const { items, loading, error, reload } =
    useModuleItems<AdminHeroRow>("hero_slides");

  if (loading)
    return <p className="text-sm text-slate-500">Loading hero banners…</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  const displayItems = items.length > 0 ? items : DEFAULT_HERO_SLIDES;

  return (
    <CrudManager<AdminHeroRow>
      title="Hero Banners & Slides"
      description="Manage rotating background images, headline quotes, and call to action buttons on the home page hero."
      module="hero_slides"
      items={displayItems}
      onReload={reload}
      fields={fields}
      columns={[
        {
          key: "title",
          label: "Headline / Slide & Media",
          render: (item) => (
            <div className="flex items-center gap-3">
              {item.video_url ? (
                <div className="relative h-12 w-20 rounded-lg bg-slate-900 border border-slate-300 overflow-hidden flex items-center justify-center group shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover opacity-60"
                    />
                  ) : null}
                  <span className="absolute inset-0 flex items-center justify-center bg-sky-900/40 text-white font-bold text-xs gap-1">
                    ▶ Video
                  </span>
                </div>
              ) : item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="h-12 w-20 rounded-lg object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="h-12 w-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                  ▶ Video
                </div>
              )}
              <div>
                <div className="font-bold text-slate-900 line-clamp-1">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500">
                  {item.subtitle || "Homepage video hero quote"}
                </div>
              </div>
            </div>
          ),
        },
        {
          key: "video_url",
          label: "Active Video Reel",
          render: (item) => (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              🎬 {item.video_url ? item.video_url.split("/").pop() : "homepage-hero-real-16x9.mp4"}
            </span>
          ),
        },
        {
          key: "cta_primary_text",
          label: "Button",
          render: (item) => item.cta_primary_text || "Explore",
        },
      ]}
    />
  );
}
