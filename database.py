import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import sqlite3
import random
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), 'salon.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Stylists Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stylists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            title TEXT NOT NULL,
            bio TEXT NOT NULL,
            experience_years INTEGER NOT NULL,
            rating REAL NOT NULL,
            reviews_count INTEGER NOT NULL,
            image_url TEXT NOT NULL,
            specialties TEXT NOT NULL,
            available_days TEXT NOT NULL DEFAULT 'Mon,Tue,Wed,Thu,Fri,Sat',
            shift_start TEXT NOT NULL DEFAULT '09:00 AM',
            shift_end TEXT NOT NULL DEFAULT '07:00 PM',
            shift_type TEXT NOT NULL DEFAULT 'Full Day',
            is_active INTEGER DEFAULT 1
        )
    ''')

    # Services Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            duration_min INTEGER NOT NULL,
            price REAL NOT NULL,
            image_url TEXT NOT NULL,
            badge TEXT DEFAULT '',
            is_popular INTEGER DEFAULT 0
        )
    ''')

    # Transformations (Before & After) Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transformations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            treatment_name TEXT NOT NULL,
            stylist_name TEXT NOT NULL,
            duration TEXT NOT NULL,
            before_image TEXT NOT NULL,
            after_image TEXT NOT NULL,
            description TEXT NOT NULL,
            client_feedback TEXT NOT NULL,
            service_id INTEGER,
            stylist_id INTEGER
        )
    ''')

    # Bookings Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_code TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_email TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            service_id INTEGER NOT NULL,
            service_name TEXT NOT NULL,
            stylist_id INTEGER,
            stylist_name TEXT NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            total_price REAL NOT NULL,
            notes TEXT,
            status TEXT DEFAULT 'confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (service_id) REFERENCES services (id),
            FOREIGN KEY (stylist_id) REFERENCES stylists (id)
        )
    ''')

    # Reviews Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            treatment_name TEXT NOT NULL,
            stylist_name TEXT NOT NULL,
            rating INTEGER NOT NULL,
            comment TEXT NOT NULL,
            date TEXT NOT NULL,
            avatar_url TEXT NOT NULL
        )
    ''')

    conn.commit()

    # Seed data if tables are empty
    cursor.execute('SELECT COUNT(*) FROM stylists')
    if cursor.fetchone()[0] == 0:
        seed_data(cursor)
        conn.commit()
    else:
        # Always refresh transformations to ensure high-definition local before/after images
        cursor.execute('DELETE FROM transformations')
        seed_transformations(cursor)
        conn.commit()

    # Run schema upgrade for shifts if columns are missing
    upgrade_db_schema(conn)

    conn.close()

def upgrade_db_schema(conn):
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(stylists)")
    cols = [col[1] for col in cursor.fetchall()]
    if 'shift_start' not in cols:
        cursor.execute("ALTER TABLE stylists ADD COLUMN shift_start TEXT DEFAULT '09:00 AM'")
    if 'shift_end' not in cols:
        cursor.execute("ALTER TABLE stylists ADD COLUMN shift_end TEXT DEFAULT '07:00 PM'")
    if 'shift_type' not in cols:
        cursor.execute("ALTER TABLE stylists ADD COLUMN shift_type TEXT DEFAULT 'Full Day'")

    # Set realistic varied shifts for initial specialists if not set
    shifts_map = {
        1: ('09:00 AM', '07:00 PM', 'Full Day (9:00 AM - 7:00 PM)', 'Mon,Tue,Wed,Thu,Fri,Sat'),
        2: ('09:00 AM', '03:15 PM', 'Morning & Midday (9:00 AM - 3:15 PM)', 'Tue,Wed,Thu,Fri,Sat,Sun'),
        3: ('12:00 PM', '07:00 PM', 'Afternoon & Evening (12:00 PM - 7:00 PM)', 'Mon,Wed,Thu,Fri,Sat'),
        4: ('09:00 AM', '02:30 PM', 'Morning Shift (9:00 AM - 2:30 PM)', 'Mon,Tue,Thu,Fri,Sat'),
        5: ('01:00 PM', '07:00 PM', 'Evening Shift (1:00 PM - 7:00 PM)', 'Wed,Thu,Fri,Sat,Sun'),
        6: ('09:00 AM', '07:00 PM', 'Full Day (9:00 AM - 7:00 PM)', 'Thu,Fri,Sat,Sun')
    }
    for sid, (s_start, s_end, s_type, s_days) in shifts_map.items():
        cursor.execute('''
            UPDATE stylists 
            SET shift_start = ?, shift_end = ?, shift_type = ?, available_days = ?
            WHERE id = ? AND (shift_type IS NULL OR shift_type = 'Full Day' OR shift_type = '')
        ''', (s_start, s_end, s_type, s_days, sid))
    conn.commit()

def seed_transformations(cursor):
    transformations_data = [
        (
            1,
            "Golden Honey Balayage & Silk Finish",
            "Hair Styling & Cuts",
            "Luxe Balayage & Gloss Therapy",
            "Elena Rostova",
            "2.5 Hours",
            "/static/images/balayage_before.jpg",
            "/static/images/balayage_after.jpg",
            "Overcame brassy grown-out roots and dull warmth with seamless sun-kissed micro-foils and an icy honey gloss toner for ultra-luminous dimension.",
            "“I couldn't believe this was my hair! Elena blended the color so naturally, and my hair feels healthier than ever.” — Sarah M.",
            2,
            1
        ),
        (
            2,
            "Hydra-Glow Glass Skin Rejuvenation",
            "Skin & Facial Therapies",
            "7-Step Medical Hydra-Glow Facial",
            "Aria Chen",
            "75 Minutes",
            "/static/images/facial_before.jpg",
            "/static/images/facial_after.jpg",
            "Targeted deep pore congestion, rough skin texture, and dehydration through vortex extraction and antioxidant peptide infusion.",
            "“The instant radiance was incredible. My skin was glowing for weeks without needing a drop of foundation.” — Jessica K.",
            5,
            3
        ),
        (
            3,
            "Executive Beard Architecture & Razor Fade",
            "Men's Grooming & Beard",
            "Executive Beard Sculpt & Hot Towel Shave",
            "Marcus Vance",
            "45 Minutes",
            "/static/images/mens_before.jpg",
            "/static/images/mens_after.jpg",
            "Restructured an overgrown, uneven beard into razor-sharp lines with tapered gradation, accompanied by hot towel aromatherapy.",
            "“Marcus is a true craftsman. The line work is millimeter-perfect and the hot towel shave was pure luxury.” — Anthony D.",
            8,
            2
        ),
        (
            4,
            "Keratin Silk Smooth Rejuvenation",
            "Hair Styling & Cuts",
            "Brazilian Gold Keratin Smoothing",
            "David Laurent",
            "2 Hours",
            "/static/images/keratin_before.jpg",
            "/static/images/keratin_after.jpg",
            "Transformed humidity-damaged coarse curls into velvet-smooth, high-shine glass hair that cuts drying time by 70%.",
            "“No more daily flat ironing! My hair stays mirror-glossy even in humid weather. Complete game changer.” — Rachel B.",
            3,
            5
        ),
        (
            5,
            "Flawless Russian Ombré Gel Nails",
            "Hand & Foot Spa / Nails",
            "Luxe Russian Gel Manicure",
            "Sofia Rodriguez",
            "60 Minutes",
            "/static/images/nails_before.jpg",
            "/static/images/nails_after.jpg",
            "Cleaned damaged cuticles with microscopic precision and built a strong natural apex using milky-nude ombré gel art.",
            "“Hands down the cleanest manicure I have ever had. Four weeks later and not a single chip or lift!” — Chloe V.",
            10,
            4
        ),
        (
            6,
            "Red Carpet Bridal Couture Glam",
            "Bridal & Glamour Makeup",
            "Red Carpet Glam & Airbrush Makeup",
            "Zara Al-Mansoor",
            "75 Minutes",
            "/static/images/bridal_before.jpg",
            "/static/images/bridal_after.jpg",
            "Subtle color correction, sculptured cheekbones, velvet nude lips, and luminous airbrush base that photographed like silk.",
            "“Zara made me feel like royalty on my wedding day. The makeup lasted all night through tears and dancing!” — Maya T.",
            12,
            6
        ),
        (
            7,
            "Signature Precision Cut & Deluxe Blowout",
            "Hair Styling & Cuts",
            "Signature Haircut & Deluxe Blowout",
            "Elena Rostova",
            "60 Minutes",
            "/static/images/haircut_before.jpg",
            "/static/images/haircut_after.jpg",
            "Eliminated split ends, reshaped heavy grown-out hair into flowing face-framing layers with an effortless, voluminous bounce.",
            "“Elena completely transformed my hair shape. It styles so effortlessly every single morning!” — Camille R.",
            1,
            1
        )
    ]
    cursor.executemany('''
        INSERT INTO transformations (
            id, title, category, treatment_name, stylist_name, duration,
            before_image, after_image, description, client_feedback, service_id, stylist_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', transformations_data)

def seed_data(cursor):
    # Seed Stylists
    stylists_data = [
        (
            1,
            "Elena Rostova",
            "Creative Hair Director & Master Colorist",
            "Internationally trained in Paris & London with over 12 years of experience crafting signature balayage, blonde transformations, and precision cut architectures.",
            12,
            4.98,
            184,
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80",
            "Balayage & Color Melt, Precision Bobs, Keratin Silk Treatments",
            "Mon,Tue,Wed,Thu,Fri,Sat"
        ),
        (
            2,
            "Marcus Vance",
            "Executive Barber & Men's Grooming Specialist",
            "Master of straight-razor fades, sculpted beard architecture, and revitalizing hot towel aromatherapy grooming for the modern gentleman.",
            9,
            4.95,
            142,
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
            "Razor Fade, Beard Sculpting, Royal Hot Towel Shave, Scalp Detox",
            "Tue,Wed,Thu,Fri,Sat,Sun"
        ),
        (
            3,
            "Aria Chen",
            "Lead Medical Aesthetician & Skin Therapist",
            "Certified clinical aesthetician specializing in non-invasive skin rejuvenation, Hydra-Glow peels, dermal infusions, and acne-clearing therapies.",
            10,
            4.99,
            215,
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
            "Hydra-Glow Facial, Anti-Aging Collagen, Deep Pore Extraction, LED Therapy",
            "Mon,Wed,Thu,Fri,Sat"
        ),
        (
            4,
            "Sofia Rodriguez",
            "Senior Nail Artist & Spa Specialist",
            "Renowned for Russian manicures, sculptural gel extensions, elegant French ombré, and soothing botanical foot spa rituals.",
            7,
            4.92,
            128,
            "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=600&auto=format&fit=crop&q=80",
            "Russian Gel Manicure, Ombré Nail Art, Paraffin Pedicure, Nail Strengthening",
            "Mon,Tue,Thu,Fri,Sat"
        ),
        (
            5,
            "David Laurent",
            "Senior Texture & Curl Specialist",
            "Expert in curly hair cutting techniques, bouncy blowouts, high-gloss color glazes, and botanical scalp nourishment.",
            11,
            4.96,
            167,
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
            "Curly Girl Cuts, Silk Press, Gloss Therapy, Volume Restorations",
            "Wed,Thu,Fri,Sat,Sun"
        ),
        (
            6,
            "Zara Al-Mansoor",
            "Bridal & Red-Carpet Makeup Artist",
            "Specialized in high-definition bridal glam, soft airbrushed finishes, and timeless red carpet aesthetics designed to shine under any lighting.",
            8,
            4.97,
            153,
            "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80",
            "Bridal Couture Makeup, Soft Glam, Airbrush Contouring, Lash Extension",
            "Thu,Fri,Sat,Sun"
        )
    ]
    cursor.executemany('''
        INSERT INTO stylists (id, name, title, bio, experience_years, rating, reviews_count, image_url, specialties, available_days)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', stylists_data)

    # Seed Common Salon Services
    services_data = [
        # Hair Styling & Cuts
        (
            1,
            "Hair Styling & Cuts",
            "Signature Haircut & Deluxe Blowout",
            "Personalized consultation, bespoke haircut tailored to facial structure, invigorating scalp wash with botanical shampoo, and red-carpet blowout.",
            60,
            65.00,
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80",
            "Most Popular",
            1
        ),
        (
            2,
            "Hair Styling & Cuts",
            "Luxe Balayage & Gloss Therapy",
            "Hand-painted sun-kissed lightening technique for seamless, low-maintenance dimensional color, followed by custom gloss toner and deep bond repair.",
            150,
            220.00,
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
            "Trending",
            1
        ),
        (
            3,
            "Hair Styling & Cuts",
            "Brazilian Gold Keratin Smoothing",
            "Zero-frizz restorative thermal treatment that infuses pure liquid keratin into hair cuticles, delivering glass-like shine for up to 5 months.",
            120,
            195.00,
            "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&auto=format&fit=crop&q=80",
            "Client Favorite",
            1
        ),
        (
            4,
            "Hair Styling & Cuts",
            "Gloss, Tone & Moisture Mask",
            "Quick radiance revival! Neutralizes unwanted brassy tones, adds intense multi-reflective mirror shine, and seals cuticles with organic argan butter.",
            45,
            60.00,
            "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80",
            "",
            0
        ),

        # Skin & Facial Therapies
        (
            5,
            "Skin & Facial Therapies",
            "7-Step Medical Hydra-Glow Facial",
            "Vortex suction deep cleansing, gentle salicylic peel, painless pore extraction, antioxidant peptide infusion, and soothing LED collagen light therapy.",
            75,
            145.00,
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80",
            "Best Seller",
            1
        ),
        (
            6,
            "Skin & Facial Therapies",
            "Collagen Youth Lift & Guasha Contour",
            "Intense lifting and firming therapy utilizing microcurrent technology, botanical collagen ampoules, and cold jade stone lymphatic drainage.",
            60,
            130.00,
            "https://images.unsplash.com/photo-1512290900672-1f551b9e25d2?w=800&auto=format&fit=crop&q=80",
            "",
            0
        ),
        (
            7,
            "Skin & Facial Therapies",
            "Deep Pore Clarifying & Anti-Blemish Detox",
            "Custom treatment targeting breakouts, hormonal congestion, and enlarged pores with enzymatic exfoliation and high-frequency ozone therapy.",
            60,
            110.00,
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
            "",
            0
        ),

        # Men's Grooming & Beard Care
        (
            8,
            "Men's Grooming & Beard",
            "Executive Beard Sculpt & Hot Towel Shave",
            "Precision clipper & straight razor contouring, hot eucalyptus towel wrap, clarifying skin scrub, and nourishing organic sandalwood beard oil massage.",
            45,
            48.00,
            "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=800&auto=format&fit=crop&q=80",
            "Popular",
            1
        ),
        (
            9,
            "Men's Grooming & Beard",
            "Royal Haircut & Signature Fade",
            "Crisp skin fade or scissor cut, detailing around ears and neckline, invigorating mint scalp massage, and tailored matte styling paste finish.",
            45,
            52.00,
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
            "",
            0
        ),

        # Hand & Foot Spa / Nails
        (
            10,
            "Hand & Foot Spa / Nails",
            "Luxe Russian Gel Manicure",
            "Flawless dry cuticle treatment for unmatched precision, nail architecture strengthening, and chip-free premium Japanese gel polish lasting 4+ weeks.",
            60,
            65.00,
            "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&auto=format&fit=crop&q=80",
            "Signature",
            1
        ),
        (
            11,
            "Hand & Foot Spa / Nails",
            "Deluxe Botanical Paraffin Pedicure",
            "Epsom sea salt soak, exfoliating brown sugar scrub, heated paraffin wax infusion, callus removal, foot massage, and high-shine gel finish.",
            60,
            75.00,
            "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80",
            "",
            0
        ),

        # Bridal & Red Carpet Glam
        (
            12,
            "Bridal & Glamour Makeup",
            "Red Carpet Glam & Airbrush Makeup",
            "Flawless photo-ready HD makeup application with long-wear airbrush foundation, mink lash accentuation, and bespoke contouring.",
            75,
            120.00,
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&auto=format&fit=crop&q=80",
            "Celebrity Choice",
            1
        ),
        (
            13,
            "Bridal & Glamour Makeup",
            "Bridal Master Suite Trial & Styling",
            "Comprehensive 2-hour bridal consultation, full hair and makeup trial, veil placement guidance, and champagne welcome.",
            120,
            240.00,
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80",
            "Luxury",
            0
        ),

        # Relaxation & Massage
        (
            14,
            "Massage & Body Relaxation",
            "Aromatherapy Scalp, Neck & Shoulder Therapy",
            "Stress-melting warm essential oil head massage combined with acupressure shoulder relief to stimulate hair follicles and erase tension.",
            45,
            58.00,
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=80",
            "Relaxing",
            0
        )
    ]
    cursor.executemany('''
        INSERT INTO services (id, category, name, description, duration_min, price, image_url, badge, is_popular)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', services_data)

    # Seed Before & After Transformations
    seed_transformations(cursor)

    # Seed Sample Reviews
    reviews_data = [
        (
            1,
            "Victoria Sterling",
            "Luxe Balayage & Gloss Therapy",
            "Elena Rostova",
            5,
            "Elena is simply an artist! My balayage blends so seamlessly that people always ask if it's my natural hair. The salon ambiance is serene and luxurious.",
            "October 14, 2026",
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
        ),
        (
            2,
            "Julian Carter",
            "Executive Beard Sculpt & Hot Towel Shave",
            "Marcus Vance",
            5,
            "Best grooming experience in the city. Marcus takes his time, the hot towel treatment is heavenly, and the beard lines are laser sharp.",
            "October 18, 2026",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
        ),
        (
            3,
            "Samantha Wei",
            "7-Step Medical Hydra-Glow Facial",
            "Aria Chen",
            5,
            "Aria transformed my skin before my sister's wedding. The Hydra-Glow gave me immediate radiance and cleared up stubborn pores without irritation.",
            "October 10, 2026",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
        ),
        (
            4,
            "Emily Watson",
            "Luxe Russian Gel Manicure",
            "Sofia Rodriguez",
            5,
            "Sofia's attention to detail is unmatched. The Russian manicure technique is so clean and lasted over a month without chipping. Truly 5 stars!",
            "October 19, 2026",
            "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&auto=format&fit=crop&q=80"
        )
    ]
    cursor.executemany('''
        INSERT INTO reviews (id, customer_name, treatment_name, stylist_name, rating, comment, date, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', reviews_data)

    # Seed a couple of existing sample bookings so calendar shows active realistic state
    today_str = datetime.now().strftime('%Y-%m-%d')
    tomorrow_str = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    sample_bookings = [
        (
            'SLN-78210', 'Camilla Hayes', 'camilla.h@example.com', '+1 (555) 234-5678',
            1, 'Signature Haircut & Deluxe Blowout', 1, 'Elena Rostova',
            today_str, '10:30 AM', 65.00, 'Prefers layered blowout', 'confirmed'
        ),
        (
            'SLN-94123', 'David Miller', 'd.miller@example.com', '+1 (555) 345-6789',
            8, 'Executive Beard Sculpt & Hot Towel Shave', 2, 'Marcus Vance',
            today_str, '02:00 PM', 48.00, 'Sensitive skin on neck', 'confirmed'
        ),
        (
            'SLN-62849', 'Hannah Abbott', 'hannah.a@example.com', '+1 (555) 456-7890',
            5, '7-Step Medical Hydra-Glow Facial', 3, 'Aria Chen',
            tomorrow_str, '11:15 AM', 145.00, 'Pre-event skin prep', 'confirmed'
        )
    ]
    cursor.executemany('''
        INSERT INTO bookings (
            booking_code, customer_name, customer_email, customer_phone,
            service_id, service_name, stylist_id, stylist_name,
            appointment_date, appointment_time, total_price, notes, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', sample_bookings)

if __name__ == '__main__':
    init_db()
    print("Database initialized successfully with stylists, services, transformations, and reviews!")
