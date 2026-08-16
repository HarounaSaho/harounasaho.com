// Live site content. Edit this file to add works, shows, projects, or studio updates, then push to publish.
export const WORKS = [
  { cat: "HS·002", title: "Ferryman at Low Tide", medium: "Oil on linen", yr: "2022", ex: "THE LONG WALK", dims: "48 × 48 in" },
  { cat: "HS·005", title: "Norman, Interior", medium: "Oil on panel", yr: "2023", ex: null, dims: "24 × 24 in" },
  { cat: "HS·008", title: "Salt Road", medium: "Oil on linen", yr: "2023", ex: "THE LONG WALK", dims: "60 × 60 in" },
  { cat: "HS·011", title: "Two Rivers, One Name", medium: "Acrylic on canvas", yr: "2024", ex: "THE LONG WALK", dims: "36 × 36 in" },
  { cat: "HS·014", title: "The Keeper's Table", medium: "Oil on linen", yr: "2024", ex: "SECOND SEASON", dims: "52 × 52 in" },
  { cat: "HS·016", title: "Watchtower, Unfinished", medium: "Gouache on paper", yr: "2024", ex: null, dims: "18 × 18 in" },
  { cat: "HS·019", title: "Harvest Without Rain", medium: "Oil on linen", yr: "2025", ex: "SECOND SEASON", dims: "60 × 60 in" },
  { cat: "HS·021", title: "Cartographer's Hands", medium: "Oil on panel", yr: "2025", ex: "SECOND SEASON", dims: "30 × 30 in" },
  { cat: "HS·024", title: "Nine Skies for One Horizon", medium: "Gouache on paper", yr: "2025", ex: "SECOND SEASON", dims: "8 × 8 in" },
  { cat: "HS·027", title: "Return, Delayed", medium: "Oil on linen", yr: "2026", ex: null, dims: "44 × 44 in" },
  { cat: "HS·029", title: "The Second Ferry", medium: "Oil on linen", yr: "2026", ex: "SECOND SEASON", dims: "66 × 66 in" },
  { cat: "HS·031", title: "Field Notes, Gambia", medium: "Acrylic on canvas", yr: "2026", ex: null, dims: "28 × 28 in" },
];

export const SHOWS = {
  "THE LONG WALK": "YALE SCHOOL OF ART · 2024",
  "SECOND SEASON": "GREEN HALL GALLERY · 2026",
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
