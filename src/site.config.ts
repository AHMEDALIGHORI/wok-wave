/** All buyer-editable content, links, colours and dish data live here. */
export type Callout = {
  /** Ingredient label shown as HTML. */ label: string;
  /** Label anchor, as percentages of the desktop stage. */ x: number;
  /** Vertical label position as a percentage of the desktop stage. */
  y: number;
  /** Ingredient anchor, as percentages of the source frame. */ targetX: number;
  /** Vertical ingredient position as a percentage of the source frame. */
  targetY: number;
  /** Scroll progress at which the label appears, from 0 to 1. */ at: number;
};
export type Dish = {
  /** Composition preset independent of the dish ID; keeps headlines clear of food. */
  headlineLayout: "split" | "compact" | "wide" | "inline";
  /** Stable URL and frame-folder slug. */ id: string;
  /** Source file, relative to the project root. */ video: string;
  /** Display names in English and Chinese. */ name: string;
  /** Chinese display name, rendered as text. */
  chinese: string;
  /** Two lines of display copy. */ headline: [string, string];
  /** Short descriptive copy. */ description: string;
  /** Nominal brand backdrop. */ color: string;
  /** Edge colours sampled from the first and last video frames. */ backdropStart: string;
  /** Sampled edge colour of the exploded video frame. */
  backdropEnd: string;
  /** Price in the configured currency. */ price: number;
  /** Heat level, 0–3. */ spice: number;
  /** Vegetarian badge. */ veg: boolean;
  /** Small portion label. */ portion: string;
  /** Foreground text for contrast against this dish's footage. */ ink:
    "light" | "dark";
  /** Desktop/mobile headline size and horizontal mobile crop alignment (0–1). */ displaySize: string;
  /** Mobile headline size in CSS units. */
  mobileDisplaySize: string;
  /** Horizontal cover-crop alignment from 0 (left) to 1 (right). */
  focalX: number;
  /** Handwritten sticker copy. */ sticker: string;
  /** Ingredient labels and placement. */ callouts: Callout[];
};

/** Menu-card fields; prices and category membership are all buyer-editable. */
export type MenuItem = {
  /** Stable item key. */ id: string;
  /** English item name. */ name: string;
  /** Chinese item name and decorative tile text. */ chinese: string;
  /** Short ingredient/serving description. */ description: string;
  /** Amount in the site's currency. */ price: number;
  /** Heat level from 0 (mild) to 3 (very hot). */ spice: number;
  /** Whether to display a vegetarian badge. */ veg: boolean;
  /** Whether to display the signature dish badge. */ hero: boolean;
  /** Corresponding signature poster ID; empty for other menu dishes. */ heroId: string;
  /** Public image URL for this menu card. */ image: string;
  /** ID from the categories list. */ category: string;
  /** Palette key from site.colors. */ color: string;
};

export const site = {
  /** Restaurant wordmark; rendered as real text. */ name: "WOK WAVE",
  /** Short Chinese brand descriptor. */ chineseName: "中式街头美食",
  /** Navigation/SEO brand description. */ tagline:
    "Chinese street food. Big main-character energy.",
  /** Public origin; replace before deployment. */ url: "https://wok-wave.example",
  /** Search/social description. */ description:
    "Soup that spills. Noodles that hit. Chinese street food, turned all the way up. Meet WOK WAVE.",
  /** Restaurant structured-data cuisine and price bracket. */ cuisine:
    "Chinese",
  /** Restaurant price bracket for structured data. */
  priceRange: "$$",
  /** Brand palette; components receive these as CSS variables. */ colors: {
    /** Foreground colour; light or dark for dishes, near-black in the palette. */
    ink: "#111111",
    /** Warm background and reversed-text colour. */
    cream: "#FFF6E5",
    /** Primary action and sticker accent. */
    lime: "#B6FF3B",
    /** Hot-pink secondary accent. */
    pink: "#FF2E93",
    /** Cherry-red hero and brand accent. */
    red: "#E10F2B",
    /** Sunshine-yellow noodle accent. */
    yellow: "#FFC800",
    /** Bubblegum-pink bao accent. */
    bao: "#FF9EB5",
    /** Electric-orange chicken accent. */
    orange: "#FF6A00",
  },
  /** Currency for every displayed price. */ currency: "USD",
  /** Price formatting locale. */ locale: "en-US",
  /** Buyer-supplied order URL; supports https://wa.me/… deep links. */ orderUrl:
    "https://example.com/order",
  /** Buyer-supplied reservation URL. */ bookingUrl: "https://example.com/book",
  /** Buyer-supplied map URL. */ mapUrl:
    "https://maps.google.com/?q=Chinatown+New+York",
  /** Buyer-supplied social profile. */ instagramUrl:
    "https://www.instagram.com/",
  /** Example location; replace before launch. */ address:
    "88 Mott Street, Chinatown, New York, NY",
  /** Human-readable service hours. */ hours: "Every day · 12pm—3am",
  /** Schema.org opening hours. */ openingHours: ["Mo-Su 12:00-03:00"],
  /** Nav items, in display order. */ nav: [
    {
      /** Visible label text. */
      label: "The good stuff",
      /** Anchor or destination URL. */
      href: "#xiaolongbao",
    },
    {
      /** Visible label text. */
      label: "The menu",
      /** Anchor or destination URL. */
      href: "#menu",
    },
    {
      /** Visible label text. */
      label: "Find us",
      /** Anchor or destination URL. */
      href: "#visit",
    },
  ],
  /** Shared interface strings; keep components free of branding/copy. */ ui: {
    /** Navigation order-button label. */
    order: "Order now",
    /** Dish and menu order-link label. */
    add: "Add to order",
    /** Scroll-hint label. */
    scroll: "Scroll to spill",
    /** Optional exploration CTA copy. */
    explore: "Meet your new obsession",
    /** Small introduction above the signature dish. */
    eyebrow: "BIG FLAVOUR. ZERO CHILL.",
    /** Small desktop edition label. */
    edition: "THE LATE-NIGHT EDIT",
    /** Optional editorial section counter. */
    number: "01 / 04",
    /** Text running around the rotating circular badge. */
    badge: "LATE NIGHT / OPEN TILL 3AM / ",
    /** Large text in the centre of the badge. */
    badgeCenter: "3AM",
    /** Preloader text and accessible status label. */
    loading: "Getting steamy",
    /** Assembled-poster alternative-text suffix. */
    ready: "Fresh out the steamer",
    /** Keyboard skip-link label. */
    skip: "Skip to content",
    /** Accessible label for opening mobile navigation. */
    menuOpen: "Open navigation",
    /** Accessible label for closing mobile navigation. */
    menuClose: "Close navigation",
    /** Accessible name of the primary navigation. */
    navigation: "Main navigation",
    /** Accessible canvas description prefix; followed by the dish name. */
    canvasLabel: "Exploded view of",
    /** Accessible prefix for the numerical heat level. */
    spiceLabel: "Spice level",
    /** Optional description of a mild dish. */
    mild: "All flavour. No fire.",
    /** Accessible name for the ingredient callout group. */
    ingredients: "What makes it hit",
    /** First descriptive line under the hero dish. */
    heroNote: "Hand-folded. Broth-loaded. Dangerously good.",
    /** Second descriptive line under the hero dish. */
    heroSubnote: "Six little reasons to stay out late.",
    /** Template disclaimer printed in the footer. */
    demoNote:
      "Demo template · replace example order and booking links before launch.",
    /** Optional introductory headline for alternate layouts. */
    checkpointTitle: "A little spill. A lot of flavour.",
    /** Optional introduction for alternate layouts. */
    checkpointCopy: "Good food. Better company. One more round?",
    /** Back-to-top link label. */
    backTop: "Run it back",
    /** Template creator credit. */
    footerCredit: "Built with Brand Motion",
    /** Accessible name of the dish progress navigation. */
    railLabel: "Jump to a signature dish",
    /** Vegetarian sticker text. */
    vegetarian: "VEG",
    /** Signature-dish sticker text. */
    signature: "FAN FAVOURITE",
    /** Accessible name of the category tabs. */
    menuLabel: "Browse the menu",
    /** Menu section eyebrow. */
    menuEyebrow: "THE GROUP CHAT HAS GOOD TASTE",
    /** First line of the menu heading. */
    menuTitle: "Bring your appetite.",
    /** Underlined second line of the menu heading. */
    menuTitleAccent: "We’ll bring the chaos.",
    /** Introductory menu paragraph. */
    menuCopy:
      "For the “just one bite” friend. For the whole table. For you, at 2am.",
    /** Optional all-items label. */
    menuAll: "All the good stuff",
    /** Menu footnote about portions and sharing. */
    menuNote: "Made fresh. Meant to share. No judgement if you don’t.",
    /** Allergy advisory below the menu. */
    menuAllergens: "Allergies? Tell our crew before you order.",
    /** Visit-section eyebrow. */
    visitEyebrow: "YOUR NEW REGULAR SPOT",
    /** Two-line visit heading. */
    visitTitle: ["Out late?", "Come hungry."],
    /** Visit-section introductory paragraph. */
    visitCopy:
      "Follow the steam. Find your people. Pull up for a proper feed, a quick bao, or the kind of night that needs one more bowl.",
    /** Address heading on the visit ticket. */
    visitAddressLabel: "FIND THE WAVE",
    /** Opening-hours heading on the visit ticket. */
    visitHoursLabel: "WHEN THE WOK’S ON",
    /** Map-link label. */
    map: "Get directions",
    /** Reservation-button label. */
    book: "Book a table",
    /** Social-profile link label. */
    instagram: "Catch the vibe",
    /** Handwritten visit-ticket sticker. */
    visitSticker: "walk-ins\nwelcome!",
    /** Small footer tagline. */
    footerLine: "GOOD FOOD. LOUD FRIENDS. LATE NIGHTS.",
    /** Copyright and rights statement. */
    copyright: "© 2026 WOK WAVE. All bites reserved.",
    /** Chinese text on the menu stamp. */
    menuChinese: "菜单",
    /** Chinese text on the visit ticket. */
    visitChinese: "来吃饭",
    /** Heat descriptions indexed by spice level 0 through 3. */
    spicyLabels: ["MILD", "A LITTLE KICK", "FEEL THE HEAT", "FULL SEND"],
  },
  /** Menu categories and their stable IDs. */ categories: [
    {
      /** Stable identifier used for links and data relationships. */
      id: "all",
      /** Visible label text. */
      label: "All the good stuff",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "dumplings",
      /** Visible label text. */
      label: "Dumplings",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "noodles",
      /** Visible label text. */
      label: "Noodles & Rice",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "wok",
      /** Visible label text. */
      label: "Wok",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "sides",
      /** Visible label text. */
      label: "Sides",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "sweet",
      /** Visible label text. */
      label: "Sweet & Sips",
    },
  ],
  /** Placeholder menu; prices use currency above. heroId links to a signature's poster. */ menu: [
    {
      /** Stable identifier used for links and data relationships. */
      id: "xiaolongbao",
      /** English display name. */
      name: "Xiaolongbao",
      /** Chinese display name, rendered as text. */
      chinese: "小笼包",
      /** Short description shown to visitors. */
      description:
        "Six hand-folded pockets of pork and golden broth. Handle with love.",
      /** Amount in the configured currency. */
      price: 12,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 0,
      /** Show the vegetarian badge when true. */
      veg: false,
      /** Use a signature dish photo when true. */
      hero: true,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "xiaolongbao",
      /** Public image URL for the menu card. */
      image: "/posters/xiaolongbao-mobile.webp",
      /** Category ID used by the menu tabs. */
      category: "dumplings",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "red",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "dan-dan",
      /** English display name. */
      name: "Dan Dan Noodles",
      /** Chinese display name, rendered as text. */
      chinese: "担担面",
      /** Short description shown to visitors. */
      description: "Springy noodles, crispy pork and our can’t-stop chili oil.",
      /** Amount in the configured currency. */
      price: 16,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 2,
      /** Show the vegetarian badge when true. */
      veg: false,
      /** Use a signature dish photo when true. */
      hero: true,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "dandannoodles",
      /** Public image URL for the menu card. */
      image: "/posters/dandannoodles-mobile.webp",
      /** Category ID used by the menu tabs. */
      category: "noodles",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "yellow",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "duck-bao",
      /** English display name. */
      name: "Peking Duck Bao",
      /** Chinese display name, rendered as text. */
      chinese: "北京烤鸭包",
      /** Short description shown to visitors. */
      description:
        "Two pillowy buns. Lacquered duck, hoisin, cucumber and crunch.",
      /** Amount in the configured currency. */
      price: 14,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 0,
      /** Show the vegetarian badge when true. */
      veg: false,
      /** Use a signature dish photo when true. */
      hero: true,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "pekingduckbao",
      /** Public image URL for the menu card. */
      image: "/posters/pekingduckbao-mobile.webp",
      /** Category ID used by the menu tabs. */
      category: "dumplings",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "bao",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "kung-pao",
      /** English display name. */
      name: "Kung Pao Chicken",
      /** Chinese display name, rendered as text. */
      chinese: "宫保鸡丁",
      /** Short description shown to visitors. */
      description: "Wok-charred chicken. Roasted peanuts. Sichuan mic drop.",
      /** Amount in the configured currency. */
      price: 18,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 3,
      /** Show the vegetarian badge when true. */
      veg: false,
      /** Use a signature dish photo when true. */
      hero: true,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "kungpaochicken",
      /** Public image URL for the menu card. */
      image: "/posters/kungpaochicken-mobile.webp",
      /** Category ID used by the menu tabs. */
      category: "wok",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "orange",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "mapo",
      /** English display name. */
      name: "Mapo Tofu",
      /** Chinese display name, rendered as text. */
      chinese: "麻婆豆腐",
      /** Short description shown to visitors. */
      description: "Silken tofu in a fiery mushroom and fermented-bean sauce.",
      /** Amount in the configured currency. */
      price: 15,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 3,
      /** Show the vegetarian badge when true. */
      veg: true,
      /** Use a signature dish photo when true. */
      hero: false,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "",
      /** Public image URL for the menu card. */
      image: "/menu/mapo.webp",
      /** Category ID used by the menu tabs. */
      category: "wok",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "red",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "crispy-beef",
      /** English display name. */
      name: "Crispy Chili Beef",
      /** Chinese display name, rendered as text. */
      chinese: "香辣牛肉",
      /** Short description shown to visitors. */
      description: "Crispy edges. Sticky chili glaze. Absolutely no leftovers.",
      /** Amount in the configured currency. */
      price: 19,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 2,
      /** Show the vegetarian badge when true. */
      veg: false,
      /** Use a signature dish photo when true. */
      hero: false,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "",
      /** Public image URL for the menu card. */
      image: "/menu/crispy-beef.webp",
      /** Category ID used by the menu tabs. */
      category: "wok",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "orange",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "scallion-pancake",
      /** English display name. */
      name: "Scallion Pancake",
      /** Chinese display name, rendered as text. */
      chinese: "葱油饼",
      /** Short description shown to visitors. */
      description:
        "Golden, flaky layers with a soy-vinegar dip. Tear and share.",
      /** Amount in the configured currency. */
      price: 7,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 0,
      /** Show the vegetarian badge when true. */
      veg: true,
      /** Use a signature dish photo when true. */
      hero: false,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "",
      /** Public image URL for the menu card. */
      image: "/menu/scallion-pancake.webp",
      /** Category ID used by the menu tabs. */
      category: "sides",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "lime",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "egg-rice",
      /** English display name. */
      name: "Egg Fried Rice",
      /** Chinese display name, rendered as text. */
      chinese: "蛋炒饭",
      /** Short description shown to visitors. */
      description:
        "Fluffy rice, golden egg and the unmistakable kiss of the wok.",
      /** Amount in the configured currency. */
      price: 11,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 0,
      /** Show the vegetarian badge when true. */
      veg: true,
      /** Use a signature dish photo when true. */
      hero: false,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "",
      /** Public image URL for the menu card. */
      image: "/menu/egg-rice.webp",
      /** Category ID used by the menu tabs. */
      category: "noodles",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "yellow",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "wontons",
      /** English display name. */
      name: "Spicy Red Oil Wontons",
      /** Chinese display name, rendered as text. */
      chinese: "红油抄手",
      /** Short description shown to visitors. */
      description: "Pork wontons swimming in fragrant chili oil. Dive in.",
      /** Amount in the configured currency. */
      price: 12,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 2,
      /** Show the vegetarian badge when true. */
      veg: false,
      /** Use a signature dish photo when true. */
      hero: false,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "",
      /** Public image URL for the menu card. */
      image: "/menu/wontons.webp",
      /** Category ID used by the menu tabs. */
      category: "dumplings",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "bao",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "squid",
      /** English display name. */
      name: "Salt & Pepper Squid",
      /** Chinese display name, rendered as text. */
      chinese: "椒盐鱿鱼",
      /** Short description shown to visitors. */
      description: "Light, crisp squid with chili, garlic and a proper crunch.",
      /** Amount in the configured currency. */
      price: 14,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 1,
      /** Show the vegetarian badge when true. */
      veg: false,
      /** Use a signature dish photo when true. */
      hero: false,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "",
      /** Public image URL for the menu card. */
      image: "/menu/squid.webp",
      /** Category ID used by the menu tabs. */
      category: "sides",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "orange",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "soup",
      /** English display name. */
      name: "Hot & Sour Soup",
      /** Chinese display name, rendered as text. */
      chinese: "酸辣汤",
      /** Short description shown to visitors. */
      description:
        "Mushrooms, tofu and bamboo shoots. Warming from the first sip.",
      /** Amount in the configured currency. */
      price: 8,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 1,
      /** Show the vegetarian badge when true. */
      veg: true,
      /** Use a signature dish photo when true. */
      hero: false,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "",
      /** Public image URL for the menu card. */
      image: "/menu/soup.webp",
      /** Category ID used by the menu tabs. */
      category: "sides",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "yellow",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "sago",
      /** English display name. */
      name: "Mango Pomelo Sago",
      /** Chinese display name, rendered as text. */
      chinese: "杨枝甘露",
      /** Short description shown to visitors. */
      description:
        "Mango, pomelo and little sago pearls. The cool-down you need.",
      /** Amount in the configured currency. */
      price: 8,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 0,
      /** Show the vegetarian badge when true. */
      veg: true,
      /** Use a signature dish photo when true. */
      hero: false,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "",
      /** Public image URL for the menu card. */
      image: "/menu/sago.webp",
      /** Category ID used by the menu tabs. */
      category: "sweet",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "yellow",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "boba",
      /** English display name. */
      name: "Brown Sugar Boba",
      /** Chinese display name, rendered as text. */
      chinese: "黑糖珍珠",
      /** Short description shown to visitors. */
      description:
        "Chewy pearls, fresh milk and brown-sugar swirls. Sip happy.",
      /** Amount in the configured currency. */
      price: 7,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 0,
      /** Show the vegetarian badge when true. */
      veg: true,
      /** Use a signature dish photo when true. */
      hero: false,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "",
      /** Public image URL for the menu card. */
      image: "/menu/boba.webp",
      /** Category ID used by the menu tabs. */
      category: "sweet",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "bao",
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "sesame-balls",
      /** English display name. */
      name: "Sesame Balls",
      /** Chinese display name, rendered as text. */
      chinese: "芝麻球",
      /** Short description shown to visitors. */
      description:
        "Golden sesame crunch with a sweet red-bean heart. Three to love.",
      /** Amount in the configured currency. */
      price: 6,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 0,
      /** Show the vegetarian badge when true. */
      veg: true,
      /** Use a signature dish photo when true. */
      hero: false,
      /** ID of the signature poster; empty for other menu dishes. */
      heroId: "",
      /** Public image URL for the menu card. */
      image: "/menu/sesame-balls.webp",
      /** Category ID used by the menu tabs. */
      category: "sweet",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "lime",
    },
  ] satisfies MenuItem[],
  /** Opposing ticker content. */ tickers: [
    "NO CAP, IT’S CRISPY",
    "SOUP DUMPLINGS ARE A PERSONALITY",
    "FREE REFILLS ON CHILI OIL",
  ],
  /** Four source videos and all hero content. */ dishes: [
    {
      /** Stable identifier used for links and data relationships. */
      id: "xiaolongbao",
      /** Headline composition around this footage. */
      headlineLayout: "split",
      /** Foreground colour; light or dark for dishes, near-black in the palette. */
      ink: "light",
      /** Desktop headline size in CSS units. */
      displaySize: "14vw",
      /** Mobile headline size in CSS units. */
      mobileDisplaySize: "18vw",
      /** Horizontal cover-crop alignment from 0 (left) to 1 (right). */
      focalX: 0.65,
      /** Source video path relative to the project root. */
      video: "assets-src/videos/xiaolongbao.mp4",
      /** English display name. */
      name: "Xiaolongbao",
      /** Chinese display name, rendered as text. */
      chinese: "小笼包",
      /** Two lines of headline text. */
      headline: ["Spill", "the soup."],
      /** Short description shown to visitors. */
      description:
        "Delicate folds. Rich pork. A whole lot of golden broth. Go on, make a little mess.",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "#E10F2B",
      /** Sampled edge colour of the assembled video frame. */
      backdropStart: "#af323d",
      /** Sampled edge colour of the exploded video frame. */
      backdropEnd: "#680915",
      /** Amount in the configured currency. */
      price: 12,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 0,
      /** Show the vegetarian badge when true. */
      veg: false,
      /** Serving-size label printed on the price sticker. */
      portion: "6 SOUP DUMPLINGS",
      /** Handwritten note; use a newline for a second line. */
      sticker: "little buns.\nbig feelings.",
      /** Ingredient labels with source-image and stage anchors. */
      callouts: [
        {
          /** Visible label text. */
          label: "Delicate wrapper",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 26,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 24,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 58,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 15,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.68,
        },
        {
          /** Visible label text. */
          label: "Pork filling",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 81,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 35,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 58,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 32,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.72,
        },
        {
          /** Visible label text. */
          label: "Golden broth",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 25,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 46,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 58,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 49,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.77,
        },
        {
          /** Visible label text. */
          label: "Fresh ginger",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 80,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 64,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 59,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 59,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.82,
        },
        {
          /** Visible label text. */
          label: "Black vinegar",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 25,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 65,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 47,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 46,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.87,
        },
      ],
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "dandannoodles",
      /** Headline composition around this footage. */
      headlineLayout: "compact",
      /** Foreground colour; light or dark for dishes, near-black in the palette. */
      ink: "dark",
      /** Desktop headline size in CSS units. */
      displaySize: "7vw",
      /** Mobile headline size in CSS units. */
      mobileDisplaySize: "12vw",
      /** Horizontal cover-crop alignment from 0 (left) to 1 (right). */
      focalX: 0.5,
      /** Source video path relative to the project root. */
      video: "assets-src/videos/dandannoodles.mp4",
      /** English display name. */
      name: "Dan Dan Noodles",
      /** Chinese display name, rendered as text. */
      chinese: "担担面",
      /** Two lines of headline text. */
      headline: ["Main character", "noodles."],
      /** Short description shown to visitors. */
      description:
        "Springy noodles. Crispy pork. Chili oil with something to prove.",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "#FFC800",
      /** Sampled edge colour of the assembled video frame. */
      backdropStart: "#fde468",
      /** Sampled edge colour of the exploded video frame. */
      backdropEnd: "#f7d247",
      /** Amount in the configured currency. */
      price: 16,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 2,
      /** Show the vegetarian badge when true. */
      veg: false,
      /** Serving-size label printed on the price sticker. */
      portion: "ONE BIG BOWL",
      /** Handwritten note; use a newline for a second line. */
      sticker: "slurp loudly.",
      /** Ingredient labels with source-image and stage anchors. */
      callouts: [
        {
          /** Visible label text. */
          label:
            "Bok choy",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 24,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 24,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 50,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 12,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.66,
        },
        {
          /** Visible label text. */
          label:
            "Peanuts",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 77,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 28,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 50,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 25,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.7,
        },
        {
          /** Visible label text. */
          label: "Crispy pork",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 24,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 42,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 50,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 36,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.75,
        },
        {
          /** Visible label text. */
          label:
            "Chili oil",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 77,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 45,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 50,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 47,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.8,
        },
        {
          /** Visible label text. */
          label: "Sesame paste",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 24,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 57,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 50,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 56,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.84,
        },
        {
          /** Visible label text. */
          label:
            "Noodles",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 77,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 67,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 50,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 73,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.88,
        },
      ],
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "pekingduckbao",
      /** Headline composition around this footage. */
      headlineLayout: "wide",
      /** Foreground colour; light or dark for dishes, near-black in the palette. */
      ink: "dark",
      /** Desktop headline size in CSS units. */
      displaySize: "8.6vw",
      /** Mobile headline size in CSS units. */
      mobileDisplaySize: "12.5vw",
      /** Horizontal cover-crop alignment from 0 (left) to 1 (right). */
      focalX: 0.5,
      /** Source video path relative to the project root. */
      video: "assets-src/videos/pekingduckbao.mp4",
      /** English display name. */
      name: "Peking Duck Bao",
      /** Chinese display name, rendered as text. */
      chinese: "北京烤鸭包",
      /** Two lines of headline text. */
      headline: ["Duck, but", "make it a bao."],
      /** Short description shown to visitors. */
      description: "Pillowy bao meets lacquered duck. Your new love language.",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "#FF9EB5",
      /** Sampled edge colour of the assembled video frame. */
      backdropStart: "#f39cbb",
      /** Sampled edge colour of the exploded video frame. */
      backdropEnd: "#ed5c96",
      /** Amount in the configured currency. */
      price: 14,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 0,
      /** Show the vegetarian badge when true. */
      veg: false,
      /** Serving-size label printed on the price sticker. */
      portion: "2 LOADED BAO",
      /** Handwritten note; use a newline for a second line. */
      sticker: "bao down.",
      /** Ingredient labels with source-image and stage anchors. */
      callouts: [
        {
          /** Visible label text. */
          label:
            "Bao bun",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 24,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 23,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 49,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 19,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.68,
        },
        {
          /** Visible label text. */
          label:
            "Scallion",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 77,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 34,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 50,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 31,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.73,
        },
        {
          /** Visible label text. */
          label:
            "Cucumber",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 24,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 43,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 50,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 38,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.78,
        },
        {
          /** Visible label text. */
          label:
            "Hoisin",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 77,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 52,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 50,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 50,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.83,
        },
        {
          /** Visible label text. */
          label: "Lacquered duck",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 24,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 64,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 50,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 70,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.88,
        },
      ],
    },
    {
      /** Stable identifier used for links and data relationships. */
      id: "kungpaochicken",
      /** Headline composition around this footage. */
      headlineLayout: "inline",
      /** Foreground colour; light or dark for dishes, near-black in the palette. */
      ink: "dark",
      /** Desktop headline size in CSS units. */
      displaySize: "10vw",
      /** Mobile headline size in CSS units. */
      mobileDisplaySize: "18vw",
      /** Horizontal cover-crop alignment from 0 (left) to 1 (right). */
      focalX: 0.5,
      /** Source video path relative to the project root. */
      video: "assets-src/videos/kungpaochicken.mp4",
      /** English display name. */
      name: "Kung Pao Chicken",
      /** Chinese display name, rendered as text. */
      chinese: "宫保鸡丁",
      /** Two lines of headline text. */
      headline: ["Heat", "check."],
      /** Short description shown to visitors. */
      description:
        "Wok-charred chicken, sticky glaze and a Sichuan wake-up call.",
      /** Dish backdrop hex colour, or a palette key for menu tiles. */
      color: "#FF6A00",
      /** Sampled edge colour of the assembled video frame. */
      backdropStart: "#f7a145",
      /** Sampled edge colour of the exploded video frame. */
      backdropEnd: "#bf4b05",
      /** Amount in the configured currency. */
      price: 18,
      /** Heat level from 0 (mild) to 3 (very hot). */
      spice: 3,
      /** Show the vegetarian badge when true. */
      veg: false,
      /** Serving-size label printed on the price sticker. */
      portion: "WOK-FIRED TO ORDER",
      /** Handwritten note; use a newline for a second line. */
      sticker: "hot stuff.",
      /** Ingredient labels with source-image and stage anchors. */
      callouts: [
        {
          /** Visible label text. */
          label: "Sichuan pepper",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 24,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 24,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 49,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 11,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.68,
        },
        {
          /** Visible label text. */
          label:
            "Chicken",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 77,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 36,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 50,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 35,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.73,
        },
        {
          /** Visible label text. */
          label: "Dried chilies",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 24,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 44,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 54,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 28,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.78,
        },
        {
          /** Visible label text. */
          label: "Sticky glaze",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 77,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 55,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 55,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 49,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.83,
        },
        {
          /** Visible label text. */
          label:
            "Peanuts",
          /** Horizontal label position as a percentage of the desktop stage. */
          x: 24,
          /** Vertical label position as a percentage of the desktop stage. */
          y: 66,
          /** Horizontal ingredient position as a percentage of the source frame. */
          targetX: 55,
          /** Vertical ingredient position as a percentage of the source frame. */
          targetY: 61,
          /** Reveal threshold from 0 to 1 along section progress. */
          at: 0.88,
        },
      ],
    },
  ] satisfies Dish[],
};

export const formatPrice = (price: number) =>
  new Intl.NumberFormat(site.locale, {
    style: "currency",
    currency: site.currency,
    maximumFractionDigits: 0,
  }).format(price);
