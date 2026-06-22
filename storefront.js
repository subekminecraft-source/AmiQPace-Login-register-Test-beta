(function (global) {
  "use strict";

  var STORAGE_PROJECTS = "amiqplace_projects";
  var STORAGE_ACTIVE = "amiqplace_active_project";
  var STORAGE_PREVIEW_SNAPSHOT = "amiqplace_preview_snapshot";
  var STORAGE_CART_PREFIX = "amiqplace_cart_";
  var STORAGE_STORE_NOTIFICATIONS = "amiqplace_store_notifications";
  var DESKTOP_MIN_WIDTH = 1121;

  var PRODUCT_CATEGORIES_BY_INDUSTRY = {
    fashion: [
      { id: "tops", label: "Góra" },
      { id: "bottoms", label: "Spodnie i spódnice" },
      { id: "dresses", label: "Sukienki" },
      { id: "outerwear", label: "Okrycia wierzchnie" },
      { id: "footwear", label: "Obuwie" },
      { id: "accessories", label: "Akcesoria" },
      { id: "other", label: "Inne" }
    ],
    food: [
      { id: "meals", label: "Dania gotowe" },
      { id: "boxes", label: "Boxy i zestawy" },
      { id: "grocery", label: "Produkty spożywcze" },
      { id: "beverages", label: "Napoje" },
      { id: "desserts", label: "Desery" },
      { id: "other", label: "Inne" }
    ],
    electronics: [
      { id: "phones", label: "Smartfony i tablety" },
      { id: "computers", label: "Komputery" },
      { id: "audio", label: "Audio i słuchawki" },
      { id: "accessories", label: "Akcesoria" },
      { id: "smart-home", label: "Smart home" },
      { id: "other", label: "Inne" }
    ],
    beauty: [
      { id: "skincare", label: "Pielęgnacja" },
      { id: "makeup", label: "Makijaż" },
      { id: "fragrance", label: "Zapachy" },
      { id: "hair", label: "Włosy" },
      { id: "sets", label: "Zestawy" },
      { id: "other", label: "Inne" }
    ],
    home: [
      { id: "furniture", label: "Meble" },
      { id: "decor", label: "Dekoracje" },
      { id: "textile", label: "Tekstylia" },
      { id: "lighting", label: "Oświetlenie" },
      { id: "kitchen", label: "Kuchnia" },
      { id: "other", label: "Inne" }
    ],
    services: [
      { id: "consulting", label: "Konsulting" },
      { id: "courses", label: "Kursy i szkolenia" },
      { id: "digital", label: "Produkty cyfrowe" },
      { id: "vouchers", label: "Vouchery" },
      { id: "subscriptions", label: "Subskrypcje" },
      { id: "other", label: "Inne" }
    ],
    general: [
      { id: "featured", label: "Polecane" },
      { id: "new", label: "Nowości" },
      { id: "bestsellers", label: "Bestsellery" },
      { id: "sale", label: "Promocje" },
      { id: "other", label: "Inne" }
    ]
  };

  function getProductCategoriesForIndustry(industryId) {
    return (
      PRODUCT_CATEGORIES_BY_INDUSTRY[industryId] ||
      PRODUCT_CATEGORIES_BY_INDUSTRY.general ||
      []
    );
  }

  function getProductCategoryLabel(industryId, categoryId) {
    if (!categoryId) return "";
    var list = getProductCategoriesForIndustry(industryId);
    var found = list.find(function (c) {
      return c.id === categoryId;
    });
    return found ? found.label : categoryId;
  }

  var FASHION_BANNER_DEFAULT =
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80";

  var DEPRECATED_MEDIA_FRAGMENTS = ["photo-1483985988355-763728fa0b65"];

  var BANNER_PRESETS = [
    {
      id: "runway",
      label: "Runway",
      url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "street",
      label: "Street style",
      url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "minimal",
      label: "Minimal",
      url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "atelier",
      label: "Atelier moda",
      url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687812?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "editorial",
      label: "Edytorial",
      url: "https://images.unsplash.com/photo-1483985988355-763728fa0b65?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "fabric",
      label: "Tkaniny",
      url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "boutique",
      label: "Butik",
      url: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "accessories",
      label: "Akcesoria",
      url: "https://images.unsplash.com/photo-1492707892479-7bcbcddda0eb?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "denim",
      label: "Denim",
      url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "shoes",
      label: "Obuwie",
      url: "https://images.unsplash.com/photo-1460353581641-37baddab0fa7?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "winter",
      label: "Zima",
      url: "https://images.unsplash.com/photo-1539109136884-252489459d0a?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "portrait",
      label: "Portret",
      url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "hanger",
      label: "Szafa",
      url: "https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "knit",
      label: "Dzianina",
      url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "vintage",
      label: "Vintage",
      url: "https://images.unsplash.com/photo-1525507119025-ed4c629a60bc?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "coat",
      label: "Płaszcz",
      url: "https://images.unsplash.com/photo-1539533018447-63fcce267608?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "jewelry-fashion",
      label: "Biżuteria",
      url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "summer",
      label: "Lato",
      url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "catalog",
      label: "Katalog",
      url: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "monochrome",
      label: "Monochrom",
      url: "https://images.unsplash.com/photo-1503342217507-b04a15ec7518?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "bags",
      label: "Torby",
      url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "runway-bw",
      label: "Runway B&W",
      url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80"
    }
  ];

  var PRODUCT_IMAGE_PRESETS = [
    {
      id: "apparel-1",
      label: "Odzież",
      url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "apparel-2",
      label: "Stylizacja",
      url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "shoes",
      label: "Buty",
      url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "bag",
      label: "Akcesoria",
      url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "beauty",
      label: "Beauty",
      url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "home",
      label: "Dom",
      url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
    }
  ];

  var TECH_BANNER_DEFAULT =
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80";

  var TECH_BANNER_PRESETS = [
    {
      id: "circuit",
      label: "Circuit",
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "desk",
      label: "Setup",
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "neon",
      label: "Neon tech",
      url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "minimal",
      label: "Minimal",
      url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "workspace",
      label: "Workspace",
      url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "gadgets",
      label: "Gadgety",
      url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "smartphone",
      label: "Smartfony",
      url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "audio",
      label: "Audio",
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "laptop",
      label: "Laptop",
      url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "keyboard",
      label: "Klawiatura",
      url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "camera",
      label: "Foto",
      url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "vr",
      label: "VR",
      url: "https://images.unsplash.com/photo-1622979135225-d2fe269b9bd0?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "server",
      label: "Data center",
      url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "drone",
      label: "Drony",
      url: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "tablet",
      label: "Tablet",
      url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "smartwatch",
      label: "Smartwatch",
      url: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "coding",
      label: "Kod",
      url: "https://images.unsplash.com/photo-1461742480802-5662cf7f9030?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "rgb-desk",
      label: "RGB setup",
      url: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "motherboard",
      label: "Hardware",
      url: "https://images.unsplash.com/photo-1555617982-dacb30405770?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "smart-home",
      label: "Smart home",
      url: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "wearable",
      label: "Wearables",
      url: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "console",
      label: "Gaming",
      url: "https://images.unsplash.com/photo-1486401899868-0e435ed85128?auto=format&fit=crop&w=1400&q=80"
    }
  ];

  var LUX_BANNER_PRESETS = [
    {
      id: "lux-atelier",
      label: "Atelier noc",
      url: "https://images.unsplash.com/photo-1617137968427-85924c800a07?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-boutique",
      label: "Butik premium",
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-marble",
      label: "Marmur & złoto",
      url: "https://images.unsplash.com/photo-1618221191710-1f55383664c8?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-leather",
      label: "Maroquinerie",
      url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-jewelry",
      label: "Joaillerie",
      url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-watch",
      label: "Horlogerie",
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-perfume",
      label: "Parfumerie",
      url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-silk",
      label: "Jedwab",
      url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-interior",
      label: "Interior lux",
      url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-fashion",
      label: "Haute couture",
      url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-champagne",
      label: "Champagne",
      url: "https://images.unsplash.com/photo-1543007630-91504a4f0c0d?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-velvet",
      label: "Aksamit",
      url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-shoes",
      label: "Chaussures",
      url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-candles",
      label: "Ambiance",
      url: "https://images.unsplash.com/photo-1602602439150-a87863644710?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-gold",
      label: "Or & noir",
      url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-spa",
      label: "Spa & wellness",
      url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-yacht",
      label: "Yacht club",
      url: "https://images.unsplash.com/photo-1567899378494-47b050a96278?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-gallery",
      label: "Galeria",
      url: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-penthouse",
      label: "Penthouse",
      url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-roses",
      label: "Roses",
      url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-cognac",
      label: "Cognac",
      url: "https://images.unsplash.com/photo-1569529465841-df137a181cc2?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-tailoring",
      label: "Tailoring",
      url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "lux-showroom",
      label: "Showroom",
      url: "https://images.unsplash.com/photo-1618221191710-1f55383664c8?auto=format&fit=crop&w=1800&q=80"
    }
  ];

  var ENTERPRISE_BANNER_DEFAULT =
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80";

  var ENTERPRISE_BANNER_PRESETS = [
    {
      id: "ent-skyline",
      label: "Skyline",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "ent-boardroom",
      label: "Boardroom",
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "ent-team",
      label: "Zespół",
      url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "ent-analytics",
      label: "Analityka",
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "ent-logistics",
      label: "Logistyka",
      url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1800&q=80"
    },
    {
      id: "ent-retail",
      label: "Retail hub",
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=80"
    }
  ];

  var FOOD_BANNER_PRESETS = [
    {
      id: "food-restaurant",
      label: "Restauracja",
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "food-pizza",
      label: "Pizza",
      url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "food-coffee",
      label: "Kawa",
      url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "food-bakery",
      label: "Piekarnia",
      url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "food-sushi",
      label: "Sushi",
      url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "food-wine",
      label: "Wino",
      url: "https://images.unsplash.com/photo-1510812431400-5740e1515a78?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "food-burger",
      label: "Burger",
      url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "food-brunch",
      label: "Brunch",
      url: "https://images.unsplash.com/photo-1533777857889-4be7c7102a4e?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "food-dessert",
      label: "Desery",
      url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "food-farm",
      label: "Farm to table",
      url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "food-chef",
      label: "Kuchnia",
      url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "food-bar",
      label: "Bar & koktajle",
      url: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1400&q=80"
    }
  ];

  var UNIVERSAL_BANNER_PRESETS = [
    {
      id: "uni-clean",
      label: "Czyste tło",
      url: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-gradient",
      label: "Gradient",
      url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-studio",
      label: "Studio",
      url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-nature",
      label: "Natura",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-urban",
      label: "Urban",
      url: "https://images.unsplash.com/photo-1477959858607-67ae85e3f1be?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-food",
      label: "Gastro",
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-pastel",
      label: "Pastel",
      url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-dark",
      label: "Ciemne tło",
      url: "https://images.unsplash.com/photo-1550684848-fac1c5b4a853?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-texture",
      label: "Tekstura",
      url: "https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-minimal-white",
      label: "Biel",
      url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-architecture",
      label: "Architektura",
      url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-sunrise",
      label: "Wschód słońca",
      url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-beach",
      label: "Plaża",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-coffee",
      label: "Kawa & lifestyle",
      url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-books",
      label: "Książki",
      url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-flowers",
      label: "Kwiaty",
      url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-marble",
      label: "Marmur",
      url: "https://images.unsplash.com/photo-1618221191710-1f55383664c8?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-skyline",
      label: "Skyline",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-workspace-dark",
      label: "Ciemne studio",
      url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-retail",
      label: "Retail",
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-wellness",
      label: "Wellness",
      url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=80"
    },
    {
      id: "uni-craft",
      label: "Rękodzieło",
      url: "https://images.unsplash.com/photo-1452860606245-08befc0ff4db?auto=format&fit=crop&w=1400&q=80"
    }
  ];

  var BANNER_LIBRARY = [
    { id: "lux", label: "Maison Éclat · Premium", templateIds: ["amiq-lux"], presets: LUX_BANNER_PRESETS },
    { id: "fashion", label: "Moda & Lookbook", templateIds: ["amiq-fashion"], presets: BANNER_PRESETS },
    { id: "tech", label: "Tech Store Pro", templateIds: ["amiq-tech"], presets: TECH_BANNER_PRESETS },
    { id: "enterprise", label: "Multi-brand Hub", templateIds: ["amiq-enterprise"], presets: ENTERPRISE_BANNER_PRESETS },
    { id: "food", label: "Gastro & Food", templateIds: ["amiq-food"], presets: FOOD_BANNER_PRESETS },
    { id: "universal", label: "Uniwersalne", templateIds: [], presets: UNIVERSAL_BANNER_PRESETS }
  ];

  function getBannerLibraryForTemplate(templateId) {
    var primary = BANNER_LIBRARY.filter(function (cat) {
      return cat.templateIds.indexOf(templateId) !== -1;
    });
    var rest = BANNER_LIBRARY.filter(function (cat) {
      return cat.templateIds.indexOf(templateId) === -1;
    });
    return primary.concat(rest);
  }

  function getFlatBannerLibrary(templateId) {
    var flat = [];
    getBannerLibraryForTemplate(templateId || "").forEach(function (cat) {
      (cat.presets || []).forEach(function (preset) {
        flat.push({
          id: preset.id,
          label: preset.label,
          url: preset.url,
          categoryId: cat.id,
          categoryLabel: cat.label
        });
      });
    });
    return flat;
  }

  var LUX_BANNER_DEFAULT =
    "https://images.unsplash.com/photo-1617137968427-85924c800a07?auto=format&fit=crop&w=1800&q=80";

  var LUX_COLLECTION_PRESETS = [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80"
  ];

  function readStorageItem(key) {
    try {
      var sessionValue = sessionStorage.getItem(key);
      if (sessionValue) return sessionValue;
    } catch (e) {}
    try {
      return localStorage.getItem(key);
    } catch (e2) {}
    return null;
  }

  function writeStorageItem(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {}
    try {
      localStorage.setItem(key, value);
    } catch (e2) {}
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isDeprecatedMediaUrl(url) {
    if (!url) return false;
    return DEPRECATED_MEDIA_FRAGMENTS.some(function (frag) {
      return String(url).indexOf(frag) !== -1;
    });
  }

  function resolveMediaUrl() {
    var candidates = [];
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i]) candidates.push(arguments[i]);
    }
    for (var j = 0; j < candidates.length; j++) {
      if (isDeprecatedMediaUrl(candidates[j])) continue;
      var safe = safeCssUrl(candidates[j]);
      if (safe) return safe;
    }
    return "";
  }

  function safeCssUrl(url) {
    if (!url || typeof url !== "string") return "";
    var trimmed = url.trim();
    if (/^data:image\/(?:jpeg|jpg|png|webp|gif|svg\+xml);base64,/i.test(trimmed)) {
      return trimmed.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    }
    if (!/^https?:\/\//i.test(trimmed)) return "";
    return trimmed.replace(/&/g, "%26").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }

  function formatPrice(n) {
    return Number(n || 0).toFixed(2).replace(".", ",") + " zł";
  }

  function normalizeCollections(raw) {
    var defaults = [
      { id: "col_default_1", title: "Nowa kolekcja", subtitle: "Wiosna 2026", image: BANNER_PRESETS[0].url, productIds: [] },
      { id: "col_default_2", title: "Essentials", subtitle: "Codzienne must-have", image: BANNER_PRESETS[1].url, productIds: [] }
    ];
    if (!Array.isArray(raw) || !raw.length) return defaults;
    return raw.slice(0, 15).map(function (c, i) {
      var def = defaults[i] || defaults[0];
      return {
        id: c.id || "col_" + i,
        title: c.title || def.title,
        subtitle: c.subtitle || "",
        image: c.image || def.image,
        productIds: Array.isArray(c.productIds) ? c.productIds : []
      };
    });
  }

  function normalizeStore(raw) {
    if (!raw) return null;
    var collections = normalizeCollections(raw.collections);
    var lockedTheme =
      raw.templateId === "amiq-fashion"
        ? "fashion"
        : raw.templateId === "amiq-tech"
          ? "tech"
          : raw.templateId === "amiq-lux"
            ? "lux"
            : raw.templateId === "amiq-enterprise"
              ? "enterprise"
              : null;
    var theme = lockedTheme || raw.theme || raw.thumb || "blank";
    var thumb = lockedTheme || raw.thumb || raw.theme || "blank";
    return {
      id: raw.id,
      name: raw.name || "Nowy sklep",
      storeName: raw.storeName || raw.name || "Sklep",
      slug: raw.slug || "sklep",
      theme: theme,
      thumb: thumb,
      status: raw.status || "draft",
      publishedAt: raw.publishedAt || null,
      templateId: raw.templateId || null,
      heroTitle: raw.heroTitle || "Witaj w naszym sklepie",
      heroSubtitle: raw.heroSubtitle || "Odkryj produkty dopasowane do Twoich potrzeb.",
      heroCta: raw.heroCta || "Zobacz ofertę",
      heroBadge: raw.heroBadge || null,
      heroImage: raw.heroImage || null,
      heroLayout:
        raw.heroLayout === "full" || raw.heroLayout === "split-wide" ? raw.heroLayout : "split",
      heroOverlay: typeof raw.heroOverlay === "number" ? raw.heroOverlay : 45,
      colorMode: raw.colorMode === "dark" ? "dark" : "light",
      accentColor: raw.accentColor || null,
      cardRadius: raw.cardRadius || "soft",
      headingStyle: raw.headingStyle || "modern",
      lookbookTitle: raw.lookbookTitle || "Kolekcje sezonowe",
      lookbookSubtitle: raw.lookbookSubtitle || "Lookbook i stylizacje na każdą okazję.",
      collections: collections,
      logoMode: raw.logoMode === "image" ? "image" : "text",
      logoText: raw.logoText || raw.storeName || raw.name || "Sklep",
      logoImage: raw.logoImage || null,
      logoFont: raw.logoFont || "manrope",
      sectionTitle: raw.sectionTitle || "Nasze produkty",
      sectionSubtitle: raw.sectionSubtitle || "Przeglądaj aktualną ofertę sklepu.",
      aboutTitle: raw.aboutTitle || "O sklepie",
      aboutText:
        raw.aboutText ||
        "Tworzymy produkty z myślą o jakości i prostym zakupie online. Zmień ten tekst w edytorze panelu.",
      newsletterTitle: raw.newsletterTitle || "Bądź na bieżąco",
      newsletterSubtitle: raw.newsletterSubtitle || "Zapisz się po informacje o nowościach i promocjach.",
      announcement: raw.announcement || null,
      storeCategory: raw.storeCategory || null,
      categoryProfile: raw.categoryProfile && typeof raw.categoryProfile === "object" ? raw.categoryProfile : {},
      techCompareTitle: raw.techCompareTitle || "Porównaj modele",
      techCompareSubtitle: raw.techCompareSubtitle || "Szybkie zestawienie kluczowych parametrów.",
      techCategoriesTitle: raw.techCategoriesTitle || "Przeglądaj kategorie",
      techCategoriesSubtitle:
        raw.techCategoriesSubtitle || "Szybki dostęp do segmentów oferty — dopasowany pod sklep elektroniki.",
      techFaqTitle: raw.techFaqTitle || "Najczęstsze pytania",
      techFaqSubtitle: raw.techFaqSubtitle || "Odpowiedzi przed zakupem — edytujesz je w panelu sklepu.",
      techBrandsLabel: raw.techBrandsLabel || "Autoryzowani partnerzy",
      techCategories: normalizeTechCategories(raw.techCategories),
      techFaqs: normalizeTechFaqs(raw.techFaqs),
      techCompare: normalizeTechCompare(raw.techCompare),
      techBrands: normalizeTechBrands(raw.techBrands),
      techHeroStats: normalizeTechHeroStats(raw.techHeroStats),
      luxStoryTitle: raw.luxStoryTitle || "Dziedzictwo marki",
      luxStoryText:
        raw.luxStoryText ||
        "Od 1987 roku tworzymy przedmioty, które przekraczają sezonowe trendy — łącząc rzemiosło atelier z nowoczesną estetyką.",
      luxStoryImage: raw.luxStoryImage || null,
      luxExperienceTitle: raw.luxExperienceTitle || "Private Shopping",
      luxExperienceText:
        raw.luxExperienceText ||
        "Umów spersonalizowaną sesję z doradcą stylisty — online lub w naszym butiku flagowym w Warszawie.",
      luxExperienceCta: raw.luxExperienceCta || "Umów konsultację",
      luxPillars: normalizeLuxPillars(raw.luxPillars),
      luxPress: normalizeLuxPress(raw.luxPress),
      enterpriseBrandsTitle: raw.enterpriseBrandsTitle || "Portfolio marek",
      enterpriseBrandsSubtitle:
        raw.enterpriseBrandsSubtitle || "Każda marka ma własny katalog, branding i raporty — zarządzane z jednego panelu.",
      enterpriseSolutionsTitle: raw.enterpriseSolutionsTitle || "Platforma B2B",
      enterpriseSolutionsSubtitle:
        raw.enterpriseSolutionsSubtitle || "Narzędzia dla zespołów handlowych, franczyz i partnerów dystrybucyjnych.",
      enterpriseSegmentsTitle: raw.enterpriseSegmentsTitle || "Segmenty klientów",
      enterpriseSegmentsSubtitle:
        raw.enterpriseSegmentsSubtitle || "Osobne cenniki, widoczność produktów i warunki płatności dla każdego segmentu.",
      enterpriseCasesTitle: raw.enterpriseCasesTitle || "Historie sukcesu",
      enterpriseCasesSubtitle:
        raw.enterpriseCasesSubtitle || "Jak grupy retailowe skalują sprzedaż wielu marek w AmiQPlace.",
      enterprisePartnersLabel: raw.enterprisePartnersLabel || "Ekosystem partnerów",
      enterpriseFaqTitle: raw.enterpriseFaqTitle || "Pytania B2B",
      enterpriseFaqSubtitle: raw.enterpriseFaqSubtitle || "Wdrożenie, integracje, faktury i warunki współpracy.",
      enterprisePortalTitle: raw.enterprisePortalTitle || "Portal partnera B2B",
      enterprisePortalSubtitle:
        raw.enterprisePortalSubtitle || "Zamówienia hurtowe, statusy dostaw i raporty marży w jednym miejscu.",
      enterprisePortalCta: raw.enterprisePortalCta || "Poproś o dostęp",
      enterpriseBrands: normalizeEnterpriseBrands(raw.enterpriseBrands),
      enterpriseSolutions: normalizeEnterpriseSolutions(raw.enterpriseSolutions),
      enterpriseSegments: normalizeEnterpriseSegments(raw.enterpriseSegments),
      enterpriseCaseStudies: normalizeEnterpriseCaseStudies(raw.enterpriseCaseStudies),
      enterprisePartners: normalizeEnterprisePartners(raw.enterprisePartners),
      enterpriseFaqs: normalizeEnterpriseFaqs(raw.enterpriseFaqs),
      enterpriseHeroStats: normalizeTechHeroStats(raw.enterpriseHeroStats),
      sectionVisibility: normalizeSectionVisibility(raw.sectionVisibility, {
        templateId: raw.templateId,
        theme: theme
      }),
      checkout: normalizeStoreCheckout(raw.checkout),
      storeSettings: normalizeStoreSettings(raw.storeSettings, raw),
      products: Array.isArray(raw.products) ? raw.products.map(normalizeProduct).filter(Boolean) : []
    };
  }

  function normalizeLuxPillars(raw) {
    var defaults = [
      {
        icon: "fa-gem",
        title: "Materiały pierwszej klasy",
        desc: "Skóra garbowana roślinnie, jedwab mulberry i metale szlachetne."
      },
      {
        icon: "fa-hand-sparkles",
        title: "Ręczne wykończenie",
        desc: "Każdy egzemplarz przechodzi kontrolę jakości w atelier."
      },
      {
        icon: "fa-certificate",
        title: "Certyfikat autentyczności",
        desc: "Numer seryjny, opakowanie archivalne i dożywotnia konserwacja."
      }
    ];
    if (!Array.isArray(raw) || !raw.length) return defaults;
    return raw.slice(0, 4).map(function (p, i) {
      var d = defaults[i] || defaults[0];
      return {
        icon: p.icon || d.icon,
        title: p.title || d.title,
        desc: p.desc || d.desc
      };
    });
  }

  function normalizeLuxPress(raw) {
    var defaults = [
      { quote: "„Definicja nowoczesnego luksusu bez kompromisów.”", source: "Vogue Poland" },
      { quote: "„Butik, który rozumie sztukę prezentacji.”", source: "Elle Man" },
      { quote: "„Kolekcje warte kolekcjonowania.”", source: "Forbes Life" }
    ];
    if (!Array.isArray(raw) || !raw.length) return defaults;
    return raw.slice(0, 5).map(function (p, i) {
      var d = defaults[i] || defaults[0];
      return {
        quote: p.quote || d.quote,
        source: p.source || d.source
      };
    });
  }

  function normalizeTechCategories(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(function (c, index) {
        return {
          id: c.id || "tcat_" + index,
          label: c.label || "Kategoria",
          icon: c.icon || "fa-microchip",
          desc: c.desc || "",
          productIds: Array.isArray(c.productIds) ? c.productIds.slice() : []
        };
      })
      .filter(function (c) {
        return c.label;
      });
  }

  function normalizeTechFaqs(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(function (f) {
        return { q: String(f.q || f.question || "").trim(), a: String(f.a || f.answer || "").trim() };
      })
      .filter(function (f) {
        return f.q && f.a;
      });
  }

  function normalizeTechCompare(raw) {
    var base = raw && typeof raw === "object" ? raw : {};
    return {
      productIds: Array.isArray(base.productIds) ? base.productIds.slice(0, 4) : [],
      specKeys: Array.isArray(base.specKeys) ? base.specKeys.slice() : []
    };
  }

  function normalizeTechBrands(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(function (b) {
        return typeof b === "string" ? b.trim() : b && b.name ? String(b.name).trim() : "";
      })
      .filter(Boolean);
  }

  function normalizeTechHeroStats(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(function (s) {
        return { value: String(s.value || "").trim(), label: String(s.label || "").trim() };
      })
      .filter(function (s) {
        return s.value && s.label;
      });
  }

  function normalizeEnterpriseBrands(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(function (b, i) {
        return {
          id: b.id || "ebrand_" + i,
          name: String(b.name || "").trim(),
          tagline: String(b.tagline || "").trim(),
          category: String(b.category || "").trim(),
          image: b.image || null,
          productCount: b.productCount != null ? String(b.productCount) : ""
        };
      })
      .filter(function (b) {
        return b.name;
      });
  }

  function normalizeEnterpriseSolutions(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(function (s, i) {
        return {
          id: s.id || "esol_" + i,
          title: String(s.title || "").trim(),
          desc: String(s.desc || "").trim(),
          icon: String(s.icon || "fa-layer-group").trim()
        };
      })
      .filter(function (s) {
        return s.title;
      });
  }

  function normalizeEnterpriseSegments(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(function (s, i) {
        return {
          id: s.id || "eseg_" + i,
          title: String(s.title || "").trim(),
          subtitle: String(s.subtitle || "").trim(),
          icon: String(s.icon || "fa-building").trim()
        };
      })
      .filter(function (s) {
        return s.title;
      });
  }

  function normalizeEnterpriseCaseStudies(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(function (c, i) {
        return {
          id: c.id || "ecase_" + i,
          brand: String(c.brand || "").trim(),
          title: String(c.title || "").trim(),
          metric: String(c.metric || "").trim(),
          metricLabel: String(c.metricLabel || "").trim(),
          quote: String(c.quote || "").trim(),
          image: c.image || null
        };
      })
      .filter(function (c) {
        return c.title;
      });
  }

  function normalizeEnterprisePartners(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(function (p) {
        return String(p || "").trim();
      })
      .filter(Boolean);
  }

  function normalizeEnterpriseFaqs(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(function (f) {
        return { q: String(f.q || "").trim(), a: String(f.a || "").trim() };
      })
      .filter(function (f) {
        return f.q && f.a;
      });
  }

  function normalizeStoreSettings(raw, project) {
    var n = raw && typeof raw === "object" ? raw : {};
    var baseName = (project && (project.storeName || project.name)) || "Sklep";
    return {
      contactEmail: n.contactEmail || "",
      contactPhone: n.contactPhone || "",
      seoTitle: n.seoTitle || baseName,
      seoDescription: n.seoDescription || "",
      maintenanceMode: !!n.maintenanceMode,
      hideFromSearch: !!n.hideFromSearch,
      returnPolicy: n.returnPolicy || "",
      supportHours: n.supportHours || "Pn–Pt 9:00–17:00"
    };
  }

  function buildMaintenancePage(store, compact) {
    var ss = store.storeSettings || {};
    var contact =
      ss.contactEmail
        ? '<a class="sf-maintenance__contact" href="mailto:' +
          escapeHtml(ss.contactEmail) +
          '"><i class="fas fa-envelope" aria-hidden="true"></i> ' +
          escapeHtml(ss.contactEmail) +
          "</a>"
        : "";
    return (
      '<div class="sf-maintenance' +
      (compact ? " sf-maintenance--compact" : "") +
      '">' +
      '<div class="sf-maintenance__inner">' +
      '<div class="sf-maintenance__icon"><i class="fas fa-screwdriver-wrench" aria-hidden="true"></i></div>' +
      "<h1>" +
      escapeHtml(store.storeName || store.name || "Sklep") +
      "</h1>" +
      "<p>Sklep jest chwilowo niedostępny — wracamy wkrótce z ulepszeniami.</p>" +
      (ss.supportHours ? "<span class=\"sf-maintenance__hours\">Obsługa: " + escapeHtml(ss.supportHours) + "</span>" : "") +
      contact +
      "</div></div>"
    );
  }

  var SHIPPING_LEGACY_MAP = {
    courier: "dpd_courier",
    locker: "inpost_locker",
    pickup: "pickup_store"
  };

  var SHIPPING_CATEGORY_META = {
    express: {
      title: "Dostawa ekspresowa",
      icon: "fa-bolt",
      desc: "Priorytetowa realizacja — kurier pod wskazany adres tego samego lub następnego dnia."
    },
    address: {
      title: "Dostawa na adres",
      icon: "fa-truck-fast",
      desc: "Standardowa wysyłka kurierem pod drzwi — adres dostawy w kolejnym kroku."
    },
    pickup: {
      title: "Odbiór w punkcie",
      icon: "fa-box",
      desc: "Paczkomaty, automaty i punkty partnerskie — wybierz kod punktu w kasie."
    }
  };

  function getShippingCategoryMeta(category) {
    return SHIPPING_CATEGORY_META[category] || SHIPPING_CATEGORY_META.address;
  }

  function getShippingMethodCatalog() {
    return [
      {
        id: "inpost_express",
        label: "InPost Kurier ekspres",
        category: "express",
        icon: "fa-bolt",
        eta: "Jutro do 12:00",
        price: 24.99,
        enabled: false
      },
      {
        id: "dpd_express_18",
        label: "DPD Express do 18:00",
        category: "express",
        icon: "fa-gauge-high",
        eta: "Następny dzień roboczy",
        price: 22.99,
        enabled: false
      },
      {
        id: "dhl_express_9",
        label: "DHL Express do 9:00",
        category: "express",
        icon: "fa-plane-departure",
        eta: "Następny dzień do 9:00",
        price: 29.99,
        enabled: false
      },
      {
        id: "same_day_city",
        label: "Dostawa tego samego dnia",
        category: "express",
        icon: "fa-motorcycle",
        eta: "Dziś wieczorem (miasto)",
        price: 34.99,
        enabled: false
      },
      {
        id: "dhl_courier",
        label: "Kurier DHL",
        category: "address",
        icon: "fa-truck",
        eta: "1–2 dni robocze",
        price: 16.99,
        enabled: false
      },
      {
        id: "dpd_courier",
        label: "Kurier DPD",
        category: "address",
        icon: "fa-truck-fast",
        eta: "1–2 dni robocze",
        price: 15.99,
        enabled: false
      },
      {
        id: "inpost_courier",
        label: "Kurier InPost",
        category: "address",
        icon: "fa-truck-ramp-box",
        eta: "1–2 dni robocze",
        price: 14.99,
        enabled: false
      },
      {
        id: "gls_courier",
        label: "Kurier GLS",
        category: "address",
        icon: "fa-truck-field",
        eta: "2–3 dni robocze",
        price: 13.99,
        enabled: false
      },
      {
        id: "ups_standard",
        label: "UPS Standard",
        category: "address",
        icon: "fa-truck-moving",
        eta: "2–4 dni robocze",
        price: 17.99,
        enabled: false
      },
      {
        id: "fedex_economy",
        label: "FedEx Economy",
        category: "address",
        icon: "fa-truck-plane",
        eta: "2–3 dni robocze",
        price: 18.99,
        enabled: false
      },
      {
        id: "poczta_kurier",
        label: "Poczta Polska — kurier",
        category: "address",
        icon: "fa-envelope-open-text",
        eta: "2–4 dni robocze",
        price: 12.49,
        enabled: false
      },
      {
        id: "inpost_locker",
        label: "Paczkomat InPost",
        category: "pickup",
        icon: "fa-box",
        eta: "1–3 dni robocze",
        price: 11.99,
        enabled: false,
        pointType: "paczkomat"
      },
      {
        id: "orlen_paczka",
        label: "Orlen Paczka",
        category: "pickup",
        icon: "fa-gas-pump",
        eta: "1–3 dni robocze",
        price: 10.99,
        enabled: false,
        pointType: "orlen"
      },
      {
        id: "dpd_pickup",
        label: "DPD Pickup",
        category: "pickup",
        icon: "fa-location-dot",
        eta: "1–3 dni robocze",
        price: 12.99,
        enabled: false,
        pointType: "dpd"
      },
      {
        id: "dhl_pop",
        label: "DHL POP / punkt",
        category: "pickup",
        icon: "fa-store",
        eta: "1–3 dni robocze",
        price: 13.99,
        enabled: false,
        pointType: "dhl"
      },
      {
        id: "allegro_one",
        label: "Allegro One Box",
        category: "pickup",
        icon: "fa-cube",
        eta: "1–2 dni robocze",
        price: 10.49,
        enabled: false,
        pointType: "allegro"
      },
      {
        id: "paczka_ruch",
        label: "Paczka w RUCHu",
        category: "pickup",
        icon: "fa-shop",
        eta: "2–4 dni robocze",
        price: 8.99,
        enabled: false,
        pointType: "ruch"
      },
      {
        id: "pocztex_point",
        label: "Pocztex Punkt",
        category: "pickup",
        icon: "fa-envelope",
        eta: "2–4 dni robocze",
        price: 9.99,
        enabled: false,
        pointType: "pocztex"
      },
      {
        id: "zabka_orlen",
        label: "Żabka / automat ORLEN",
        category: "pickup",
        icon: "fa-shop",
        eta: "1–3 dni robocze",
        price: 10.49,
        enabled: false,
        pointType: "zabka"
      },
      {
        id: "empik_pickup",
        label: "Empik — punkt odbioru",
        category: "pickup",
        icon: "fa-book",
        eta: "1–3 dni robocze",
        price: 11.49,
        enabled: false,
        pointType: "empik"
      },
      {
        id: "biedronka_automat",
        label: "Automat Biedronka",
        category: "pickup",
        icon: "fa-cart-shopping",
        eta: "1–3 dni robocze",
        price: 9.49,
        enabled: false,
        pointType: "biedronka"
      },
      {
        id: "pickup_store",
        label: "Odbiór osobisty w sklepie",
        category: "pickup",
        icon: "fa-store",
        eta: "Po umówieniu",
        price: 0,
        enabled: false,
        pointType: "store"
      }
    ];
  }

  function getShippingMethodById(store, id) {
    var checkout = store.checkout || getDefaultStoreCheckout();
    return (checkout.shipping.methods || []).find(function (m) {
      return m.id === id;
    });
  }

  function getDefaultStoreCheckout() {
    var methods = getShippingMethodCatalog().map(function (m) {
      return Object.assign({}, m);
    });
    methods.forEach(function (m) {
      if (m.id === "dpd_courier" || m.id === "inpost_locker") m.enabled = true;
    });
    return {
      payments: {
        enabled: ["transfer", "blik", "cod"],
        primary: "blik",
        bankAccount: "PL 12 3456 7890 1234 5678 9012 3456",
        codFee: 5,
        demoMode: true,
        configured: true
      },
      shipping: {
        methods: methods,
        freeFrom: 299,
        configured: true
      }
    };
  }

  function normalizeStoreCheckout(raw) {
    var catalog = getShippingMethodCatalog();
    var savedList = raw && raw.shipping && raw.shipping.methods ? raw.shipping.methods : [];
    var savedById = {};
    savedList.forEach(function (m) {
      if (!m || !m.id) return;
      var id = SHIPPING_LEGACY_MAP[m.id] || m.id;
      savedById[id] = Object.assign({}, m, { id: id });
    });
    var methods = catalog.map(function (defM) {
      return savedById[defM.id] ? Object.assign({}, defM, savedById[defM.id]) : Object.assign({}, defM);
    });
    var def = getDefaultStoreCheckout();
    return {
      payments: Object.assign({}, def.payments, raw && raw.payments ? raw.payments : {}),
      shipping: Object.assign({}, def.shipping, raw && raw.shipping ? raw.shipping : {}, { methods: methods })
    };
  }

  var PAYMENT_META = {
    transfer: { label: "Przelew bankowy", icon: "fa-building-columns", hint: "Dane do przelewu po złożeniu zamówienia" },
    blik: { label: "BLIK", icon: "fa-mobile-screen-button", hint: "Kod BLIK w aplikacji bankowej" },
    cod: { label: "Płatność za pobraniem", icon: "fa-money-bill-wave", hint: "Zapłacisz kurierowi przy odbiorze przesyłki" },
    payu: { label: "PayU", icon: "fa-bolt", hint: "Szybka płatność online" },
    p24: { label: "Przelewy24", icon: "fa-credit-card", hint: "Przelewy i karty" },
    stripe: { label: "Karta płatnicza", icon: "fa-stripe-s", hint: "Visa, Mastercard, Apple Pay" }
  };

  function getPaymentLabel(id) {
    return (PAYMENT_META[id] && PAYMENT_META[id].label) || id;
  }

  function productHasVisibleSpecs(product) {
    return product && product.specsVisible !== false && Array.isArray(product.specs) && product.specs.length > 0;
  }

  function normalizeProduct(raw) {
    if (!raw) return null;
    var variants = normalizeProductVariants(raw);
    return {
      id: raw.id,
      name: raw.name || "Produkt",
      price: Number(raw.price) || 0,
      comparePrice:
        typeof raw.comparePrice === "number" && raw.comparePrice > 0 ? raw.comparePrice : null,
      stock: typeof raw.stock === "number" ? raw.stock : parseInt(raw.stock, 10) || 0,
      status: raw.status === "draft" ? "draft" : "active",
      desc: raw.desc || "",
      longDesc: raw.longDesc || "",
      image: raw.image || null,
      gallery: Array.isArray(raw.gallery)
        ? raw.gallery
            .map(function (u) {
              return safeCssUrl(u) || (u && String(u).trim().indexOf("data:image/") === 0 ? u.trim() : "");
            })
            .filter(Boolean)
            .slice(0, 5)
        : [],
      tag: raw.tag || null,
      brandLabel: raw.brandLabel || null,
      shippingTime: raw.shippingTime || "1–3 dni robocze",
      sku: raw.sku || "",
      variants: variants,
      categoryId: raw.categoryId || null,
      specs: Array.isArray(raw.specs)
        ? raw.specs
            .map(function (s) {
              return { label: String(s.label || "").trim(), value: String(s.value || "").trim() };
            })
            .filter(function (s) {
              return s.label && s.value;
            })
        : [],
      specsVisible: raw.specsVisible !== false,
      rating: typeof raw.rating === "number" ? raw.rating : null,
      updatedAt: raw.updatedAt || Date.now()
    };
  }

  function normalizeProductVariants(raw) {
    if (!raw) return [];
    if (Array.isArray(raw.variants) && raw.variants.length) {
      return raw.variants
        .map(function (v, index) {
          var options = Array.isArray(v.options)
            ? v.options.map(function (o) {
                return String(o || "").trim();
              }).filter(Boolean)
            : [];
          return {
            id: v.id || "var_" + index,
            name: String(v.name || "Wariant").trim() || "Wariant",
            options: options
          };
        })
        .filter(function (v) {
          return v.options.length > 0;
        });
    }
    if (raw.sizes && String(raw.sizes).trim()) {
      var legacy = String(raw.sizes)
        .split(/[,;|/]/)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      if (legacy.length) {
        return [{ id: "size", name: "Rozmiar", options: legacy }];
      }
    }
    return [];
  }

  function formatVariantLabel(selections) {
    if (!selections || typeof selections !== "object") return "";
    return Object.keys(selections)
      .map(function (key) {
        return key + ": " + selections[key];
      })
      .join(" · ");
  }

  function getCartLineKey(productId, selections) {
    if (!selections || !Object.keys(selections).length) return String(productId);
    return (
      productId +
      "::" +
      Object.keys(selections)
        .sort()
        .map(function (key) {
          return key + "=" + selections[key];
        })
        .join("|")
    );
  }

  function buildVariantPickersHtml(product) {
    if (!product.variants || !product.variants.length) return "";
    return (
      '<div class="sf-pdp-variants" data-sf-variants-root>' +
      product.variants
        .map(function (variant) {
          return (
            '<div class="sf-pdp-variant" data-sf-variant-group="' +
            escapeHtml(variant.name) +
            '">' +
            "<label>" +
            escapeHtml(variant.name) +
            "</label>" +
            '<div class="sf-pdp-variant__options" role="listbox" aria-label="' +
            escapeHtml(variant.name) +
            '">' +
            variant.options
              .map(function (opt, index) {
                return (
                  '<button type="button" class="sf-pdp-variant__btn' +
                  (index === 0 ? " is-active" : "") +
                  '" data-sf-variant="' +
                  escapeHtml(variant.name) +
                  '" data-sf-variant-value="' +
                  escapeHtml(opt) +
                  '" role="option"' +
                  (index === 0 ? ' aria-selected="true"' : "") +
                  ">" +
                  escapeHtml(opt) +
                  "</button>"
                );
              })
              .join("") +
            "</div></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function initPdpVariantSelection(container, product) {
    container._sfVariantSelection = {};
    if (!product || !product.variants || !product.variants.length) return;
    product.variants.forEach(function (variant) {
      if (variant.options && variant.options[0]) {
        container._sfVariantSelection[variant.name] = variant.options[0];
      }
    });
  }

  function collectPdpVariantSelections(container, product) {
    if (!product || !product.variants || !product.variants.length) return {};
    var selections = {};
    var complete = true;
    product.variants.forEach(function (variant) {
      var group = container.querySelector('[data-sf-variant-group="' + variant.name + '"]');
      var active = group ? group.querySelector("[data-sf-variant].is-active") : null;
      if (active) {
        selections[variant.name] = active.getAttribute("data-sf-variant-value") || "";
      } else {
        complete = false;
      }
    });
    return complete ? selections : null;
  }

  function getProductById(store, productId) {
    if (!store || !productId) return null;
    var found = (store.products || []).find(function (p) {
      return p.id === productId;
    });
    return found ? normalizeProduct(found) : null;
  }

  function parseProductHash(hash) {
    var route = parseStorefrontRoute(hash);
    return route.view === "product" ? route.productId : null;
  }

  function parseStorefrontRoute(hash) {
    var value = hash != null ? hash : (global.location && global.location.hash) || "";
    var h = String(value);
    var productMatch = h.match(/^#\/?produkt\/([^/?#]+)/i);
    if (productMatch) return { view: "product", productId: decodeURIComponent(productMatch[1]) };
    if (/^#\/?koszyk/i.test(h)) return { view: "cart", productId: null };
    if (/^#\/?checkout/i.test(h)) return { view: "checkout", productId: null };
    if (/^#\/?zamowienie/i.test(h)) return { view: "success", productId: null };
    var searchPath = h.match(/^#\/?szukaj\/([^/?#]+)/i);
    if (searchPath) return { view: "search", productId: null, query: decodeURIComponent(searchPath[1].replace(/\+/g, " ")) };
    var searchQuery = h.match(/^#\/?szukaj(?:\?([^#]*))?/i);
    if (searchQuery) {
      var params = {};
      try {
        (searchQuery[1] || "").split("&").forEach(function (part) {
          var kv = part.split("=");
          if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent((kv[1] || "").replace(/\+/g, " "));
        });
      } catch (e) {}
      return { view: "search", productId: null, query: params.q || "" };
    }
    return { view: "home", productId: null, query: "" };
  }

  function getCartKey(storeId) {
    return STORAGE_CART_PREFIX + storeId;
  }

  function getCart(storeId) {
    try {
      var raw = localStorage.getItem(getCartKey(storeId));
      var cart = raw ? JSON.parse(raw) : [];
      return cart.map(function (item) {
        if (!item.cartItemId) {
          item.cartItemId = item.lineKey || "ci_" + item.productId;
        }
        if (!item.lineKey) {
          item.lineKey = getCartLineKey(item.productId, item.variantSelections);
        }
        return item;
      });
    } catch (e) {
      return [];
    }
  }

  function saveCart(storeId, items) {
    try {
      localStorage.setItem(getCartKey(storeId), JSON.stringify(items));
    } catch (e) {}
  }

  function getCartItemCount(storeId) {
    return getCart(storeId).reduce(function (sum, item) {
      return sum + (item.qty || 0);
    }, 0);
  }

  function clearCart(storeId) {
    saveCart(storeId, []);
  }

  function addToCart(store, productId, qty, selections) {
    var product = getProductById(store, productId);
    if (!product || product.status !== "active") return false;
    if (product.variants && product.variants.length) {
      if (!selections || !Object.keys(selections).length) return false;
      var required = product.variants.every(function (v) {
        return selections[v.name];
      });
      if (!required) return false;
    }
    var amount = Math.max(1, parseInt(qty, 10) || 1);
    var maxStock = product.stock > 0 ? product.stock : amount;
    var lineKey = getCartLineKey(productId, selections);
    var cart = getCart(store.id);
    var idx = cart.findIndex(function (item) {
      return item.lineKey === lineKey;
    });
    if (idx === -1) {
      cart.push({
        cartItemId: "ci_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
        lineKey: lineKey,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image || null,
        qty: Math.min(amount, maxStock),
        variantSelections: selections || {},
        variantLabel: formatVariantLabel(selections)
      });
    } else {
      cart[idx].qty = Math.min((cart[idx].qty || 0) + amount, maxStock);
    }
    saveCart(store.id, cart);
    pushStoreNotification({
      projectId: store.id,
      type: "cart",
      title: "Dodano do koszyka",
      message: product.name + (formatVariantLabel(selections) ? " · " + formatVariantLabel(selections) : "") + " × " + Math.min(amount, maxStock)
    });
    return true;
  }

  function updateCartItemQty(storeId, cartItemId, qty) {
    var cart = getCart(storeId);
    var idx = cart.findIndex(function (item) {
      return item.cartItemId === cartItemId || item.lineKey === cartItemId || item.productId === cartItemId;
    });
    if (idx === -1) return;
    if (qty <= 0) cart.splice(idx, 1);
    else cart[idx].qty = qty;
    saveCart(storeId, cart);
  }

  function removeFromCart(storeId, cartItemId) {
    updateCartItemQty(storeId, cartItemId, 0);
  }

  function calcCartTotals(store, cart, shippingId, paymentId) {
    var subtotal = cart.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
    var checkout = store.checkout || getDefaultStoreCheckout();
    var shippingMethods = (checkout.shipping.methods || []).filter(function (m) {
      return m.enabled;
    });
    var ship = shippingMethods.find(function (m) {
      return m.id === shippingId;
    });
    if (!ship && shippingMethods.length) ship = shippingMethods[0];
    var shippingCost = 0;
    if (ship) {
      shippingCost =
        subtotal >= (checkout.shipping.freeFrom || 0) && checkout.shipping.freeFrom > 0 ? 0 : Number(ship.price) || 0;
    }
    var codFee = 0;
    if (paymentId === "cod" && (checkout.payments.enabled || []).indexOf("cod") !== -1) {
      codFee = Number(checkout.payments.codFee) || 0;
    }
    return {
      subtotal: subtotal,
      shipping: shippingCost,
      codFee: codFee,
      shippingLabel: ship ? ship.label : "—",
      shippingId: ship ? ship.id : null,
      shippingCategory: ship ? ship.category : null,
      total: subtotal + shippingCost + codFee
    };
  }

  function buildCheckoutShippingGroupHtml(category, methods, selectedId) {
    if (!methods.length) return "";
    var meta = getShippingCategoryMeta(category);
    return (
      '<div class="sf-checkout-shipping-group sf-checkout-shipping-group--' +
      escapeHtml(category) +
      '">' +
      "<h4><i class=\"fas " +
      escapeHtml(meta.icon) +
      '" aria-hidden="true"></i> ' +
      escapeHtml(meta.title) +
      "</h4>" +
      (meta.desc ? '<p class="sf-checkout-shipping-group__desc">' + escapeHtml(meta.desc) + "</p>" : "") +
      '<div class="sf-checkout-options">' +
      methods
        .map(function (m) {
          return buildCheckoutShippingOptionHtml(m, selectedId && m.id === selectedId);
        })
        .join("") +
      "</div></div>"
    );
  }

  function buildCheckoutShippingOptionHtml(method, checked) {
    var icon =
      method.icon ||
      (method.category === "pickup" ? "fa-box" : method.category === "express" ? "fa-bolt" : "fa-truck-fast");
    var badge =
      method.category === "express"
        ? '<span class="sf-checkout-option__badge">Ekspres</span>'
        : method.price === 0
          ? '<span class="sf-checkout-option__badge sf-checkout-option__badge--free">Gratis</span>'
          : "";
    return (
      '<label class="sf-checkout-option sf-checkout-option--' +
      escapeHtml(method.category || "address") +
      (checked ? " is-selected" : "") +
      '">' +
      '<input type="radio" name="sf-shipping" value="' +
      escapeHtml(method.id) +
      '"' +
      (checked ? " checked" : "") +
      ' data-sf-shipping-method data-sf-shipping-category="' +
      escapeHtml(method.category || "address") +
      '">' +
      '<span class="sf-checkout-option__icon"><i class="fas ' +
      escapeHtml(icon) +
      '" aria-hidden="true"></i></span>' +
      "<div class=\"sf-checkout-option__body\"><strong>" +
      escapeHtml(method.label) +
      badge +
      "</strong><span>" +
      escapeHtml(method.eta) +
      " · " +
      escapeHtml(method.price > 0 ? formatPrice(method.price) : "Gratis") +
      "</span></div>" +
      '<span class="sf-checkout-option__check" aria-hidden="true"><i class="fas fa-check"></i></span></label>'
    );
  }

  function updateCheckoutDeliveryUI(container) {
    var shipInput = container.querySelector("[data-sf-shipping-method]:checked");
    var category = shipInput ? shipInput.getAttribute("data-sf-shipping-category") || "address" : "address";
    var addressBlock = container.querySelector("[data-sf-checkout-address-block]");
    var pickupBlock = container.querySelector("[data-sf-checkout-pickup-block]");
    var isPickup = category === "pickup";
    if (addressBlock) addressBlock.hidden = isPickup;
    if (pickupBlock) pickupBlock.hidden = !isPickup;
    container.querySelectorAll("[data-sf-field-street], [data-sf-field-postal], [data-sf-field-city]").forEach(function (el) {
      el.required = !isPickup;
    });
    container.querySelectorAll("[data-sf-field-pickup-point], [data-sf-field-pickup-city]").forEach(function (el) {
      el.required = isPickup;
    });
    var hint = container.querySelector("[data-sf-pickup-hint-text]");
    if (hint && shipInput) {
      var method = { id: shipInput.value };
      var store = container._sfStore;
      if (store) {
        var meta = getShippingMethodById(store, shipInput.value);
        if (meta) {
          hint.textContent =
            meta.pointType === "paczkomat"
              ? "Podaj kod paczkomatu (np. WAW01M) i miasto — w produkcji podłączymy mapę punktów InPost."
              : meta.pointType === "orlen"
                ? "Wpisz kod punktu Orlen Paczka lub nazwę stacji — docelowo wybór z mapy."
                : meta.pointType === "allegro"
                  ? "Wpisz kod Allegro One Box — w produkcji wybierzesz punkt z mapy."
                  : meta.pointType === "ruch"
                    ? "Podaj numer punktu RUCH lub sklepu partnerskiego."
                    : "Podaj identyfikator punktu odbioru i miasto — w wersji produkcyjnej pojawi się mapa.";
        }
      }
    }
  }

  function saveProjectsList(projects) {
    writeStorageItem(STORAGE_PROJECTS, JSON.stringify(projects));
    try {
      global.dispatchEvent(new CustomEvent("amiqplace:projects-updated"));
    } catch (e) {}
  }

  function upsertCustomerFromOrder(project, order) {
    if (!project || !order || !order.email) return project.customers || [];
    var customers = (project.customers || []).slice();
    var email = String(order.email).toLowerCase();
    var idx = customers.findIndex(function (c) {
      return String(c.email).toLowerCase() === email;
    });
    if (idx === -1) {
      customers.unshift({
        id: "cust_" + Date.now(),
        name: order.customer || "Klient",
        email: order.email,
        phone: order.phone || "",
        ordersCount: 1,
        totalSpent: order.total || 0,
        lastOrderAt: order.createdAt || Date.now(),
        source: "order",
        createdAt: Date.now()
      });
    } else {
      var existing = Object.assign({}, customers[idx]);
      existing.ordersCount = (existing.ordersCount || 0) + 1;
      existing.totalSpent = (existing.totalSpent || 0) + (order.total || 0);
      existing.lastOrderAt = order.createdAt || Date.now();
      existing.name = order.customer || existing.name;
      if (order.phone) existing.phone = order.phone;
      customers[idx] = existing;
    }
    return customers;
  }

  function decrementStockForOrderItems(project, items) {
    var products = (project.products || []).slice();
    (items || []).forEach(function (item) {
      if (!item || !item.productId) return;
      var pIdx = products.findIndex(function (p) {
        return p.id === item.productId;
      });
      if (pIdx === -1) return;
      var p = Object.assign({}, products[pIdx]);
      if (typeof p.stock === "number") {
        p.stock = Math.max(0, p.stock - (parseInt(item.qty, 10) || 1));
      }
      products[pIdx] = p;
    });
    return products;
  }

  function pushProjectActivity(project, text) {
    project.activity = [{ text: text, ts: Date.now() }].concat(project.activity || []).slice(0, 12);
  }

  function readStoreNotifications() {
    try {
      var raw = readStorageItem(STORAGE_STORE_NOTIFICATIONS);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list)
        ? list.map(function (n) {
            return Object.assign({ read: false, ts: Date.now() }, n || {});
          })
        : [];
    } catch (e) {
      return [];
    }
  }

  function writeStoreNotifications(list) {
    list = (list || []).slice(0, 80);
    try {
      writeStorageItem(STORAGE_STORE_NOTIFICATIONS, JSON.stringify(list));
    } catch (e) {}
    try {
      global.dispatchEvent(new CustomEvent("amiqplace:store-notification"));
    } catch (e2) {}
  }

  function pushStoreNotification(entry) {
    var list = readStoreNotifications();
    list.unshift(
      Object.assign(
        {
          id: "evt_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
          ts: Date.now(),
          read: false
        },
        entry
      )
    );
    writeStoreNotifications(list);
  }

  function productMatchesSearchQuery(product, q, store) {
    if (!q) return false;
    var hay = [
      product.name,
      product.desc,
      product.longDesc,
      product.sku,
      product.tag,
      product.categoryId ? getProductCategoryLabel(store.storeCategory, product.categoryId) : ""
    ]
      .concat(
        (product.specs || []).map(function (s) {
          return s.label + " " + s.value;
        })
      )
      .join(" ")
      .toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  function collectionMatchesSearchQuery(col, q) {
    if (!col || !q) return false;
    return ((col.title || "") + " " + (col.subtitle || "")).toLowerCase().indexOf(q) !== -1;
  }

  function searchStoreCatalog(store, query) {
    var q = String(query || "")
      .trim()
      .toLowerCase();
    if (!q) {
      return { query: "", products: [], collections: [], categories: [] };
    }
    store = normalizeStore(store);
    var products = (store.products || [])
      .filter(function (p) {
        return p.status === "active";
      })
      .filter(function (p) {
        return productMatchesSearchQuery(p, q, store);
      });
    var collections = (store.collections || []).filter(function (col) {
      return collectionMatchesSearchQuery(col, q);
    });
    var categories = isTechStore(store)
      ? (store.techCategories || []).filter(function (cat) {
          return ((cat.label || "") + " " + (cat.desc || "")).toLowerCase().indexOf(q) !== -1;
        })
      : [];
    return { query: query, products: products, collections: collections, categories: categories };
  }

  function buildHeaderSearchHtml(store, compact, currentQuery) {
    if (compact) return "";
    var placeholder = isTechStore(store)
      ? "Szukaj produktów, marek, SKU…"
      : isLookbookStore(store)
        ? "Szukaj produktów i kolekcji…"
        : "Szukaj w sklepie…";
    if (isTechStore(store)) {
      return (
        '<div class="sf-header__search sf-header__search--tech" role="search">' +
        '<form class="sf-header__search-form sf-header__search-form--tech" data-sf-search-form action="#/szukaj" method="get">' +
        '<label class="sf-header__search-field">' +
        '<i class="fas fa-magnifying-glass sf-header__search-field-icon" aria-hidden="true"></i>' +
        '<input type="search" name="q" class="sf-header__search-input" data-sf-store-search placeholder="' +
        escapeHtml(placeholder) +
        '" value="' +
        escapeHtml(currentQuery || "") +
        '" aria-label="Szukaj w sklepie" autocomplete="off">' +
        '<kbd class="sf-header__search-kbd" aria-hidden="true">/</kbd>' +
        "</label>" +
        '<button type="submit" class="sf-header__search-submit sf-header__search-submit--tech" aria-label="Szukaj">' +
        '<i class="fas fa-arrow-right" aria-hidden="true"></i></button>' +
        "</form></div>"
      );
    }
    return (
      '<div class="sf-header__search" role="search">' +
      '<form class="sf-header__search-form" data-sf-search-form action="#/szukaj" method="get">' +
      '<i class="fas fa-magnifying-glass" aria-hidden="true"></i>' +
      '<input type="search" name="q" data-sf-store-search placeholder="' +
      escapeHtml(placeholder) +
      '" value="' +
      escapeHtml(currentQuery || "") +
      '" aria-label="Szukaj w sklepie" autocomplete="off">' +
      '<button type="submit" class="sf-header__search-submit" aria-label="Szukaj"><i class="fas fa-arrow-right" aria-hidden="true"></i></button>' +
      "</form></div>"
    );
  }

  function placeDemoOrder(store, payload) {
    var projects = getProjects();
    var idx = projects.findIndex(function (p) {
      return p.id === store.id;
    });
    if (idx === -1) return null;
    var project = projects[idx];
    var orders = (project.orders || []).slice();
    var num = 1000 + orders.length + 1;
    var order = Object.assign(
      {
        id: "ord_" + Date.now(),
        number: "#" + num,
        status: "new",
        createdAt: Date.now()
      },
      payload
    );
    orders.unshift(order);
    var customers = upsertCustomerFromOrder(project, order);
    var products = decrementStockForOrderItems(project, order.items || []);
    pushProjectActivity(project, "Nowe zamówienie " + order.number + " ze sklepu");
    project.orders = orders;
    project.customers = customers;
    project.products = products;
    projects[idx] = project;
    saveProjectsList(projects);
    pushStoreNotification({
      projectId: store.id,
      type: "order",
      title: "Nowe zamówienie " + order.number,
      message:
        (order.customer || "Klient") +
        " · " +
        formatPrice(order.total || 0) +
        (order.productName ? " · " + order.productName : "")
    });
    clearCart(store.id);
    return order;
  }

  function buildCartButtonHtml(store, lookbook) {
    var count = getCartItemCount(store.id);
    var badge =
      count > 0
        ? '<span class="sf-cart-count">' + count + "</span>"
        : lookbook
          ? ""
          : '<span class="sf-cart-count is-zero">0</span>';
    return (
      '<button type="button" class="sf-icon-btn sf-icon-btn--cart' +
      (lookbook ? " sf-icon-btn--cart-solo" : "") +
      '" data-sf-open-cart aria-label="Koszyk (' +
      count +
      ')"><i class="fas fa-bag-shopping"></i>' +
      badge +
      "</button>"
    );
  }

  function getAllProductImages(product) {
    var images = [];
    if (product.image && safeCssUrl(product.image)) images.push(product.image);
    else if (product.image && String(product.image).indexOf("data:image/") === 0) images.push(product.image);
    (product.gallery || []).forEach(function (url) {
      if (images.indexOf(url) === -1 && (safeCssUrl(url) || String(url).indexOf("data:image/") === 0)) {
        images.push(url);
      }
    });
    return images;
  }

  function isLuxStore(store) {
    if (!store) return false;
    if (store.templateId === "amiq-lux") return true;
    if (store.templateId === "amiq-fashion" || store.templateId === "amiq-tech" || store.templateId === "amiq-enterprise")
      return false;
    if (store.templateId) return false;
    return store.theme === "lux";
  }

  function isLookbookStore(store) {
    if (!store) return false;
    if (store.templateId === "amiq-fashion") return true;
    if (store.templateId === "amiq-tech" || store.templateId === "amiq-lux" || store.templateId === "amiq-enterprise")
      return false;
    if (store.templateId) return false;
    return store.theme === "fashion";
  }

  function isTechStore(store) {
    if (!store) return false;
    if (store.templateId === "amiq-tech") return true;
    if (store.templateId === "amiq-fashion" || store.templateId === "amiq-lux" || store.templateId === "amiq-enterprise")
      return false;
    if (store.templateId) return false;
    return store.theme === "tech";
  }

  function isEnterpriseStore(store) {
    if (!store) return false;
    if (store.templateId === "amiq-enterprise") return true;
    if (store.templateId) return false;
    return store.theme === "enterprise";
  }

  function getStoreVisualTheme(store) {
    if (!store) return "blank";
    if (store.templateId === "amiq-fashion") return "fashion";
    if (store.templateId === "amiq-tech") return "tech";
    if (store.templateId === "amiq-lux") return "lux";
    if (store.templateId === "amiq-enterprise") return "enterprise";
    return store.theme || store.thumb || "blank";
  }

  function defaultSectionVisibility(store) {
    if (isTechStore(store)) {
      return {
        announcement: true,
        hero: true,
        heroStats: true,
        trust: true,
        categories: true,
        deals: true,
        products: true,
        compare: true,
        faq: true,
        brands: true,
        about: true,
        newsletter: true
      };
    }
    if (isLuxStore(store)) {
      return {
        announcement: true,
        hero: true,
        trust: true,
        lookbook: true,
        products: true,
        luxStory: true,
        luxCraft: true,
        luxExperience: true,
        luxPress: true,
        about: true,
        newsletter: true
      };
    }
    if (isLookbookStore(store)) {
      return {
        announcement: true,
        hero: true,
        trust: true,
        lookbook: true,
        products: true,
        about: true,
        newsletter: true
      };
    }
    if (isEnterpriseStore(store)) {
      return {
        announcement: true,
        hero: true,
        heroStats: true,
        trust: true,
        brandHub: true,
        entSolutions: true,
        entSegments: true,
        products: true,
        entCases: true,
        entPartners: true,
        entFaq: true,
        entPortal: true,
        about: true,
        newsletter: true
      };
    }
    return {
      announcement: true,
      hero: true,
      trust: true,
      products: true,
      about: true,
      newsletter: true
    };
  }

  function normalizeSectionVisibility(raw, store) {
    var defaults = defaultSectionVisibility(store || {});
    var vis = raw && typeof raw === "object" ? raw : {};
    var out = {};
    Object.keys(defaults).forEach(function (key) {
      out[key] = vis[key] !== false;
    });
    return out;
  }

  function isSectionEnabled(store, key) {
    var vis = store.sectionVisibility || defaultSectionVisibility(store);
    return vis[key] !== false;
  }

  function storeClassList(store, compact, device) {
    var visualTheme = getStoreVisualTheme(store);
    var list = [
      "sf-store",
      "sf-store--" + escapeHtml(visualTheme),
      "sf-store--" + device,
      "sf-heading--" + escapeHtml(store.headingStyle || "modern"),
      "sf-radius--" + escapeHtml(store.cardRadius || "soft")
    ];
    if (compact) list.push("sf-store--compact");
    if (store.colorMode === "dark") list.push("sf-store--dark");
    if (isLuxStore(store)) list.push("sf-store--luxury");
    if (isLookbookStore(store)) list.push("sf-store--lookbook");
    if (isTechStore(store)) list.push("sf-store--tech-pro");
    if (isEnterpriseStore(store)) list.push("sf-store--enterprise-hub");
    return list.join(" ");
  }

  function storeStyleAttr(store) {
    var parts = [];
    if (store.accentColor) {
      parts.push("--sf-accent:" + store.accentColor);
      parts.push("--sf-accent-soft: color-mix(in srgb, " + store.accentColor + " 16%, transparent)");
    }
    var heroUrl = resolveMediaUrl(
      store.heroImage,
      isLookbookStore(store) ? FASHION_BANNER_DEFAULT : null,
      isLookbookStore(store) && BANNER_PRESETS[1] ? BANNER_PRESETS[1].url : null,
      isTechStore(store) ? TECH_BANNER_DEFAULT : null,
      isTechStore(store) && TECH_BANNER_PRESETS[0] ? TECH_BANNER_PRESETS[0].url : null,
      isLuxStore(store) ? LUX_BANNER_DEFAULT : null,
      isLuxStore(store) ? LUX_BANNER_DEFAULT : null,
      isEnterpriseStore(store) ? ENTERPRISE_BANNER_DEFAULT : null,
      isEnterpriseStore(store) && ENTERPRISE_BANNER_PRESETS[0] ? ENTERPRISE_BANNER_PRESETS[0].url : null
    );
    if (heroUrl) parts.push("--sf-hero-image:url('" + heroUrl + "')");
    parts.push(
      "--sf-hero-overlay:" +
        (store.heroOverlay != null
          ? store.heroOverlay
          : isTechStore(store)
            ? 62
            : isLuxStore(store)
              ? 48
              : isEnterpriseStore(store)
                ? 52
                : 45)
    );
    return parts.length ? ' style="' + parts.join(";") + '"' : "";
  }

  function buildTechHeaderHtml(store, compact, device, searchQuery) {
    var cartBtn = buildCartButtonHtml(store, false);
    var navFull = compact ? "" : '<a href="#o-nas">O nas</a><a href="#kontakt">Kontakt</a>';
    return (
      '<header class="sf-header sf-header--tech">' +
      '<div class="sf-header__brand">' +
      buildLogoHtml(store) +
      "</div>" +
      buildHeaderSearchHtml(store, compact, searchQuery) +
      '<nav class="sf-header__nav sf-header__nav--desktop" aria-label="Nawigacja sklepu">' +
      '<a href="#kategorie">Kategorie</a>' +
      '<a href="#promocje">Promocje</a>' +
      '<a href="#produkty">Produkty</a>' +
      '<a href="#porownaj">Porównaj</a>' +
      '<a href="#faq">FAQ</a>' +
      navFull +
      "</nav>" +
      '<div class="sf-header__actions">' +
      cartBtn +
      '<details class="sf-mobile-menu">' +
      '<summary class="sf-icon-btn sf-mobile-menu__trigger" aria-label="Menu"><i class="fas fa-bars"></i></summary>' +
      '<div class="sf-mobile-menu__panel">' +
      '<nav class="sf-mobile-menu__nav" aria-label="Menu mobilne">' +
      '<a href="#kategorie">Kategorie</a>' +
      '<a href="#promocje">Promocje</a>' +
      '<a href="#produkty">Produkty</a>' +
      '<a href="#porownaj">Porównaj</a>' +
      '<a href="#faq">FAQ</a>' +
      navFull +
      "</nav></div></details></div></header>"
    );
  }

  function buildTechHeroInner(store, statsHtml) {
    return (
      (store.heroBadge ? '<span class="sf-hero__badge sf-hero__badge--tech">' + escapeHtml(store.heroBadge) + "</span>" : "") +
      "<h1>" +
      escapeHtml(store.heroTitle) +
      "</h1>" +
      "<p>" +
      escapeHtml(store.heroSubtitle) +
      "</p>" +
      '<div class="sf-hero__actions sf-hero__actions--tech">' +
      '<a class="sf-hero__cta sf-hero__cta--primary" href="#produkty">' +
      escapeHtml(store.heroCta) +
      '</a><a class="sf-hero__cta sf-hero__cta--ghost" href="#porownaj">Porównaj modele</a></div>' +
      (statsHtml || "")
    );
  }

  function buildTechHeroSection(store, compact) {
    var stats = (store.techHeroStats || []).slice(0, 3);
    var showStats = isSectionEnabled(store, "heroStats");
    var statsHtml =
      showStats && stats.length
        ? '<div class="sf-tech-hero__stats">' +
          stats
            .map(function (s) {
              return "<article><strong>" + escapeHtml(s.value) + "</strong><span>" + escapeHtml(s.label) + "</span></article>";
            })
            .join("") +
          "</div>"
        : "";
    var inner = buildTechHeroInner(store, statsHtml);
    var layout = store.heroLayout === "full" ? "full" : store.heroLayout === "split-wide" ? "split-wide" : "split";
    var visual =
      '<div class="sf-hero--tech__visual' +
      (layout === "split-wide" ? " sf-hero--tech__visual--wide" : "") +
      '" aria-hidden="true"><div class="sf-hero--tech__glow"></div></div>';

    if (layout === "full") {
      return (
        '<section class="sf-hero sf-hero--tech sf-hero--tech-layout-full">' +
        '<div class="sf-hero--tech__banner-bg" aria-hidden="true"></div>' +
        '<div class="sf-hero--tech__banner-content">' +
        inner +
        "</div></section>"
      );
    }

    if (layout === "split-wide") {
      return (
        '<section class="sf-hero sf-hero--tech sf-hero--tech-layout-wide">' +
        '<div class="sf-hero--tech__wide">' +
        '<div class="sf-hero--tech__copy">' +
        inner +
        "</div>" +
        visual +
        "</div></section>"
      );
    }

    return (
      '<section class="sf-hero sf-hero--tech sf-hero--tech-layout-split">' +
      '<div class="sf-hero--tech__grid">' +
      '<div class="sf-hero--tech__copy">' +
      inner +
      "</div>" +
      visual +
      "</div></section>"
    );
  }

  function buildTechTrustBar() {
    return (
      '<section class="sf-tech-trust" aria-label="Zalety sklepu">' +
      '<article><i class="fas fa-bolt"></i><div><strong>Ekspresowa wysyłka</strong><span>Zamów do 15:00 — wyślemy dziś</span></div></article>' +
      '<article><i class="fas fa-shield-halved"></i><div><strong>Gwarancja producenta</strong><span>Oficjalna dystrybucja PL</span></div></article>' +
      '<article><i class="fas fa-headset"></i><div><strong>Eksperckie wsparcie</strong><span>Pomoc przy wyborze sprzętu</span></div></article>' +
      '<article><i class="fas fa-rotate-left"></i><div><strong>30 dni na zwrot</strong><span>Bez stresu, online</span></div></article>' +
      "</section>"
    );
  }

  function buildTechCategoryTiles(store) {
    var cats = (store.techCategories || []).slice(0, 6);
    if (!cats.length) return "";
    var title = store.techCategoriesTitle || "Przeglądaj kategorie";
    var subtitle = store.techCategoriesSubtitle || "";
    return (
      '<section class="sf-tech-categories" id="kategorie">' +
      '<div class="sf-tech-categories__layout">' +
      '<aside class="sf-tech-categories__side">' +
      '<span class="sf-tech-categories__eyebrow"><i class="fas fa-layer-group" aria-hidden="true"></i> Katalog tech</span>' +
      "<h2>" +
      escapeHtml(title) +
      "</h2>" +
      (subtitle ? "<p>" + escapeHtml(subtitle) + "</p>" : "") +
      '<nav class="sf-tech-categories__nav" aria-label="Szybkie kategorie">' +
      "<ul>" +
      cats
        .map(function (cat) {
          return (
            '<li><a href="#produkty"><i class="fas ' +
            escapeHtml(cat.icon) +
            '" aria-hidden="true"></i><span><strong>' +
            escapeHtml(cat.label) +
            "</strong>" +
            (cat.desc ? "<em>" + escapeHtml(cat.desc) + "</em>" : "") +
            "</span></a></li>"
          );
        })
        .join("") +
      "</ul></nav>" +
      '<a class="sf-tech-categories__cta" href="#produkty">Cała oferta <i class="fas fa-arrow-right" aria-hidden="true"></i></a>' +
      "</aside>" +
      '<div class="sf-tech-categories__main">' +
      '<div class="sf-tech-categories__grid">' +
      cats
        .map(function (cat, index) {
          return (
            '<a class="sf-tech-cat-tile" href="#produkty">' +
            '<span class="sf-tech-cat-tile__badge">0' +
            (index + 1) +
            "</span>" +
            '<span class="sf-tech-cat-tile__icon"><i class="fas ' +
            escapeHtml(cat.icon) +
            '" aria-hidden="true"></i></span>' +
            "<div><strong>" +
            escapeHtml(cat.label) +
            "</strong>" +
            (cat.desc ? "<span>" + escapeHtml(cat.desc) + "</span>" : "") +
            "</div>" +
            '<i class="fas fa-arrow-right sf-tech-cat-tile__arrow" aria-hidden="true"></i></a>'
          );
        })
        .join("") +
      "</div></div></div></section>"
    );
  }

  function buildLuxHeaderHtml(store, compact) {
    var cartBtn = buildCartButtonHtml(store, true);
    return (
      '<header class="sf-header sf-header--lux">' +
      '<div class="sf-header__brand">' +
      buildLogoHtml(store) +
      "</div>" +
      (compact
        ? ""
        : '<nav class="sf-header__nav sf-header__nav--desktop" aria-label="Nawigacja">' +
          '<a href="#kolekcje">Kolekcje</a>' +
          '<a href="#produkty">Produkty</a>' +
          '<a href="#atelier">Atelier</a>' +
          '<a href="#maison">Maison</a>' +
          '<a href="#kontakt">Kontakt</a>' +
          "</nav>") +
      '<div class="sf-header__actions">' +
      cartBtn +
      '<details class="sf-mobile-menu">' +
      '<summary class="sf-icon-btn sf-mobile-menu__trigger" aria-label="Menu"><i class="fas fa-bars"></i></summary>' +
      '<div class="sf-mobile-menu__panel">' +
      '<nav class="sf-mobile-menu__nav" aria-label="Menu mobilne">' +
      '<a href="#kolekcje">Kolekcje</a><a href="#produkty">Produkty</a><a href="#atelier">Atelier</a><a href="#maison">Maison</a><a href="#kontakt">Kontakt</a>' +
      "</nav></div></details></div></header>"
    );
  }

  function buildLuxHeroSection(store) {
    return (
      '<section class="sf-lux-hero" id="hero">' +
      '<div class="sf-lux-hero__media" aria-hidden="true"></div>' +
      '<div class="sf-lux-hero__veil" aria-hidden="true"></div>' +
      '<div class="sf-lux-hero__content">' +
      (store.heroBadge
        ? '<span class="sf-lux-hero__badge">' + escapeHtml(store.heroBadge) + "</span>"
        : "") +
      "<h1>" +
      escapeHtml(store.heroTitle) +
      "</h1>" +
      "<p>" +
      escapeHtml(store.heroSubtitle) +
      "</p>" +
      '<div class="sf-lux-hero__actions">' +
      '<a class="sf-lux-btn sf-lux-btn--gold" href="#produkty">' +
      escapeHtml(store.heroCta) +
      '</a><a class="sf-lux-btn sf-lux-btn--line" href="#kolekcje">Kolekcje sezonowe</a></div>' +
      '<span class="sf-lux-hero__scroll"><i class="fas fa-chevron-down" aria-hidden="true"></i> Odkryj</span></div></section>'
    );
  }

  function buildLuxMaisonBar() {
    return (
      '<section class="sf-lux-maison" aria-label="Obietnice marki">' +
      '<article><i class="fas fa-truck"></i><div><strong>White-glove delivery</strong><span>Dostawa premium w 24–48 h</span></div></article>' +
      '<article><i class="fas fa-shield-halved"></i><div><strong>Gwarancja autentyczności</strong><span>Certyfikat i numer seryjny</span></div></article>' +
      '<article><i class="fas fa-gift"></i><div><strong>Opakowanie archivalne</strong><span>Idealne na prezent</span></div></article>' +
      '<article><i class="fas fa-concierge-bell"></i><div><strong>Concierge 7 dni</strong><span>Stylistka na telefonie</span></div></article>' +
      "</section>"
    );
  }

  function buildLuxEditorialCollections(store) {
    var cols = (store.collections || []).slice(0, 3);
    if (!cols.length) return "";
    return (
      '<section class="sf-lux-collections" id="kolekcje">' +
      '<div class="sf-lux-section-head">' +
      '<span class="sf-lux-eyebrow">Sezon SS26</span>' +
      "<h2>" +
      escapeHtml(store.lookbookTitle) +
      "</h2><p>" +
      escapeHtml(store.lookbookSubtitle) +
      "</p></div>" +
      '<div class="sf-lux-collections__stack">' +
      cols
        .map(function (col, index) {
          var img = resolveMediaUrl(
            col.image,
            LUX_COLLECTION_PRESETS[index] || LUX_BANNER_DEFAULT,
            LUX_BANNER_DEFAULT,
            LUX_COLLECTION_PRESETS[0],
            LUX_COLLECTION_PRESETS[1]
          );
          var reverse = index % 2 === 1 ? " sf-lux-collection--reverse" : "";
          return (
            '<article class="sf-lux-collection' +
            reverse +
            '">' +
            '<div class="sf-lux-collection__media" style="background-image:url(\'' +
            img +
            "')\"></div>" +
            '<div class="sf-lux-collection__copy">' +
            '<span class="sf-lux-collection__num">0' +
            (index + 1) +
            "</span>" +
            "<h3>" +
            escapeHtml(col.title) +
            "</h3><p>" +
            escapeHtml(col.subtitle) +
            '</p><a href="#produkty" class="sf-lux-link">Odkryj kolekcję <i class="fas fa-arrow-right"></i></a></div></article>'
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function buildLuxProductCards(products, store, compact) {
    var list = products.slice(0, compact ? 4 : 6);
    if (!list.length) {
      return (
        '<div class="sf-products__empty sf-products__empty--lux">' +
        "<strong>Brak produktów w ofercie</strong>" +
        "<span>Dodaj aktywne produkty w panelu.</span></div>"
      );
    }
    return (
      '<div class="sf-lux-products__grid">' +
      list
        .map(function (p) {
          var imgUrl = safeCssUrl(p.image);
          var mediaStyle = imgUrl ? ' style="background-image:url(\'' + imgUrl + "')\"" : "";
          var compare =
            p.comparePrice && p.comparePrice > p.price
              ? '<span class="sf-lux-product__compare">' + escapeHtml(formatPrice(p.comparePrice)) + "</span>"
              : "";
          return (
            '<a class="sf-lux-product" href="#/produkt/' +
            encodeURIComponent(p.id) +
            '" data-sf-open-product="' +
            escapeHtml(p.id) +
            '">' +
            '<div class="sf-lux-product__media"' +
            mediaStyle +
            ">" +
            (p.tag ? '<span class="sf-lux-product__tag">' + escapeHtml(p.tag) + "</span>" : "") +
            "</div>" +
            '<div class="sf-lux-product__body">' +
            "<h3>" +
            escapeHtml(p.name) +
            "</h3>" +
            (p.desc ? "<p>" + escapeHtml(p.desc) + "</p>" : "") +
            '<div class="sf-lux-product__foot">' +
            compare +
            '<span class="sf-lux-product__price">' +
            escapeHtml(formatPrice(p.price)) +
            "</span></div></div></a>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function buildLuxStorySection(store) {
    var img = resolveMediaUrl(store.luxStoryImage, LUX_BANNER_DEFAULT, LUX_BANNER_DEFAULT, null, null);
    return (
      '<section class="sf-lux-story" id="atelier">' +
      '<div class="sf-lux-story__media" style="background-image:url(\'' +
      img +
      "')\"></div>" +
      '<div class="sf-lux-story__copy">' +
      '<span class="sf-lux-eyebrow">Atelier</span>' +
      "<h2>" +
      escapeHtml(store.luxStoryTitle) +
      "</h2><p>" +
      escapeHtml(store.luxStoryText) +
      '</p><a href="#maison" class="sf-lux-link">Poznaj historię marki <i class="fas fa-arrow-right"></i></a></div></section>'
    );
  }

  function buildLuxPillarsSection(store) {
    var pillars = store.luxPillars || [];
    return (
      '<section class="sf-lux-craft" aria-label="Rzemiosło">' +
      '<div class="sf-lux-section-head sf-lux-section-head--center">' +
      '<span class="sf-lux-eyebrow">Savoir-faire</span>' +
      "<h2>Sztuka detalu</h2>" +
      "<p>Każdy produkt przechodzi przez ręce mistrzów rzemiosła — od projektu po finalną inspekcję.</p></div>" +
      '<div class="sf-lux-craft__grid">' +
      pillars
        .map(function (p) {
          return (
            '<article class="sf-lux-craft__card">' +
            '<span class="sf-lux-craft__icon"><i class="fas ' +
            escapeHtml(p.icon) +
            '" aria-hidden="true"></i></span>' +
            "<h3>" +
            escapeHtml(p.title) +
            "</h3><p>" +
            escapeHtml(p.desc) +
            "</p></article>"
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function buildLuxExperienceSection(store) {
    return (
      '<section class="sf-lux-experience">' +
      '<div class="sf-lux-experience__inner">' +
      '<span class="sf-lux-eyebrow">Concierge</span>' +
      "<h2>" +
      escapeHtml(store.luxExperienceTitle) +
      "</h2><p>" +
      escapeHtml(store.luxExperienceText) +
      '</p><a href="#kontakt" class="sf-lux-btn sf-lux-btn--gold">' +
      escapeHtml(store.luxExperienceCta) +
      "</a></div></section>"
    );
  }

  function buildLuxPressStrip(store) {
    var items = store.luxPress || [];
    return (
      '<section class="sf-lux-press" aria-label="Prasa">' +
      '<div class="sf-lux-press__track">' +
      items
        .map(function (p) {
          return (
            '<blockquote class="sf-lux-press__item"><p>' +
            escapeHtml(p.quote) +
            '</p><cite>— ' +
            escapeHtml(p.source) +
            "</cite></blockquote>"
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function buildLuxConciergeNewsletter(store) {
    return (
      '<section class="sf-lux-concierge" id="kontakt">' +
      '<div class="sf-lux-concierge__copy">' +
      "<h2>" +
      escapeHtml(store.newsletterTitle) +
      "</h2><p>" +
      escapeHtml(store.newsletterSubtitle) +
      '</p></div><form class="sf-lux-concierge__form" onsubmit="return false">' +
      '<input type="email" placeholder="Adres e-mail" disabled aria-label="E-mail">' +
      '<button type="button" disabled>Dołącz do listy VIP</button></form></section>'
    );
  }

  function buildLuxAboutSection(store, productCount) {
    return (
      '<section class="sf-lux-maison-block" id="maison">' +
      '<div class="sf-lux-maison-block__copy">' +
      '<span class="sf-lux-eyebrow">La Maison</span>' +
      "<h2>" +
      escapeHtml(store.aboutTitle) +
      "</h2><p>" +
      escapeHtml(store.aboutText) +
      "</p></div>" +
      '<div class="sf-lux-maison-block__stats">' +
      "<article><strong>" +
      productCount +
      "</strong><span>Kuratorskich produktów</span></article>" +
      '<article><strong>1987</strong><span>Rok założenia</span></article>' +
      '<article><strong>12</strong><span>Krajów dostawy</span></article>' +
      '<article><strong>4.9</strong><span>Ocena klientów VIP</span></article></div></section>'
    );
  }

  function buildLuxFooter(store) {
    return (
      '<footer class="sf-footer sf-footer--lux">' +
      '<div class="sf-footer--lux__grid">' +
      "<div><strong>" +
      escapeHtml(store.storeName) +
      "</strong><p>Butik premium · rzemiosło · autentyczność</p></div>" +
      "<div><span>Sklep</span><a href=\"#produkty\">Produkty</a><a href=\"#kolekcje\">Kolekcje</a><a href=\"#atelier\">Atelier</a></div>" +
      "<div><span>Obsługa</span><a href=\"#kontakt\">Concierge</a><a href=\"#maison\">O marce</a><a href=\"#\">Dostawa & zwroty</a></div>" +
      "<div><span>Kontakt</span><span>concierge@" +
      escapeHtml(store.slug || "maison") +
      ".amiqplace.pl</span><span>Warszawa · Mediolan</span></div></div>" +
      '<div class="sf-footer--lux__bottom"><span>© ' +
      new Date().getFullYear() +
      " " +
      escapeHtml(store.storeName) +
      '</span><span>Powered by AmiQPlace</span></div></footer>'
    );
  }

  function buildTechDealsSection(store) {
    var cols = (store.collections || []).slice(0, 3);
    if (!cols.length) return "";
    return (
      '<section class="sf-tech-deals" id="promocje">' +
      '<div class="sf-section-head">' +
      "<h2>" +
      escapeHtml(store.lookbookTitle || "Promocje tygodnia") +
      "</h2><p>" +
      escapeHtml(store.lookbookSubtitle || "Wybrane okazje z aktualnej oferty.") +
      "</p></div>" +
      '<div class="sf-tech-deals__grid">' +
      cols
        .map(function (col, index) {
          var img =
            safeCssUrl(col.image) ||
            safeCssUrl(TECH_BANNER_PRESETS[index] ? TECH_BANNER_PRESETS[index].url : TECH_BANNER_DEFAULT);
          var colProducts = getProductsForCollection(store, col);
          var priceHint = colProducts.length
            ? "od " + escapeHtml(formatPrice(Math.min.apply(null, colProducts.map(function (p) { return p.price; }))))
            : "";
          return (
            '<article class="sf-tech-deal">' +
            '<div class="sf-tech-deal__media" style="background-image:url(\'' +
            img +
            "')\"></div>" +
            '<div class="sf-tech-deal__body">' +
            '<span class="sf-tech-deal__tag">Deal #' +
            (index + 1) +
            "</span>" +
            "<h3>" +
            escapeHtml(col.title) +
            "</h3>" +
            "<p>" +
            escapeHtml(col.subtitle) +
            "</p>" +
            (priceHint ? '<span class="sf-tech-deal__price">' + priceHint + "</span>" : "") +
            '<a href="#produkty" class="sf-tech-deal__link">Zobacz ofertę <i class="fas fa-arrow-right"></i></a></div></article>'
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function buildTechProductCards(products, store, compact) {
    var limit = compact ? 4 : 12;
    var list = products.slice(0, limit);
    if (!list.length) {
      return (
        '<div class="sf-products__empty">' +
        "<strong>Brak produktów w ofercie</strong>" +
        "<span>Dodaj aktywne produkty w panelu — pojawią się tutaj automatycznie.</span></div>"
      );
    }
    return (
      '<div class="sf-products__grid sf-products__grid--tech">' +
      list
        .map(function (p) {
          var imgUrl = safeCssUrl(p.image);
          var mediaStyle = imgUrl ? ' style="background-image:url(\'' + imgUrl + "')\"" : "";
          var catLabel = p.categoryId ? getProductCategoryLabel(store.storeCategory, p.categoryId) : "";
          var specs = productHasVisibleSpecs(p) ? (p.specs || []).slice(0, 2) : [];
          var specsHtml = specs.length
            ? '<ul class="sf-tech-card__specs">' +
              specs
                .map(function (s) {
                  return "<li><span>" + escapeHtml(s.label) + "</span><strong>" + escapeHtml(s.value) + "</strong></li>";
                })
                .join("") +
              "</ul>"
            : "";
          var ratingHtml =
            p.rating != null
              ? '<span class="sf-tech-card__rating"><i class="fas fa-star" aria-hidden="true"></i> ' +
                escapeHtml(String(p.rating)) +
                "</span>"
              : "";
          return (
            '<a class="sf-product-card sf-product-card--tech sf-product-card--link" href="#/produkt/' +
            encodeURIComponent(p.id) +
            '" data-sf-open-product="' +
            escapeHtml(p.id) +
            '">' +
            '<div class="sf-product-card__media sf-product-card__media--photo"' +
            mediaStyle +
            ">" +
            (p.tag ? '<span class="sf-product-card__tag">' + escapeHtml(p.tag) + "</span>" : "") +
            "</div>" +
            '<div class="sf-product-card__body">' +
            (catLabel ? '<span class="sf-product-card__category">' + escapeHtml(catLabel) + "</span>" : "") +
            "<h3>" +
            escapeHtml(p.name) +
            "</h3>" +
            (p.desc ? "<p>" + escapeHtml(p.desc) + "</p>" : "") +
            specsHtml +
            '<div class="sf-product-card__foot">' +
            '<span class="sf-product-card__price">' +
            escapeHtml(formatPrice(p.price)) +
            "</span>" +
            ratingHtml +
            '<span class="sf-product-card__cta">Szczegóły</span></div></div></a>'
          );
        })
        .join("") +
      "</div>"
    );
  }

  function buildTechCompareSection(store) {
    var compare = store.techCompare || { productIds: [], specKeys: [] };
    var ids = compare.productIds || [];
    var products = ids
      .map(function (pid) {
        return getProductById(store, pid);
      })
      .filter(Boolean);
    if (products.length < 2) return "";
    var specKeys = compare.specKeys && compare.specKeys.length ? compare.specKeys : [];
    if (!specKeys.length) {
      products.forEach(function (p) {
        (p.specs || []).forEach(function (s) {
          if (specKeys.indexOf(s.label) === -1) specKeys.push(s.label);
        });
      });
      specKeys = specKeys.slice(0, 6);
    }
    return (
      '<section class="sf-tech-compare" id="porownaj">' +
      '<div class="sf-section-head sf-section-head--center">' +
      "<h2>" +
      escapeHtml(store.techCompareTitle || "Porównaj modele") +
      "</h2><p>" +
      escapeHtml(store.techCompareSubtitle || "") +
      "</p></div>" +
      '<div class="sf-tech-compare__wrap">' +
      '<table class="sf-tech-compare__table"><thead><tr><th scope="col">Parametr</th>' +
      products
        .map(function (p) {
          return (
            '<th scope="col"><a href="#/produkt/' +
            encodeURIComponent(p.id) +
            '" data-sf-open-product="' +
            escapeHtml(p.id) +
            '">' +
            escapeHtml(p.name) +
            "</a></th>"
          );
        })
        .join("") +
      "</tr></thead><tbody>" +
      '<tr><th scope="row">Cena</th>' +
      products
        .map(function (p) {
          return "<td>" + escapeHtml(formatPrice(p.price)) + "</td>";
        })
        .join("") +
      "</tr>" +
      specKeys
        .map(function (key) {
          return (
            "<tr><th scope=\"row\">" +
            escapeHtml(key) +
            "</th>" +
            products
              .map(function (p) {
                var spec = (p.specs || []).find(function (s) {
                  return s.label === key;
                });
                return "<td>" + escapeHtml(spec ? spec.value : "—") + "</td>";
              })
              .join("") +
            "</tr>"
          );
        })
        .join("") +
      "</tbody></table></div></section>"
    );
  }

  function buildTechFaqSection(store) {
    var faqs = (store.techFaqs || []).slice(0, 8);
    if (!faqs.length) return "";
    return (
      '<section class="sf-tech-faq" id="faq">' +
      '<div class="sf-section-head">' +
      "<h2>" +
      escapeHtml(store.techFaqTitle || "FAQ") +
      "</h2><p>" +
      escapeHtml(store.techFaqSubtitle || "") +
      "</p></div>" +
      '<div class="sf-tech-faq__list">' +
      faqs
        .map(function (f, i) {
          return (
            '<article class="sf-tech-faq__item' +
            (i === 0 ? " is-open" : "") +
            '">' +
            '<button type="button" class="sf-tech-faq__q" data-sf-tech-faq-toggle aria-expanded="' +
            (i === 0 ? "true" : "false") +
            '">' +
            escapeHtml(f.q) +
            '<i class="fas fa-chevron-down" aria-hidden="true"></i></button>' +
            '<div class="sf-tech-faq__a"><p>' +
            escapeHtml(f.a) +
            "</p></div></article>"
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function buildTechBrandsStrip(store) {
    var brands = (store.techBrands || []).slice(0, 8);
    if (!brands.length) return "";
    return (
      '<section class="sf-tech-brands" aria-label="Marki w ofercie">' +
      '<p class="sf-tech-brands__label">' +
      escapeHtml(store.techBrandsLabel || "Autoryzowani partnerzy") +
      "</p>" +
      '<div class="sf-tech-brands__row">' +
      brands
        .map(function (name) {
          return '<span class="sf-tech-brands__chip">' + escapeHtml(name) + "</span>";
        })
        .join("") +
      "</div></section>"
    );
  }

  function buildEnterpriseHeaderHtml(store, compact, device, searchQuery) {
    var cartBtn = buildCartButtonHtml(store, false);
    var navFull = compact ? "" : '<a href="#o-nas">O nas</a><a href="#kontakt">Kontakt</a>';
    return (
      '<header class="sf-header sf-header--enterprise">' +
      '<div class="sf-header__brand">' +
      buildLogoHtml(store) +
      "</div>" +
      buildHeaderSearchHtml(store, compact, searchQuery) +
      '<nav class="sf-header__nav sf-header__nav--desktop" aria-label="Nawigacja sklepu">' +
      '<a href="#marki">Marki</a>' +
      '<a href="#rozwiazania">Rozwiązania</a>' +
      '<a href="#produkty">Katalog</a>' +
      '<a href="#case-studies">Case studies</a>' +
      '<a href="#b2b">Portal B2B</a>' +
      navFull +
      "</nav>" +
      '<div class="sf-header__actions">' +
      cartBtn +
      '<details class="sf-mobile-menu">' +
      '<summary class="sf-icon-btn sf-mobile-menu__trigger" aria-label="Menu"><i class="fas fa-bars"></i></summary>' +
      '<div class="sf-mobile-menu__panel">' +
      '<nav class="sf-mobile-menu__nav" aria-label="Menu mobilne">' +
      '<a href="#marki">Marki</a>' +
      '<a href="#rozwiazania">Rozwiązania</a>' +
      '<a href="#produkty">Katalog</a>' +
      '<a href="#case-studies">Case studies</a>' +
      '<a href="#b2b">Portal B2B</a>' +
      navFull +
      "</nav></div></details></div></header>"
    );
  }

  function buildEnterpriseHeroSection(store, compact) {
    var stats = (store.enterpriseHeroStats || []).slice(0, 3);
    var showStats = isSectionEnabled(store, "heroStats");
    var statsHtml =
      showStats && stats.length
        ? '<div class="sf-ent-hero__stats">' +
          stats
            .map(function (s) {
              return "<article><strong>" + escapeHtml(s.value) + "</strong><span>" + escapeHtml(s.label) + "</span></article>";
            })
            .join("") +
          "</div>"
        : "";
    return (
      '<section class="sf-hero sf-hero--enterprise">' +
      '<div class="sf-hero--enterprise__grid">' +
      '<div class="sf-hero--enterprise__copy">' +
      (store.heroBadge ? '<span class="sf-hero__badge sf-hero__badge--enterprise">' + escapeHtml(store.heroBadge) + "</span>" : "") +
      "<h1>" +
      escapeHtml(store.heroTitle) +
      "</h1>" +
      "<p>" +
      escapeHtml(store.heroSubtitle) +
      "</p>" +
      '<div class="sf-hero__actions sf-hero__actions--enterprise">' +
      '<a class="sf-hero__cta sf-hero__cta--primary" href="#marki">' +
      escapeHtml(store.heroCta) +
      '</a><a class="sf-hero__cta sf-hero__cta--ghost" href="#b2b">Portal B2B</a></div>' +
      statsHtml +
      "</div>" +
      '<div class="sf-hero--enterprise__visual" aria-hidden="true">' +
      '<div class="sf-hero--enterprise__dash">' +
      '<div class="sf-hero--enterprise__dash-head"><span></span><span></span><span></span></div>' +
      '<div class="sf-hero--enterprise__dash-body">' +
      '<div class="sf-hero--enterprise__dash-bar"></div>' +
      '<div class="sf-hero--enterprise__dash-grid">' +
      "<span></span><span></span><span></span><span></span>" +
      "</div></div></div></div></div></section>"
    );
  }

  function buildEnterpriseTrustBar() {
    return (
      '<section class="sf-ent-trust" aria-label="Zalety platformy">' +
      '<article><i class="fas fa-sitemap"></i><div><strong>Multi-brand w jednym panelu</strong><span>Osobne katalogi i branding per marka</span></div></article>' +
      '<article><i class="fas fa-handshake"></i><div><strong>Segmentacja B2B</strong><span>Cenniki hurtowe i widoczność per grupa</span></div></article>' +
      '<article><i class="fas fa-chart-pie"></i><div><strong>Raporty cross-brand</strong><span>Marża, rotacja i konwersja w czasie rzeczywistym</span></div></article>' +
      '<article><i class="fas fa-plug"></i><div><strong>Integracje ERP/CRM</strong><span>BaseLinker, Fakturownia i API webhooks</span></div></article>' +
      "</section>"
    );
  }

  function buildEnterpriseBrandHub(store) {
    var brands = (store.enterpriseBrands || []).slice(0, 6);
    if (!brands.length) return "";
    return (
      '<section class="sf-ent-brands" id="marki">' +
      '<div class="sf-section-head sf-section-head--center sf-ent-section-head">' +
      '<span class="sf-ent-eyebrow">Portfolio</span>' +
      "<h2>" +
      escapeHtml(store.enterpriseBrandsTitle) +
      "</h2><p>" +
      escapeHtml(store.enterpriseBrandsSubtitle) +
      "</p></div>" +
      '<div class="sf-ent-brands__grid">' +
      brands
        .map(function (b) {
          var img = safeCssUrl(b.image);
          var style = img ? ' style="background-image:url(\'' + img + "')\"" : "";
          return (
            '<article class="sf-ent-brand-card">' +
            '<div class="sf-ent-brand-card__media"' +
            style +
            "></div>" +
            '<div class="sf-ent-brand-card__body">' +
            (b.category ? '<span class="sf-ent-brand-card__cat">' + escapeHtml(b.category) + "</span>" : "") +
            "<h3>" +
            escapeHtml(b.name) +
            "</h3>" +
            (b.tagline ? "<p>" + escapeHtml(b.tagline) + "</p>" : "") +
            (b.productCount
              ? '<span class="sf-ent-brand-card__count"><i class="fas fa-box-open" aria-hidden="true"></i> ' +
                escapeHtml(b.productCount) +
                " SKU</span>"
              : "") +
            '<a href="#produkty" class="sf-ent-brand-card__link">Przeglądaj katalog <i class="fas fa-arrow-right" aria-hidden="true"></i></a>' +
            "</div></article>"
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function buildEnterpriseSolutionsSection(store) {
    var items = (store.enterpriseSolutions || []).slice(0, 4);
    if (!items.length) return "";
    return (
      '<section class="sf-ent-solutions" id="rozwiazania">' +
      '<div class="sf-ent-solutions__layout">' +
      '<div class="sf-ent-solutions__intro">' +
      '<span class="sf-ent-eyebrow">Platforma</span>' +
      "<h2>" +
      escapeHtml(store.enterpriseSolutionsTitle) +
      "</h2><p>" +
      escapeHtml(store.enterpriseSolutionsSubtitle) +
      "</p></div>" +
      '<div class="sf-ent-solutions__grid">' +
      items
        .map(function (s) {
          return (
            '<article class="sf-ent-solution-card">' +
            '<span class="sf-ent-solution-card__icon"><i class="fas ' +
            escapeHtml(s.icon) +
            '" aria-hidden="true"></i></span>' +
            "<h3>" +
            escapeHtml(s.title) +
            "</h3><p>" +
            escapeHtml(s.desc) +
            "</p></article>"
          );
        })
        .join("") +
      "</div></div></section>"
    );
  }

  function buildEnterpriseSegmentsSection(store) {
    var segments = (store.enterpriseSegments || []).slice(0, 4);
    if (!segments.length) return "";
    return (
      '<section class="sf-ent-segments">' +
      '<div class="sf-section-head sf-section-head--center sf-ent-section-head">' +
      '<span class="sf-ent-eyebrow">Segmentacja</span>' +
      "<h2>" +
      escapeHtml(store.enterpriseSegmentsTitle) +
      "</h2><p>" +
      escapeHtml(store.enterpriseSegmentsSubtitle) +
      "</p></div>" +
      '<div class="sf-ent-segments__row">' +
      segments
        .map(function (s) {
          return (
            '<article class="sf-ent-segment-card">' +
            '<i class="fas ' +
            escapeHtml(s.icon) +
            '" aria-hidden="true"></i>' +
            "<h3>" +
            escapeHtml(s.title) +
            "</h3>" +
            (s.subtitle ? "<p>" + escapeHtml(s.subtitle) + "</p>" : "") +
            "</article>"
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function buildEnterpriseProductCards(products, store, compact) {
    var limit = compact ? 4 : 8;
    var list = products.slice(0, limit);
    if (!list.length) {
      return (
        '<div class="sf-products__empty">' +
        "<strong>Brak produktów w katalogu</strong>" +
        "<span>Dodaj produkty w panelu — pojawią się z etykietą marki.</span></div>"
      );
    }
    return (
      '<div class="sf-products__grid sf-products__grid--enterprise">' +
      list
        .map(function (p) {
          var imgUrl = safeCssUrl(p.image);
          var mediaStyle = imgUrl ? ' style="background-image:url(\'' + imgUrl + "')\"" : "";
          var brand = p.brandLabel ? '<span class="sf-ent-card__brand">' + escapeHtml(p.brandLabel) + "</span>" : "";
          return (
            '<a class="sf-product-card sf-product-card--enterprise sf-product-card--link" href="#/produkt/' +
            encodeURIComponent(p.id) +
            '" data-sf-open-product="' +
            escapeHtml(p.id) +
            '">' +
            '<div class="sf-product-card__media sf-product-card__media--photo"' +
            mediaStyle +
            ">" +
            brand +
            (p.tag ? '<span class="sf-product-card__tag">' + escapeHtml(p.tag) + "</span>" : "") +
            "</div>" +
            '<div class="sf-product-card__body">' +
            "<h3>" +
            escapeHtml(p.name) +
            "</h3>" +
            (p.desc ? "<p>" + escapeHtml(p.desc) + "</p>" : "") +
            '<div class="sf-product-card__foot">' +
            "<strong>" +
            formatPrice(p.price) +
            "</strong>" +
            '<span class="sf-ent-card__sku">SKU · ' +
            escapeHtml(String(p.stock || 0)) +
            " szt.</span></div></div></a>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function buildEnterpriseCaseStudies(store) {
    var cases = (store.enterpriseCaseStudies || []).slice(0, 3);
    if (!cases.length) return "";
    return (
      '<section class="sf-ent-cases" id="case-studies">' +
      '<div class="sf-section-head sf-section-head--center sf-ent-section-head">' +
      '<span class="sf-ent-eyebrow">Case studies</span>' +
      "<h2>" +
      escapeHtml(store.enterpriseCasesTitle) +
      "</h2><p>" +
      escapeHtml(store.enterpriseCasesSubtitle) +
      "</p></div>" +
      '<div class="sf-ent-cases__grid">' +
      cases
        .map(function (c) {
          var img = safeCssUrl(c.image);
          var style = img ? ' style="background-image:url(\'' + img + "')\"" : "";
          return (
            '<article class="sf-ent-case-card">' +
            '<div class="sf-ent-case-card__media"' +
            style +
            "></div>" +
            '<div class="sf-ent-case-card__body">' +
            (c.brand ? '<span class="sf-ent-case-card__brand">' + escapeHtml(c.brand) + "</span>" : "") +
            "<h3>" +
            escapeHtml(c.title) +
            "</h3>" +
            (c.quote ? '<blockquote>"' + escapeHtml(c.quote) + '"</blockquote>' : "") +
            (c.metric
              ? '<div class="sf-ent-case-card__metric"><strong>' +
                escapeHtml(c.metric) +
                "</strong><span>" +
                escapeHtml(c.metricLabel || "") +
                "</span></div>"
              : "") +
            "</div></article>"
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function buildEnterprisePartnersStrip(store) {
    var partners = (store.enterprisePartners || []).slice(0, 8);
    if (!partners.length) return "";
    return (
      '<section class="sf-ent-partners" aria-label="Partnerzy">' +
      '<p class="sf-ent-partners__label">' +
      escapeHtml(store.enterprisePartnersLabel || "Ekosystem partnerów") +
      "</p>" +
      '<div class="sf-ent-partners__row">' +
      partners
        .map(function (name) {
          return '<span class="sf-ent-partners__chip">' + escapeHtml(name) + "</span>";
        })
        .join("") +
      "</div></section>"
    );
  }

  function buildEnterpriseFaqSection(store) {
    var faqs = (store.enterpriseFaqs || []).slice(0, 6);
    if (!faqs.length) return "";
    return (
      '<section class="sf-ent-faq" id="faq">' +
      '<div class="sf-ent-faq__layout">' +
      '<div class="sf-ent-faq__intro">' +
      '<span class="sf-ent-eyebrow">FAQ B2B</span>' +
      "<h2>" +
      escapeHtml(store.enterpriseFaqTitle) +
      "</h2><p>" +
      escapeHtml(store.enterpriseFaqSubtitle) +
      "</p></div>" +
      '<div class="sf-ent-faq__list">' +
      faqs
        .map(function (f, i) {
          return (
            '<article class="sf-ent-faq__item' +
            (i === 0 ? " is-open" : "") +
            '">' +
            '<button type="button" class="sf-ent-faq__q" data-sf-ent-faq-toggle aria-expanded="' +
            (i === 0 ? "true" : "false") +
            '">' +
            escapeHtml(f.q) +
            '<i class="fas fa-chevron-down" aria-hidden="true"></i></button>' +
            '<div class="sf-ent-faq__a"><p>' +
            escapeHtml(f.a) +
            "</p></div></article>"
          );
        })
        .join("") +
      "</div></div></section>"
    );
  }

  function buildEnterprisePortalBand(store) {
    return (
      '<section class="sf-ent-portal" id="b2b">' +
      '<div class="sf-ent-portal__inner">' +
      '<div class="sf-ent-portal__copy">' +
      '<span class="sf-ent-eyebrow sf-ent-eyebrow--light">B2B</span>' +
      "<h2>" +
      escapeHtml(store.enterprisePortalTitle) +
      "</h2><p>" +
      escapeHtml(store.enterprisePortalSubtitle) +
      "</p></div>" +
      '<div class="sf-ent-portal__actions">' +
      '<a class="sf-ent-portal__cta" href="#kontakt">' +
      escapeHtml(store.enterprisePortalCta) +
      '</a><span class="sf-ent-portal__note"><i class="fas fa-lock" aria-hidden="true"></i> Dostęp po weryfikacji NIP</span>' +
      "</div></div></section>"
    );
  }

  function buildEnterpriseAboutSection(store, productCount) {
    return (
      '<section class="sf-about sf-about--enterprise" id="o-nas">' +
      '<div class="sf-about__card sf-about__card--enterprise">' +
      '<span class="sf-ent-eyebrow">O platformie</span>' +
      "<h2>" +
      escapeHtml(store.aboutTitle) +
      "</h2><p>" +
      escapeHtml(store.aboutText) +
      "</p></div>" +
      '<div class="sf-about__stats sf-about__stats--enterprise">' +
      "<article><strong>" +
      (store.enterpriseBrands || []).length +
      "</strong><span>Marek w hubie</span></article>" +
      "<article><strong>" +
      productCount +
      "+</strong><span>Produktów łącznie</span></article>" +
      '<article><strong>99.9%</strong><span>Uptime platformy</span></article>' +
      "</div></section>"
    );
  }

  function buildEnterpriseNewsletter(store) {
    return (
      '<section class="sf-newsletter sf-newsletter--enterprise" id="kontakt">' +
      "<div><span class=\"sf-ent-eyebrow\">Newsletter B2B</span><h2>" +
      escapeHtml(store.newsletterTitle) +
      "</h2><p>" +
      escapeHtml(store.newsletterSubtitle) +
      "</p></div>" +
      '<form class="sf-newsletter__form sf-newsletter__form--enterprise" onsubmit="return false">' +
      '<input type="email" placeholder="E-mail służbowy" disabled>' +
      '<button type="button" disabled>Dołącz do listy</button></form></section>'
    );
  }

  function buildEnterpriseFooter(store) {
    return (
      '<footer class="sf-footer sf-footer--enterprise">' +
      '<div class="sf-footer--enterprise__grid">' +
      "<div><strong>" +
      escapeHtml(store.storeName) +
      "</strong><span>Multi-brand commerce platform</span></div>" +
      '<div class="sf-footer--enterprise__links">' +
      '<a href="#marki">Marki</a><a href="#rozwiazania">Rozwiązania</a><a href="#produkty">Katalog</a><a href="#b2b">Portal B2B</a>' +
      "</div></div>" +
      "<span>© " +
      new Date().getFullYear() +
      " · Powered by AmiQPlace · " +
      escapeHtml(store.slug) +
      ".amiqplace.pl</span></footer>"
    );
  }

  function getProjects() {
    try {
      var raw = readStorageItem(STORAGE_PROJECTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function getProjectById(id) {
    return (
      getProjects().find(function (p) {
        return p.id === id;
      }) || null
    );
  }

  function getActiveProject() {
    try {
      var id = readStorageItem(STORAGE_ACTIVE);
      return id ? getProjectById(id) : null;
    } catch (e) {
      return null;
    }
  }

  function getPreviewSnapshot() {
    try {
      var raw = readStorageItem(STORAGE_PREVIEW_SNAPSHOT);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function savePreviewSnapshot(project) {
    if (!project) return;
    writeStorageItem(STORAGE_PREVIEW_SNAPSHOT, JSON.stringify(project));
  }

  function resolveProject(id) {
    if (id) {
      var fromList = normalizeStore(getProjectById(id));
      if (fromList) return fromList;
      var snap = getPreviewSnapshot();
      if (snap && snap.id === id) return normalizeStore(snap);
      return null;
    }
    return normalizeStore(getActiveProject()) || normalizeStore(getPreviewSnapshot());
  }

  function isDesktopViewport() {
    return global.matchMedia("(min-width: " + DESKTOP_MIN_WIDTH + "px)").matches;
  }

  function buildProductCards(products, theme, compact, cardOptions) {
    cardOptions = cardOptions || {};
    var linkCards = cardOptions.linkCards !== false;
    var storeCategory = cardOptions.storeCategory || null;
    var limit = compact ? 4 : 12;
    var list = products.slice(0, limit);
    if (!list.length) {
      return (
        '<div class="sf-products__empty">' +
        "<strong>Brak produktów w ofercie</strong>" +
        "<span>Dodaj aktywne produkty w panelu — pojawią się tutaj automatycznie.</span>" +
        "</div>"
      );
    }
    return (
      '<div class="sf-products__grid">' +
      list
        .map(function (p, index) {
          var imgUrl = safeCssUrl(p.image);
          var mediaClass =
            "sf-product-card__media" +
            (imgUrl
              ? " sf-product-card__media--photo"
              : " sf-product-card__media--" + escapeHtml(theme) + " sf-product-card__media--" + ((index % 3) + 1));
          var mediaStyle = imgUrl ? ' style="background-image:url(\'' + imgUrl + "')\"" : "";
          var tagHtml = p.tag ? '<span class="sf-product-card__tag">' + escapeHtml(p.tag) + "</span>" : "";
          var catLabel = p.categoryId ? getProductCategoryLabel(storeCategory, p.categoryId) : "";
          var catHtml = catLabel ? '<span class="sf-product-card__category">' + escapeHtml(catLabel) + "</span>" : "";
          var cardInner =
            '<div class="' +
            mediaClass +
            '"' +
            mediaStyle +
            ">" +
            tagHtml +
            "</div>" +
            '<div class="sf-product-card__body">' +
            catHtml +
            "<h3>" +
            escapeHtml(p.name) +
            "</h3>" +
            (p.desc ? "<p>" + escapeHtml(p.desc) + "</p>" : "") +
            '<div class="sf-product-card__foot">' +
            '<span class="sf-product-card__price">' +
            escapeHtml(formatPrice(p.price)) +
            "</span>" +
            '<span class="sf-product-card__cta">' +
            (linkCards ? "Zobacz produkt" : "Do koszyka") +
            "</span></div></div>";
          if (linkCards) {
            return (
              '<a class="sf-product-card sf-product-card--link" href="#/produkt/' +
              encodeURIComponent(p.id) +
              '" data-sf-open-product="' +
              escapeHtml(p.id) +
              '">' +
              cardInner +
              "</a>"
            );
          }
          return '<article class="sf-product-card">' + cardInner + "</article>";
        })
        .join("") +
      "</div>"
    );
  }

  function buildLogoHtml(store) {
    var logoSrc =
      safeCssUrl(store.logoImage || "") ||
      (/^data:image\//i.test(store.logoImage || "") ? String(store.logoImage).trim() : "");
    if (store.logoMode === "image" && logoSrc) {
      return (
        '<span class="sf-header__brand-logo sf-header__brand-logo--image">' +
        '<img src="' +
        escapeHtml(logoSrc) +
        '" alt="' +
        escapeHtml(store.storeName) +
        '"></span>'
      );
    }
    return (
      '<span class="sf-header__brand-logo sf-header__brand-logo--text sf-font--' +
      escapeHtml(store.logoFont || "manrope") +
      '">' +
      escapeHtml(store.logoText || store.storeName) +
      "</span>"
    );
  }

  function buildHeaderHtml(store, compact, device, lookbook, searchQuery) {
    if (isTechStore(store)) return buildTechHeaderHtml(store, compact, device, searchQuery);
    if (isLuxStore(store)) return buildLuxHeaderHtml(store, compact);
    if (isEnterpriseStore(store)) return buildEnterpriseHeaderHtml(store, compact, device, searchQuery);
    var navExtra = lookbook ? '<a href="#lookbook">Lookbook</a>' : "";
    var navFull = compact ? "" : '<a href="#o-nas">O nas</a><a href="#kontakt">Kontakt</a>';
    var cartBtn = buildCartButtonHtml(store, lookbook);
    var searchHtml = buildHeaderSearchHtml(store, compact, searchQuery);

    if (lookbook) {
      return (
        '<header class="sf-header sf-header--lookbook">' +
        '<div class="sf-header__brand">' +
        buildLogoHtml(store) +
        "</div>" +
        searchHtml +
        '<nav class="sf-header__nav sf-header__nav--desktop" aria-label="Nawigacja sklepu">' +
        navExtra +
        '<a href="#produkty">Produkty</a>' +
        navFull +
        "</nav>" +
        '<div class="sf-header__actions">' +
        cartBtn +
        '<details class="sf-mobile-menu">' +
        '<summary class="sf-icon-btn sf-mobile-menu__trigger" aria-label="Menu"><i class="fas fa-bars"></i></summary>' +
        '<div class="sf-mobile-menu__panel">' +
        '<nav class="sf-mobile-menu__nav" aria-label="Menu mobilne">' +
        navExtra +
        '<a href="#produkty">Produkty</a>' +
        navFull +
        "</nav>" +
        '<button type="button" class="sf-mobile-menu__account" tabindex="-1"><i class="far fa-user" aria-hidden="true"></i> Moje konto</button>' +
        "</div></details></div></header>"
      );
    }

    return (
      '<header class="sf-header">' +
      '<div class="sf-header__brand">' +
      '<span class="sf-header__logo" aria-hidden="true"></span>' +
      "<strong>" +
      escapeHtml(store.storeName) +
      "</strong></div>" +
      searchHtml +
      '<nav class="sf-header__nav" aria-label="Nawigacja sklepu">' +
      '<a href="#produkty">Produkty</a>' +
      navFull +
      "</nav>" +
      '<div class="sf-header__actions">' +
      '<button type="button" class="sf-icon-btn" tabindex="-1" aria-label="Konto"><i class="far fa-user"></i></button>' +
      cartBtn +
      (device === "mobile" ? '<button type="button" class="sf-icon-btn" tabindex="-1" aria-label="Menu"><i class="fas fa-bars"></i></button>' : "") +
      "</div></header>"
    );
  }

  function getProductsForCollection(store, col) {
    var all = store.products || [];
    return (col.productIds || [])
      .map(function (pid) {
        return all.find(function (p) {
          return p.id === pid && p.status === "active";
        });
      })
      .filter(Boolean);
  }

  function buildLookbookCollections(store, compact) {
    if (compact) return "";
    var cols = (store.collections || []).slice(0, 15);
    if (!cols.length) return "";
    return (
      '<section class="sf-lookbook" id="lookbook">' +
      '<div class="sf-section-head sf-section-head--center">' +
      "<h2>" +
      escapeHtml(store.lookbookTitle) +
      "</h2><p>" +
      escapeHtml(store.lookbookSubtitle) +
      "</p></div>" +
      '<div class="sf-lookbook__grid sf-lookbook__grid--' +
      (cols.length === 1 ? "one" : "duo") +
      '">' +
      cols
        .map(function (col, index) {
          var img = resolveMediaUrl(
            col.image,
            BANNER_PRESETS[index] ? BANNER_PRESETS[index].url : null,
            FASHION_BANNER_DEFAULT,
            BANNER_PRESETS[1] ? BANNER_PRESETS[1].url : null
          );
          var colProducts = getProductsForCollection(store, col);
          var productsHtml = colProducts.length
            ? '<ul class="sf-lookbook__products">' +
              colProducts
                .slice(0, 4)
                .map(function (p) {
                  return "<li>" + escapeHtml(p.name) + " · " + escapeHtml(formatPrice(p.price)) + "</li>";
                })
                .join("") +
              "</ul>"
            : '<p class="sf-lookbook__empty-products">Brak przypisanych produktów</p>';
          return (
            '<article class="sf-lookbook__tile">' +
            '<div class="sf-lookbook__media" style="background-image:url(\'' +
            img +
            "')\"></div>" +
            '<div class="sf-lookbook__copy">' +
            "<span>Kolekcja</span><h3>" +
            escapeHtml(col.title) +
            "</h3><p>" +
            escapeHtml(col.subtitle) +
            "</p>" +
            productsHtml +
            '<button type="button" class="sf-lookbook__link" tabindex="-1">Zobacz kolekcję <i class="fas fa-arrow-right"></i></button></div></article>'
          );
        })
        .join("") +
      "</div></section>"
    );
  }

  function buildHeroSection(store, compact) {
    if (isLookbookStore(store)) {
      return (
        '<section class="sf-hero sf-hero--banner">' +
        '<div class="sf-hero__banner-bg" aria-hidden="true"></div>' +
        '<div class="sf-hero__banner-content">' +
        (store.heroBadge ? '<span class="sf-hero__badge">' + escapeHtml(store.heroBadge) + "</span>" : "") +
        "<h1>" +
        escapeHtml(store.heroTitle) +
        "</h1>" +
        "<p>" +
        escapeHtml(store.heroSubtitle) +
        "</p>" +
        '<div class="sf-hero__actions">' +
        '<a class="sf-hero__cta sf-hero__cta--primary" href="#produkty">' +
        escapeHtml(store.heroCta) +
        '</a><a class="sf-hero__cta sf-hero__cta--ghost" href="#lookbook">Lookbook</a></div></div></section>'
      );
    }
    return (
      '<section class="sf-hero">' +
      '<div class="sf-hero__copy">' +
      "<h1>" +
      escapeHtml(store.heroTitle) +
      "</h1>" +
      "<p>" +
      escapeHtml(store.heroSubtitle) +
      "</p>" +
      '<a class="sf-hero__cta" href="#produkty">' +
      escapeHtml(store.heroCta) +
      "</a></div>" +
      '<div class="sf-hero__visual" aria-hidden="true"></div></section>'
    );
  }

  function buildRelatedProducts(store, currentId, theme, limit) {
    var others = (store.products || [])
      .filter(function (p) {
        return p.id !== currentId && p.status === "active";
      })
      .slice(0, limit || 3);
    if (!others.length) return "";
    return (
      '<section class="sf-pdp-related">' +
      '<div class="sf-section-head sf-section-head--center">' +
      "<h2>Może Ci się spodobać</h2>" +
      "<p>Podobne produkty z aktualnej oferty sklepu.</p></div>" +
      buildProductCards(others, theme, false, { linkCards: true, storeCategory: store.storeCategory }) +
      "</section>"
    );
  }

  function buildProductDetailPage(store, productId, options) {
    options = options || {};
    var compact = !!options.compact;
    var device = options.device === "mobile" ? "mobile" : "desktop";
    store = normalizeStore(store);
    var product = getProductById(store, productId);
    var lookbook = isLookbookStore(store);
    var tech = isTechStore(store);
    var isDraft = store.status !== "published";

    if (!product || product.status !== "active") {
      return (
        "<div class=\"" +
        storeClassList(store, compact, device) +
        "\"" +
        storeStyleAttr(store) +
        ">" +
        buildHeaderHtml(store, compact, device, lookbook) +
        '<main class="sf-pdp sf-pdp--missing">' +
        '<div class="sf-pdp__empty">' +
        "<strong>Produkt niedostępny</strong>" +
        "<p>Ten produkt nie istnieje lub jest ukryty w panelu.</p>" +
        '<a class="sf-pdp__back" href="#produkty" data-sf-back-catalog><i class="fas fa-arrow-left" aria-hidden="true"></i> Wróć do katalogu</a>' +
        "</div></main>" +
        '<footer class="sf-footer"><div><strong>' +
        escapeHtml(store.storeName) +
        '</strong><span>Powered by AmiQPlace</span></div></footer></div>'
      );
    }

    var images = getAllProductImages(product);
    var mainImage = images[0] || "";
    var mainStyle = mainImage
      ? " style=\"background-image:url('" + (safeCssUrl(mainImage) || mainImage) + "')\""
      : "";
    var inStock = product.stock > 0;
    var stockLabel = inStock
      ? product.stock <= 5
        ? "Ostatnie " + product.stock + " szt."
        : "Dostępny — " + product.stock + " szt."
      : "Chwilowo niedostępny";

    var thumbsHtml = images
      .map(function (url, i) {
        return (
          '<button type="button" class="sf-pdp-gallery__thumb' +
          (i === 0 ? " is-active" : "") +
          '" data-sf-gallery-thumb="' +
          escapeHtml(url) +
          '" style="background-image:url(\'' +
          (safeCssUrl(url) || url) +
          "')\" aria-label=\"Zdjęcie " +
          (i + 1) +
          '"></button>'
        );
      })
      .join("");

    var compareHtml =
      product.comparePrice && product.comparePrice > product.price
        ? '<span class="sf-pdp__compare">' + escapeHtml(formatPrice(product.comparePrice)) + "</span>"
        : "";

    var savings =
      product.comparePrice && product.comparePrice > product.price
        ? Math.round((1 - product.price / product.comparePrice) * 100)
        : 0;
    var savingsHtml = savings
      ? '<span class="sf-pdp__savings">-' + savings + "%</span>"
      : "";

    var categoryLabel = product.categoryId ? getProductCategoryLabel(store.storeCategory, product.categoryId) : "";
    var variantPickersHtml = buildVariantPickersHtml(product);

    var metaRows = [
      categoryLabel ? { icon: "fa-tag", label: "Kategoria", value: escapeHtml(categoryLabel) } : null,
      { icon: "fa-truck-fast", label: "Wysyłka", value: escapeHtml(product.shippingTime) },
      product.sku ? { icon: "fa-barcode", label: "SKU", value: escapeHtml(product.sku) } : null
    ].filter(Boolean);

    var metaHtml = metaRows
      .map(function (row) {
        return (
          '<li><i class="fas ' +
          row.icon +
          '" aria-hidden="true"></i><span>' +
          row.label +
          "</span><strong>" +
          row.value +
          "</strong></li>"
        );
      })
      .join("");

    var longBody = product.longDesc || product.desc || "";
    var descGalleryHtml =
      images.length > 1
        ? '<div class="sf-pdp-desc-gallery">' +
          images
            .slice(1)
            .map(function (url) {
              return (
                '<figure class="sf-pdp-desc-gallery__item" style="background-image:url(\'' +
                (safeCssUrl(url) || url) +
                "')\"></figure>"
              );
            })
            .join("") +
          "</div>"
        : "";

    var html =
      "<div class=\"" +
      storeClassList(store, compact, device) +
      " sf-store--pdp\"" +
      storeStyleAttr(store) +
      ">";

    if (store.announcement) {
      html +=
        '<div class="sf-announcement"><i class="fas fa-bullhorn" aria-hidden="true"></i> ' +
        escapeHtml(store.announcement) +
        "</div>";
    }

    html += buildHeaderHtml(store, compact, device, lookbook);

    var ratingHtml =
      tech && product.rating != null
        ? '<div class="sf-pdp__rating"><i class="fas fa-star" aria-hidden="true"></i> ' +
          escapeHtml(String(product.rating)) +
          ' <span>ocena klientów</span></div>'
        : "";
    var techHighlightsHtml = tech
      ? '<div class="sf-pdp__tech-highlights">' +
        '<span><i class="fas fa-shield-halved" aria-hidden="true"></i> Gwarancja producenta</span>' +
        '<span><i class="fas fa-certificate" aria-hidden="true"></i> Autoryzowana dystrybucja</span>' +
        '<span><i class="fas fa-table-columns" aria-hidden="true"></i> <a href="#porownaj">Porównaj modele</a></span>' +
        "</div>"
      : "";

    html +=
      '<main class="sf-pdp' +
      (tech ? " sf-pdp--tech" : "") +
      '" data-sf-pdp="' +
      escapeHtml(product.id) +
      '">' +
      '<nav class="sf-pdp__breadcrumb" aria-label="Nawigacja produktu">' +
      '<a href="#" data-sf-back-catalog>' +
      escapeHtml(store.storeName) +
      '</a><span aria-hidden="true">/</span><a href="#produkty" data-sf-back-catalog>Produkty</a>' +
      (categoryLabel
        ? '<span aria-hidden="true">/</span><span class="sf-pdp__crumb-category">' + escapeHtml(categoryLabel) + "</span>"
        : "") +
      '<span aria-hidden="true">/</span><span aria-current="page">' +
      escapeHtml(product.name) +
      "</span></nav>" +
      '<div class="sf-pdp__hero">' +
      '<div class="sf-pdp-gallery">' +
      '<div class="sf-pdp-gallery__main' +
      (mainImage ? " sf-pdp-gallery__main--photo" : "") +
      '" data-sf-pdp-main-image' +
      mainStyle +
      ">" +
      (product.tag ? '<span class="sf-product-card__tag sf-pdp-gallery__tag">' + escapeHtml(product.tag) + "</span>" : "") +
      "</div>" +
      (images.length > 1 ? '<div class="sf-pdp-gallery__thumbs">' + thumbsHtml + "</div>" : "") +
      "</div>" +
      '<div class="sf-pdp__buybox">' +
      (product.tag && lookbook ? '<span class="sf-pdp__eyebrow">' + escapeHtml(product.tag) + "</span>" : "") +
      (categoryLabel
        ? '<p class="sf-pdp__category"><i class="fas fa-tag" aria-hidden="true"></i> ' + escapeHtml(categoryLabel) + "</p>"
        : "") +
      "<h1>" +
      escapeHtml(product.name) +
      "</h1>" +
      ratingHtml +
      (product.desc ? '<p class="sf-pdp__lead">' + escapeHtml(product.desc) + "</p>" : "") +
      techHighlightsHtml +
      '<div class="sf-pdp__price-row">' +
      '<span class="sf-pdp__price">' +
      escapeHtml(formatPrice(product.price)) +
      "</span>" +
      compareHtml +
      savingsHtml +
      "</div>" +
      '<p class="sf-pdp__stock' +
      (inStock ? " is-in-stock" : " is-out") +
      '"><i class="fas fa-' +
      (inStock ? "circle-check" : "clock") +
      '" aria-hidden="true"></i> ' +
      escapeHtml(stockLabel) +
      "</p>" +
      (metaHtml ? '<ul class="sf-pdp__meta">' + metaHtml + "</ul>" : "") +
      variantPickersHtml +
      (tech
        ? '<div class="sf-pdp__buybox-meta">' +
          '<div class="sf-pdp__qty sf-pdp__qty--ship" data-sf-qty-wrap>' +
          "<label>Czas wysyłki</label>" +
          '<span class="sf-pdp__ship-badge"><i class="fas fa-truck-fast" aria-hidden="true"></i> ' +
          escapeHtml(product.shippingTime) +
          "</span></div>" +
          '<div class="sf-pdp__qty sf-pdp__qty--numeric">' +
          "<label for=\"sf-qty-" +
          escapeHtml(product.id) +
          '">Ilość</label>' +
          '<div class="sf-pdp__qty-controls sf-pdp__qty-controls--tech">' +
          '<button type="button" class="sf-pdp__qty-btn" data-sf-qty-minus aria-label="Zmniejsz ilość"><i class="fas fa-minus" aria-hidden="true"></i></button>' +
          '<input id="sf-qty-' +
          escapeHtml(product.id) +
          '" class="sf-pdp__qty-input" type="number" min="1" max="' +
          Math.max(1, product.stock || 1) +
          '" value="1" data-sf-qty-input inputmode="numeric">' +
          '<button type="button" class="sf-pdp__qty-btn" data-sf-qty-plus aria-label="Zwiększ ilość"><i class="fas fa-plus" aria-hidden="true"></i></button>' +
          "</div></div></div>"
        : '<div class="sf-pdp__qty" data-sf-qty-wrap>' +
          "<label>Czas wysyłki</label>" +
          '<span class="sf-pdp__ship-badge"><i class="fas fa-truck-fast" aria-hidden="true"></i> ' +
          escapeHtml(product.shippingTime) +
          "</span></div>" +
          '<div class="sf-pdp__qty sf-pdp__qty--numeric">' +
          "<label for=\"sf-qty-" +
          escapeHtml(product.id) +
          '">Ilość</label>' +
          '<div class="sf-pdp__qty-controls">' +
          '<button type="button" class="sf-pdp__qty-btn" data-sf-qty-minus aria-label="Zmniejsz ilość">−</button>' +
          '<input id="sf-qty-' +
          escapeHtml(product.id) +
          '" class="sf-pdp__qty-input" type="number" min="1" max="' +
          Math.max(1, product.stock || 1) +
          '" value="1" data-sf-qty-input>' +
          '<button type="button" class="sf-pdp__qty-btn" data-sf-qty-plus aria-label="Zwiększ ilość">+</button>' +
          "</div></div>") +
      '<div class="sf-pdp__actions">' +
      '<button type="button" class="sf-pdp__btn sf-pdp__btn--primary" data-sf-demo-buy' +
      (inStock ? "" : " disabled") +
      '><i class="fas fa-bolt" aria-hidden="true"></i> Kup teraz</button>' +
      '<button type="button" class="sf-pdp__btn sf-pdp__btn--secondary" data-sf-demo-cart' +
      (inStock ? "" : " disabled") +
      '><i class="fas fa-bag-shopping" aria-hidden="true"></i> Dodaj do koszyka</button>' +
      "</div>" +
      (tech
        ? '<div class="sf-pdp__trust sf-pdp__trust--tech">' +
          '<article><i class="fas fa-truck-fast"></i><strong>Wysyłka</strong><span>' +
          escapeHtml(product.shippingTime) +
          "</span></article>" +
          '<article><i class="fas fa-money-bill-wave"></i><strong>Pobranie</strong><span>Dostępne w kasie</span></article>' +
          '<article><i class="fas fa-box"></i><strong>Paczkomat</strong><span>InPost i punkty partnerskie</span></article>' +
          '<article><i class="fas fa-rotate-left"></i><strong>Zwrot</strong><span>30 dni na test</span></article></div>'
        : '<div class="sf-pdp__trust">' +
          '<article><i class="fas fa-truck-fast"></i><strong>Dostawa</strong><span>' +
          escapeHtml(product.shippingTime) +
          "</span></article>" +
          '<article><i class="fas fa-rotate-left"></i><strong>Zwrot</strong><span>14 dni bez pytań</span></article>' +
          '<article><i class="fas fa-shield-halved"></i><strong>Płatności</strong><span>Bezpieczne transakcje</span></article></div>') +
      "</div></div>";

    var techSpecsHtml =
      isTechStore(store) && productHasVisibleSpecs(product)
        ? '<section class="sf-pdp-panel sf-pdp-panel--tech-specs">' +
          "<h2>Specyfikacja techniczna</h2>" +
          '<div class="sf-tech-spec-grid">' +
          product.specs
            .map(function (s) {
              return (
                '<article class="sf-tech-spec-card"><span>' +
                escapeHtml(s.label) +
                "</span><strong>" +
                escapeHtml(s.value) +
                "</strong></article>"
              );
            })
            .join("") +
          "</div></section>"
        : "";

    if (!compact) {
      html +=
        '<div class="sf-pdp__details">' +
        techSpecsHtml +
        '<section class="sf-pdp-panel">' +
        "<h2>Opis produktu</h2>" +
        (longBody
          ? '<div class="sf-pdp__long">' +
            longBody
              .split(/\n{2,}/)
              .map(function (para) {
                return "<p>" + escapeHtml(para.trim()) + "</p>";
              })
              .join("") +
            "</div>"
          : "<p>Brak rozszerzonego opisu — dodaj go w panelu produktów.</p>") +
        descGalleryHtml +
        "</section>" +
        '<section class="sf-pdp-panel">' +
        "<h2>Szczegóły</h2>" +
        '<dl class="sf-pdp-specs">' +
        (product.variants && product.variants.length
          ? product.variants
              .map(function (v) {
                return (
                  "<div><dt>" +
                  escapeHtml(v.name) +
                  "</dt><dd>" +
                  escapeHtml(v.options.join(", ")) +
                  "</dd></div>"
                );
              })
              .join("")
          : "") +
        (product.sku ? "<div><dt>Kod produktu</dt><dd>" + escapeHtml(product.sku) + "</dd></div>" : "") +
        "<div><dt>Czas wysyłki</dt><dd>" +
        escapeHtml(product.shippingTime) +
        "</dd></div></dl></section>" +
        '<section class="sf-pdp-panel sf-pdp-panel--accordion">' +
        "<h2>Dostawa i zwroty</h2>" +
        "<p>Wysyłka kurierem lub do paczkomatu — czas realizacji: <strong>" +
        escapeHtml(product.shippingTime) +
        "</strong>. Możliwość zwrotu w ciągu 14 dni od otrzymania przesyłki.</p>" +
        "</section></div>" +
        buildRelatedProducts(store, product.id, store.theme, 3);
    }

    html +=
      "</main>" +
      '<footer class="sf-footer">' +
      "<div><strong>" +
      escapeHtml(store.storeName) +
      "</strong><span>Powered by AmiQPlace</span></div>" +
      "<span>© " +
      new Date().getFullYear() +
      " · " +
      escapeHtml(store.slug) +
      ".amiqplace.pl</span></footer>" +
      '<div class="sf-demo-toast" data-sf-demo-toast hidden role="status"></div>';

    if (isDraft) {
      html += '<div class="sf-draft-badge"><i class="fas fa-eye" aria-hidden="true"></i> Podgląd — sklep w trybie szkicu</div>';
    }

    html += "</div>";
    return html;
  }

  function buildStoreShellStart(store, compact, device, lookbook, searchQuery) {
    var html = "<div class=\"" + storeClassList(store, compact, device) + "\"" + storeStyleAttr(store) + ">";
    if (store.announcement) {
      html +=
        '<div class="sf-announcement"><i class="fas fa-bullhorn" aria-hidden="true"></i> ' +
        escapeHtml(store.announcement) +
        "</div>";
    }
    html += buildHeaderHtml(store, compact, device, lookbook, searchQuery || "");
    return html;
  }

  function buildSearchPage(store, options) {
    options = options || {};
    var compact = !!options.compact;
    var device = options.device === "mobile" ? "mobile" : "desktop";
    var route = options.route || {};
    var query = route.query != null ? route.query : options.searchQuery || "";
    store = normalizeStore(store);
    if (!store) return "";
    var lookbook = isLookbookStore(store);
    var tech = isTechStore(store);
    var isDraft = store.status !== "published";
    var results = searchStoreCatalog(store, query);
    var total = results.products.length + results.collections.length + results.categories.length;
    var html = buildStoreShellStart(store, compact, device, lookbook, query);
    html +=
      '<main class="sf-search-page">' +
      '<div class="sf-search-page__head">' +
      "<h1>Wyniki wyszukiwania</h1>" +
      (query
        ? '<p>Znaleziono <strong>' +
          total +
          "</strong> wyników dla „" +
          escapeHtml(query) +
          "”</p>"
        : "<p>Wpisz frazę, aby przeszukać produkty i kolekcje.</p>") +
      "</div>";

    if (!query) {
      html +=
        '<p class="sf-search-page__hint"><i class="fas fa-magnifying-glass" aria-hidden="true"></i> Użyj paska wyszukiwania u góry strony.</p></main>' +
        buildStoreShellEnd(store, isDraft);
      return html;
    }

    if (!total) {
      html +=
        '<div class="sf-search-page__empty">' +
        "<strong>Brak wyników</strong>" +
        "<p>Spróbuj innej frazy — np. nazwy produktu, marki, SKU lub tytułu kolekcji.</p>" +
        '<a href="#produkty" class="sf-pdp__btn sf-pdp__btn--secondary" data-sf-back-catalog>Przeglądaj katalog</a></div></main>' +
        buildStoreShellEnd(store, isDraft);
      return html;
    }

    if (results.collections.length) {
      html +=
        '<section class="sf-search-section"><h2>Kolekcje i promocje</h2><div class="sf-search-collections">' +
        results.collections
          .map(function (col) {
            var anchor = lookbook ? "#lookbook" : tech ? "#promocje" : "#produkty";
            return (
              '<a class="sf-search-collection-card" href="' +
              anchor +
              '"><strong>' +
              escapeHtml(col.title) +
              "</strong><span>" +
              escapeHtml(col.subtitle || "") +
              "</span></a>"
            );
          })
          .join("") +
        "</div></section>";
    }

    if (results.categories.length) {
      html +=
        '<section class="sf-search-section"><h2>Kategorie</h2><div class="sf-search-collections">' +
        results.categories
          .map(function (cat) {
            return (
              '<a class="sf-search-collection-card" href="#kategorie"><strong>' +
              escapeHtml(cat.label) +
              "</strong><span>" +
              escapeHtml(cat.desc || "") +
              "</span></a>"
            );
          })
          .join("") +
        "</div></section>";
    }

    if (results.products.length) {
      html +=
        '<section class="sf-search-section"><h2>Produkty</h2>' +
        (tech
          ? buildTechProductCards(results.products, store, compact)
          : buildProductCards(results.products, getStoreVisualTheme(store), compact, { storeCategory: store.storeCategory })) +
        "</section>";
    }

    html += "</main>" + buildStoreShellEnd(store, isDraft);
    return html;
  }

  function buildStoreShellEnd(store, isDraft) {
    var html =
      '<footer class="sf-footer">' +
      "<div><strong>" +
      escapeHtml(store.storeName) +
      "</strong><span>Powered by AmiQPlace</span></div>" +
      "<span>© " +
      new Date().getFullYear() +
      " · " +
      escapeHtml(store.slug) +
      ".amiqplace.pl</span></footer>" +
      '<div class="sf-demo-toast" data-sf-demo-toast hidden role="status"></div>';
    if (isDraft) {
      html += '<div class="sf-draft-badge"><i class="fas fa-eye" aria-hidden="true"></i> Podgląd — sklep w trybie szkicu</div>';
    }
    html += "</div>";
    return html;
  }

  function buildCartPage(store, options) {
    options = options || {};
    var compact = !!options.compact;
    var device = options.device === "mobile" ? "mobile" : "desktop";
    store = normalizeStore(store);
    var lookbook = isLookbookStore(store);
    var isDraft = store.status !== "published";
    var cart = getCart(store.id);
    var html = buildStoreShellStart(store, compact, device, lookbook);

    html +=
      '<main class="sf-cart-page">' +
      '<nav class="sf-pdp__breadcrumb"><a href="#" data-sf-back-catalog>' +
      escapeHtml(store.storeName) +
      '</a><span>/</span><span aria-current="page">Koszyk</span></nav>' +
      "<h1>Twój koszyk</h1>";

    if (!cart.length) {
      html +=
        '<div class="sf-cart-empty">' +
        '<div class="sf-cart-empty__icon"><i class="fas fa-bag-shopping" aria-hidden="true"></i></div>' +
        "<strong>Koszyk jest pusty</strong>" +
        "<p>Dodaj produkty z katalogu, aby przejść do kasy.</p>" +
        '<a href="#produkty" class="sf-pdp__btn sf-pdp__btn--primary" data-sf-back-catalog>Przeglądaj produkty</a></div>';
    } else {
      var totals = calcCartTotals(store, cart, null);
      html +=
        '<div class="sf-cart-layout">' +
        '<div class="sf-cart-items">' +
        cart
          .map(function (item) {
            var img = item.image && (safeCssUrl(item.image) || String(item.image).indexOf("data:image/") === 0);
            var thumbStyle = img ? " style=\"background-image:url('" + (safeCssUrl(item.image) || item.image) + "')\"" : "";
            return (
              '<article class="sf-cart-item" data-sf-cart-item="' +
              escapeHtml(item.cartItemId) +
              '">' +
              '<div class="sf-cart-item__thumb' +
              (img ? " sf-cart-item__thumb--photo" : "") +
              '"' +
              thumbStyle +
              "></div>" +
              '<div class="sf-cart-item__body">' +
              "<h3>" +
              escapeHtml(item.name) +
              "</h3>" +
              (item.variantLabel
                ? '<p class="sf-cart-item__variant"><i class="fas fa-sliders" aria-hidden="true"></i> ' +
                  escapeHtml(item.variantLabel) +
                  "</p>"
                : "") +
              '<span class="sf-cart-item__price">' +
              escapeHtml(formatPrice(item.price)) +
              "</span>" +
              '<div class="sf-cart-item__qty">' +
              '<button type="button" class="sf-pdp__qty-btn" data-sf-cart-minus="' +
              escapeHtml(item.cartItemId) +
              '">−</button>' +
              '<span class="sf-cart-item__qty-val">' +
              item.qty +
              "</span>" +
              '<button type="button" class="sf-pdp__qty-btn" data-sf-cart-plus="' +
              escapeHtml(item.cartItemId) +
              '">+</button></div></div>' +
              '<button type="button" class="sf-cart-item__remove" data-sf-cart-remove="' +
              escapeHtml(item.cartItemId) +
              '" aria-label="Usuń"><i class="fas fa-trash" aria-hidden="true"></i></button></article>'
            );
          })
          .join("") +
        "</div>" +
        '<aside class="sf-cart-summary">' +
        "<h2>Podsumowanie</h2>" +
        '<div class="sf-cart-summary__row"><span>Produkty</span><strong data-sf-cart-subtotal>' +
        escapeHtml(formatPrice(totals.subtotal)) +
        "</strong></div>" +
        '<p class="sf-cart-summary__hint">Dostawa wybierzesz w następnym kroku.</p>' +
        '<button type="button" class="sf-pdp__btn sf-pdp__btn--primary sf-pdp__btn--block" data-sf-open-checkout>Przejdź do kasy</button>' +
        '<a href="#produkty" class="sf-cart-summary__link" data-sf-back-catalog>Kontynuuj zakupy</a></aside></div>';
    }

    html += "</main>" + buildStoreShellEnd(store, isDraft);
    return html;
  }

  function buildCheckoutPage(store, options) {
    options = options || {};
    var compact = !!options.compact;
    var device = options.device === "mobile" ? "mobile" : "desktop";
    store = normalizeStore(store);
    var lookbook = isLookbookStore(store);
    var isDraft = store.status !== "published";
    var cart = getCart(store.id);
    var checkout = store.checkout || getDefaultStoreCheckout();
    var shippingMethods = (checkout.shipping.methods || []).filter(function (m) {
      return m.enabled;
    });
    var paymentMethods = (checkout.payments.enabled || []).filter(function (id) {
      return PAYMENT_META[id];
    });
    var defaultShip = shippingMethods[0] ? shippingMethods[0].id : "";
    var defaultPay = checkout.payments.primary || paymentMethods[0] || "transfer";
    var totals = calcCartTotals(store, cart, defaultShip, defaultPay);
    var expressMethods = shippingMethods.filter(function (m) {
      return m.category === "express";
    });
    var addressMethods = shippingMethods.filter(function (m) {
      return m.category === "address";
    });
    var pickupMethods = shippingMethods.filter(function (m) {
      return m.category === "pickup";
    });
    var firstShip = shippingMethods[0] || null;
    var firstShipId = firstShip ? firstShip.id : "";
    var firstIsPickup = firstShip && firstShip.category === "pickup";

    var html = buildStoreShellStart(store, compact, device, lookbook);

    if (!cart.length) {
      html +=
        '<main class="sf-checkout-page sf-checkout-page--empty">' +
        "<h1>Kasa</h1>" +
        '<p>Koszyk jest pusty — dodaj produkty przed płatnością.</p>' +
        '<a href="#produkty" class="sf-pdp__btn sf-pdp__btn--primary" data-sf-back-catalog>Wróć do sklepu</a></main>' +
        buildStoreShellEnd(store, isDraft);
      return html;
    }

    html +=
      '<main class="sf-checkout-page">' +
      '<div class="sf-checkout-progress" aria-label="Postęp zamówienia">' +
      '<span class="is-done"><i class="fas fa-check"></i> Koszyk</span>' +
      '<span class="is-active">2. Dostawa i płatność</span>' +
      "<span>3. Potwierdzenie</span></div>" +
      '<div class="sf-checkout-layout">' +
      '<aside class="sf-checkout-order">' +
      "<h2>Twoje zamówienie</h2>" +
      '<ul class="sf-checkout-order__list">' +
      cart
        .map(function (item) {
          return (
            "<li><span>" +
            escapeHtml(item.name) +
            (item.variantLabel ? " · " + escapeHtml(item.variantLabel) : "") +
            " × " +
            item.qty +
            "</span><strong>" +
            escapeHtml(formatPrice(item.price * item.qty)) +
            "</strong></li>"
          );
        })
        .join("") +
      "</ul>" +
      '<div class="sf-checkout-order__row"><span>Suma produktów</span><strong data-sf-checkout-subtotal>' +
      escapeHtml(formatPrice(totals.subtotal)) +
      "</strong></div>" +
      '<div class="sf-checkout-order__row"><span>Dostawa</span><strong data-sf-checkout-shipping>' +
      escapeHtml(totals.shipping > 0 ? formatPrice(totals.shipping) : "Gratis") +
      "</strong></div>" +
      '<div class="sf-checkout-order__row" data-sf-checkout-cod-row' +
      (totals.codFee > 0 ? "" : " hidden") +
      '><span>Opłata za pobranie</span><strong data-sf-checkout-cod>' +
      escapeHtml(formatPrice(totals.codFee)) +
      "</strong></div>" +
      '<div class="sf-checkout-order__total"><span>Do zapłaty</span><strong data-sf-checkout-total>' +
      escapeHtml(formatPrice(totals.total)) +
      "</strong></div>" +
      (checkout.shipping.freeFrom > 0
        ? '<p class="sf-checkout-order__note">Darmowa dostawa od ' + escapeHtml(formatPrice(checkout.shipping.freeFrom)) + "</p>"
        : "") +
      "</aside>" +
      '<form class="sf-checkout-form" data-sf-checkout-form>' +
      '<section class="sf-checkout-block">' +
      "<h3><span>1</span> Dane kontaktowe</h3>" +
      '<div class="sf-checkout-fields">' +
      '<label class="sf-field"><span>Imię i nazwisko</span><input type="text" required data-sf-field-name placeholder="Anna Kowalska" maxlength="80"></label>' +
      '<label class="sf-field"><span>E-mail</span><input type="email" required data-sf-field-email placeholder="anna@email.pl" maxlength="120"></label>' +
      '<label class="sf-field"><span>Telefon</span><input type="tel" required data-sf-field-phone placeholder="+48 600 000 000" maxlength="20"></label>' +
      "</div></section>" +
      '<section class="sf-checkout-block">' +
      "<h3><span>2</span> Metoda dostawy</h3>" +
      '<div class="sf-checkout-shipping-groups">' +
      buildCheckoutShippingGroupHtml("express", expressMethods, firstShipId) +
      buildCheckoutShippingGroupHtml("address", addressMethods, firstShipId) +
      buildCheckoutShippingGroupHtml("pickup", pickupMethods, firstShipId) +
      "</div></section>" +
      '<section class="sf-checkout-block sf-checkout-block--delivery" data-sf-checkout-delivery>' +
      "<h3><span>3</span> Szczegóły dostawy</h3>" +
      '<div class="sf-checkout-fields sf-checkout-fields--address" data-sf-checkout-address-block' +
      (firstIsPickup ? " hidden" : "") +
      ">" +
      '<label class="sf-field sf-field--full"><span>Ulica</span><input type="text" data-sf-field-street required placeholder="ul. Przykładowa" maxlength="80"></label>' +
      '<label class="sf-field"><span>Nr budynku / lokalu</span><input type="text" data-sf-field-building required placeholder="12/4" maxlength="20"></label>' +
      '<label class="sf-field"><span>Kod pocztowy</span><input type="text" data-sf-field-postal required placeholder="00-001" maxlength="10"></label>' +
      '<label class="sf-field"><span>Miasto</span><input type="text" data-sf-field-city required placeholder="Warszawa" maxlength="60"></label>' +
      '<label class="sf-field sf-field--full"><span>Uwagi dla kuriera (opcjonalnie)</span><input type="text" data-sf-field-notes placeholder="Domofon, piętro, preferowana godzina" maxlength="120"></label>' +
      "</div>" +
      '<div class="sf-checkout-fields sf-checkout-fields--pickup" data-sf-checkout-pickup-block' +
      (firstIsPickup ? "" : " hidden") +
      ">" +
      '<p class="sf-checkout-pickup-hint" data-sf-pickup-hint-text>Wybierz punkt odbioru — w wersji produkcyjnej pojawi się mapa.</p>' +
      '<label class="sf-field"><span>Kod / numer punktu</span><input type="text" data-sf-field-pickup-point required placeholder="WAW01M lub kod punktu" maxlength="40"></label>' +
      '<label class="sf-field"><span>Miasto punktu</span><input type="text" data-sf-field-pickup-city required placeholder="Warszawa" maxlength="60"></label>' +
      '<label class="sf-field sf-field--full"><span>Nazwa punktu (opcjonalnie)</span><input type="text" data-sf-field-pickup-label placeholder="Np. Paczkomat przy stacji ORLEN" maxlength="100"></label>' +
      "</div></section>" +
      '<section class="sf-checkout-block">' +
      "<h3><span>4</span> Płatność</h3>" +
      '<div class="sf-checkout-options">' +
      paymentMethods
        .map(function (id, i) {
          var meta = PAYMENT_META[id];
          return (
            '<label class="sf-checkout-option' +
            (id === defaultPay ? " is-selected" : "") +
            '">' +
            '<input type="radio" name="sf-payment" value="' +
            escapeHtml(id) +
            '"' +
            (id === defaultPay ? " checked" : "") +
            " data-sf-payment-method>" +
            '<span class="sf-checkout-option__icon"><i class="fas ' +
            meta.icon +
            '"></i></span>' +
            "<div><strong>" +
            escapeHtml(meta.label) +
            "</strong><span>" +
            escapeHtml(meta.hint) +
            "</span></div></label>"
          );
        })
        .join("") +
      "</div>" +
      (checkout.payments.enabled.indexOf("transfer") !== -1
        ? '<div class="sf-checkout-bank" data-sf-bank-info><i class="fas fa-circle-info"></i> Po złożeniu zamówienia otrzymasz numer konta: <strong>' +
          escapeHtml(checkout.payments.bankAccount || "—") +
          "</strong></div>"
        : "") +
      (checkout.payments.enabled.indexOf("cod") !== -1 && checkout.payments.codFee > 0
        ? '<div class="sf-checkout-bank sf-checkout-bank--cod' +
          (defaultPay === "cod" ? "" : " hidden") +
          '" data-sf-cod-info><i class="fas fa-money-bill-wave"></i> Płatność za pobraniem: dodatkowa opłata <strong>' +
          escapeHtml(formatPrice(checkout.payments.codFee)) +
          "</strong> zostanie doliczona do zamówienia.</div>"
        : "") +
      "</section>" +
      '<label class="sf-checkout-consent">' +
      '<input type="checkbox" required data-sf-field-consent>' +
      "<span>Akceptuję regulamin sklepu i politykę prywatności (demo).</span></label>" +
      '<button type="submit" class="sf-pdp__btn sf-pdp__btn--primary sf-pdp__btn--block" data-sf-place-order>' +
      '<i class="fas fa-lock" aria-hidden="true"></i> Złóż zamówienie · ' +
      escapeHtml(formatPrice(totals.total)) +
      "</button>" +
      '<p class="sf-checkout-secure"><i class="fas fa-shield-halved"></i> Bezpieczne połączenie SSL · tryb demo AmiQPlace</p>' +
      "</form></div></main>" +
      buildStoreShellEnd(store, isDraft);
    return html;
  }

  function buildOrderSuccessPage(store, options) {
    options = options || {};
    var compact = !!options.compact;
    var device = options.device === "mobile" ? "mobile" : "desktop";
    store = normalizeStore(store);
    var lookbook = isLookbookStore(store);
    var isDraft = store.status !== "published";
    var orderNum = options.orderNumber || "#1001";
    var html = buildStoreShellStart(store, compact, device, lookbook);
    html +=
      '<main class="sf-checkout-success">' +
      '<div class="sf-checkout-success__icon"><i class="fas fa-circle-check" aria-hidden="true"></i></div>' +
      "<h1>Dziękujemy za zamówienie!</h1>" +
      "<p>Numer zamówienia: <strong>" +
      escapeHtml(orderNum) +
      "</strong></p>" +
      "<p>Potwierdzenie wysłaliśmy na podany adres e-mail. W wersji produkcyjnej uruchomimy tu prawdziwą bramkę płatności.</p>" +
      '<div class="sf-checkout-success__actions">' +
      '<a href="#produkty" class="sf-pdp__btn sf-pdp__btn--secondary" data-sf-back-catalog>Wróć do sklepu</a>' +
      "</div></main>" +
      buildStoreShellEnd(store, isDraft);
    return html;
  }

  function buildStorefrontInner(store, options) {
    options = options || {};
    var route = options.route || parseStorefrontRoute();
    if (options.productId) route = { view: "product", productId: options.productId };
    if (route.view === "cart") return buildCartPage(store, options);
    if (route.view === "checkout") return buildCheckoutPage(store, options);
    if (route.view === "success") {
      return buildOrderSuccessPage(store, Object.assign({}, options, { orderNumber: route.orderNumber }));
    }
    if (route.view === "product" && route.productId) {
      return buildProductDetailPage(store, route.productId, options);
    }
    if (route.view === "search") {
      return buildSearchPage(store, Object.assign({}, options, { route: route }));
    }
    var compact = !!options.compact;
    var device = options.device === "mobile" ? "mobile" : "desktop";
    store = normalizeStore(store);
    if (!store) return "";
    if (store.storeSettings && store.storeSettings.maintenanceMode && !options.ownerPreview) {
      return buildMaintenancePage(store, !!options.compact);
    }
    var products = (store.products || []).filter(function (p) {
      return p.status === "active";
    });
    var isDraft = store.status !== "published";
    var lookbook = isLookbookStore(store);
    var tech = isTechStore(store);
    var lux = isLuxStore(store);
    var enterprise = isEnterpriseStore(store);

    var html = "<div class=\"" + storeClassList(store, compact, device) + "\"" + storeStyleAttr(store) + ">";

    if (options.ownerPreview && store.storeSettings && store.storeSettings.maintenanceMode) {
      html +=
        '<div class="sf-owner-banner"><i class="fas fa-screwdriver-wrench" aria-hidden="true"></i> Tryb konserwacji aktywny — klienci widzą stronę „wkrótce wracamy”.</div>';
    }

    if (store.announcement && isSectionEnabled(store, "announcement")) {
      html +=
        '<div class="sf-announcement"><i class="fas fa-bullhorn" aria-hidden="true"></i> ' +
        escapeHtml(store.announcement) +
        "</div>";
    }

    html += buildHeaderHtml(store, compact, device, lookbook);

    if (isSectionEnabled(store, "hero")) {
      if (tech) html += buildTechHeroSection(store, compact);
      else if (lux) html += buildLuxHeroSection(store);
      else if (enterprise) html += buildEnterpriseHeroSection(store, compact);
      else html += buildHeroSection(store, compact);
    }

    if (!compact && isSectionEnabled(store, "trust")) {
      if (tech) {
        html += buildTechTrustBar();
      } else if (lux) {
        html += buildLuxMaisonBar();
      } else if (enterprise) {
        html += buildEnterpriseTrustBar();
      } else {
        html +=
          '<section class="sf-trust' +
          (lookbook ? " sf-trust--spaced" : "") +
          '" aria-label="Zalety sklepu">' +
          '<article><i class="fas fa-truck-fast"></i><strong>Szybka wysyłka</strong><span>1–3 dni robocze</span></article>' +
          '<article><i class="fas fa-shield-halved"></i><strong>Bezpieczne płatności</strong><span>Szyfrowane transakcje</span></article>' +
          '<article><i class="fas fa-rotate-left"></i><strong>14 dni na zwrot</strong><span>Bez zbędnych formalności</span></article>' +
          "</section>";
      }
    }

    if (lux && isSectionEnabled(store, "lookbook")) html += buildLuxEditorialCollections(store);
    else if (lookbook && isSectionEnabled(store, "lookbook")) html += buildLookbookCollections(store, compact);
    if (enterprise && !compact) {
      if (isSectionEnabled(store, "brandHub")) html += buildEnterpriseBrandHub(store);
      if (isSectionEnabled(store, "entSolutions")) html += buildEnterpriseSolutionsSection(store);
      if (isSectionEnabled(store, "entSegments")) html += buildEnterpriseSegmentsSection(store);
    }
    if (tech && !compact) {
      if (isSectionEnabled(store, "categories")) html += buildTechCategoryTiles(store);
      if (isSectionEnabled(store, "deals")) html += buildTechDealsSection(store);
    }

    if (isSectionEnabled(store, "products")) {
      html +=
        '<section class="sf-products' +
        (lux ? " sf-products--lux" : "") +
        '" id="produkty">' +
        '<div class="sf-section-head' +
        (lookbook || tech || lux ? " sf-section-head--center" : "") +
        (lux ? " sf-lux-section-head sf-lux-section-head--center" : "") +
        (enterprise ? " sf-ent-section-head" : "") +
        '">' +
        (lux ? '<span class="sf-lux-eyebrow">Kuracja</span>' : "") +
        (enterprise ? '<span class="sf-ent-eyebrow">Katalog łączony</span>' : "") +
        "<h2>" +
        escapeHtml(store.sectionTitle) +
        "</h2><p>" +
        escapeHtml(store.sectionSubtitle) +
        "</p></div>" +
        (tech
          ? buildTechProductCards(products, store, compact)
          : lux
            ? buildLuxProductCards(products, store, compact)
            : enterprise
              ? buildEnterpriseProductCards(products, store, compact)
              : buildProductCards(products, getStoreVisualTheme(store), compact, { storeCategory: store.storeCategory })) +
        "</section>";
    }

    if (lux && !compact) {
      if (isSectionEnabled(store, "luxStory")) html += buildLuxStorySection(store);
      if (isSectionEnabled(store, "luxCraft")) html += buildLuxPillarsSection(store);
      if (isSectionEnabled(store, "luxExperience")) html += buildLuxExperienceSection(store);
      if (isSectionEnabled(store, "luxPress")) html += buildLuxPressStrip(store);
    }

    if (tech && !compact) {
      if (isSectionEnabled(store, "compare")) html += buildTechCompareSection(store);
      if (isSectionEnabled(store, "faq")) html += buildTechFaqSection(store);
      if (isSectionEnabled(store, "brands")) html += buildTechBrandsStrip(store);
    }

    if (enterprise && !compact) {
      if (isSectionEnabled(store, "entCases")) html += buildEnterpriseCaseStudies(store);
      if (isSectionEnabled(store, "entPartners")) html += buildEnterprisePartnersStrip(store);
      if (isSectionEnabled(store, "entFaq")) html += buildEnterpriseFaqSection(store);
      if (isSectionEnabled(store, "entPortal")) html += buildEnterprisePortalBand(store);
    }

    if (!compact) {
      if (isSectionEnabled(store, "about")) {
        if (lux) {
          html += buildLuxAboutSection(store, products.length);
        } else if (enterprise) {
          html += buildEnterpriseAboutSection(store, products.length);
        } else {
          html +=
            '<section class="sf-about" id="o-nas">' +
            '<div class="sf-about__card">' +
            "<h2>" +
            escapeHtml(store.aboutTitle) +
            "</h2><p>" +
            escapeHtml(store.aboutText) +
            "</p></div>" +
            '<div class="sf-about__stats">' +
            "<article><strong>" +
            products.length +
            "+</strong><span>Produktów</span></article>" +
            '<article><strong>4.9</strong><span>Ocena klientów</span></article>' +
            '<article><strong>24h</strong><span>Wsparcie</span></article>' +
            "</div></section>";
        }
      }
      if (isSectionEnabled(store, "newsletter")) {
        if (lux) {
          html += buildLuxConciergeNewsletter(store);
        } else if (enterprise) {
          html += buildEnterpriseNewsletter(store);
        } else {
          html +=
            '<section class="sf-newsletter" id="kontakt">' +
            "<div><h2>" +
            escapeHtml(store.newsletterTitle) +
            "</h2><p>" +
            escapeHtml(store.newsletterSubtitle) +
            "</p></div>" +
            '<form class="sf-newsletter__form" onsubmit="return false">' +
            '<input type="email" placeholder="Twój e-mail" disabled>' +
            '<button type="button" disabled>Zapisz się</button></form></section>';
        }
      }
    }

    if (lux) {
      html += buildLuxFooter(store);
    } else if (enterprise) {
      html += buildEnterpriseFooter(store);
    } else {
      html +=
        '<footer class="sf-footer">' +
        "<div><strong>" +
        escapeHtml(store.storeName) +
        "</strong><span>Powered by AmiQPlace</span></div>" +
        "<span>© " +
        new Date().getFullYear() +
        " · " +
        escapeHtml(store.slug) +
        ".amiqplace.pl</span></footer>";
    }

    if (isDraft) {
      html += '<div class="sf-draft-badge"><i class="fas fa-eye" aria-hidden="true"></i> Podgląd — sklep w trybie szkicu</div>';
    }

    html += "</div>";
    return html;
  }

  function buildMobileBlockMessage() {
    return (
      '<div class="panel-preview-mobile-block">' +
      '<div class="panel-preview-mobile-block__icon" aria-hidden="true"><i class="fas fa-mobile-screen"></i></div>' +
      "<strong>Brak aktywnego projektu</strong>" +
      "<p>Stwórz sklep, aby zobaczyć podgląd w wersji mobilnej.</p>" +
      '<button type="button" class="panel-project-card__btn panel-project-card__btn--primary" data-open-projects-modal>Stwórz projekt</button>' +
      "</div>"
    );
  }

  function buildPanelPreview(project, options) {
    options = options || {};
    var panelOnMobile = !isDesktopViewport();

    if (!project) {
      return (
        '<div class="panel-preview-empty">' +
        "<strong>Brak aktywnego projektu</strong>" +
        "<p>Stwórz sklep, aby zobaczyć podgląd.</p>" +
        '<button type="button" class="panel-project-card__btn panel-project-card__btn--primary" data-open-projects-modal>Stwórz projekt</button>' +
        "</div>"
      );
    }

    var store = normalizeStore(project);
    var compact = !!options.compact;
    var device = panelOnMobile ? "mobile" : options.device === "mobile" ? "mobile" : "desktop";

    var previewNotice =
      '<div class="panel-preview-notice" role="note">' +
      '<i class="fas fa-circle-info" aria-hidden="true"></i>' +
      '<div class="panel-preview-notice__copy">' +
      "<strong>Zalecamy pełny podgląd</strong>" +
      "<p>Ramka w panelu jest węższa niż prawdziwy sklep — nagłówek i sekcje mogą tu wyglądać inaczej. Otwórz pełną stronę, aby zobaczyć finalny układ bez ograniczeń.</p>" +
      "</div></div>";

    var toolbar = panelOnMobile
      ? '<div class="panel-preview-toolbar panel-preview-toolbar--mobile-only">' +
        '<span class="panel-preview-mobile-badge"><i class="fas fa-mobile-screen" aria-hidden="true"></i> Podgląd mobilny</span>' +
        '<button type="button" class="panel-preview-open-btn" data-open-full-preview><i class="fas fa-up-right-from-square" aria-hidden="true"></i> Pełna strona</button>' +
        "</div>"
      : '<div class="panel-preview-toolbar">' +
        '<div class="panel-preview-toolbar__start">' +
        '<div class="panel-device-tabs" aria-label="Tryb podglądu">' +
        '<button type="button" class="' +
        (device === "desktop" ? "is-active" : "") +
        '" data-preview-device="desktop"><i class="fas fa-desktop" aria-hidden="true"></i> Desktop</button>' +
        '<button type="button" class="' +
        (device === "mobile" ? "is-active" : "") +
        '" data-preview-device="mobile"><i class="fas fa-mobile-screen" aria-hidden="true"></i> Mobile</button>' +
        "</div></div>" +
        '<button type="button" class="panel-preview-open-btn panel-preview-open-btn--primary" data-open-full-preview><i class="fas fa-up-right-from-square" aria-hidden="true"></i> Pełny podgląd</button>' +
        "</div>";

    return (
      previewNotice +
      toolbar +
      '<div class="panel-store-preview' +
      (compact ? " panel-store-preview--compact" : "") +
      (device === "mobile" ? " is-mobile" : "") +
      '" data-store-preview>' +
      '<div class="panel-browser">' +
      '<div class="panel-browser__bar">' +
      '<span class="panel-browser__dot"></span><span class="panel-browser__dot"></span><span class="panel-browser__dot"></span>' +
      '<span class="panel-browser__url">' +
      escapeHtml(store.slug) +
      ".amiqplace.pl</span></div>" +
      '<div class="panel-browser__content">' +
      buildStorefrontInner(store, { compact: compact, device: device, ownerPreview: true }) +
      "</div></div></div>"
    );
  }

  function buildPreviewProjectFromTemplate(templateId) {
    var defaults = getTemplateDefaults(templateId) || {};
    return normalizeStore(
      Object.assign(
        {
          id: "preview_" + templateId,
          name: defaults.name || "Podgląd",
          slug: "podglad-szablonu",
          status: "draft",
          templateId: templateId,
          theme: defaults.theme || "blank",
          thumb: defaults.thumb || defaults.theme || "blank"
        },
        defaults
      )
    );
  }

  function buildTemplatePreviewFrame(templateId) {
    var store = buildPreviewProjectFromTemplate(templateId);
    if (!store) return "";
    return (
      '<div class="panel-browser panel-browser--template">' +
      '<div class="panel-browser__bar">' +
      '<span class="panel-browser__dot"></span><span class="panel-browser__dot"></span><span class="panel-browser__dot"></span>' +
      '<span class="panel-browser__url">' +
      escapeHtml(store.slug) +
      ".amiqplace.pl</span></div>" +
      '<div class="panel-browser__content panel-browser__content--template">' +
      buildStorefrontInner(store, { compact: false, device: "desktop" }) +
      "</div></div>"
    );
  }

  function getFashionProducts() {
    return [
      normalizeProduct({
        id: "prod_fashion_1",
        name: "Koszula Oversize Linen",
        price: 189,
        comparePrice: 229,
        stock: 22,
        status: "active",
        desc: "Naturalny len, luźny krój",
        longDesc:
          "Koszula oversize z premium lnu — lekka, przewiewna i idealna na cieplejsze dni.\n\nLuźny fason pasuje do denim i eleganckich spodni z wysokim stanem. Subtelna tekstura materiału dodaje charakteru każdej stylizacji.",
        image: PRODUCT_IMAGE_PRESETS[0].url,
        gallery: [PRODUCT_IMAGE_PRESETS[1].url, PRODUCT_IMAGE_PRESETS[4].url],
        tag: "Nowość",
        sku: "LIN-OS-01",
        shippingTime: "24–48 h",
        variants: [{ name: "Rozmiar", options: ["XS", "S", "M", "L", "XL"] }],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_fashion_2",
        name: "Spodnie Wide Fit",
        price: 249,
        stock: 18,
        status: "active",
        desc: "Wysoki stan, miękka bawełna",
        longDesc:
          "Spodnie wide fit z wysokim stanem — komfort na co dzień i elegancki kształt.\n\nMiękka bawełna z dodatkiem elastanu. Pas idealny do koszul i kardiganów.",
        image: PRODUCT_IMAGE_PRESETS[1].url,
        gallery: [PRODUCT_IMAGE_PRESETS[0].url],
        tag: "Bestseller",
        sku: "WIDE-02",
        shippingTime: "1–3 dni robocze",
        variants: [
          { name: "Rozmiar", options: ["S", "M", "L"] },
          { name: "Kolor", options: ["Czarny", "Beż"] }
        ],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_fashion_3",
        name: "Marynarka Minimal",
        price: 329,
        stock: 11,
        status: "active",
        desc: "Klasyczna linia, uniwersalny fason",
        longDesc: "Minimalistyczna marynarka z lekką podszewką. Dopełnia lookbookowe stylizacje i sprawdza się w biurze.",
        image: PRODUCT_IMAGE_PRESETS[2].url,
        tag: null,
        sku: "BLZ-MIN-03",
        shippingTime: "2–4 dni robocze",
        variants: [{ name: "Rozmiar", options: ["S", "M", "L", "XL"] }],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_fashion_4",
        name: "Sneakersy Cloud Step",
        price: 299,
        comparePrice: 349,
        stock: 30,
        status: "active",
        desc: "Lekka podeszwa, codzienny komfort",
        longDesc: "Sneakersy z amortyzującą podeszwą Cloud Step — lekkie, wygodne i odporne na codzienne użytkowanie.",
        image: PRODUCT_IMAGE_PRESETS[2].url,
        gallery: [PRODUCT_IMAGE_PRESETS[3].url],
        tag: "Promocja",
        sku: "SNK-CLD-04",
        shippingTime: "24–48 h",
        variants: [{ name: "Rozmiar", options: ["36", "37", "38", "39", "40", "41", "42", "43", "44"] }],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_fashion_5",
        name: "Torebka Soft Curve",
        price: 199,
        stock: 14,
        status: "active",
        desc: "Skóra ekologiczna, limitowana seria",
        longDesc: "Torebka Soft Curve — miękka linia, wewnętrzna kieszeń na telefon i regulowany pasek.",
        image: PRODUCT_IMAGE_PRESETS[3].url,
        tag: "Limitowana",
        sku: "BAG-SC-05",
        shippingTime: "1–3 dni robocze",
        variants: [{ name: "Kolor", options: ["Karmel", "Czarny"] }],
        updatedAt: Date.now()
      })
    ];
  }

  function getTemplateDefaults(templateId) {
    if (templateId === "amiq-minimal") {
      return {
        name: "AmiQPlace Classic",
        storeName: "AmiQPlace Classic",
        heroTitle: "Twój sklep online w kilka minut",
        heroSubtitle: "Uniwersalny szablon AmiQPlace — dodaj produkty, zmień nagłówki i opublikuj, gdy będziesz gotowy.",
        heroCta: "Przeglądaj produkty",
        sectionTitle: "Polecane produkty",
        sectionSubtitle: "Kilka przykładowych pozycji — podmień je własną ofertą w panelu.",
        aboutTitle: "Dlaczego AmiQPlace Classic?",
        aboutText:
          "To oficjalny, uniwersalny szablon startowy AmiQPlace. Sprawdza się w każdej branży: od rękodzieła po usługi lokalne. Edytuj teksty, dodawaj produkty i rozwijaj sklep bez kodowania.",
        announcement: "Darmowa dostawa przy zamówieniach powyżej 150 zł",
        theme: "blank",
        thumb: "blank",
        checklist: { theme: true, product: true, payments: false, shipping: false },
        products: [
          {
            id: "prod_demo_1",
            name: "Produkt startowy",
            price: 49.99,
            stock: 30,
            status: "active",
            desc: "Idealny na pierwszą ofertę w sklepie",
            image: PRODUCT_IMAGE_PRESETS[0].url,
            tag: "Nowość",
            updatedAt: Date.now()
          },
          {
            id: "prod_demo_2",
            name: "Zestaw premium",
            price: 129,
            stock: 15,
            status: "active",
            desc: "Pakiet bestsellerów do szybkiego startu",
            image: PRODUCT_IMAGE_PRESETS[5].url,
            tag: "Bestseller",
            updatedAt: Date.now()
          },
          {
            id: "prod_demo_3",
            name: "Akcesoria codzienne",
            price: 39.5,
            stock: 40,
            status: "active",
            desc: "Uzupełnienie katalogu na start",
            image: PRODUCT_IMAGE_PRESETS[3].url,
            tag: null,
            updatedAt: Date.now()
          }
        ]
      };
    }
    if (templateId === "amiq-fashion") {
      return {
        name: "Moda & Lookbook",
        storeName: "Moda & Lookbook",
        templateId: "amiq-fashion",
        heroTitle: "Styl na co dzień i na wyjątkowe chwile",
        heroSubtitle: "Sezonowe kolekcje, edytorialny lookbook i starannie wyselekcjonowane bestsellery.",
        heroCta: "Odkryj kolekcję",
        heroBadge: "Kolekcja Wiosna 2026",
        heroImage: FASHION_BANNER_DEFAULT,
        heroOverlay: 42,
        colorMode: "light",
        accentColor: "#8b52c4",
        cardRadius: "soft",
        headingStyle: "editorial",
        lookbookTitle: "Lookbook sezonu",
        lookbookSubtitle: "Dwie linie produktowe — od codziennych essentials po edycje limitowane.",
        logoMode: "text",
        logoText: "Moda & Lookbook",
        logoFont: "playfair",
        collections: [
          {
            id: "col_fashion_1",
            title: "Nowa kolekcja",
            subtitle: "Wiosna 2026",
            image: BANNER_PRESETS[0].url,
            productIds: ["prod_fashion_1", "prod_fashion_2"]
          },
          {
            id: "col_fashion_2",
            title: "Essentials",
            subtitle: "Codzienne must-have",
            image: BANNER_PRESETS[1].url,
            productIds: ["prod_fashion_3", "prod_fashion_4"]
          }
        ],
        sectionTitle: "Bestsellery",
        sectionSubtitle: "Najczęściej wybierane produkty naszych klientów.",
        aboutTitle: "Marka z charakterem",
        aboutText:
          "Projektujemy ubrania i akcesoria, które łączą komfort z nowoczesną estetyką. Każda kolekcja powstaje z myślą o świadomym stylu i trwałej jakości.",
        newsletterTitle: "Dołącz do listy VIP",
        newsletterSubtitle: "Pierwsze info o dropach, promocjach i nowych lookbookach.",
        announcement: "Darmowa dostawa i zwrot do 30 dni na pierwsze zamówienie",
        theme: "fashion",
        thumb: "fashion",
        checklist: { theme: true, product: true, payments: false, shipping: false },
        sectionVisibility: {
          announcement: true,
          hero: true,
          trust: true,
          lookbook: true,
          products: true,
          about: true,
          newsletter: true
        },
        products: getFashionProducts()
      };
    }
    if (templateId === "amiq-tech") {
      var techProducts = getTechProducts();
      return {
        name: "Tech Store Pro",
        storeName: "TechVault Pro",
        templateId: "amiq-tech",
        storeCategory: "electronics",
        heroTitle: "Technologia, która przyspiesza Twój dzień",
        heroSubtitle:
          "Laptopy, audio, smartfony i smart home — porównuj specyfikacje, wybieraj warianty i kupuj z gwarancją w jednym miejscu.",
        heroCta: "Odkryj produkty",
        heroBadge: "Nowa seria · Q2 2026",
        heroImage: TECH_BANNER_DEFAULT,
        heroLayout: "split",
        heroOverlay: 58,
        colorMode: "dark",
        accentColor: "#38bdf8",
        cardRadius: "soft",
        headingStyle: "modern",
        lookbookTitle: "Promocje tygodnia",
        lookbookSubtitle: "Wybrane zestawy i akcesoria w obniżonych cenach — tylko do wyczerpania stanów.",
        collections: [
          {
            id: "col_tech_1",
            title: "Audio Week −20%",
            subtitle: "Słuchawki i głośniki premium",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
            productIds: ["prod_tech_1", "prod_tech_6"]
          },
          {
            id: "col_tech_2",
            title: "Laptop + torba gratis",
            subtitle: "Zestawy dla pracy zdalnej",
            image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
            productIds: ["prod_tech_2", "prod_tech_5"]
          },
          {
            id: "col_tech_3",
            title: "Smartfony w ratach 0%",
            subtitle: "Flagowce z dostawą 24h",
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
            productIds: ["prod_tech_3"]
          }
        ],
        techCategories: [
          {
            id: "phones",
            label: "Smartfony",
            icon: "fa-mobile-screen",
            desc: "Flagowce i modele mid-range",
            productIds: ["prod_tech_3"]
          },
          {
            id: "computers",
            label: "Komputery",
            icon: "fa-laptop",
            desc: "Laptopy, monitory, stacje",
            productIds: ["prod_tech_2", "prod_tech_5"]
          },
          {
            id: "audio",
            label: "Audio",
            icon: "fa-headphones",
            desc: "ANC, Hi-Res, bezprzewodowe",
            productIds: ["prod_tech_1"]
          },
          {
            id: "wearables",
            label: "Wearables",
            icon: "fa-watch-smart",
            desc: "Smartwatche i opaski",
            productIds: ["prod_tech_6"]
          }
        ],
        techCompareTitle: "Porównaj bestsellery",
        techCompareSubtitle: "Zestawienie kluczowych parametrów — bez przekopywania się przez opisy.",
        techCategoriesTitle: "Przeglądaj kategorie",
        techCategoriesSubtitle: "Szybki dostęp do segmentów oferty — smartfony, audio, komputery i wearables.",
        techBrandsLabel: "Autoryzowani partnerzy",
        techFaqTitle: "Pytania przed zakupem",
        techFaqSubtitle: "Gwarancja, dostawa, raty i zwroty — najczęstsze wątpliwości klientów tech.",
        techCompare: {
          productIds: ["prod_tech_1", "prod_tech_2", "prod_tech_3"],
          specKeys: ["Chip / Procesor", "Pamięć", "Bateria", "Gwarancja", "Waga"]
        },
        techFaqs: [
          {
            q: "Czy produkty są nowe i z polskiej dystrybucji?",
            a: "Tak — sprzedajemy wyłącznie nowy sprzęt z oficjalnej dystrybucji i fakturą VAT. Każda sztuka ma numer seryjny do rejestracji gwarancji."
          },
          {
            q: "Jak szybko realizujecie wysyłkę?",
            a: "Zamówienia złożone do 15:00 wysyłamy tego samego dnia roboczego. Standardowy czas dostawy kurierem to 1–2 dni robocze."
          },
          {
            q: "Czy mogę kupić na raty lub leasing?",
            a: "W demo panelu dostępne są płatności przelewem i BLIK. W produkcji podłączysz PayU, Przelewy24 lub raty bankowe."
          },
          {
            q: "Jak działa zwrot i reklamacja?",
            a: "Masz 30 dni na zwrot bez podania przyczyny. Reklamacje gwarancyjne obsługujemy przez autoryzowany serwis — status śledzisz w panelu zamówień."
          },
          {
            q: "Czy pomagacie dobrać sprzęt pod potrzeby?",
            a: "Tak — skorzystaj z porównywarki specyfikacji na stronie głównej lub napisz na kontakt. Doradzimy konfigurację pod pracę, gaming lub mobilność."
          }
        ],
        techBrands: ["Apple", "Samsung", "Sony", "Logitech", "Dell", "ASUS", "JBL", "Anker"],
        techHeroStats: [
          { value: "1 200+", label: "Produktów w katalogu" },
          { value: "24h", label: "Wysyłka ekspres" },
          { value: "4.9★", label: "Ocena klientów" }
        ],
        logoMode: "text",
        logoText: "TechVault",
        logoFont: "satoshi",
        sectionTitle: "Bestsellery tech",
        sectionSubtitle: "Najczęściej wybierane urządzenia — z pełną specyfikacją i wariantami.",
        aboutTitle: "Sklep zaprojektowany pod elektronikę",
        aboutText:
          "TechVault Pro to szablon AmiQPlace dla branży tech: ciemny motyw, porównywarka parametrów, sekcja FAQ i karty produktów z kluczowymi specyfikacjami. Edytuj teksty, kolory i ofertę w panelu — bez kodowania.",
        newsletterTitle: "Tech dropy i promocje",
        newsletterSubtitle: "Zapisz się po wcześniejszy dostęp do premier i kodów rabatowych.",
        announcement: "Darmowa dostawa przy zamówieniach powyżej 299 zł · Gwarancja producenta",
        theme: "tech",
        thumb: "tech",
        checklist: { theme: true, product: true, payments: true, shipping: true },
        checkout: (function () {
          var c = getDefaultStoreCheckout();
          c.payments.enabled = ["blik", "transfer", "cod"];
          c.payments.primary = "blik";
          c.payments.codFee = 5;
          c.payments.configured = true;
          c.shipping.freeFrom = 299;
          c.shipping.configured = true;
          c.shipping.methods.forEach(function (m) {
            m.enabled =
              m.id === "inpost_express" ||
              m.id === "dhl_courier" ||
              m.id === "dpd_courier" ||
              m.id === "inpost_courier" ||
              m.id === "inpost_locker" ||
              m.id === "orlen_paczka" ||
              m.id === "dpd_pickup" ||
              m.id === "allegro_one" ||
              m.id === "dhl_pop";
          });
          return c;
        })(),
        sectionVisibility: {
          announcement: true,
          hero: true,
          heroStats: true,
          trust: true,
          categories: true,
          deals: true,
          products: true,
          compare: true,
          faq: true,
          brands: true,
          about: true,
          newsletter: true
        },
        products: techProducts
      };
    }
    if (templateId === "amiq-lux") {
      var luxProducts = getLuxProducts();
      return {
        name: "Maison Éclat",
        storeName: "Maison Éclat",
        templateId: "amiq-lux",
        storeCategory: "fashion",
        heroTitle: "Sztuka bycia wyjątkowym",
        heroSubtitle:
          "Kuratorski butik luksusowy — maroquinerie, joaillerie i essences w limitowanych edycjach. Rzemiosło, które przetrwa pokolenia.",
        heroCta: "Odkryj kolekcję",
        heroBadge: "Maison · Édition Limitée SS26",
        heroImage: LUX_BANNER_DEFAULT,
        heroOverlay: 48,
        colorMode: "dark",
        accentColor: "#c9a962",
        cardRadius: "soft",
        headingStyle: "editorial",
        lookbookTitle: "Kolekcje haute",
        lookbookSubtitle: "Trzy linie produktowe — od ikonicznej maroquinerie po joaillerie i essences.",
        logoMode: "text",
        logoText: "Maison Éclat",
        logoFont: "playfair",
        collections: [
          {
            id: "col_lux_1",
            title: "Haute Maroquinerie",
            subtitle: "Skóra garbowana roślinnie · ręczne szwy · numeracja",
            image: LUX_COLLECTION_PRESETS[0],
            productIds: ["prod_lux_1", "prod_lux_6"]
          },
          {
            id: "col_lux_2",
            title: "Joaillerie & Horlogerie",
            subtitle: "Złoto 18K · szafiry · mechanizmy szwajcarskie",
            image: LUX_COLLECTION_PRESETS[1],
            productIds: ["prod_lux_2", "prod_lux_3"]
          },
          {
            id: "col_lux_3",
            title: "Essences & Silks",
            subtitle: "Parfum extrait · jedwab mulberry · edycje sezonowe",
            image: LUX_COLLECTION_PRESETS[2],
            productIds: ["prod_lux_4", "prod_lux_5"]
          }
        ],
        sectionTitle: "Kuratorski wybór",
        sectionSubtitle: "Sześć ikonicznych produktów — każdy w limitowanej partii z certyfikatem autentyczności.",
        aboutTitle: "La Maison depuis 1987",
        aboutText:
          "Maison Éclat powstała w Mediolanie z wizją tworzenia przedmiotów ponadczasowych. Łączymy tradycyjne rzemiosło atelier z nowoczesną estetyką — dla klientów, którzy cenią autentyczność i detal.",
        luxStoryTitle: "Atelier & savoir-faire",
        luxStoryText:
          "W naszym warszawskim atelier każdy produkt przechodzi minimum 47 etapów kontroli. Współpracujemy z mistrzami rzemiosła z Florencji, Genewy i Paryża — bez kompromisów w kwestii materiałów i etyki produkcji.",
        luxStoryImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
        luxExperienceTitle: "Private Shopping",
        luxExperienceText:
          "Umów spersonalizowaną sesję z doradcą stylisty — online przez concierge lub w naszym butiku flagowym. Dostawa white-glove w całej Polsce.",
        luxExperienceCta: "Umów konsultację",
        luxPillars: [
          {
            icon: "fa-gem",
            title: "Materiały pierwszej klasy",
            desc: "Skóra garbowana roślinnie, jedwab mulberry i metale szlachetne."
          },
          {
            icon: "fa-hand-sparkles",
            title: "Ręczne wykończenie",
            desc: "Każdy egzemplarz przechodzi kontrolę jakości w atelier."
          },
          {
            icon: "fa-certificate",
            title: "Certyfikat autentyczności",
            desc: "Numer seryjny, opakowanie archivalne i dożywotnia konserwacja."
          }
        ],
        luxPress: [
          { quote: "„Definicja nowoczesnego luksusu bez kompromisów.”", source: "Vogue Poland" },
          { quote: "„Butik, który rozumie sztukę prezentacji.”", source: "Elle Man" },
          { quote: "„Kolekcje warte kolekcjonowania.”", source: "Forbes Life" }
        ],
        newsletterTitle: "Lista VIP Maison",
        newsletterSubtitle: "Pierwsze informacje o dropach limitowanych, zaproszenia na private shopping i dostęp do pre-orderów.",
        announcement: "Darmowa dostawa white-glove przy zamówieniach powyżej 2 000 zł",
        theme: "lux",
        thumb: "lux",
        checklist: { theme: true, product: true, payments: false, shipping: false },
        sectionVisibility: {
          announcement: true,
          hero: true,
          trust: true,
          lookbook: true,
          products: true,
          luxStory: true,
          luxCraft: true,
          luxExperience: true,
          luxPress: true,
          about: true,
          newsletter: true
        },
        products: luxProducts
      };
    }
    if (templateId === "amiq-enterprise") {
      var entProducts = [
        {
          id: "prod_ent_1",
          name: "Atlas Pro Workspace",
          price: 2490,
          stock: 42,
          status: "active",
          desc: "Ergonomiczne stanowisko biurowe — linia corporate",
          image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
          tag: "B2B",
          brandLabel: "NordLine Office",
          updatedAt: Date.now()
        },
        {
          id: "prod_ent_2",
          name: "Meridian Smart Display 55″",
          price: 4299,
          stock: 18,
          status: "active",
          desc: "Panel interaktywny do sal konferencyjnych",
          image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
          tag: "Nowość",
          brandLabel: "Meridian Tech",
          updatedAt: Date.now()
        },
        {
          id: "prod_ent_3",
          name: "Verde Organic Box",
          price: 89,
          stock: 320,
          status: "active",
          desc: "Zestaw bio przekąsek — linia HoReCa",
          image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
          brandLabel: "Verde Foods",
          updatedAt: Date.now()
        },
        {
          id: "prod_ent_4",
          name: "Aurum Executive Set",
          price: 1890,
          stock: 24,
          status: "active",
          desc: "Zestaw premium gifting — corporate rewards",
          image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
          tag: "Premium",
          brandLabel: "Aurum Gifts",
          updatedAt: Date.now()
        },
        {
          id: "prod_ent_5",
          name: "Pulse Fitness Band Pro",
          price: 449,
          stock: 95,
          status: "active",
          desc: "Opaski wellness — program benefitów pracowniczych",
          image: "https://images.unsplash.com/photo-1576243345690-4e4b79b6328d?auto=format&fit=crop&w=800&q=80",
          brandLabel: "Pulse Active",
          updatedAt: Date.now()
        },
        {
          id: "prod_ent_6",
          name: "CloudSync ERP Connector",
          price: 990,
          stock: 999,
          status: "active",
          desc: "Licencja roczna — synchronizacja zamówień i stanów",
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
          tag: "SaaS",
          brandLabel: "AmiQ Integrations",
          updatedAt: Date.now()
        }
      ];
      return {
        name: "Multi-brand Hub",
        storeName: "Multi-brand Hub",
        templateId: "amiq-enterprise",
        heroTitle: "Jedna platforma. Wiele marek. Pełna kontrola.",
        heroSubtitle:
          "Zarządzaj portfolio sklepów, segmentacją B2B i raportami cross-brand z jednego panelu AmiQPlace — bez rozproszenia danych.",
        heroCta: "Poznaj marki",
        heroBadge: "Enterprise · Multi-brand",
        heroImage: ENTERPRISE_BANNER_DEFAULT,
        heroOverlay: 52,
        colorMode: "light",
        accentColor: "#0f766e",
        cardRadius: "soft",
        headingStyle: "modern",
        logoMode: "text",
        logoText: "Multi-brand Hub",
        logoFont: "satoshi",
        sectionTitle: "Katalog łączony",
        sectionSubtitle: "Produkty ze wszystkich marek w hubie — z etykietą brandu i stanem magazynowym.",
        aboutTitle: "Platforma dla grup retailowych",
        aboutText:
          "Multi-brand Hub łączy wiele sklepów w jednym ekosystemie: osobne brandingi, wspólna infrastruktura płatności i dostaw, segmentacja B2B oraz raporty marży per marka i kanał sprzedaży.",
        newsletterTitle: "Briefing dla partnerów B2B",
        newsletterSubtitle: "Comiesięczny digest: nowe marki w hubie, integracje API i case studies wdrożeń.",
        announcement: "Nowe marki w hubie co kwartał · Raporty cross-brand w planie Professional",
        theme: "enterprise",
        thumb: "enterprise",
        checklist: { theme: true, product: true, payments: true, shipping: true },
        enterpriseBrandsTitle: "Portfolio marek",
        enterpriseBrandsSubtitle: "Każda marka ma własny katalog, baner i raporty — zarządzane centralnie.",
        enterpriseSolutionsTitle: "Platforma B2B",
        enterpriseSolutionsSubtitle: "Narzędzia dla zespołów handlowych, franczyz i partnerów dystrybucyjnych.",
        enterpriseSegmentsTitle: "Segmenty klientów",
        enterpriseSegmentsSubtitle: "Osobne cenniki, widoczność produktów i warunki płatności dla każdej grupy.",
        enterpriseCasesTitle: "Historie sukcesu",
        enterpriseCasesSubtitle: "Jak grupy retailowe skalują sprzedaż wielu marek w AmiQPlace.",
        enterprisePartnersLabel: "Ekosystem integracji",
        enterpriseFaqTitle: "Pytania B2B",
        enterpriseFaqSubtitle: "Wdrożenie, integracje, faktury i warunki współpracy.",
        enterprisePortalTitle: "Portal partnera B2B",
        enterprisePortalSubtitle: "Zamówienia hurtowe, statusy dostaw i raporty marży w jednym miejscu.",
        enterprisePortalCta: "Poproś o dostęp",
        enterpriseHeroStats: [
          { value: "12", label: "Marek w hubie" },
          { value: "48k", label: "SKU łącznie" },
          { value: "99.9%", label: "Uptime SLA" }
        ],
        enterpriseBrands: [
          {
            id: "eb1",
            name: "NordLine Office",
            tagline: "Meble i wyposażenie biur premium",
            category: "Workspace",
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
            productCount: "840"
          },
          {
            id: "eb2",
            name: "Meridian Tech",
            tagline: "Sprzęt AV i rozwiązania smart office",
            category: "Technology",
            image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
            productCount: "620"
          },
          {
            id: "eb3",
            name: "Verde Foods",
            tagline: "Catering bio i boxy korporacyjne",
            category: "Food & HoReCa",
            image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
            productCount: "210"
          },
          {
            id: "eb4",
            name: "Aurum Gifts",
            tagline: "Corporate gifting i zestawy VIP",
            category: "Premium",
            image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
            productCount: "380"
          }
        ],
        enterpriseSolutions: [
          {
            id: "es1",
            title: "Centralny katalog",
            desc: "Jeden panel — wiele marek, wspólne reguły cenowe i widoczność per segment.",
            icon: "fa-sitemap"
          },
          {
            id: "es2",
            title: "Segmentacja B2B",
            desc: "Cenniki hurtowe, limity kredytowe i widoczność SKU per grupa klientów.",
            icon: "fa-users-gear"
          },
          {
            id: "es3",
            title: "Raporty cross-brand",
            desc: "Marża, rotacja i konwersja per marka, kanał i region — eksport do CSV.",
            icon: "fa-chart-line"
          },
          {
            id: "es4",
            title: "Integracje API",
            desc: "ERP, CRM, BaseLinker i webhooks — synchronizacja zamówień w czasie rzeczywistym.",
            icon: "fa-plug"
          }
        ],
        enterpriseSegments: [
          {
            id: "seg1",
            title: "Franczyza",
            subtitle: "Osobne cenniki i branding per lokalizacja",
            icon: "fa-store"
          },
          {
            id: "seg2",
            title: "Hurt B2B",
            subtitle: "Minimalne zamówienia i faktury zbiorcze",
            icon: "fa-boxes-stacked"
          },
          {
            id: "seg3",
            title: "Korporacje",
            subtitle: "Programy benefitów i zamówienia centralne",
            icon: "fa-building"
          },
          {
            id: "seg4",
            title: "Marketplace",
            subtitle: "Multi-vendor z moderacją i prowizją",
            icon: "fa-shop"
          }
        ],
        enterpriseCaseStudies: [
          {
            id: "cs1",
            brand: "Retail Group Polska",
            title: "4 marki → 1 panel w 6 tygodni",
            metric: "+34%",
            metricLabel: "wzrost marży łącznej",
            quote: "Scaliliśmy cztery sklepy bez utraty tożsamości marek — raporty mamy pierwszy raz w jednym miejscu.",
            image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80"
          },
          {
            id: "cs2",
            brand: "HoReCa Alliance",
            title: "Segmentacja B2B dla 200+ lokali",
            metric: "−18h",
            metricLabel: "mniej pracy operacyjnej / tydz.",
            quote: "Portal partnera zastąpił nam chaotyczne zamówienia mailowe i arkusze Excel.",
            image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80"
          }
        ],
        enterprisePartners: ["BaseLinker", "PayU", "InPost", "Fakturownia", "Stripe", "Google Analytics"],
        enterpriseFaqs: [
          {
            q: "Ile marek mogę podłączyć do huba?",
            a: "W planie Professional — do 12 marek z osobnym brandingiem. Wyższe limity po indywidualnej wycenie enterprise."
          },
          {
            q: "Czy każda marka ma własną domenę?",
            a: "Tak — subdomena *.amiqplace.pl w standardzie lub własna domena po weryfikacji DNS w ustawieniach panelu."
          },
          {
            q: "Jak działa segmentacja B2B?",
            a: "Tworzysz grupy klientów z osobnymi cennikami, widocznością produktów i warunkami płatności — bez duplikowania katalogu."
          },
          {
            q: "Czy raporty obejmują wszystkie marki?",
            a: "Tak — dashboard cross-brand plus widoki per marka, kanał sprzedaży i region z eksportem CSV."
          }
        ],
        sectionVisibility: {
          announcement: true,
          hero: true,
          heroStats: true,
          trust: true,
          brandHub: true,
          entSolutions: true,
          entSegments: true,
          products: true,
          entCases: true,
          entPartners: true,
          entFaq: true,
          entPortal: true,
          about: true,
          newsletter: true
        },
        checkout: (function () {
          var c = getDefaultStoreCheckout();
          c.payments.enabled = ["transfer", "blik", "payu"];
          c.payments.primary = "transfer";
          c.payments.configured = true;
          c.shipping.configured = true;
          c.shipping.freeFrom = 500;
          return c;
        })(),
        products: entProducts
      };
    }
    return null;
  }

  function getLuxProducts() {
    return [
      normalizeProduct({
        id: "prod_lux_1",
        name: "Sac Aurora N°7",
        price: 4890,
        comparePrice: 5490,
        stock: 8,
        status: "active",
        desc: "Torebka ze skóry cielęcej · edycja numerowana",
        longDesc:
          "Sac Aurora N°7 to ikona maroquinerie Maison Éclat — miękka skóra cielęca, ręczne szwy saddle stitch i złote okucia w odcieniu champagne.\n\nDołączony certyfikat autentyczności i opakowanie archivalne.",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1590874103328-eac3a477784?auto=format&fit=crop&w=900&q=80"
        ],
        tag: "Édition Limitée",
        sku: "LUX-SAC-A7",
        shippingTime: "24–48 h white-glove",
        variants: [{ name: "Kolor", options: ["Noir", "Champagne", "Bordeaux"] }],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_lux_2",
        name: "Montre Celeste 38",
        price: 12400,
        stock: 4,
        status: "active",
        desc: "Zegarek automatyczny · szafirowe szkło · złoto 18K",
        longDesc:
          "Montre Celeste 38 — szwajcarski mechanizm automatyczny, koperta ze złota 18K i tarcza z masy perłowej.\n\nWodoodporność 50 m · pasek aligator · numer seryjny grawerowany.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
        gallery: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80"],
        tag: "Horlogerie",
        sku: "LUX-WCH-C38",
        shippingTime: "Insured delivery",
        variants: [{ name: "Tarcza", options: ["Perła", "Onyx"] }],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_lux_3",
        name: "Boucles Lumière Or",
        price: 2890,
        stock: 12,
        status: "active",
        desc: "Kolczyki · złoto 18K · szafiry naturalne",
        longDesc: "Kolczyki Lumière Or — ręcznie osadzone szafiry i diamenty w oprawie z żółtego złota 18K.",
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80",
        tag: "Joaillerie",
        sku: "LUX-JWL-LG",
        shippingTime: "24–48 h",
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_lux_4",
        name: "Parfum Éclat Royal 50 ml",
        price: 890,
        stock: 40,
        status: "active",
        desc: "Extrait de parfum · nuty bursztynu i irysa",
        longDesc: "Éclat Royal — kompozycja stworzona przez perfumiarza z Grasse. Nuty głowy: bergamotka, serce: irys, baza: bursztyn i skóra.",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
        tag: "Essences",
        sku: "LUX-PRF-ER50",
        shippingTime: "1–3 dni",
        variants: [{ name: "Pojemność", options: ["50 ml", "100 ml"] }],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_lux_5",
        name: "Foulard Riviera",
        price: 1290,
        stock: 18,
        status: "active",
        desc: "Jedwab mulberry 100% · ręcznie wykończony brzeg",
        longDesc: "Foulard Riviera — jedwab najwyższej jakości, nadruk inspirowany wybrzeżem Amalfi, ręcznie wykończony brzeg.",
        image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80",
        tag: "Silks",
        sku: "LUX-SLK-RV",
        shippingTime: "1–3 dni",
        variants: [{ name: "Wzór", options: ["Azure", "Ivory", "Noir"] }],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_lux_6",
        name: "Oxford Atelier Noir",
        price: 2190,
        stock: 14,
        status: "active",
        desc: "Skóra cielęca · Goodyear welt · ręczne wykończenie",
        longDesc: "Oxford Atelier Noir — klasyczne oxfordy wykonane metodą Goodyear welt. Skóra cielęca, podszewka skórzana, podeszwa skórzana.",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
        tag: "Maroquinerie",
        sku: "LUX-SHO-OX",
        shippingTime: "2–4 dni",
        variants: [
          { name: "Rozmiar", options: ["40", "41", "42", "43", "44"] },
          { name: "Szerokość", options: ["Standard", "Wide"] }
        ],
        updatedAt: Date.now()
      })
    ];
  }

  function getTechProducts() {
    return [
      normalizeProduct({
        id: "prod_tech_1",
        name: "Nova ANC Pro X",
        price: 649,
        comparePrice: 799,
        stock: 34,
        status: "active",
        categoryId: "audio",
        desc: "Flagowe słuchawki z ANC i Hi-Res Audio",
        longDesc:
          "Nova ANC Pro X to bezprzewodowe słuchawki klasy premium z adaptacyjną redukcją szumów i profilem dźwięku Hi-Res.\n\nIdealne do pracy zdalnej, podróży i codziennego słuchania — z 40 godzinami pracy na jednym ładowaniu.",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1484704849701-f032a568e944?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80"
        ],
        tag: "Bestseller",
        sku: "NOVA-ANC-X",
        shippingTime: "24–48 h",
        rating: 4.9,
        variants: [{ name: "Kolor", options: ["Grafit", "Srebrny", "Niebieski"] }],
        specs: [
          { label: "Chip / Procesor", value: "Nova H2" },
          { label: "Pamięć", value: "—" },
          { label: "Bateria", value: "40 h ANC" },
          { label: "Gwarancja", value: "24 mies." },
          { label: "Waga", value: "248 g" }
        ],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_tech_2",
        name: 'Ultrabook Air 15" M4',
        price: 5499,
        stock: 12,
        status: "active",
        categoryId: "computers",
        desc: "15\" · 16 GB · 512 GB SSD · macOS",
        longDesc:
          "Ultrabook Air 15\" z chipem M4 — lekki, cichy i wydajny laptop do kreatywnej pracy i codziennego użytkowania.\n\nEkran Liquid Retina, całodzienna bateria i kompaktowa obudowa aluminiowa.",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80",
        gallery: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80"],
        tag: "Nowość",
        sku: "ULT-AIR-M4",
        shippingTime: "1–3 dni robocze",
        rating: 4.8,
        variants: [
          { name: "Pamięć", options: ["16 GB", "24 GB"] },
          { name: "Dysk", options: ["512 GB", "1 TB"] }
        ],
        specs: [
          { label: "Chip / Procesor", value: "Apple M4" },
          { label: "Pamięć", value: "16 GB unified" },
          { label: "Bateria", value: "do 18 h" },
          { label: "Gwarancja", value: "12 mies." },
          { label: "Waga", value: "1.51 kg" }
        ],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_tech_3",
        name: "Galaxy Pro X 256 GB",
        price: 4299,
        comparePrice: 4599,
        stock: 21,
        status: "active",
        categoryId: "phones",
        desc: "6.7\" AMOLED · 256 GB · 5G",
        longDesc:
          "Flagowy smartfon z ekranem AMOLED 120 Hz, potrójnym aparatem i baterią na cały dzień intensywnego użytkowania.\n\nWodoodporność IP68 i szybkie ładowanie 45 W w zestawie.",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
        tag: "Promocja",
        sku: "GPX-256",
        shippingTime: "24 h",
        rating: 4.7,
        variants: [
          { name: "Pamięć", options: ["256 GB", "512 GB"] },
          { name: "Kolor", options: ["Czarny", "Tytan", "Fiolet"] }
        ],
        specs: [
          { label: "Chip / Procesor", value: "Snapdragon 8 Gen 3" },
          { label: "Pamięć", value: "12 GB RAM" },
          { label: "Bateria", value: "5000 mAh" },
          { label: "Gwarancja", value: "24 mies." },
          { label: "Waga", value: "199 g" }
        ],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_tech_4",
        name: "Mirrorless X-T5 Body",
        price: 6899,
        stock: 7,
        status: "active",
        categoryId: "accessories",
        desc: "40 MP · IBIS · 6K video",
        longDesc:
          "Bezlusterkowiec dla twórców — 40 MP, stabilizacja obrazu IBIS i nagrywanie wideo 6K.\n\nKompaktowa obudowa, klasyczne pokrętła i szeroki wybór obiektywów.",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
        sku: "XT5-BODY",
        shippingTime: "2–4 dni robocze",
        rating: 4.9,
        specs: [
          { label: "Chip / Procesor", value: "X-Processor 5" },
          { label: "Pamięć", value: "2× SD UHS-II" },
          { label: "Bateria", value: "580 zdjęć" },
          { label: "Gwarancja", value: "24 mies." },
          { label: "Waga", value: "557 g" }
        ],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_tech_5",
        name: 'Monitor UltraWide 34" 4K',
        price: 2199,
        stock: 16,
        status: "active",
        categoryId: "computers",
        desc: "3440×1440 · 144 Hz · USB-C 90 W",
        longDesc:
          "Krzywizna 1900R, panel IPS 144 Hz i hub USB-C z ładowaniem laptopa 90 W — jeden kabel do pracy i obrazu.\n\nIdealny do multitaskingu, kodowania i montażu wideo.",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
        tag: "Polecane",
        sku: "UW-34-4K",
        shippingTime: "1–3 dni robocze",
        rating: 4.6,
        specs: [
          { label: "Chip / Procesor", value: "—" },
          { label: "Pamięć", value: "—" },
          { label: "Bateria", value: "—" },
          { label: "Gwarancja", value: "36 mies." },
          { label: "Waga", value: "8.2 kg" }
        ],
        updatedAt: Date.now()
      }),
      normalizeProduct({
        id: "prod_tech_6",
        name: "Pulse X Smartwatch",
        price: 899,
        comparePrice: 999,
        stock: 45,
        status: "active",
        categoryId: "accessories",
        desc: "GPS · NFC · 14 dni baterii",
        longDesc:
          "Smartwatch z GPS, płatnościami NFC i monitoringiem snu. Wodoszczelność 5 ATM i wyświetlacz AMOLED Always-On.\n\nKompatybilny z iOS i Android — świetny towarzysz treningów i codzienności.",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        tag: "Nowość",
        sku: "PULSE-X",
        shippingTime: "24–48 h",
        rating: 4.5,
        variants: [
          { name: "Rozmiar", options: ["42 mm", "46 mm"] },
          { name: "Pasek", options: ["Silikon", "Skóra"] }
        ],
        specs: [
          { label: "Chip / Procesor", value: "Pulse S1" },
          { label: "Pamięć", value: "32 GB" },
          { label: "Bateria", value: "do 14 dni" },
          { label: "Gwarancja", value: "24 mies." },
          { label: "Waga", value: "38 g" }
        ],
        updatedAt: Date.now()
      })
    ];
  }

  function getBlankStoreDefaults(name) {
    return {
      storeName: name || "Nowy sklep",
      heroTitle: "Witaj w naszym sklepie",
      heroSubtitle: "Dodaj produkty i dostosuj teksty — podgląd aktualizuje się na żywo.",
      heroCta: "Zobacz ofertę",
      sectionTitle: "Nasze produkty",
      sectionSubtitle: "Tu pojawią się aktywne produkty z panelu.",
      aboutTitle: "O sklepie",
      aboutText: "Krótko opowiedz klientom, czym się zajmujesz i dlaczego warto u Ciebie kupić."
    };
  }

  function getStorefrontMount(container) {
    if (!container) return null;
    return container.querySelector(".panel-browser__content") || container.querySelector(".sf-store") || container;
  }

  function showSfDemoToast(container, message) {
    var toast = container.querySelector("[data-sf-demo-toast]");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    toast.classList.add("is-visible");
    window.clearTimeout(showSfDemoToast._timer);
    showSfDemoToast._timer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
      toast.hidden = true;
    }, 2800);
  }

  function navigateStorefront(container, store, options, route) {
    container._sfRoute = route;
    container._sfStore = store;
    container._sfOptions = options;
    var mount = getStorefrontMount(container);
    if (!mount) return;
    var opts = Object.assign({}, options || {}, { route: route });
    mount.innerHTML = buildStorefrontInner(store, opts);
    var urlEl = container.querySelector(".panel-browser__url");
    if (urlEl && store) {
      var base = store.slug + ".amiqplace.pl";
      if (route.view === "product" && route.productId) {
        var prod = getProductById(store, route.productId);
        urlEl.textContent = base + "/produkt/" + (prod ? prod.name.toLowerCase().replace(/\s+/g, "-").slice(0, 36) : route.productId);
      } else if (route.view === "cart") urlEl.textContent = base + "/koszyk";
      else if (route.view === "checkout") urlEl.textContent = base + "/checkout";
      else if (route.view === "success") urlEl.textContent = base + "/zamowienie";
      else if (route.view === "search") urlEl.textContent = base + "/szukaj?q=" + encodeURIComponent(route.query || "");
      else urlEl.textContent = base;
    }
    wireStorefront(container, store, options);
  }

  function refreshStorefrontFromHash(container) {
    if (!container || !container._sfStore) return;
    var route = container._sfRoute || parseStorefrontRoute();
    navigateStorefront(container, container._sfStore, container._sfOptions || {}, route);
  }

  function updateCheckoutTotalsUI(container, store) {
    var shipInput = container.querySelector("[data-sf-shipping-method]:checked");
    var payInput = container.querySelector("[data-sf-payment-method]:checked");
    var shipId = shipInput ? shipInput.value : null;
    var payId = payInput ? payInput.value : null;
    var cart = getCart(store.id);
    var totals = calcCartTotals(store, cart, shipId, payId);
    var sub = container.querySelector("[data-sf-checkout-subtotal]");
    var ship = container.querySelector("[data-sf-checkout-shipping]");
    var codRow = container.querySelector("[data-sf-checkout-cod-row]");
    var cod = container.querySelector("[data-sf-checkout-cod]");
    var total = container.querySelector("[data-sf-checkout-total]");
    var btn = container.querySelector("[data-sf-place-order]");
    if (sub) sub.textContent = formatPrice(totals.subtotal);
    if (ship) ship.textContent = totals.shipping > 0 ? formatPrice(totals.shipping) : "Gratis";
    if (codRow) codRow.hidden = !(totals.codFee > 0);
    if (cod) cod.textContent = formatPrice(totals.codFee);
    if (total) total.textContent = formatPrice(totals.total);
    if (btn) btn.innerHTML = '<i class="fas fa-lock" aria-hidden="true"></i> Złóż zamówienie · ' + escapeHtml(formatPrice(totals.total));
  }

  function wireStorefront(container, store, options) {
    if (!container || !store) return;
    store = normalizeStore(store);
    options = options || {};
    container._sfStore = store;
    container._sfOptions = options;

    var pdpEl = container.querySelector("[data-sf-pdp]");
    if (pdpEl) {
      var pdpProduct = getProductById(store, pdpEl.getAttribute("data-sf-pdp"));
      initPdpVariantSelection(container, pdpProduct);
    }

    if (container._sfClickHandler) {
      container.removeEventListener("click", container._sfClickHandler);
    }
    if (container._sfChangeHandler) {
      container.removeEventListener("change", container._sfChangeHandler);
    }
    if (container._sfSubmitHandler) {
      var form = container.querySelector("[data-sf-checkout-form]");
      if (form) form.removeEventListener("submit", container._sfSubmitHandler);
    }

    container._sfClickHandler = function (event) {
      var faqToggle = event.target.closest("[data-sf-tech-faq-toggle]");
      if (faqToggle) {
        event.preventDefault();
        var item = faqToggle.closest(".sf-tech-faq__item");
        if (!item) return;
        var list = item.parentElement;
        if (list) {
          list.querySelectorAll(".sf-tech-faq__item.is-open").forEach(function (el) {
            if (el !== item) {
              el.classList.remove("is-open");
              var btn = el.querySelector("[data-sf-tech-faq-toggle]");
              if (btn) btn.setAttribute("aria-expanded", "false");
            }
          });
        }
        var open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        faqToggle.setAttribute("aria-expanded", open ? "true" : "false");
        return;
      }

      var entFaqToggle = event.target.closest("[data-sf-ent-faq-toggle]");
      if (entFaqToggle) {
        event.preventDefault();
        var entItem = entFaqToggle.closest(".sf-ent-faq__item");
        if (!entItem) return;
        var entList = entItem.parentElement;
        if (entList) {
          entList.querySelectorAll(".sf-ent-faq__item.is-open").forEach(function (el) {
            if (el !== entItem) {
              el.classList.remove("is-open");
              var btn = el.querySelector("[data-sf-ent-faq-toggle]");
              if (btn) btn.setAttribute("aria-expanded", "false");
            }
          });
        }
        var entOpen = !entItem.classList.contains("is-open");
        entItem.classList.toggle("is-open", entOpen);
        entFaqToggle.setAttribute("aria-expanded", entOpen ? "true" : "false");
        return;
      }

      var open = event.target.closest("[data-sf-open-product]");
      if (open) {
        event.preventDefault();
        navigateStorefront(container, store, options, {
          view: "product",
          productId: open.getAttribute("data-sf-open-product")
        });
        try {
          global.history.replaceState(null, "", "#/produkt/" + encodeURIComponent(open.getAttribute("data-sf-open-product")));
        } catch (e) {}
        return;
      }
      if (event.target.closest("[data-sf-open-cart]")) {
        event.preventDefault();
        navigateStorefront(container, store, options, { view: "cart", productId: null });
        try {
          global.history.replaceState(null, "", "#/koszyk");
        } catch (e) {}
        return;
      }
      if (event.target.closest("[data-sf-open-checkout]")) {
        event.preventDefault();
        navigateStorefront(container, store, options, { view: "checkout", productId: null });
        try {
          global.history.replaceState(null, "", "#/checkout");
        } catch (e) {}
        return;
      }
      var back = event.target.closest("[data-sf-back-catalog]");
      if (back) {
        event.preventDefault();
        navigateStorefront(container, store, options, { view: "home", productId: null });
        try {
          global.history.replaceState(null, "", "#produkty");
        } catch (e) {}
        return;
      }
      var thumb = event.target.closest("[data-sf-gallery-thumb]");
      if (thumb) {
        var url = thumb.getAttribute("data-sf-gallery-thumb");
        var main = container.querySelector("[data-sf-pdp-main-image]");
        container.querySelectorAll("[data-sf-gallery-thumb]").forEach(function (t) {
          t.classList.toggle("is-active", t === thumb);
        });
        if (main && url) main.style.backgroundImage = "url('" + (safeCssUrl(url) || url) + "')";
        return;
      }
      var variantBtn = event.target.closest("[data-sf-variant]");
      if (variantBtn) {
        event.preventDefault();
        var groupName = variantBtn.getAttribute("data-sf-variant");
        var groupEl = variantBtn.closest("[data-sf-variant-group]");
        if (groupEl) {
          groupEl.querySelectorAll("[data-sf-variant]").forEach(function (btn) {
            btn.classList.toggle("is-active", btn === variantBtn);
            btn.setAttribute("aria-selected", btn === variantBtn ? "true" : "false");
          });
        }
        if (!container._sfVariantSelection) container._sfVariantSelection = {};
        container._sfVariantSelection[groupName] = variantBtn.getAttribute("data-sf-variant-value") || "";
        return;
      }
      var addCart = event.target.closest("[data-sf-demo-cart]");
      if (addCart) {
        event.preventDefault();
        var pdp = container.querySelector("[data-sf-pdp]");
        var pid = pdp ? pdp.getAttribute("data-sf-pdp") : null;
        var qtyInput = container.querySelector("[data-sf-qty-input]");
        var qty = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
        var pAdd = pid ? getProductById(store, pid) : null;
        var selAdd = pAdd ? collectPdpVariantSelections(container, pAdd) : {};
        if (pAdd && pAdd.variants && pAdd.variants.length && !selAdd) {
          showSfDemoToast(container, "Wybierz wszystkie warianty przed dodaniem do koszyka.");
          return;
        }
        if (pid && addToCart(store, pid, qty, selAdd || {})) {
          showSfDemoToast(container, "Dodano do koszyka");
          var stayRoute = container._sfRoute || parseStorefrontRoute();
          navigateStorefront(container, store, options, stayRoute);
        }
        return;
      }
      var buyNow = event.target.closest("[data-sf-demo-buy]");
      if (buyNow) {
        event.preventDefault();
        var pdpEl = container.querySelector("[data-sf-pdp]");
        var productId = pdpEl ? pdpEl.getAttribute("data-sf-pdp") : null;
        var qIn = container.querySelector("[data-sf-qty-input]");
        var q = qIn ? parseInt(qIn.value, 10) || 1 : 1;
        var pBuy = productId ? getProductById(store, productId) : null;
        var selBuy = pBuy ? collectPdpVariantSelections(container, pBuy) : {};
        if (pBuy && pBuy.variants && pBuy.variants.length && !selBuy) {
          showSfDemoToast(container, "Wybierz wszystkie warianty przed zakupem.");
          return;
        }
        if (productId && addToCart(store, productId, q, selBuy || {})) {
          navigateStorefront(container, store, options, { view: "checkout", productId: null });
          try {
            global.history.replaceState(null, "", "#/checkout");
          } catch (e2) {}
        }
        return;
      }
      var minusCart = event.target.closest("[data-sf-cart-minus]");
      if (minusCart) {
        event.preventDefault();
        var idM = minusCart.getAttribute("data-sf-cart-minus");
        var itemM = getCart(store.id).find(function (x) {
          return x.cartItemId === idM;
        });
        if (itemM) updateCartItemQty(store.id, idM, itemM.qty - 1);
        refreshStorefrontFromHash(container);
        return;
      }
      var plusCart = event.target.closest("[data-sf-cart-plus]");
      if (plusCart) {
        event.preventDefault();
        var idP = plusCart.getAttribute("data-sf-cart-plus");
        var itemP = getCart(store.id).find(function (x) {
          return x.cartItemId === idP;
        });
        if (itemP) updateCartItemQty(store.id, idP, itemP.qty + 1);
        refreshStorefrontFromHash(container);
        return;
      }
      var removeCart = event.target.closest("[data-sf-cart-remove]");
      if (removeCart) {
        event.preventDefault();
        removeFromCart(store.id, removeCart.getAttribute("data-sf-cart-remove"));
        refreshStorefrontFromHash(container);
        return;
      }
      var checkoutOpt = event.target.closest(".sf-checkout-option");
      if (checkoutOpt && event.target !== checkoutOpt.querySelector("input")) {
        var radio = checkoutOpt.querySelector("input");
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      var input = container.querySelector("[data-sf-qty-input]");
      if (input && event.target.closest("[data-sf-qty-minus]")) {
        input.value = String(Math.max(1, (parseInt(input.value, 10) || 1) - 1));
      }
      if (input && event.target.closest("[data-sf-qty-plus]")) {
        input.value = String(Math.min(parseInt(input.max, 10) || 99, (parseInt(input.value, 10) || 1) + 1));
      }
    };

    container._sfChangeHandler = function (event) {
      if (event.target.matches("[data-sf-shipping-method], [data-sf-payment-method]")) {
        container.querySelectorAll(".sf-checkout-option").forEach(function (opt) {
          var inp = opt.querySelector("input");
          opt.classList.toggle("is-selected", inp && inp.checked);
        });
        var bankInfo = container.querySelector("[data-sf-bank-info]");
        if (bankInfo) {
          var pay = container.querySelector("[data-sf-payment-method]:checked");
          bankInfo.hidden = !pay || pay.value !== "transfer";
        }
        var codInfo = container.querySelector("[data-sf-cod-info]");
        if (codInfo) {
          var payCod = container.querySelector("[data-sf-payment-method]:checked");
          codInfo.hidden = !payCod || payCod.value !== "cod";
        }
        if (event.target.matches("[data-sf-shipping-method]")) {
          updateCheckoutDeliveryUI(container);
        }
        updateCheckoutTotalsUI(container, store);
      }
    };

    container._sfSubmitHandler = function (event) {
      event.preventDefault();
      var name = container.querySelector("[data-sf-field-name]");
      var email = container.querySelector("[data-sf-field-email]");
      var phone = container.querySelector("[data-sf-field-phone]");
      var consent = container.querySelector("[data-sf-field-consent]");
      if (!name || !name.value.trim() || !email || !email.value.trim()) {
        showSfDemoToast(container, "Uzupełnij dane kontaktowe");
        return;
      }
      if (!phone || !phone.value.trim()) {
        showSfDemoToast(container, "Podaj numer telefonu do kuriera lub punktu odbioru");
        return;
      }
      var shipEl = container.querySelector("[data-sf-shipping-method]:checked");
      if (!shipEl) {
        showSfDemoToast(container, "Wybierz metodę dostawy");
        return;
      }
      var isPickup = shipEl.getAttribute("data-sf-shipping-category") === "pickup";
      var deliverySummary = "";
      if (isPickup) {
        var pickupPoint = container.querySelector("[data-sf-field-pickup-point]");
        var pickupCity = container.querySelector("[data-sf-field-pickup-city]");
        if (!pickupPoint || !pickupPoint.value.trim() || !pickupCity || !pickupCity.value.trim()) {
          showSfDemoToast(container, "Podaj kod punktu odbioru i miasto");
          return;
        }
        var pickupLabel = container.querySelector("[data-sf-field-pickup-label]");
        deliverySummary =
          "Punkt: " +
          pickupPoint.value.trim() +
          ", " +
          pickupCity.value.trim() +
          (pickupLabel && pickupLabel.value.trim() ? " (" + pickupLabel.value.trim() + ")" : "");
      } else {
        var street = container.querySelector("[data-sf-field-street]");
        var building = container.querySelector("[data-sf-field-building]");
        var postal = container.querySelector("[data-sf-field-postal]");
        var city = container.querySelector("[data-sf-field-city]");
        if (!street || !street.value.trim() || !building || !building.value.trim() || !postal || !postal.value.trim() || !city || !city.value.trim()) {
          showSfDemoToast(container, "Uzupełnij adres dostawy");
          return;
        }
        var notes = container.querySelector("[data-sf-field-notes]");
        deliverySummary =
          street.value.trim() +
          " " +
          building.value.trim() +
          ", " +
          postal.value.trim() +
          " " +
          city.value.trim() +
          (notes && notes.value.trim() ? " · " + notes.value.trim() : "");
      }
      if (!consent || !consent.checked) {
        showSfDemoToast(container, "Zaakceptuj regulamin");
        return;
      }
      var cart = getCart(store.id);
      if (!cart.length) {
        showSfDemoToast(container, "Koszyk jest pusty");
        return;
      }
      var payEl = container.querySelector("[data-sf-payment-method]:checked");
      var totals = calcCartTotals(store, cart, shipEl ? shipEl.value : null, payEl ? payEl.value : null);
      var order = placeDemoOrder(store, {
        customer: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        deliveryAddress: deliverySummary,
        total: totals.total,
        itemCount: cart.reduce(function (s, i) {
          return s + i.qty;
        }, 0),
        items: cart.map(function (item) {
          return {
            productId: item.productId,
            name: item.name,
            qty: item.qty,
            price: item.price,
            variantLabel: item.variantLabel || "",
            variantSelections: item.variantSelections || {}
          };
        }),
        productName:
          cart.length === 1
            ? cart[0].name + (cart[0].variantLabel ? " (" + cart[0].variantLabel + ")" : "")
            : cart[0].name + " +" + (cart.length - 1),
        variantLabel: cart.length === 1 ? cart[0].variantLabel || "" : "",
        paymentMethod: getPaymentLabel(payEl ? payEl.value : "transfer"),
        shippingMethod: totals.shippingLabel,
        shippingCost: totals.shipping,
        codFee: totals.codFee || 0
      });
      navigateStorefront(container, store, options, { view: "success", productId: null, orderNumber: order ? order.number : "#1001" });
      try {
        global.history.replaceState(null, "", "#/zamowienie");
      } catch (e) {}
      showSfDemoToast(container, "Zamówienie złożone " + (order ? order.number : ""));
    };

    container.addEventListener("click", container._sfClickHandler);
    container.addEventListener("change", container._sfChangeHandler);
    container.querySelectorAll("[data-sf-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("[data-sf-store-search]");
        var q = input ? input.value.trim() : "";
        var nextRoute = { view: "search", productId: null, query: q };
        try {
          global.location.hash = q ? "#/szukaj?q=" + encodeURIComponent(q) : "#/szukaj";
        } catch (e) {}
        navigateStorefront(container, store, options, nextRoute);
      });
    });
    if (isTechStore(store) && !container._sfSearchKeyBound) {
      container._sfSearchKeyBound = true;
      container.addEventListener("keydown", function (event) {
        if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
        var tag = (event.target && event.target.tagName) || "";
        if (/^(INPUT|TEXTAREA|SELECT)$/i.test(tag) || (event.target && event.target.isContentEditable)) return;
        event.preventDefault();
        var searchInput = container.querySelector("[data-sf-store-search]");
        if (searchInput) searchInput.focus();
      });
    }
    var checkoutForm = container.querySelector("[data-sf-checkout-form]");
    if (checkoutForm) {
      checkoutForm.addEventListener("submit", container._sfSubmitHandler);
      updateCheckoutDeliveryUI(container);
    }
  }

  global.AmiqStorefront = {
    STORAGE_PROJECTS: STORAGE_PROJECTS,
    STORAGE_ACTIVE: STORAGE_ACTIVE,
    DESKTOP_MIN_WIDTH: DESKTOP_MIN_WIDTH,
    BANNER_PRESETS: BANNER_PRESETS,
    TECH_BANNER_PRESETS: TECH_BANNER_PRESETS,
    LUX_BANNER_PRESETS: LUX_BANNER_PRESETS,
    FOOD_BANNER_PRESETS: FOOD_BANNER_PRESETS,
    UNIVERSAL_BANNER_PRESETS: UNIVERSAL_BANNER_PRESETS,
    BANNER_LIBRARY: BANNER_LIBRARY,
    getBannerLibraryForTemplate: getBannerLibraryForTemplate,
    getFlatBannerLibrary: getFlatBannerLibrary,
    LUX_BANNER_DEFAULT: LUX_BANNER_DEFAULT,
    PRODUCT_IMAGE_PRESETS: PRODUCT_IMAGE_PRESETS,
    FASHION_BANNER_DEFAULT: FASHION_BANNER_DEFAULT,
    ENTERPRISE_BANNER_PRESETS: ENTERPRISE_BANNER_PRESETS,
    ENTERPRISE_BANNER_DEFAULT: ENTERPRISE_BANNER_DEFAULT,
    escapeHtml: escapeHtml,
    formatPrice: formatPrice,
    getProductCategoriesForIndustry: getProductCategoriesForIndustry,
    getProductCategoryLabel: getProductCategoryLabel,
    PRODUCT_CATEGORIES_BY_INDUSTRY: PRODUCT_CATEGORIES_BY_INDUSTRY,
    normalizeStore: normalizeStore,
    getProjectById: getProjectById,
    getActiveProject: getActiveProject,
    resolveProject: resolveProject,
    isDesktopViewport: isDesktopViewport,
    buildStorefrontInner: buildStorefrontInner,
    buildPanelPreview: buildPanelPreview,
    buildMobileBlockMessage: buildMobileBlockMessage,
    buildPreviewProjectFromTemplate: buildPreviewProjectFromTemplate,
    buildTemplatePreviewFrame: buildTemplatePreviewFrame,
    getTemplateDefaults: getTemplateDefaults,
    getBlankStoreDefaults: getBlankStoreDefaults,
    getShippingMethodCatalog: getShippingMethodCatalog,
    getShippingCategoryMeta: getShippingCategoryMeta,
    getDefaultStoreCheckout: getDefaultStoreCheckout,
    normalizeStoreCheckout: normalizeStoreCheckout,
    normalizeProduct: normalizeProduct,
    parseProductHash: parseProductHash,
    parseStorefrontRoute: parseStorefrontRoute,
    searchStoreCatalog: searchStoreCatalog,
    readStoreNotifications: readStoreNotifications,
    writeStoreNotifications: writeStoreNotifications,
    pushStoreNotification: pushStoreNotification,
    STORAGE_STORE_NOTIFICATIONS: STORAGE_STORE_NOTIFICATIONS,
    wireStorefront: wireStorefront,
    buildProductDetailPage: buildProductDetailPage,
    savePreviewSnapshot: savePreviewSnapshot,
    STORAGE_PREVIEW_SNAPSHOT: STORAGE_PREVIEW_SNAPSHOT
  };
})(window);
