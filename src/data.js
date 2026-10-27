// Live site content. Edit this file to add works, shows, projects, or studio updates, then push to publish.
export const WORKS = [
  { cat: "HS·001", title: "See No Evil", medium: "Acrylic on canvas", yr: "2026", ex: "BEYOND THE SPACE IN TWO", dims: "12 × 12 in", image: "/works/see-no-evil.jpg" },
  { cat: "HS·002", title: "Hear No Evil", medium: "Acrylic on canvas", yr: "2026", ex: "BEYOND THE SPACE IN TWO", dims: "12 × 12 in", image: "/works/profile-bird.jpg" },
  { cat: "HS·003", title: "Speak No Evil", medium: "Acrylic on canvas", yr: "2026", ex: "BEYOND THE SPACE IN TWO", dims: "12 × 12 in", image: "/works/speak-no-evil.jpg" },
  { cat: "HS·008", title: "Homage", medium: "Woodblock print, ink on cotton", yr: "2026", ex: "BEYOND THE SPACE IN TWO", dims: "32 × 48 in", image: "/works/relief.jpg" },
  { cat: "HS·005", title: "Continuum", medium: "Oil on canvas", yr: "2025", ex: "BEYOND THE SPACE IN TWO", dims: "48 × 36 in", image: "/works/figure-yellow.jpg" },
  { cat: "HS·006", title: "What Remains", medium: "Oil on canvas", yr: "2025", ex: "BEYOND THE SPACE IN TWO", dims: "24 × 36 in", image: "/works/beyond.jpg" },
  { cat: "HS·007", title: "Offering", medium: "Oil on canvas", yr: "2025", ex: "BEYOND THE SPACE IN TWO", dims: "24 × 36 in", image: "/works/peacock.jpg" },
  { cat: "HS·004", title: "Unheard", medium: "Acrylic on canvas", yr: "2024", ex: "BEYOND THE SPACE IN TWO", dims: "12 × 12 in", image: "/works/hear-no-evil.jpg" },
];

export const SHOWS = {
  "BEYOND THE SPACE IN TWO": "AISLING GALLERY · 2026",
};

export const PROJECTS = {
  sidonia: {
    id: "sidonia",
    sec: "SEC · 01.1 / SIDONIA AI",
    title: "Sidonia AI",
    lede: "Interface and identity work for an agent platform - mostly making complex state legible.",
    role: "HEAD OF DESIGN AND GROWTH",
    dates: "SUMMER 2026",
    surface: "WEB APP · IDENTITY",
    status: "ONGOING",
    locked: true,
    slotA: "PRODUCT SHOT",
    slotB: "STATE DIAGRAM",
    notes: [
      "The hard part is that an agent is always mid-thought. Most of the work was finding a resting state for something that never actually rests.",
      "Identity followed the interface rather than the reverse - the type and spacing rules came out of the densest screen, then went outward.",
    ],
  },
  ring: {
    id: "ring",
    sec: "SEC · 01.2 / RING",
    title: "Ring, concept",
    lede: "A voice-first ring with no screen: industrial study, gesture set, and a small system of haptic replies.",
    role: "SELF-INITIATED",
    dates: "2024 - 2025",
    surface: "WEARABLE · INDUSTRIAL",
    status: "CONCEPT",
    locked: false,
    slotA: "INDUSTRIAL RENDER",
    slotB: "GESTURE SHEET",
    notes: [
      "No screen means every reply is a texture. Six haptic patterns carry the whole vocabulary - confirm, deny, wait, listening, dropped, done.",
      "Sized around a 17.3 mm inner diameter, which is where the sensor stack stops being felt from the inside.",
    ],
  },
};

export const STUDIO_TIMELINE = [
  {
    date: "08.11.26",
    place: "STUDIO - NEW HAVEN",
    cards: [
      {
        kicker: "UPD · UNDERPAINTING",
        title: "Salt Road, II",
        photo: "STUDIO PHOTO",
        caption: "Second pass on the ground, still cold. The horizon line moved four inches down.",
        meta: "60 × 60 in · OIL ON LINEN",
      },
      {
        kicker: "UPD · WALL VIEW",
        title: "Studio wall, east",
        photo: "STUDIO PHOTO",
        caption: "Three scenes hung together for the first time to check they share one light.",
        meta: "3 CANVASES · 60 in",
      },
    ],
  },
  {
    date: "07.29.26",
    place: "STUDIO - NEW HAVEN",
    cards: [
      {
        kicker: "UPD · COLOR TEST",
        title: "Nine skies for one horizon",
        photo: "STUDIO PHOTO",
        caption: "Gouache studies pinned in a row to fix the light before the large canvas starts.",
        meta: "9 × (8 × 8 in) · GOUACHE",
      },
    ],
  },
  {
    date: "07.14.26",
    place: "TRAVEL - BANJUL, THE GAMBIA",
    cards: [
      {
        kicker: "NOTE · FIELD",
        title: "River light, midday",
        photo: "TRAVEL PHOTO",
        caption: "The water is the same value as the sky for about an hour. Almost nothing to paint but that.",
        meta: "12 FRAMES · 35 MM",
      },
      {
        kicker: "NOTE · SKETCHBOOK",
        title: "Ferry queue",
        photo: "SCAN",
        caption: "Pencil notes on how people stand when they are used to waiting. Going into the next scene.",
        meta: "6 PP · 5.5 × 8.5 in",
      },
    ],
  },
  {
    date: "07.02.26",
    place: "STUDIO - NEW HAVEN",
    cards: [
      {
        kicker: "UPD · STRETCHER BUILD",
        title: "Frame, 72 in",
        photo: "STUDIO PHOTO",
        caption: "Cross-braced poplar for the next scene - largest square the studio door allows.",
        meta: "72 × 72 in · TOL ± 0.125 in",
      },
    ],
  },
  {
    date: "06.18.26",
    place: "TRAVEL - NORMAN, OKLAHOMA",
    cards: [
      {
        kicker: "NOTE · FIELD",
        title: "Flat country, long shadow",
        photo: "TRAVEL PHOTO",
        caption: "Went back for a week. The scale of the sky here keeps ending up in the paintings.",
        meta: "20 FRAMES · 35 MM",
      },
    ],
  },
];
