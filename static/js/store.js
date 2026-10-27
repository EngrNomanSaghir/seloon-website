/**
 * MAISON DE BEAUTÉ — CLIENT DATA STORE & ENGINE
 * Pure HTML, CSS, JavaScript LocalStorage Architecture
 */

(function (window) {
  'use strict';

  const STANDARD_SLOTS = [
    "09:00 AM", "09:45 AM", "10:30 AM", "11:15 AM",
    "12:00 PM", "01:00 PM", "01:45 PM", "02:30 PM",
    "03:15 PM", "04:00 PM", "04:45 PM", "05:30 PM",
    "06:15 PM", "07:00 PM"
  ];

  const DEFAULT_STYLISTS = [
    {
      id: 1,
      name: "Elena Rostova",
      title: "Creative Hair Director & Master Colorist",
      bio: "Internationally trained in Paris & London with over 12 years of experience crafting signature balayage, blonde transformations, and precision cut architectures.",
      experience_years: 12,
      rating: 4.98,
      reviews_count: 184,
      image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80",
      specialties: "Balayage & Color Melt, Precision Bobs, Keratin Silk Treatments",
      available_days: "Mon,Tue,Wed,Thu,Fri,Sat",
      shift_start: "09:00 AM",
      shift_end: "07:00 PM",
      shift_type: "Full Day (9:00 AM - 7:00 PM)",
      is_active: 1
    },
    {
      id: 2,
      name: "Marcus Vance",
      title: "Executive Barber & Men's Grooming Specialist",
      bio: "Master of straight-razor fades, sculpted beard architecture, and revitalizing hot towel aromatherapy grooming for the modern gentleman.",
      experience_years: 9,
      rating: 4.95,
      reviews_count: 142,
      image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
      specialties: "Razor Fade, Beard Sculpting, Royal Hot Towel Shave, Scalp Detox",
      available_days: "Tue,Wed,Thu,Fri,Sat,Sun",
      shift_start: "09:00 AM",
      shift_end: "03:15 PM",
      shift_type: "Morning & Midday (9:00 AM - 3:15 PM)",
      is_active: 1
    },
    {
      id: 3,
      name: "Aria Chen",
      title: "Lead Medical Aesthetician & Skin Therapist",
      bio: "Certified clinical aesthetician specializing in non-invasive skin rejuvenation, Hydra-Glow peels, dermal infusions, and acne-clearing therapies.",
      experience_years: 10,
      rating: 4.99,
      reviews_count: 215,
      image_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
      specialties: "Hydra-Glow Facial, Anti-Aging Collagen, Deep Pore Extraction, LED Therapy",
      available_days: "Mon,Wed,Thu,Fri,Sat",
      shift_start: "12:00 PM",
      shift_end: "07:00 PM",
      shift_type: "Afternoon & Evening (12:00 PM - 7:00 PM)",
      is_active: 1
    },
    {
      id: 4,
      name: "Sofia Rodriguez",
      title: "Senior Nail Artist & Spa Specialist",
      bio: "Renowned for Russian manicures, sculptural gel extensions, elegant French ombré, and soothing botanical foot spa rituals.",
      experience_years: 7,
      rating: 4.92,
      reviews_count: 128,
      image_url: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&auto=format&fit=crop&q=80",
      specialties: "Russian Gel Manicure, Ombré Nail Art, Paraffin Pedicure, Nail Strengthening",
      available_days: "Mon,Tue,Thu,Fri,Sat",
      shift_start: "09:00 AM",
      shift_end: "02:30 PM",
      shift_type: "Morning Shift (9:00 AM - 2:30 PM)",
      is_active: 1
    },
    {
      id: 5,
      name: "David Laurent",
      title: "Senior Texture & Curl Specialist",
      bio: "Expert in curly hair cutting techniques, bouncy blowouts, high-gloss color glazes, and botanical scalp nourishment.",
      experience_years: 11,
      rating: 4.96,
      reviews_count: 167,
      image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
      specialties: "Curly Girl Cuts, Silk Press, Gloss Therapy, Volume Restorations",
      available_days: "Wed,Thu,Fri,Sat,Sun",
      shift_start: "01:00 PM",
      shift_end: "07:00 PM",
      shift_type: "Evening Shift (1:00 PM - 7:00 PM)",
      is_active: 1
    },
    {
      id: 6,
      name: "Zara Al-Mansoor",
      title: "Bridal & Red-Carpet Makeup Artist",
      bio: "Specialized in high-definition bridal glam, soft airbrushed finishes, and timeless red carpet aesthetics designed to shine under any lighting.",
      experience_years: 8,
      rating: 4.97,
      reviews_count: 153,
      image_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80",
      specialties: "Bridal Couture Makeup, Soft Glam, Airbrush Contouring, Lash Extension",
      available_days: "Thu,Fri,Sat,Sun",
      shift_start: "09:00 AM",
      shift_end: "07:00 PM",
      shift_type: "Full Day (9:00 AM - 7:00 PM)",
      is_active: 1
    }
  ];

  const DEFAULT_SERVICES = [
    // Hair Styling & Cuts
    {
      id: 1,
      category: "Hair Styling & Cuts",
      name: "Signature Haircut & Deluxe Blowout",
      description: "Personalized consultation, bespoke haircut tailored to facial structure, invigorating scalp wash with botanical shampoo, and red-carpet blowout.",
      duration_min: 60,
      price: 65.00,
      image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80",
      badge: "Most Popular",
      is_popular: 1
    },
    {
      id: 2,
      category: "Hair Styling & Cuts",
      name: "Luxe Balayage & Gloss Therapy",
      description: "Hand-painted sun-kissed lightening technique for seamless, low-maintenance dimensional color, followed by custom gloss toner and deep bond repair.",
      duration_min: 150,
      price: 220.00,
      image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
      badge: "Trending",
      is_popular: 1
    },
    {
      id: 3,
      category: "Hair Styling & Cuts",
      name: "Brazilian Gold Keratin Smoothing",
      description: "Zero-frizz restorative thermal treatment that infuses pure liquid keratin into hair cuticles, delivering glass-like shine for up to 5 months.",
      duration_min: 120,
      price: 195.00,
      image_url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&auto=format&fit=crop&q=80",
      badge: "Client Favorite",
      is_popular: 1
    },
    {
      id: 4,
      category: "Hair Styling & Cuts",
      name: "Gloss, Tone & Moisture Mask",
      description: "Quick radiance revival! Neutralizes unwanted brassy tones, adds intense multi-reflective mirror shine, and seals cuticles with organic argan butter.",
      duration_min: 45,
      price: 60.00,
      image_url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80",
      badge: "",
      is_popular: 0
    },

    // Skin & Facial Therapies
    {
      id: 5,
      category: "Skin & Facial Therapies",
      name: "7-Step Medical Hydra-Glow Facial",
      description: "Vortex suction deep cleansing, gentle salicylic peel, painless pore extraction, antioxidant peptide infusion, and soothing LED collagen light therapy.",
      duration_min: 75,
      price: 145.00,
      image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80",
      badge: "Best Seller",
      is_popular: 1
    },
    {
      id: 6,
      category: "Skin & Facial Therapies",
      name: "Collagen Youth Lift & Guasha Contour",
      description: "Intense lifting and firming therapy utilizing microcurrent technology, botanical collagen ampoules, and cold jade stone lymphatic drainage.",
      duration_min: 60,
      price: 130.00,
      image_url: "https://images.unsplash.com/photo-1512290900672-1f551b9e25d2?w=800&auto=format&fit=crop&q=80",
      badge: "",
      is_popular: 0
    },
    {
      id: 7,
      category: "Skin & Facial Therapies",
      name: "Deep Pore Clarifying & Anti-Blemish Detox",
      description: "Custom treatment targeting breakouts, hormonal congestion, and enlarged pores with enzymatic exfoliation and high-frequency ozone therapy.",
      duration_min: 60,
      price: 110.00,
      image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
      badge: "",
      is_popular: 0
    },

    // Men's Grooming & Beard Care
    {
      id: 8,
      category: "Men's Grooming & Beard",
      name: "Executive Beard Sculpt & Hot Towel Shave",
      description: "Precision clipper & straight razor contouring, hot eucalyptus towel wrap, clarifying skin scrub, and nourishing organic sandalwood beard oil massage.",
      duration_min: 45,
      price: 48.00,
      image_url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80",
      badge: "Popular",
      is_popular: 1
    },
    {
      id: 9,
      category: "Men's Grooming & Beard",
      name: "Royal Haircut & Signature Fade",
      description: "Crisp skin fade or scissor cut, detailing around ears and neckline, invigorating mint scalp massage, and tailored matte styling paste finish.",
      duration_min: 45,
      price: 52.00,
      image_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
      badge: "",
      is_popular: 0
    },

    // Hand & Foot Spa / Nails
    {
      id: 10,
      category: "Hand & Foot Spa / Nails",
      name: "Luxe Russian Gel Manicure",
      description: "Flawless dry cuticle treatment for unmatched precision, nail architecture strengthening, and chip-free premium Japanese gel polish lasting 4+ weeks.",
      duration_min: 60,
      price: 65.00,
      image_url: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80",
      badge: "Signature",
      is_popular: 1
    },
    {
      id: 11,
      category: "Hand & Foot Spa / Nails",
      name: "Deluxe Botanical Paraffin Pedicure",
      description: "Epsom sea salt soak, exfoliating brown sugar scrub, heated paraffin wax infusion, callus removal, foot massage, and high-shine gel finish.",
      duration_min: 60,
      price: 75.00,
      image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80",
      badge: "",
      is_popular: 0
    },

    // Bridal & Red Carpet Glam
    {
      id: 12,
      category: "Bridal & Glamour Makeup",
      name: "Red Carpet Glam & Airbrush Makeup",
      description: "Flawless photo-ready HD makeup application with long-wear airbrush foundation, mink lash accentuation, and bespoke contouring.",
      duration_min: 75,
      price: 120.00,
      image_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80",
      badge: "Celebrity Choice",
      is_popular: 1
    },
    {
      id: 13,
      category: "Bridal & Glamour Makeup",
      name: "Bridal Master Suite Trial & Styling",
      description: "Comprehensive 2-hour bridal consultation, full hair and makeup trial, veil placement guidance, and champagne welcome.",
      duration_min: 120,
      price: 240.00,
      image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
      badge: "Luxury",
      is_popular: 0
    },

    // Relaxation & Massage
    {
      id: 14,
      category: "Massage & Body Relaxation",
      name: "Aromatherapy Scalp, Neck & Shoulder Therapy",
      description: "Stress-melting warm essential oil head massage combined with acupressure shoulder relief to stimulate hair follicles and erase tension.",
      duration_min: 45,
      price: 58.00,
      image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80",
      badge: "Relaxing",
      is_popular: 0
    }
  ];

  const DEFAULT_TRANSFORMATIONS = [
    {
      id: 1,
      title: "Golden Honey Balayage & Silk Finish",
      category: "Hair Styling & Cuts",
      treatment_name: "Luxe Balayage & Gloss Therapy",
      stylist_name: "Elena Rostova",
      duration: "2.5 Hours",
      before_image: "images/balayage_before.jpg",
      after_image: "images/balayage_after.jpg",
      description: "Overcame brassy grown-out roots and dull warmth with seamless sun-kissed micro-foils and an icy honey gloss toner for ultra-luminous dimension.",
      client_feedback: "“I couldn't believe this was my hair! Elena blended the color so naturally, and my hair feels healthier than ever.” — Sarah M.",
      service_id: 2,
      stylist_id: 1
    },
    {
      id: 2,
      title: "Hydra-Glow Glass Skin Rejuvenation",
      category: "Skin & Facial Therapies",
      treatment_name: "7-Step Medical Hydra-Glow Facial",
      stylist_name: "Aria Chen",
      duration: "75 Minutes",
      before_image: "images/facial_before.jpg",
      after_image: "images/facial_after.jpg",
      description: "Targeted deep pore congestion, rough skin texture, and dehydration through vortex extraction and antioxidant peptide infusion.",
      client_feedback: "“The instant radiance was incredible. My skin was glowing for weeks without needing a drop of foundation.” — Jessica K.",
      service_id: 5,
      stylist_id: 3
    },
    {
      id: 3,
      title: "Executive Beard Architecture & Razor Fade",
      category: "Men's Grooming & Beard",
      treatment_name: "Executive Beard Sculpt & Hot Towel Shave",
      stylist_name: "Marcus Vance",
      duration: "45 Minutes",
      before_image: "images/mens_before.jpg",
      after_image: "images/mens_after.jpg",
      description: "Restructured an overgrown, uneven beard into razor-sharp lines with tapered gradation, accompanied by hot towel aromatherapy.",
      client_feedback: "“Marcus is a true craftsman. The line work is millimeter-perfect and the hot towel shave was pure luxury.” — Anthony D.",
      service_id: 8,
      stylist_id: 2
    },
    {
      id: 4,
      title: "Keratin Silk Smooth Rejuvenation",
      category: "Hair Styling & Cuts",
      treatment_name: "Brazilian Gold Keratin Smoothing",
      stylist_name: "David Laurent",
      duration: "2 Hours",
      before_image: "images/keratin_before.jpg",
      after_image: "images/keratin_after.jpg",
      description: "Transformed humidity-damaged coarse curls into velvet-smooth, high-shine glass hair that cuts drying time by 70%.",
      client_feedback: "“No more daily flat ironing! My hair stays mirror-glossy even in humid weather. Complete game changer.” — Rachel B.",
      service_id: 3,
      stylist_id: 5
    },
    {
      id: 5,
      title: "Flawless Russian Ombré Gel Nails",
      category: "Hand & Foot Spa / Nails",
      treatment_name: "Luxe Russian Gel Manicure",
      stylist_name: "Sofia Rodriguez",
      duration: "60 Minutes",
      before_image: "images/nails_before.jpg",
      after_image: "images/nails_after.jpg",
      description: "Cleaned damaged cuticles with microscopic precision and built a strong natural apex using milky-nude ombré gel art.",
      client_feedback: "“Hands down the cleanest manicure I have ever had. Four weeks later and not a single chip or lift!” — Chloe V.",
      service_id: 10,
      stylist_id: 4
    },
    {
      id: 6,
      title: "Red Carpet Bridal Couture Glam",
      category: "Bridal & Glamour Makeup",
      treatment_name: "Red Carpet Glam & Airbrush Makeup",
      stylist_name: "Zara Al-Mansoor",
      duration: "75 Minutes",
      before_image: "images/bridal_before.jpg",
      after_image: "images/bridal_after.jpg",
      description: "Subtle color correction, sculptured cheekbones, velvet nude lips, and luminous airbrush base that photographed like silk.",
      client_feedback: "“Zara made me feel like royalty on my wedding day. The makeup lasted all night through tears and dancing!” — Maya T.",
      service_id: 12,
      stylist_id: 6
    },
    {
      id: 7,
      title: "Signature Precision Cut & Deluxe Blowout",
      category: "Hair Styling & Cuts",
      treatment_name: "Signature Haircut & Deluxe Blowout",
      stylist_name: "Elena Rostova",
      duration: "60 Minutes",
      before_image: "images/haircut_before.jpg",
      after_image: "images/haircut_after.jpg",
      description: "Eliminated split ends, reshaped heavy grown-out hair into flowing face-framing layers with an effortless, voluminous bounce.",
      client_feedback: "“Elena completely transformed my hair shape. It styles so effortlessly every single morning!” — Camille R.",
      service_id: 1,
      stylist_id: 1
    }
  ];

  const DEFAULT_REVIEWS = [
    {
      id: 1,
      customer_name: "Victoria Sterling",
      treatment_name: "Luxe Balayage & Gloss Therapy",
      stylist_name: "Elena Rostova",
      rating: 5,
      comment: "Elena is simply an artist! My balayage blends so seamlessly that people always ask if it's my natural hair. The salon ambiance is serene and luxurious.",
      date: "October 14, 2026",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
    },
    {
      id: 2,
      customer_name: "Julian Carter",
      treatment_name: "Executive Beard Sculpt & Hot Towel Shave",
      stylist_name: "Marcus Vance",
      rating: 5,
      comment: "Best grooming experience in the city. Marcus takes his time, the hot towel treatment is heavenly, and the beard lines are laser sharp.",
      date: "October 18, 2026",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
    },
    {
      id: 3,
      customer_name: "Samantha Wei",
      treatment_name: "7-Step Medical Hydra-Glow Facial",
      stylist_name: "Aria Chen",
      rating: 5,
      comment: "Aria transformed my skin before my sister's wedding. The Hydra-Glow gave me immediate radiance and cleared up stubborn pores without irritation.",
      date: "October 10, 2026",
      avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
    },
    {
      id: 4,
      customer_name: "Emily Watson",
      treatment_name: "Luxe Russian Gel Manicure",
      stylist_name: "Sofia Rodriguez",
      rating: 5,
      comment: "Sofia's attention to detail is unmatched. The Russian manicure technique is so clean and lasted over a month without chipping. Truly 5 stars!",
      date: "October 19, 2026",
      avatar_url: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&auto=format&fit=crop&q=80"
    }
  ];

  // Helper date strings
  const formatDateISO = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getTodayISO = () => formatDateISO(new Date());
  const getTomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDateISO(d);
  };

  const DEFAULT_BOOKINGS = [
    {
      id: 1,
      booking_code: "SLN-78210",
      customer_name: "Camilla Hayes",
      customer_email: "camilla.h@example.com",
      customer_phone: "+1 (555) 234-5678",
      service_id: 1,
      service_name: "Signature Haircut & Deluxe Blowout",
      stylist_id: 1,
      stylist_name: "Elena Rostova",
      appointment_date: getTodayISO(),
      appointment_time: "10:30 AM",
      total_price: 65.00,
      notes: "Prefers layered blowout",
      status: "confirmed",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      booking_code: "SLN-94123",
      customer_name: "David Miller",
      customer_email: "d.miller@example.com",
      customer_phone: "+1 (555) 345-6789",
      service_id: 8,
      service_name: "Executive Beard Sculpt & Hot Towel Shave",
      stylist_id: 2,
      stylist_name: "Marcus Vance",
      appointment_date: getTodayISO(),
      appointment_time: "02:30 PM",
      total_price: 48.00,
      notes: "Sensitive skin on neck",
      status: "confirmed",
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      booking_code: "SLN-62849",
      customer_name: "Hannah Abbott",
      customer_email: "hannah.a@example.com",
      customer_phone: "+1 (555) 456-7890",
      service_id: 5,
      service_name: "7-Step Medical Hydra-Glow Facial",
      stylist_id: 3,
      stylist_name: "Aria Chen",
      appointment_date: getTomorrowISO(),
      appointment_time: "01:00 PM",
      total_price: 145.00,
      notes: "Pre-event skin prep",
      status: "confirmed",
      created_at: new Date().toISOString()
    }
  ];

  // Storage Keys
  const STORAGE_KEYS = {
    services: 'maison_services_v1',
    stylists: 'maison_stylists_v1',
    transformations: 'maison_transformations_v1',
    reviews: 'maison_reviews_v1',
    bookings: 'maison_bookings_v1',
    managerAuth: 'maison_manager_authenticated_v1'
  };

  const SalonStore = {
    STANDARD_SLOTS: STANDARD_SLOTS,

    init: function () {
      if (!localStorage.getItem(STORAGE_KEYS.services)) {
        localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(DEFAULT_SERVICES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.stylists)) {
        localStorage.setItem(STORAGE_KEYS.stylists, JSON.stringify(DEFAULT_STYLISTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.transformations)) {
        localStorage.setItem(STORAGE_KEYS.transformations, JSON.stringify(DEFAULT_TRANSFORMATIONS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.reviews)) {
        localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(DEFAULT_REVIEWS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.bookings)) {
        localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(DEFAULT_BOOKINGS));
      }
    },

    resetToDefaults: function () {
      localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(DEFAULT_SERVICES));
      localStorage.setItem(STORAGE_KEYS.stylists, JSON.stringify(DEFAULT_STYLISTS));
      localStorage.setItem(STORAGE_KEYS.transformations, JSON.stringify(DEFAULT_TRANSFORMATIONS));
      localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(DEFAULT_REVIEWS));
      localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(DEFAULT_BOOKINGS));
    },

    // ----------------- SERVICES -----------------
    getServices: function (category = 'all') {
      this.init();
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.services) || '[]');
      if (!category || category === 'all') return list;
      return list.filter(s => s.category === category);
    },

    getFeaturedServices: function (limit = 6) {
      const list = this.getServices();
      const popular = list.filter(s => s.is_popular === 1);
      return (popular.length > 0 ? popular : list).slice(0, limit);
    },

    getServiceById: function (id) {
      const list = this.getServices();
      return list.find(s => String(s.id) === String(id)) || null;
    },

    getCategories: function () {
      const list = this.getServices();
      const set = new Set(list.map(s => s.category).filter(Boolean));
      return Array.from(set).sort();
    },

    addService: function (data) {
      const list = this.getServices();
      const maxId = list.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0);
      const newService = {
        id: maxId + 1,
        category: data.category || 'Hair Styling & Cuts',
        name: data.name,
        description: data.description || '',
        duration_min: parseInt(data.duration_min, 10) || 60,
        price: parseFloat(data.price) || 50.0,
        image_url: data.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80',
        badge: data.badge || '',
        is_popular: data.is_popular ? 1 : 0
      };
      list.push(newService);
      localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(list));
      return newService;
    },

    updateService: function (data) {
      const list = this.getServices();
      const idx = list.findIndex(s => String(s.id) === String(data.id));
      if (idx === -1) return null;

      list[idx] = {
        ...list[idx],
        category: data.category || list[idx].category,
        name: data.name || list[idx].name,
        description: data.description !== undefined ? data.description : list[idx].description,
        duration_min: parseInt(data.duration_min, 10) || list[idx].duration_min,
        price: parseFloat(data.price) || list[idx].price,
        image_url: data.image_url || list[idx].image_url,
        badge: data.badge !== undefined ? data.badge : list[idx].badge,
        is_popular: data.is_popular ? 1 : 0
      };
      localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(list));
      return list[idx];
    },

    deleteService: function (id) {
      const list = this.getServices();
      const filtered = list.filter(s => String(s.id) !== String(id));
      localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(filtered));
      return true;
    },

    // ----------------- STYLISTS -----------------
    getStylists: function (activeOnly = false) {
      this.init();
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.stylists) || '[]');
      if (activeOnly) {
        return list.filter(s => Number(s.is_active) === 1);
      }
      return list;
    },

    getStylistById: function (id) {
      const list = this.getStylists();
      return list.find(s => String(s.id) === String(id)) || null;
    },

    addStylist: function (data) {
      const list = this.getStylists();
      const maxId = list.reduce((max, s) => Math.max(max, Number(s.id) || 0), 0);
      const newStylist = {
        id: maxId + 1,
        name: data.name,
        title: data.title,
        bio: data.bio || '',
        experience_years: parseInt(data.experience_years, 10) || 3,
        rating: parseFloat(data.rating) || 5.0,
        reviews_count: parseInt(data.reviews_count, 10) || 12,
        image_url: data.image_url || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80',
        specialties: data.specialties || 'Bespoke Styling, Precision Cuts',
        available_days: data.available_days || 'Mon,Tue,Wed,Thu,Fri,Sat',
        shift_start: data.shift_start || '09:00 AM',
        shift_end: data.shift_end || '07:00 PM',
        shift_type: data.shift_type || 'Full Day',
        is_active: data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1
      };
      list.push(newStylist);
      localStorage.setItem(STORAGE_KEYS.stylists, JSON.stringify(list));
      return newStylist;
    },

    updateStylist: function (data) {
      const list = this.getStylists();
      const idx = list.findIndex(s => String(s.id) === String(data.id));
      if (idx === -1) return null;

      list[idx] = {
        ...list[idx],
        name: data.name || list[idx].name,
        title: data.title || list[idx].title,
        bio: data.bio !== undefined ? data.bio : list[idx].bio,
        experience_years: parseInt(data.experience_years, 10) || list[idx].experience_years,
        rating: parseFloat(data.rating) || list[idx].rating,
        image_url: data.image_url || list[idx].image_url,
        specialties: data.specialties || list[idx].specialties,
        available_days: data.available_days || list[idx].available_days,
        shift_start: data.shift_start || list[idx].shift_start,
        shift_end: data.shift_end || list[idx].shift_end,
        shift_type: data.shift_type || list[idx].shift_type,
        is_active: data.is_active !== undefined ? Number(data.is_active) : list[idx].is_active
      };
      localStorage.setItem(STORAGE_KEYS.stylists, JSON.stringify(list));
      return list[idx];
    },

    toggleStylistStatus: function (id) {
      const list = this.getStylists();
      const idx = list.findIndex(s => String(s.id) === String(id));
      if (idx === -1) return null;
      list[idx].is_active = list[idx].is_active === 1 ? 0 : 1;
      localStorage.setItem(STORAGE_KEYS.stylists, JSON.stringify(list));
      return list[idx];
    },

    deleteStylist: function (id) {
      const list = this.getStylists();
      // Check if bookings exist
      const bookings = this.getBookings();
      const hasBookings = bookings.some(b => String(b.stylist_id) === String(id));
      if (hasBookings) {
        // Soft deactivate
        return this.updateStylist({ id: id, is_active: 0 });
      }
      const filtered = list.filter(s => String(s.id) !== String(id));
      localStorage.setItem(STORAGE_KEYS.stylists, JSON.stringify(filtered));
      return true;
    },

    // ----------------- TRANSFORMATIONS -----------------
    getTransformations: function (category = 'all') {
      this.init();
      const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.transformations) || '[]');
      if (!category || category === 'all') return list;
      return list.filter(t => t.category === category);
    },

    getTransformationCategories: function () {
      const list = this.getTransformations();
      const set = new Set(list.map(t => t.category).filter(Boolean));
      return Array.from(set);
    },

    // ----------------- REVIEWS -----------------
    getReviews: function () {
      this.init();
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.reviews) || '[]');
    },

    // ----------------- TIME & SHIFT CALCULATIONS -----------------
    parseTimeMinutes: function (timeStr) {
      if (!timeStr) return 0;
      try {
        const parts = timeStr.trim().split(/[:\s]+/);
        let hour = parseInt(parts[0], 10);
        const min = parseInt(parts[1], 10) || 0;
        const ampm = (parts[2] || '').toUpperCase();
        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        return hour * 60 + min;
      } catch (e) {
        return 0;
      }
    },

    isSlotInShift: function (slotStr, shiftStart, shiftEnd) {
      if (!shiftStart || !shiftEnd) return true;
      const sStart = this.parseTimeMinutes(shiftStart);
      const sEnd = this.parseTimeMinutes(shiftEnd);
      const slotM = this.parseTimeMinutes(slotStr);
      return slotM >= sStart && slotM <= sEnd;
    },

    getDayName: function (dateStr) {
      // Parse ISO date string (YYYY-MM-DD) avoiding timezone issues
      const parts = dateStr.split('-');
      if (parts.length !== 3) return '';
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    },

    getAvailableSlots: function (dateStr, stylistId = null) {
      if (!dateStr) return { slots: [], is_off_day: false };

      const dayName = this.getDayName(dateStr);
      const allStylists = this.getStylists(true);
      const bookings = this.getBookings();

      let stylist = null;
      let isOffDay = false;
      let shiftStart = "09:00 AM";
      let shiftEnd = "07:00 PM";

      if (stylistId && stylistId !== 'any' && stylistId !== 0) {
        stylist = this.getStylistById(stylistId);
        if (stylist) {
          const days = (stylist.available_days || '').split(',').map(d => d.trim());
          if (!days.includes(dayName)) {
            isOffDay = true;
          }
          shiftStart = stylist.shift_start || "09:00 AM";
          shiftEnd = stylist.shift_end || "07:00 PM";
        }
      }

      // Collect existing non-cancelled bookings on this date
      const bookedTimesSet = new Set();
      if (stylist) {
        bookings.forEach(b => {
          if (b.appointment_date === dateStr && String(b.stylist_id) === String(stylist.id) && b.status !== 'cancelled') {
            bookedTimesSet.add(b.appointment_time);
          }
        });
      } else {
        // For "Any Specialist": A slot is full only if number of booked stylists >= total active stylists
        const activeCount = allStylists.length || 1;
        const counts = {};
        bookings.forEach(b => {
          if (b.appointment_date === dateStr && b.status !== 'cancelled') {
            counts[b.appointment_time] = (counts[b.appointment_time] || 0) + 1;
          }
        });
        Object.keys(counts).forEach(time => {
          if (counts[time] >= activeCount) {
            bookedTimesSet.add(time);
          }
        });
      }

      const slotsData = STANDARD_SLOTS.map(slot => {
        const inShift = stylist ? this.isSlotInShift(slot, shiftStart, shiftEnd) : true;
        const isBooked = bookedTimesSet.has(slot);
        const isAvailable = (!isOffDay) && inShift && (!isBooked);

        let status = 'available';
        if (isOffDay) status = 'off_duty';
        else if (!inShift) status = 'outside_shift';
        else if (isBooked) status = 'booked';

        return {
          time: slot,
          available: isAvailable,
          status: status,
          in_shift: inShift,
          is_booked: isBooked
        };
      });

      return {
        slots: slotsData,
        date: dateStr,
        day_name: dayName,
        is_off_day: isOffDay,
        stylist_name: stylist ? stylist.name : 'Any Specialist',
        shift_info: stylist ? `${shiftStart} - ${shiftEnd}` : 'Standard Operating Hours'
      };
    },

    getSpecialistAvailability: function (stylistId, dateStr) {
      if (!dateStr) dateStr = getTodayISO();
      const stylist = this.getStylistById(stylistId);
      if (!stylist) return null;

      const dayName = this.getDayName(dateStr);
      const availableDays = (stylist.available_days || '').split(',').map(d => d.trim());
      const isWorkingDay = availableDays.includes(dayName);

      const shiftStart = stylist.shift_start || "09:00 AM";
      const shiftEnd = stylist.shift_end || "07:00 PM";

      // Bookings for this stylist
      const bookings = this.getBookings();
      const bookedSet = new Set(
        bookings
          .filter(b => b.appointment_date === dateStr && String(b.stylist_id) === String(stylistId) && b.status !== 'cancelled')
          .map(b => b.appointment_time)
      );

      let availCount = 0;
      let bookedCount = 0;

      const slots = STANDARD_SLOTS.map(slot => {
        const inShift = this.isSlotInShift(slot, shiftStart, shiftEnd);
        const isBooked = bookedSet.has(slot);
        const isAvail = isWorkingDay && inShift && !isBooked;

        let status = 'available';
        let reason = 'Open for booking';

        if (!isWorkingDay) {
          status = 'off_duty';
          reason = `${stylist.name} is off-duty on ${dayName}s`;
        } else if (!inShift) {
          status = 'outside_shift';
          reason = `Outside working shift (${shiftStart} - ${shiftEnd})`;
        } else if (isBooked) {
          status = 'booked';
          reason = 'Slot is already booked';
          bookedCount++;
        }

        if (isAvail) availCount++;

        return {
          time: slot,
          available: isAvail,
          status: status,
          reason: reason
        };
      });

      // Find next working date if off today
      let nextWorkingDate = null;
      if (!isWorkingDay) {
        const parts = dateStr.split('-');
        const curr = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        for (let i = 1; i <= 7; i++) {
          const next = new Date(curr);
          next.setDate(curr.getDate() + i);
          const nextDayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][next.getDay()];
          if (availableDays.includes(nextDayName)) {
            nextWorkingDate = `${formatDateISO(next)} (${nextDayName})`;
            break;
          }
        }
      }

      return {
        stylist: stylist,
        date: dateStr,
        formatted_date: `${dateStr} (${dayName})`,
        day_name: dayName,
        is_working_day: isWorkingDay,
        next_working_date: nextWorkingDate,
        shift_summary: `${shiftStart} - ${shiftEnd} • ${stylist.shift_type || 'Full Day'}`,
        slots: slots,
        available_count: availCount,
        booked_count: bookedCount,
        total_slots: slots.length
      };
    },

    // ----------------- BOOKINGS -----------------
    getBookings: function (filterDate = '', filterStatus = '') {
      this.init();
      let list = JSON.parse(localStorage.getItem(STORAGE_KEYS.bookings) || '[]');
      if (filterDate) {
        list = list.filter(b => b.appointment_date === filterDate);
      }
      if (filterStatus) {
        list = list.filter(b => b.status === filterStatus);
      }
      // Sort newest date first, then time
      return list.sort((a, b) => (b.appointment_date + b.appointment_time).localeCompare(a.appointment_date + a.appointment_time));
    },

    getBookingByCode: function (code) {
      if (!code) return null;
      const list = this.getBookings();
      return list.find(b => b.booking_code.toUpperCase() === code.trim().toUpperCase()) || null;
    },

    findBooking: function (code, contact) {
      if (!code || !contact) return null;
      const c = code.trim().toUpperCase();
      const target = contact.trim().toLowerCase();
      const list = this.getBookings();

      return list.find(b => {
        const matchCode = b.booking_code.toUpperCase() === c;
        const matchEmail = (b.customer_email || '').toLowerCase() === target;
        const matchPhone = (b.customer_phone || '').includes(target) || target.includes((b.customer_phone || ''));
        return matchCode && (matchEmail || matchPhone);
      }) || null;
    },

    createBooking: function (data) {
      const serviceId = parseInt(data.service_id, 10);
      let stylistId = data.stylist_id ? parseInt(data.stylist_id, 10) : null;
      const dateStr = data.date;
      const timeStr = data.time;
      const customerName = (data.name || '').trim();
      const customerEmail = (data.email || '').trim();
      const customerPhone = (data.phone || '').trim();
      const notes = (data.notes || '').trim();

      if (!serviceId || !dateStr || !timeStr || !customerName || !customerEmail || !customerPhone) {
        return { success: false, message: 'Please fill out all required fields.' };
      }

      const service = this.getServiceById(serviceId);
      if (!service) {
        return { success: false, message: 'Selected treatment does not exist.' };
      }

      const activeStylists = this.getStylists(true);
      const bookings = this.getBookings();

      let stylist = null;
      if (stylistId && stylistId !== 0) {
        stylist = this.getStylistById(stylistId);
        if (!stylist) {
          return { success: false, message: 'Selected specialist does not exist.' };
        }
      } else {
        // Auto-assign any available active stylist not booked at this slot
        const busyIds = new Set(
          bookings
            .filter(b => b.appointment_date === dateStr && b.appointment_time === timeStr && b.status !== 'cancelled')
            .map(b => b.stylist_id)
        );
        const dayName = this.getDayName(dateStr);
        const freeStylist = activeStylists.find(s => {
          const days = (s.available_days || '').split(',').map(d => d.trim());
          const workingToday = days.includes(dayName);
          const inShift = this.isSlotInShift(timeStr, s.shift_start, s.shift_end);
          return workingToday && inShift && !busyIds.has(s.id);
        }) || activeStylists[0];

        stylist = freeStylist;
        stylistId = freeStylist.id;
      }

      // Collision check
      const collision = bookings.find(b => 
        String(b.stylist_id) === String(stylistId) &&
        b.appointment_date === dateStr &&
        b.appointment_time === timeStr &&
        b.status !== 'cancelled'
      );

      if (collision) {
        return {
          success: false,
          status_code: 409,
          message: `This slot is already booked for ${stylist.name}. Please choose another time.`
        };
      }

      // Generate unique booking code
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "SLN-";
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const maxId = bookings.reduce((max, b) => Math.max(max, Number(b.id) || 0), 0);
      const newBooking = {
        id: maxId + 1,
        booking_code: code,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        service_id: service.id,
        service_name: service.name,
        stylist_id: stylist.id,
        stylist_name: stylist.name,
        appointment_date: dateStr,
        appointment_time: timeStr,
        total_price: service.price,
        notes: notes,
        status: "confirmed",
        created_at: new Date().toISOString()
      };

      bookings.push(newBooking);
      localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));

      return {
        success: true,
        booking_code: code,
        booking: newBooking,
        redirect_url: `confirmation.html?code=${code}`
      };
    },

    updateBookingStatus: function (id, newStatus) {
      const allowed = ['confirmed', 'completed', 'cancelled'];
      if (!allowed.includes(newStatus)) return { success: false, message: 'Invalid status' };

      const list = this.getBookings();
      const idx = list.findIndex(b => String(b.id) === String(id));
      if (idx === -1) return { success: false, message: 'Booking not found' };

      list[idx].status = newStatus;
      localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(list));
      return { success: true, message: `Booking updated to ${newStatus}` };
    },

    cancelBooking: function (code) {
      if (!code) return { success: false, message: 'Booking code required' };
      const list = this.getBookings();
      const idx = list.findIndex(b => b.booking_code.toUpperCase() === code.trim().toUpperCase());
      if (idx === -1) return { success: false, message: 'Booking not found' };

      list[idx].status = 'cancelled';
      localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(list));
      return { success: true, message: 'Your appointment has been cancelled.' };
    },

    // ----------------- METRICS -----------------
    getMetrics: function () {
      const bookings = this.getBookings();
      const todayISO = getTodayISO();

      const totalBookings = bookings.length;
      const todayBookings = bookings.filter(b => b.appointment_date === todayISO).length;
      const totalRevenue = bookings
        .filter(b => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (parseFloat(b.total_price) || 0), 0);

      const allStylists = this.getStylists();
      const activeStylists = allStylists.filter(s => s.is_active === 1).length;

      return {
        total_bookings: totalBookings,
        today_bookings: todayBookings,
        total_revenue: totalRevenue,
        active_stylists: activeStylists,
        total_stylists: allStylists.length
      };
    },

    // ----------------- CALENDAR ICS EXPORT -----------------
    downloadIcs: function (booking) {
      if (!booking) return;

      const dateClean = (booking.appointment_date || '').replace(/-/g, '');
      const timePart = booking.appointment_time || '10:00 AM';
      const startMin = this.parseTimeMinutes(timePart);
      const endMin = startMin + 75;

      const pad = (n) => String(n).padStart(2, '0');
      const startH = pad(Math.floor(startMin / 60));
      const startM = pad(startMin % 60);
      const endH = pad(Math.floor(endMin / 60));
      const endM = pad(endMin % 60);

      const dtStart = `${dateClean}T${startH}${startM}00`;
      const dtEnd = `${dateClean}T${endH}${endM}00`;

      const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Maison De Beaute Salon//Appointments//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `SUMMARY:${booking.service_name} at Maison De Beauté`,
        `DESCRIPTION:Salon Appointment with Specialist ${booking.stylist_name}\\nBooking Code: ${booking.booking_code}`,
        "LOCATION:Maison De Beauté Salon & Spa, 742 Fifth Avenue, Luxury Suite 400",
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR"
      ];

      const icsContent = icsLines.join("\r\n");
      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `appointment-${booking.booking_code}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    // ----------------- MANAGER AUTH -----------------
    isManagerAuthenticated: function () {
      return sessionStorage.getItem(STORAGE_KEYS.managerAuth) === 'true';
    },

    verifyManagerPassword: function (password) {
      const valid = (password || '').trim() === 'ceo2026';
      if (valid) {
        sessionStorage.setItem(STORAGE_KEYS.managerAuth, 'true');
      }
      return valid;
    },

    logoutManager: function () {
      sessionStorage.removeItem(STORAGE_KEYS.managerAuth);
    }
  };

  // Initialize store on load
  SalonStore.init();

  window.SalonStore = SalonStore;
})(window);
