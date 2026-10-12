import jsPDF from "jspdf";
import type { PackageDetail } from "@/lib/types/tour";

/** Helper to load an image URL into HTMLImageElement & convert to base64 Data URL */
async function loadImageDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generatePackagePdf(pkg: PackageDetail): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm

  // Preload Brand Assets (Logo, Header Graphic, Footer Graphic, Package Hero Image)
  const logoDataUrl = await loadImageDataUrl("/brand/yana-logo-header.png");
  const headerBannerUrl = await loadImageDataUrl("/brand/yana-logo-header.png");
  const footerBannerUrl = await loadImageDataUrl("/brand/footer-travel-bg.jpg");
  const heroDataUrl = pkg.hero_image_url ? await loadImageDataUrl(pkg.hero_image_url) : null;

  // Preload Day Images
  const dayImageMap = new Map<number, string | null>();
  if (pkg.itinerary && pkg.itinerary.length > 0) {
    for (const day of pkg.itinerary) {
      if (day.image_url) {
        const dataUrl = await loadImageDataUrl(day.image_url);
        dayImageMap.set(day.day_number, dataUrl);
      }
    }
  }

  // Brand Color Tokens
  const primaryBlue = [12, 60, 138]; // #0c3c8a
  const textDark = [30, 41, 59]; // #1e293b
  const textMuted = [100, 116, 139]; // #64748b
  const accentGold = [217, 119, 6]; // #d97706

  let y = 38; // Vertical cursor after header

  // ── Helper: Draw Header & Footer Template Frame on Every Page ──────────────
  const drawTemplateFrame = () => {
    // 1. Top Header Banner Graphic & Official Logo
    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, "PNG", 10, 5, 55, 24);
      } catch {
        doc.setFillColor(12, 60, 138);
        doc.roundedRect(10, 5, 45, 20, 3, 3, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("YANA", 32.5, 17, { align: "center" });
      }
    }

    // Header Right Airplane & Global Destinations Banner
    try {
      if (headerBannerUrl) {
        doc.addImage(headerBannerUrl, "PNG", pageWidth - 100, 2, 98, 30);
      }
    } catch {
      // Fallback
    }

    // Header Separator Line
    doc.setDrawColor(210, 220, 235);
    doc.setLineWidth(0.5);
    doc.line(10, 32, pageWidth - 10, 32);

    // 2. Footer Graphic & Contact Details Banner across Bottom
    if (footerBannerUrl) {
      try {
        doc.addImage(footerBannerUrl, "PNG", 0, pageHeight - 32, pageWidth, 32);
      } catch {
        doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.rect(0, pageHeight - 22, pageWidth, 22, "F");
      }
    } else {
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.rect(0, pageHeight - 22, pageWidth, 22, "F");
    }

    // Footer Text overlay
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");

    // Office 1: Udupi Corporate Office
    doc.text("📍 Udupi, Corporate Office", 12, pageHeight - 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("📞 +91 951388143  |  ✉ info@yanaindia.com", 12, pageHeight - 10);
    doc.text("🌐 www.yanaindia.com", 12, pageHeight - 5.5);

    // Office 2: Bengaluru
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("📍 Bengaluru", 88, pageHeight - 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("#20, 3rd Floor, S L Plaza, 8th Cross", 88, pageHeight - 10);
    doc.text("Sampige Road, Malleshwaram-560003", 88, pageHeight - 5.5);

    // Office 3: Hubli
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("📍 Hubli", 155, pageHeight - 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("#45, 3rd Floor, Satellite Complex,", 155, pageHeight - 10);
    doc.text("Koppikar Road, Hubli - 580020", 155, pageHeight - 5.5);
  };

  // Page Boundary Checker
  const checkAddPage = (neededSpace: number = 15) => {
    if (y + neededSpace > pageHeight - 26) {
      doc.addPage();
      drawTemplateFrame();
      y = 38;
    }
  };

  // Draw initial page frame
  drawTemplateFrame();

  // ── Package Hero Header Banner ─────────────────────────────────────────────
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, y, pageWidth - 24, 30, 3, 3, "F");

  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);

  const titleLines = doc.splitTextToSize(pkg.title, 125);
  doc.text(titleLines, 16, y + 10);

  // Group / Scope Badges
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.roundedRect(16, y + 20, 24, 6, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text((pkg.tour_type || "GROUP").toUpperCase(), 28, y + 24, { align: "center" });

  doc.setFillColor(100, 116, 139);
  doc.roundedRect(42, y + 20, 26, 6, 1.5, 1.5, "F");
  doc.text((pkg.scope || "DOMESTIC").toUpperCase(), 55, y + 24, { align: "center" });

  // Price & Duration Info
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  const priceDisplay = pkg.price_amount
    ? `₹ ${Number(pkg.price_amount).toLocaleString("en-IN")}`
    : "On Request";
  doc.text(priceDisplay, pageWidth - 16, y + 12, { align: "right" });

  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const durationDisplay = pkg.duration_days
    ? `${pkg.duration_days} Days / ${pkg.duration_nights || pkg.duration_days - 1} Nights`
    : "";
  doc.text(durationDisplay, pageWidth - 16, y + 20, { align: "right" });

  y += 36;

  // ── Hero Banner Image (If present) ─────────────────────────────────────────
  if (heroDataUrl) {
    checkAddPage(50);
    try {
      doc.addImage(heroDataUrl, "JPEG", 12, y, pageWidth - 24, 45);
      y += 50;
    } catch {
      // Ignore image render error
    }
  }

  // ── Overview Section ───────────────────────────────────────────────────────
  if (pkg.overview) {
    checkAddPage(25);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOUR OVERVIEW", 12, y);
    y += 5.5;

    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const overviewLines = doc.splitTextToSize(pkg.overview, pageWidth - 24);
    doc.text(overviewLines, 12, y);
    y += overviewLines.length * 4.5 + 6;
  }

  // ── Highlights Section ─────────────────────────────────────────────────────
  if (pkg.highlights && pkg.highlights.length > 0) {
    checkAddPage(20);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("HIGHLIGHTS", 12, y);
    y += 6;

    pkg.highlights.forEach((h) => {
      checkAddPage(7);
      doc.setTextColor(accentGold[0], accentGold[1], accentGold[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("✔", 14, y);

      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      const hLines = doc.splitTextToSize(h, pageWidth - 32);
      doc.text(hLines, 20, y);
      y += hLines.length * 4 + 2;
    });
    y += 4;
  }

  // ── Day-Wise Itinerary Section ─────────────────────────────────────────────
  if (pkg.itinerary && pkg.itinerary.length > 0) {
    checkAddPage(20);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DAY-WISE ITINERARY", 12, y);
    y += 7;

    pkg.itinerary.forEach((day) => {
      const dayImgDataUrl = dayImageMap.get(day.day_number);
      const neededSpace = dayImgDataUrl ? 65 : 30;
      checkAddPage(neededSpace);

      // Day Badge Box
      doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      doc.roundedRect(12, y, 16, 7, 1.5, 1.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`DAY ${day.day_number}`, 20, y + 4.8, { align: "center" });

      // Title
      if (day.title) {
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const dayTitleLines = doc.splitTextToSize(day.title, pageWidth - 55);
        doc.text(dayTitleLines, 32, y + 5);
        y += Math.max(8, dayTitleLines.length * 4.5 + 2);
      } else {
        y += 9;
      }

      // Day Image (Render image in PDF if present)
      if (dayImgDataUrl) {
        try {
          doc.addImage(dayImgDataUrl, "JPEG", 14, y, pageWidth - 28, 38);
          y += 41;
        } catch {
          // Ignore error
        }
      }

      // Day Activities Description
      if (day.description) {
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(day.description, pageWidth - 28);
        doc.text(descLines, 14, y);
        y += descLines.length * 4 + 3;
      }

      // Meals & Stay Pill Badges
      if (day.meals || day.stay) {
        let badgeX = 14;
        if (day.meals) {
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(badgeX, y, 48, 5.5, 1, 1, "F");
          doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.text(`🍽 Meals: ${day.meals}`, badgeX + 3, y + 4);
          badgeX += 52;
        }

        if (day.stay) {
          doc.setFillColor(241, 245, 249);
          doc.roundedRect(badgeX, y, 48, 5.5, 1, 1, "F");
          doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.text(`🏨 Stay: ${day.stay}`, badgeX + 3, y + 4);
        }
        y += 8;
      }

      // Divider line between days
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.4);
      doc.line(14, y, pageWidth - 14, y);
      y += 5;
    });
  }

  // ── Inclusions & Exclusions Section ────────────────────────────────────────
  if ((pkg.inclusions && pkg.inclusions.length > 0) || (pkg.exclusions && pkg.exclusions.length > 0)) {
    checkAddPage(30);
    y += 2;

    const colWidth = (pageWidth - 30) / 2;

    // Headers
    doc.setTextColor(16, 185, 129); // Green
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("INCLUSIONS", 12, y);

    doc.setTextColor(239, 68, 68); // Red
    doc.text("EXCLUSIONS", 12 + colWidth + 6, y);

    y += 6;

    const maxItems = Math.max(pkg.inclusions?.length || 0, pkg.exclusions?.length || 0);

    for (let i = 0; i < maxItems; i++) {
      checkAddPage(6);
      const inc = pkg.inclusions?.[i];
      const exc = pkg.exclusions?.[i];

      if (inc) {
        doc.setTextColor(16, 185, 129);
        doc.setFontSize(8);
        doc.text("✓", 12, y);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.setFont("helvetica", "normal");
        const incLines = doc.splitTextToSize(inc, colWidth - 6);
        doc.text(incLines, 17, y);
      }

      if (exc) {
        doc.setTextColor(239, 68, 68);
        doc.setFontSize(8);
        doc.text("✕", 12 + colWidth + 6, y);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.setFont("helvetica", "normal");
        const excLines = doc.splitTextToSize(exc, colWidth - 6);
        doc.text(excLines, 12 + colWidth + 11, y);
      }

      y += 5;
    }
  }

  // Trigger PDF file download in browser
  const fileName = `${pkg.title.replace(/[^a-zA-Z0-9]/g, "_")}_YanaTravels.pdf`;
  doc.save(fileName);
}

