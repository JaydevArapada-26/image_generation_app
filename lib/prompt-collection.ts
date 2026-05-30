export const GROUPS = [
  "Studio & Minimalist",
  "Jewelry & Luxury",
  "Outdoor & Nature",
  "Luxury & Abstract",
  "Creative & Experimental",
  "Festive & Seasonal",
  "Kids & Toys",
  "Food & Beverage",
  "Tech & Futuristic",
  "Plain Color Backgrounds",
  "Creative Color Pop Background",
] as const;

export type Group = (typeof GROUPS)[number];

export const PROMPT_COLLECTION: Record<Group, Record<string, string>> = {
  "Studio & Minimalist": {
    "E-commerce White":
      "Clean white seamless studio setup, soft shadow under product, high-key lighting, minimal modern e-commerce presentation, lots of breathing space, ultra-clean commercial look.",
    "Warm White Luxury":
      "Soft warm white studio scene, elegant premium lighting, subtle glow, refined minimal luxury mood, clean background, expensive and calm presentation.",
    "Dark Luxury Studio":
      "Deep dark studio atmosphere, dramatic premium lighting, refined contrast, elegant shadow control, luxury commercial presentation.",
    "Dark Charcoal Stone":
      "Charcoal stone surface, moody studio lighting, premium texture contrast, grounded minimal luxury composition.",
    "Concrete Pedestal":
      "Product placed on a clean concrete pedestal, modern studio feel, subtle shadow play, minimal architectural luxury.",
    "Paper Texture":
      "Soft paper-textured backdrop, gentle studio lighting, refined editorial product mood, minimal and tactile.",
    "Neutral Fabric Surface":
      "Neutral fabric surface, soft folds, calm studio ambience, elegant product-first composition.",
    "Natural Stone Minimal":
      "Minimal natural stone environment, premium texture, soft daylight, restrained and clean composition.",
    "Soft Window Light":
      "Gentle window light, natural shadows, calm editorial product look, clean minimal styling.",
    "Golden Hour Studio":
      "Warm golden-hour inspired studio lighting, soft luxury glow, premium highlights, elegant mood.",
    "Natural Shadow Play":
      "Minimal setup with beautiful natural shadow patterns, clean composition, refined artistic atmosphere.",
    "Negative Space Minimal":
      "Highly minimal composition with large negative space for text, premium brand presentation, clean modern balance.",
    "Luxury Breathing Space":
      "Luxury minimal layout with generous breathing room, soft shadows, refined premium clarity.",
    "Gradient Seamless":
      "Smooth seamless gradient background, polished studio lighting, modern commercial finish.",
    "Gray Gradient Studio":
      "Elegant gray gradient backdrop, controlled studio lighting, clean premium product hero shot.",
  },
  "Jewelry & Luxury": {
    "Black Velvet Luxury":
      "Rich black velvet backdrop, deep contrast, sparkling highlights, premium jewelry editorial styling.",
    "Marble Luxury":
      "Elegant marble surface, refined luxury mood, crisp reflections, premium catalog presentation.",
    "Mirror Reflection":
      "Reflective mirror base, glamorous luxury lighting, polished high-end jewelry showcase.",
    "Luxury Hand Model":
      "Elegant hand model presentation, natural pose, premium jewelry ad style, soft luxury lighting.",
    "Necklace Portrait":
      "Portrait-oriented jewelry composition, graceful placement, elegant luxury framing, premium editorial mood.",
    "Warm Gold Glow":
      "Warm golden illumination, rich jewelry sparkle, luxurious and inviting atmosphere.",
    "Silver Brilliance":
      "Cool radiant silver highlights, clean luxury contrast, premium jewelry shine.",
    "Colored Gemstones":
      "Vibrant gemstone-focused composition, rich color brilliance, luxe editorial styling.",
    "E-commerce Jewelry":
      "Clean e-commerce jewelry presentation, isolated product focus, crisp detail, premium white-background clarity.",
    "Jewelry Macro Detail":
      "Extreme macro focus on craftsmanship, gemstones, prongs, texture, sparkle, and fine finishing.",
    "Silk Luxury Styling":
      "Soft silk drapery, elegant luxury folds, premium jewelry presentation, refined softness.",
    "Natural Wood Luxury":
      "Warm natural wood luxury setting, earthy premium tone, elegant handcrafted feeling.",
    "Romantic Rose Styling":
      "Romantic floral luxury scene, soft rose accents, refined jewelry elegance, delicate premium tone.",
    "Gemstone Glow":
      "Gemstone-led glow effect, luminous luxury atmosphere, sparkling and polished composition.",
    "Diamond Bridal Luxury":
      "Bridal jewelry luxury mood, radiant diamond brilliance, elegant wedding-ready styling.",
    "Royal Indian Jewelry":
      "Rich royal Indian jewelry presentation, majestic luxury treatment, ornate premium styling.",
    "Minimal Luxury":
      "Minimal luxurious layout, restrained elegance, high-end product focus, polished and timeless.",
  },
  "Outdoor & Nature": {
    "Beach Lifestyle":
      "Bright beach lifestyle setting, natural sunlit atmosphere, refreshing and premium outdoor feel.",
    "Forest Moss":
      "Soft mossy forest floor mood, organic texture, natural freshness, premium outdoor styling.",
    "Mountain Adventure":
      "Bold mountain adventure scene, crisp natural air, energetic outdoor storytelling.",
    "Winter Snow":
      "Clean winter snow environment, cool atmospheric lighting, fresh premium outdoor mood.",
    "Golden Hour":
      "Warm outdoor golden hour scene, glowing natural light, premium lifestyle energy.",
    "Soft Overcast":
      "Gentle overcast daylight, soft shadows, calm natural product presentation.",
    "Natural Shade":
      "Product shown under natural shade, balanced lighting, soft realistic outdoor ambiance.",
    "Spring Bloom":
      "Fresh spring bloom atmosphere, soft floral energy, bright natural styling.",
    "Summer Energy":
      "Vibrant summer outdoor mood, energetic sunlight, lively premium presentation.",
    "Autumn Warmth":
      "Warm autumn colors, cozy outdoor atmosphere, rich seasonal natural styling.",
    "Lake Reflection":
      "Calm lake-side reflective scene, serene premium outdoor composition.",
    "Waterfall Energy":
      "Dynamic waterfall energy, fresh motion, dramatic natural atmosphere.",
    "Ocean Coastal":
      "Ocean coast styling, airy premium light, refreshing natural luxury.",
    "Rain & Mist":
      "Moody rain and mist ambience, atmospheric texture, cinematic natural storytelling.",
    "Camping Lifestyle":
      "Outdoor camping lifestyle setting, natural warmth, adventurous and authentic mood.",
    "Hiking Adventure":
      "Active hiking adventure scene, rugged natural energy, premium lifestyle framing.",
    "Eco Lifestyle":
      "Clean eco-conscious outdoor presentation, natural materials, fresh sustainable mood.",
    "Desert Canyon":
      "Dry desert canyon landscape, warm texture, bold natural scale, premium composition.",
    "Forest Canopy":
      "Lush forest canopy light, filtered green ambience, organic premium atmosphere.",
    "Coastal Cliffs":
      "Dramatic coastal cliff setting, open sky, cinematic natural energy.",
    "Nature Macro":
      "Macro view of natural textures and environment, crisp organic detail, premium realism.",
    "Natural Framing":
      "Product framed by natural elements like leaves, branches, stones, or sunlight, clean premium balance.",
  },
  "Luxury & Abstract": {
    "Silk Elegance":
      "Elegant silk folds, fluid premium texture, refined luxury composition.",
    "Dynamic Water Splash":
      "Controlled premium water splash effect, dramatic motion, luxurious abstract styling.",
    "Geometric Luxury":
      "Precise geometric luxury design, structured and polished, modern premium look.",
    "Frozen Ice":
      "Crystal-clear frozen ice aesthetic, cool premium clarity, refined abstract mood.",
    "Dark Moody Luxury":
      "Deep moody luxury atmosphere, rich shadows, dramatic premium styling.",
    "Dramatic Shadows":
      "Strong shadow composition, elegant contrast, artistic luxury presentation.",
    "Texture Detail":
      "Texture-first abstract luxury treatment, highly tactile, refined and close-up.",
    "Material Focus":
      "Emphasis on premium material surfaces, luxurious texture rendering, clean art direction.",
    "Surface Macro":
      "Macro view of surface details, abstract luxury texture, crisp and premium finish.",
    "Quiet Luxury":
      "Subtle elegant luxury with soft restraint, refined understatement, premium calm.",
    "Architectural Clean Lines":
      "Sleek architectural forms, neat structure, premium modern sophistication.",
    "Monochromatic Gradient":
      "Single-tone gradient luxury, smooth tonal transition, elegant minimal depth.",
    "Radial Focus":
      "Centered radial composition with elegant attention flow, premium abstract balance.",
    "Diagonal Composition":
      "Dynamic diagonal layout, strong visual movement, high-end abstract energy.",
    "Mixed Media Luxury":
      "Rich layered mixed-media luxury aesthetic, refined experimental texture, premium art direction.",
    "Crystal Structures":
      "Crystal-inspired sculptural abstraction, elegant shine, premium faceted detail.",
  },
  "Creative & Experimental": {
    "Floating Luxury":
      "Luxury product floating in a premium surreal scene, polished and high-end.",
    "Floating Elements":
      "Suspended visual elements around the product, controlled and elegant experimental styling.",
    "Light Painting":
      "Artful light-painting trails, cinematic creative energy, premium experimental polish.",
    "Prismatic Refraction":
      "Prismatic light refraction, elegant color splitting, futuristic premium feel.",
    "Infinite Mirrors":
      "Mirror recursion and depth illusion, surreal luxury, polished and striking.",
    "Liquid Metal":
      "Liquid metal surfaces and reflections, futuristic luxury, glossy premium finish.",
    "Color Abstract":
      "Abstract color composition, expressive but controlled, premium commercial creativity.",
    "Geometric Rhythm":
      "Rhythmic geometric forms, structured motion, modern experimental luxury.",
    "Layered Abstract":
      "Layered abstract depth, premium artistic complexity, clean product focus.",
    "Neon Futuristic":
      "Neon-lit futuristic styling, bold glow, high-energy premium modern look.",
    "Holographic Gradient":
      "Holographic gradient effects, luminous color play, sleek futuristic branding feel.",
    "Chrome Futurism":
      "Chrome-finished futuristic styling, glossy metallic energy, premium sci-fi mood.",
    "Glass Prism":
      "Transparent glass prism composition, refracted light, elegant experimental luxury.",
    "Digital Wave":
      "Digital wave motion aesthetic, fluid tech-inspired abstraction, premium and sharp.",
    "Futuristic Portal":
      "Portal-like visual frame, futuristic depth, premium surreal commercial energy.",
  },
  "Festive & Seasonal": {
    "Diwali Festive Glow":
      "Warm festive glow, elegant lights, celebratory premium atmosphere.",
    "Holi Festival Colors":
      "Bright playful color burst, festive energy, lively celebratory styling.",
    "Raksha Bandhan":
      "Warm family festive mood, elegant Indian celebration styling, premium and emotional.",
    "Navratri Garba":
      "Energetic traditional festive presentation, colorful cultural richness, premium celebration scene.",
    "Ganesh Chaturthi":
      "Devotional festive styling, rich traditional ambience, respectful premium presentation.",
    "Onam Pookalam":
      "Elegant floral pookalam styling, bright cultural celebration mood, refined festive look.",
    "Pongal Celebration":
      "Warm harvest festival atmosphere, traditional and premium cultural presentation.",
    "Karva Chauth":
      "Romantic and elegant Indian festive scene, graceful celebratory styling.",
    "Durga Puja":
      "Grand festive atmosphere, rich traditional energy, premium cultural visual.",
    "Christmas Decor":
      "Festive winter decor, warm lights, premium seasonal branding mood.",
    "Valentine Romance":
      "Romantic soft festive styling, gentle premium mood, emotionally warm presentation.",
    "Eid Elegance":
      "Elegant celebratory mood, refined festive composition, premium cultural styling.",
    "Wedding Season":
      "Luxurious wedding-ready styling, rich celebratory ambience, premium and elegant.",
    "New Year Celebration":
      "Modern celebratory sparkle, fresh premium energy, festive commercial style.",
    "Winter Holiday":
      "Cozy seasonal holiday mood, warm lights, premium winter presentation.",
  },
  "Kids & Toys": {
    "Bright Playroom":
      "Cheerful bright playroom setting, safe, colorful, and playful premium mood.",
    "Toy Detail Macro":
      "Macro focus on toy texture, materials, joints, finishing, and quality detail.",
    "Natural Play":
      "Natural light play scene, soft authentic kid-friendly styling, warm and playful.",
    "Educational Play":
      "Learning-focused play environment, bright and cheerful, premium educational presentation.",
    "Imaginative Adventure":
      "Fantasy-inspired playful adventure mood, energetic and imaginative.",
    "Cozy Nursery":
      "Soft cozy nursery atmosphere, warm and calm, premium kid-safe styling.",
    "Outdoor Adventure":
      "Active outdoor play scene, energetic and joyful, authentic child-friendly mood.",
    "Family Playtime":
      "Warm family interaction scene, engaging and joyful, premium lifestyle feel.",
    "Holiday Gift Styling":
      "Gift-ready toy presentation, festive and attractive, premium retail styling.",
    "Material Texture Macro":
      "Close-up texture detail of toy materials, premium quality focus.",
    "Action Motion":
      "Dynamic toy action moment, playful movement, crisp commercial energy.",
    "Miniature World":
      "Toy placed in a miniature imaginative world, charming and premium.",
    "Baby Sensory Play":
      "Gentle sensory play scene, soft colors, safe and tender presentation.",
    "Toddler Learning":
      "Educational toddler-friendly styling, bright and inviting learning atmosphere.",
    "Creative Play":
      "Imagination-led creative play scene, fun and visually rich, premium and playful.",
    "STEM Learning":
      "Science and building-inspired STEM play, smart, clean, and educational.",
    "Action Figure Scene":
      "Action figure styled scene, dynamic and collectible, premium toy presentation.",
    "Building & Construction":
      "Construction and building play environment, structured and playful.",
    "Arts & Crafts":
      "Creative craft table scene, colorful and hands-on, premium kid-friendly styling.",
    "Outdoor Sports":
      "Energetic outdoor sports play mood, active and lively product storytelling.",
    "Comfort Toys":
      "Soft comforting toy styling, warm gentle atmosphere, reassuring and premium.",
    "Eco-Friendly Toys":
      "Natural and sustainable toy presentation, earthy premium materials, responsible branding.",
    "Toy Organization":
      "Neat toy storage and organization scene, clean lifestyle presentation.",
    "Travel Play":
      "Portable travel-friendly toy styling, compact and practical, premium retail mood.",
    "Inclusive Play":
      "Warm inclusive play environment, friendly and accessible visual tone.",
    "Toy Unboxing":
      "Exciting unboxing presentation, premium retail reveal, clean and engaging.",
  },
  "Food & Beverage": {
    "Gourmet Restaurant Plating":
      "Fine dining plating, elegant composition, premium culinary presentation.",
    "Rustic Wooden Table":
      "Rustic wooden table scene, warm handcrafted feeling, premium natural food styling.",
    "Overhead Flat-Lay":
      "Top-down flat-lay composition, clean organized food presentation, high clarity.",
    "Dessert Macro Close-Up":
      "Extreme close-up dessert detail, texture-rich, indulgent, premium food photography.",
    "Refreshing Drink Splash":
      "Dynamic beverage splash moment, crisp refreshing energy, premium commercial look.",
    "Natural Window Light":
      "Soft natural window-light food styling, fresh and appetizing, premium realism.",
    "Golden Hour Warmth":
      "Warm glowing food presentation, cozy and appetizing, premium lifestyle mood.",
    "Bright & Airy Fresh":
      "Fresh bright food presentation, clean airy atmosphere, polished and inviting.",
    "Dark Moody Atmospheric":
      "Dark moody culinary styling, rich contrast, upscale restaurant feeling.",
    "45-Degree Natural Eating Angle":
      "Natural 45-degree food angle, believable and appetizing, polished commercial framing.",
    "Straight-On for Height":
      "Straight-on presentation emphasizing structure and height, clean and premium.",
    "Three-Quarters Perspective":
      "Three-quarter angle food styling, balanced depth, elegant and realistic.",
    "Ingredient Macro Detail":
      "Macro detail on ingredients, freshness, texture, and premium food realism.",
    "Cross-Section Reveal":
      "Cross-section reveal showing layers and filling, informative and appetizing.",
    "Steam & Smoke Effects":
      "Gentle steam or smoke effect, hot fresh serving mood, premium cinematic food shot.",
    "Texture Focus Detail":
      "Texture-driven culinary styling, refined close-up, premium appetizing finish.",
    "Fresh Herb Garnish Styling":
      "Fresh herb garnish accent, elegant and clean plating, premium presentation.",
    "Deconstructed Ingredients":
      "Deconstructed culinary layout, stylish composition, premium editorial food design.",
    "Layered Composition Styling":
      "Layered food arrangement, strong visual structure, premium and organized.",
    "Minimalist Clean Plating":
      "Minimal plating with refined negative space, clean premium restaurant look.",
    "Marble Surface Luxury":
      "Luxurious marble food surface, elegant fine-dining mood, premium and polished.",
    "Concrete Industrial Modern":
      "Industrial modern food setting with concrete surface, stylish and contemporary.",
    "Vintage Distressed Charm":
      "Vintage rustic charm, lightly distressed texture, warm nostalgic food styling.",
    "Linen Textile Softness":
      "Soft linen textile setting, calm and elegant food presentation.",
    "Splash Action Dynamic":
      "Action splash food styling, energetic and premium commercial motion.",
    "Levitation Floating Food":
      "Floating food composition, surreal and polished, high-impact commercial style.",
    "Cooking Process Action":
      "In-process cooking scene, dynamic and authentic, premium culinary storytelling.",
    "Color Pop Selective":
      "Selective color emphasis, bold appetizing presentation, modern commercial appeal.",
    "Restaurant Atmosphere":
      "Restaurant-style ambience, premium dining mood, refined and realistic.",
    "Home Kitchen Cozy":
      "Cozy home kitchen mood, warm and inviting, authentic premium presentation.",
    "Outdoor Picnic Fresh":
      "Fresh outdoor picnic presentation, bright and natural, lifestyle-focused styling.",
    "Professional Kitchen Action":
      "Fast-paced professional kitchen atmosphere, sharp and premium culinary action.",
    "Seasonal Ingredient Focus":
      "Seasonal ingredient-led styling, fresh and timely, premium food look.",
    "Comfort Food Warmth":
      "Warm comforting food mood, inviting texture, cozy premium presentation.",
  },
  "Tech & Futuristic": {
    "Neon Glow": "Neon-lit tech atmosphere, bold glow, premium futuristic styling.",
    "Digital Grid":
      "Digital grid-inspired backdrop, sharp and modern, premium tech aesthetic.",
    "Cyberpunk Noir":
      "Dark cyberpunk noir mood, cinematic contrast, futuristic and polished.",
    "Rain Reflections":
      "Wet reflective surface with rain reflections, sleek premium futuristic mood.",
    "Neon Sign Backdrop":
      "Neon sign-inspired backdrop, high energy tech branding, premium modern feel.",
    "LED Matrix":
      "LED matrix environment, structured futuristic glow, crisp and premium.",
    "Laser Accent":
      "Subtle laser accents, sharp futuristic energy, premium commercial styling.",
    "Liquid Chrome":
      "Liquid chrome surfaces, glossy reflections, luxury sci-fi energy.",
    "Carbon Fiber":
      "Carbon-fiber texture mood, sleek performance styling, premium tech feel.",
    "Smart Glass":
      "Transparent smart glass styling, clean modern innovation, premium finish.",
    "LED Surfaces":
      "Light-emitting surface design, futuristic glow, polished product framing.",
    "Space Geometry":
      "Space-inspired geometry, clean futuristic balance, premium and modern.",
    "Robotic Industrial":
      "Robotic industrial environment, metallic precision, premium technical mood.",
    "Holographic Gradient":
      "Holographic gradient tech styling, luminous modern color, premium futuristic look.",
    "Glass Prism":
      "Glass prism and refraction effects, sleek luminous tech presentation.",
    "Futuristic Portal":
      "Portal-style futuristic composition, high-tech depth, premium sci-fi atmosphere.",
    "Monochrome Tech":
      "Monochrome tech look, clean minimal futurism, sleek commercial styling.",
    "Blue Energy":
      "Blue energy glow aesthetic, powerful futuristic vibe, premium and sharp.",
    "Minimal Tech Studio":
      "Minimal tech studio, clean background, modern innovation, premium product focus.",
    "Gaming RGB":
      "RGB-lit gaming energy, vivid tech mood, premium and dynamic.",
  },
  "Plain Color Backgrounds": {
    "Soft Pastel":
      "Soft pastel solid background, gentle and premium, clean product focus.",
    "Pure White":
      "Pure white seamless background, classic ecommerce clarity, clean and sharp.",
    "Deep Neutral":
      "Deep neutral solid tone, elegant and balanced, premium commercial simplicity.",
    "Single Tone":
      "Single-tone background, minimal distraction, clean product-first styling.",
    "Brand Primary":
      "Use the brand primary color as a clean background, polished and identity-driven.",
    "Brand Secondary":
      "Use the brand secondary color as a clean background, refined and consistent.",
    "Matte Black":
      "Matte black background, dramatic contrast, luxurious premium presentation.",
    "Soft Cream": "Soft cream background, warm and elegant, premium minimal styling.",
    "Light Gray":
      "Light gray background, modern and neutral, clean commercial presentation.",
    "Luxury Beige":
      "Luxury beige background, soft upscale tone, premium and refined.",
    "Charcoal Black":
      "Charcoal black background, moody and strong, elegant product focus.",
    "Warm Nude":
      "Warm nude background, soft sophisticated tone, premium commercial mood.",
    "Minimal Brand Color":
      "Minimal use of a brand color background, clean and polished identity presentation.",
    "Premium Monochrome":
      "Premium monochrome solid background, refined, clean, and modern.",
  },
  "Creative Color Pop Background": {
    "Split Duotone":
      "Split duotone background, bold and modern, high-impact commercial styling.",
    "Diagonal Color Swipe":
      "Diagonal color swipe composition, energetic and graphic, premium and playful.",
    "Center Circle Pop":
      "Central color pop layout, product highlighted strongly, bold and polished.",
    "Sunrise Gradient":
      "Soft sunrise gradient background, uplifting and vibrant, premium and modern.",
    "Checkerboard Floor":
      "Checkerboard floor visual, playful and stylish, creative commercial presentation.",
    "Pastel Blocks":
      "Pastel block arrangement, soft playful energy, premium color-forward composition.",
    "Neon Edge Glow":
      "Neon edge glow background, energetic and futuristic, strong visual punch.",
    "Brand Stripes":
      "Brand stripe styling, strong identity, clean and modern promotional feel.",
    "Color Shadow Pop":
      "Color-shadow pop effect, lively and creative, premium ad styling.",
    "Vibrant Monochrome":
      "Single-color vibrant monochrome style, bold and clean, high-impact product focus.",
    "Floating Color Panels":
      "Floating colored panels around the product, modern and playful, premium composition.",
    "Brand Gradient":
      "Smooth brand gradient background, polished, contemporary, and identity-driven.",
    "Playful Geometry":
      "Playful geometric color composition, creative and modern, premium and fun.",
    "Retro Pop":
      "Retro-inspired pop color styling, energetic, nostalgic, and stylish.",
    "Bold Pastel Contrast":
      "Bold pastel contrast background, vibrant but soft, premium and eye-catching.",
  },
};
