import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

const fallbackDestinations = [
  "Kashmir",
  "Leh–Ladakh",
  "Kerala",
  "Goa",
  "Rajasthan",
  "Andaman",
  "Meghalaya",
  "Sikkim",
  "Dubai",
  "Singapore",
  "Bali",
  "Maldives",
  "Thailand",
  "Vietnam",
  "Nepal",
  "Bhutan",
  "Europe",
  "Mauritius",
];

export function DestinationMarquee() {
  const [destinations, setDestinations] = useState<string[]>(fallbackDestinations);

  useEffect(() => {
    let cancelled = false;
    api
      .listPublicDestinations()
      .then((items) => {
        if (!cancelled && Array.isArray(items) && items.length > 0) {
          const names = items
            .map((d) => d.name?.trim())
            .filter((name): name is string => Boolean(name));
          if (names.length > 0) {
            setDestinations(names);
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const row = [...destinations, ...destinations];
  return (
    <div className="border-y border-border-soft bg-bg-soft py-6">
      <div
        className="group flex overflow-hidden"
        style={{ maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}
      >
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {row.map((d, i) => (
            <span
              key={i}
              className="whitespace-nowrap font-heading text-xl font-bold text-deep/70"
            >
              {d}
              <span className="ml-10 text-primary/50">✦</span>
            </span>
          ))}
        </div>
        <div
          aria-hidden
          className="flex shrink-0 animate-marquee items-center gap-10 pr-10"
        >
          {row.map((d, i) => (
            <span
              key={i}
              className="whitespace-nowrap font-heading text-xl font-bold text-deep/70"
            >
              {d}
              <span className="ml-10 text-primary/50">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
