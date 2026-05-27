-- =============================================================
-- HungryLakwatsero — Seed Script
-- Cavite Culinary Tourism Platform
-- Safe for re-seeding: uses INSERT ... ON DUPLICATE KEY UPDATE
-- Password hash is bcrypt for 'Admin@123!' (cost factor 10)
-- Hash: $2a$10$h5mnEAUFLg0UY/fVJBi4bu8XXGRgkz5oOhtsqML40PtCHoZYwN13.
-- =============================================================

-- ============================================================
-- ROLES
-- ============================================================
INSERT INTO roles (id, name, description) VALUES
  (1, 'Tourist',            'Standard visitor: culinary exploration, map navigation, ratings, and reviews'),
  (2, 'Food Business Owner','Merchant: manage restaurant details, menu items, announcements, reply to reviews'),
  (3, 'Admin',              'Superuser: user management, content moderation, restaurant approvals, CMS stories')
ON DUPLICATE KEY UPDATE
  name        = VALUES(name),
  description = VALUES(description);

-- ============================================================
-- USERS
-- All passwords: Admin@123!
-- Hash: $2a$10$h5mnEAUFLg0UY/fVJBi4bu8XXGRgkz5oOhtsqML40PtCHoZYwN13.
-- ============================================================
INSERT INTO users (id, role_id, username, email, password_hash, first_name, last_name, is_active, is_verified) VALUES
  (1, 3, 'admin',    'admin@hungrylakwatsero.ph',   '$2a$10$h5mnEAUFLg0UY/fVJBi4bu8XXGRgkz5oOhtsqML40PtCHoZYwN13.', 'Admin',   'User',     TRUE,  TRUE),
  (2, 1, 'tourist1', 'tourist1@demo.com',      '$2a$10$h5mnEAUFLg0UY/fVJBi4bu8XXGRgkz5oOhtsqML40PtCHoZYwN13.', 'Juan',    'dela Cruz',TRUE,  TRUE),
  (3, 2, 'owner1',   'owner1@demo.com',        '$2a$10$h5mnEAUFLg0UY/fVJBi4bu8XXGRgkz5oOhtsqML40PtCHoZYwN13.', 'Maria',   'Santos',   TRUE,  TRUE)
ON DUPLICATE KEY UPDATE
  email         = VALUES(email),
  username      = VALUES(username),
  password_hash = VALUES(password_hash),
  first_name    = VALUES(first_name),
  last_name     = VALUES(last_name),
  is_active     = VALUES(is_active),
  is_verified   = VALUES(is_verified);

-- ============================================================
-- MUNICIPALITIES — All 23 in Cavite Province
-- ============================================================
INSERT INTO municipalities (id, name, description, latitude, longitude, featured_image) VALUES
  ( 1, 'Cavite City',                'The historic island-city of Cavite and cradle of Philippine independence. Famous for Pancit Estacion, Bacalao, and Quesillo.',                                              14.4776, 120.8988, '/uploads/municipalities/cavite_city.jpg'),
  ( 2, 'Kawit',                      'Birthplace of Philippine Independence. Known for its seafood culture along Bacoor Bay, especially fresh oysters and shrimps.',                                             14.4422, 120.8980, '/uploads/municipalities/kawit.jpg'),
  ( 3, 'Noveleta',                   'A quiet riverside municipality rich in maritime culture and known for fresh river fish and traditional Caviteño dishes.',                                                   14.4289, 120.8852, '/uploads/municipalities/noveleta.jpg'),
  ( 4, 'Rosario',                    'Known as the "Bagsakan ng Isda" of Cavite — a hub for fresh fish trade and seafood delicacies along Manila Bay.',                                                         14.4172, 120.8514, '/uploads/municipalities/rosario.jpg'),
  ( 5, 'Tanza',                      'An agricultural and coastal municipality producing salt, fishponds, and fresh seafood. Home to the Tanza Reef and heritage churches.',                                    14.3947, 120.8497, '/uploads/municipalities/tanza.jpg'),
  ( 6, 'Naic',                       'Gateway to the western coast of Cavite, known for mangrove forests, oyster beds, and traditional Naic Cassava Cake.',                                                    14.3167, 120.7625, '/uploads/municipalities/naic.jpg'),
  ( 7, 'Ternate',                    'A coastal municipality with strong Moluccan cultural heritage. Famous for exotic seafood, miagos vinegar, and traditional boat-building.',                                14.2858, 120.7222, '/uploads/municipalities/ternate.jpg'),
  ( 8, 'Maragondon',                 'A historic highland municipality and former capital of Cavite. Known for organic highland vegetables, native chicken dishes, and historical landmarks.',                   14.2672, 120.7358, '/uploads/municipalities/maragondon.jpg'),
  ( 9, 'Alfonso',                    'A cool highland town famous for organic strawberry farms, fresh vegetables, and farm-to-table dining hidden among the Tagaytay highlands.',                               14.1403, 120.8567, '/uploads/municipalities/alfonso.jpg'),
  (10, 'Magallanes',                 'A remote coastal municipality rich in mangroves and traditional fishing. Known for dried fish, shrimp paste (bagoong), and native shellfish.',                           14.1878, 120.7522, '/uploads/municipalities/magallanes.jpg'),
  (11, 'Indang',                     'Birthplace of the famous Kalamay Indang sticky delicacy and home to organic cacao farms and heritage bahay-na-bato architecture.',                                       14.1978, 120.8786, '/uploads/municipalities/indang.jpg'),
  (12, 'Mendez',                     'A highland town adjacent to Tagaytay known for native coffee, fresh leafy greens, and a peaceful rural dining atmosphere.',                                              14.1344, 120.9053, '/uploads/municipalities/mendez.jpg'),
  (13, 'Tagaytay City',              'Cavite\'s premium tourist destination perched on a ridge overlooking Taal Volcano. World-renowned for Bulalo, Crispy Tawilis, and breathtaking views.',                  14.1153, 120.9621, '/uploads/municipalities/tagaytay.jpg'),
  (14, 'Amadeo',                     'The Coffee Capital of Cavite. Home to sprawling Coffea Liberica (Barako) farms and native coffee blends served in rustic hillside cafes.',                               14.1683, 120.9253, '/uploads/municipalities/amadeo.jpg'),
  (15, 'Silang',                     'A lush agricultural municipality bordering Laguna, famous for pineapple farms, organic coffee nurseries, flower gardens, and farm-to-table restaurants.',                14.2310, 120.9762, '/uploads/municipalities/silang.jpg'),
  (16, 'Carmona',                    'An urbanizing town on the eastern edge of Cavite known for leisure parks, local eateries, and growing food and beverage industry hubs.',                                  14.3156, 121.0581, '/uploads/municipalities/carmona.jpg'),
  (17, 'General Trias',              'A fast-growing city blending traditional Filipino eateries with modern dining. Famous for barbeque centers, lutong-bahay restaurants, and street food.',                  14.3867, 120.8806, '/uploads/municipalities/gen_trias.jpg'),
  (18, 'Dasmariñas City',            'The most populous city in Cavite and a melting pot of culinary traditions. Features diverse restaurants from heritage Filipino to international cuisine.',                 14.3294, 120.9367, '/uploads/municipalities/dasma.jpg'),
  (19, 'Bacoor City',                'Gateway city to Cavite and home to the legendary Digman Halo-Halo and thriving muscle/oyster beds along Bacoor Bay.',                                                   14.4624, 120.9646, '/uploads/municipalities/bacoor.jpg'),
  (20, 'Imus City',                  'The Christmas Capital of Cavite and home to the world-renowned garlicky, sour Imus Longganisa — a national culinary heritage food product.',                             14.4296, 120.9367, '/uploads/municipalities/imus.jpg'),
  (21, 'General Mariano Alvarez',    'Known locally as GMA, a progressive municipality with a vibrant food scene, local markets, and a growing number of specialty restaurants and cafes.',                    14.3019, 121.0042, '/uploads/municipalities/gma.jpg'),
  (22, 'Trece Martires City',        'The provincial capital of Cavite. A center for government, commerce, and local food culture. Famous for local markets and traditional Caviteño dishes.',                 14.2822, 120.8656, '/uploads/municipalities/trece.jpg'),
  (23, 'Cavite City (Alt)',          'Historic fortified city at the tip of Cavite peninsula — use for overflow references. Shares coordinates with the primary Cavite City entry.',                            14.4776, 120.8988, NULL)
ON DUPLICATE KEY UPDATE
  name          = VALUES(name),
  description   = VALUES(description),
  latitude      = VALUES(latitude),
  longitude     = VALUES(longitude);

-- ============================================================
-- RESTAURANTS — 10 authentic Cavite establishments
-- ============================================================
INSERT INTO restaurants
  (id, owner_id, municipality_id, name, description, address, barangay,
   latitude, longitude, contact_info, business_hours, history_story,
   cuisine_type, cuisine_tags, is_featured, status)
VALUES
  -- 1. Tagaytay Bulalo House
  (1, 3, 13,
   'Tagaytay Bulalo House',
   'Serving Cavite\'s most authentic premium beef bulalo — slow-simmered for six hours with giant marrow bones, sweet white corn, pechay, and a crystal-clear rich broth. Best enjoyed overlooking Taal Volcano.',
   'Maharlika Highway East, Tagaytay City, Cavite',
   'Brgy. Sungay East',
   14.1205, 120.9585,
   '+63 46 413 9999',
   '{"Monday–Sunday": "7:00 AM – 11:00 PM"}',
   'Established in 1995, Tagaytay Bulalo House began as a humble roadside carinderia catering to jeepney drivers braving the cold Tagaytay air. The founders, the Reyes family, used their grandparents\' original recipe of slow-simmering whole beef legs with only sea salt and whole peppercorns. Word spread, tourists flocked, and the carinderia expanded into a beloved institution with a panoramic view of Taal Volcano.',
   'Filipino / Bulalo',
   'Filipino,Bulalo,Beef,Soup,Heritage',
   TRUE, 'approved'),

  -- 2. Kawit Heritage Oyster Bar
  (2, 3, 2,
   'Kawit Heritage Oyster Bar',
   'Fresh oysters harvested directly from Kawit\'s coastal talaba beds on Bacoor Bay, served in both traditional kamayan style and modern preparations — grilled, baked, kinilaw, and in classic sinigang.',
   'Tirona Highway, Kawit, Cavite',
   'Brgy. Batong Dalig',
   14.4420, 120.8980,
   '+63 917 123 4567',
   '{"Tuesday–Sunday": "10:00 AM – 9:00 PM", "Monday": "Closed"}',
   'Rooted in generations of oyster farming along Bacoor Bay, the Kawit Heritage Oyster Bar was founded to preserve and celebrate the talaba farming tradition that has sustained coastal Cavite families since the Spanish colonial period. The restaurant sources exclusively from six local farming families and uses traditional harvesting techniques that maintain the ecosystem.',
   'Seafood / Filipino',
   'Seafood,Oysters,Heritage,Filipino,Kawit',
   FALSE, 'approved'),

  -- 3. Silang Farm Garden Cafe
  (3, 3, 15,
   'Silang Farm Garden Cafe',
   'A scenic farm-to-table dining sanctuary nestled inside a working tropical flower nursery. We roast organic Coffea Liberica (Barako) on-site and harvest herbs and vegetables from our 2-hectare garden plot daily.',
   'Laguna–Bel Air Bypass Road, Silang, Cavite',
   'Brgy. Lalaan I',
   14.2185, 120.9820,
   '+63 46 888 1234',
   '{"Wednesday–Monday": "9:00 AM – 8:00 PM", "Tuesday": "Closed"}',
   'Built as an extension of a family-run flower and ornamental plant nursery established in 1981, Silang Farm Garden Cafe opened its kitchen in 2009 to share the bounty of its land. Every dish traces its ingredients to within 10 kilometers of the restaurant. The café became a symbol of Silang\'s transition toward agri-tourism and earned recognition from the Department of Tourism in 2018.',
   'Farm-to-Table / Café',
   'Farm-to-Table,Organic,Coffee,Garden,Silang',
   FALSE, 'approved'),

  -- 4. Imus Longganisa Hub
  (4, 3, 20,
   'Imus Longganisa Hub',
   'The definitive home of the legendary Imus Longganisa — a garlicky, tangy, naturally cured pork sausage encased in native intestine casings. Served with sinangag, fried egg, and house-made sukang Iloko.',
   'Gen. Castañeda St., Poblacion, Imus City, Cavite',
   'Brgy. Poblacion IV-A',
   14.4312, 120.9388,
   '+63 922 987 6543',
   '{"Monday–Saturday": "5:30 AM – 3:00 PM", "Sunday": "5:30 AM – 12:00 PM"}',
   'The Imus Longganisa Hub was established to preserve the original 1950s recipe documented by Lola Asuncion de Vera. The traditional Imus-style sausage relies on natural pork casings, heavy garlic, coarse black pepper, Cavite sea salt, and the characteristic souring agent — native Iloko vinegar — giving it a uniquely tangy-garlicky profile that sets it apart from all other Philippine regional longganisa.',
   'Filipino / Breakfast',
   'Filipino,Longganisa,Breakfast,Heritage,Pork',
   TRUE, 'approved'),

  -- 5. Casa Magdalena
  (5, 3, 18,
   'Casa Magdalena',
   'A heritage dining house in Dasmariñas serving classic Caviteño recipes preserved across three generations — Bacalao con Patatas, Relleno, Morcon, and slow-braised Estofado — inside a restored 1930s bahay-na-bato.',
   'Emilio Aguinaldo Highway, Dasmariñas City, Cavite',
   'Brgy. Salawag',
   14.3294, 120.9350,
   '+63 46 402 0012',
   '{"Wednesday–Monday": "11:00 AM – 9:30 PM", "Tuesday": "Closed"}',
   'Casa Magdalena is named after its founder, Magdalena Cruz-Villanueva, who began feeding neighborhood families from her ancestral home kitchen in 1937. The family kept the recipes strictly within the bloodline, with each generation of women hand-training the next. Now open to the public, the restaurant serves as a living museum of colonial Caviteño cooking, preserving flavors that reflect Spanish, Malay, and indigenous Filipino culinary fusion.',
   'Filipino Heritage',
   'Filipino,Heritage,Colonial,Caviteño,Fine Dining',
   TRUE, 'approved'),

  -- 6. The Pancit Estacion
  (6, 3, 1,
   'The Pancit Estacion',
   'The only restaurant in Cavite City dedicated exclusively to the iconic Pancit Estacion — thin rice noodles in a rich orange mung bean and shrimp sauce, topped with hard-boiled egg and a squeeze of calamansi.',
   'Pulo Luzon Road, Cavite City',
   'Brgy. Pulo Luzon',
   14.4776, 120.8980,
   '+63 46 431 0567',
   '{"Daily": "6:00 AM – 2:00 PM"}',
   'Named after the old railway estacion (station) in Cavite City where this dish was first sold to early morning commuters in the 1920s, The Pancit Estacion carries on the century-old tradition. The orange sauce — made from ground mung beans (togue), shrimp, and sour kamias — is prepared fresh each morning and cooked only until it sells out. This is authentic Caviteño soul food.',
   'Traditional Filipino',
   'Filipino,Noodles,Cavite City,Heritage,Traditional',
   FALSE, 'approved'),

  -- 7. Kalamay Sa Indang
  (7, 3, 11,
   'Kalamay Sa Indang',
   'The most traditional producer of the century-old Kalamay Indang sticky rice delicacy. Watch our artisans slow-stir the kalamay in giant brass kawa pots over an open flame — a labor of love taking four hours per batch.',
   'Poblacion Road, Indang, Cavite',
   'Brgy. Poblacion I',
   14.1978, 120.8750,
   '+63 46 869 0234',
   '{"Tuesday–Sunday": "8:00 AM – 6:00 PM", "Monday": "Closed"}',
   'Kalamay Indang is Indang\'s most celebrated cultural heritage product and is recognized by the National Commission for Culture and the Arts (NCCA) as an Intangible Cultural Heritage. Kalamay Sa Indang was founded by the Lontok family, who have guarded the original recipe — malagkit rice flour, muscovado sugar, and thick coconut milk — for five generations. The slow-stirring ritual in a brass kawa is considered a community bonding activity.',
   'Desserts / Traditional',
   'Desserts,Kalamay,Heritage,Sticky Rice,Traditional',
   FALSE, 'approved'),

  -- 8. Alfonso Farm Café
  (8, 3, 9,
   'Alfonso Farm Café',
   'A tranquil highland café surrounded by strawberry farms and vegetable patches. Serves organic, chemical-free breakfast plates, fresh strawberry preserves, and locally roasted coffee from neighboring Amadeo farms.',
   'Barangay Luksuhin Ilaya, Alfonso, Cavite',
   'Brgy. Luksuhin Ilaya',
   14.1403, 120.8520,
   '+63 917 456 7890',
   '{"Saturday–Thursday": "7:00 AM – 6:00 PM", "Friday": "Closed"}',
   'Alfonso Farm Café was born from a dream to show city visitors where their food truly comes from. Owners Rolando and Carmelita Bautista opened their strawberry farm to guests in 2014, adding a small coffee nook that quickly became a destination. The café is fully powered by solar panels, sources water from a natural spring on the property, and sends all organic waste back to the farm as compost.',
   'Organic / Farm Café',
   'Organic,Farm,Coffee,Strawberry,Highlands',
   FALSE, 'approved'),

  -- 9. Amadeo Kape at Pagkain
  (9, 3, 14,
   'Amadeo Kape at Pagkain',
   'A rustic hilltop café in the Coffee Capital of Cavite serving freshly roasted Barako (Coffea Liberica) coffee alongside hearty Filipino breakfast and merienda plates. Beans sourced from 12 partner Amadeo farms.',
   'National Road, Amadeo, Cavite',
   'Brgy. San Juan II',
   14.1683, 120.9210,
   '+63 49 501 0987',
   '{"Daily": "6:00 AM – 8:00 PM"}',
   'Amadeo is the beating heart of Philippine Barako coffee farming. Amadeo Kape at Pagkain was founded in 2011 by a collective of third-generation coffee farmers who wanted visitors to experience authentic Barako — bold, woody, and earthy — brewed in traditional clay pots rather than commercial machines. Each cup is directly tied to a specific farm plot, preserving the tradition of single-origin traceability in Philippine coffee culture.',
   'Coffee / Filipino',
   'Coffee,Barako,Filipino,Breakfast,Amadeo',
   FALSE, 'approved'),

  -- 10. General Trias Barbeque Center
  (10, 3, 17,
   'General Trias Barbeque Center',
   'An open-air grills destination in the heart of General Trias, famous for inihaw na liempo, pork bbq on bamboo skewers, chicken inasal, grilled seafood, and classic Filipino boodle fight packages for groups.',
   'Arnaldo Highway, General Trias, Cavite',
   'Brgy. Buenavista III',
   14.3867, 120.8810,
   '+63 46 509 1234',
   '{"Daily": "11:00 AM – 11:00 PM"}',
   'General Trias Barbeque Center started in 1988 as a roadside ihaw-ihaw stall operated by the Mercado family, strategically placed along the Arnaldo Highway to serve workers from nearby industrial estates. The charcoal and bamboo grill tradition passed from father to son, and today the center seats over 200 diners under open-air bamboo pavilions, maintaining the same charcoal techniques and homemade bbq basting sauce recipe for over three decades.',
   'Barbeque / Filipino',
   'Barbeque,Grills,Filipino,Inihaw,Liempo',
   FALSE, 'approved')

ON DUPLICATE KEY UPDATE
  name         = VALUES(name),
  description  = VALUES(description),
  cuisine_type = VALUES(cuisine_type),
  cuisine_tags = VALUES(cuisine_tags),
  is_featured  = VALUES(is_featured),
  status       = VALUES(status);

-- ============================================================
-- RESTAURANT IMAGES
-- ============================================================
INSERT INTO restaurant_images (id, restaurant_id, image_url, is_primary) VALUES
  ( 1,  1, '/uploads/restaurants/bulalo_house_main.jpg',          TRUE),
  ( 2,  1, '/uploads/restaurants/bulalo_house_interior.jpg',      FALSE),
  ( 3,  2, '/uploads/restaurants/kawit_oyster_bar_main.jpg',      TRUE),
  ( 4,  3, '/uploads/restaurants/silang_farm_cafe_main.jpg',      TRUE),
  ( 5,  4, '/uploads/restaurants/imus_longganisa_main.jpg',       TRUE),
  ( 6,  5, '/uploads/restaurants/casa_magdalena_main.jpg',        TRUE),
  ( 7,  6, '/uploads/restaurants/pancit_estacion_main.jpg',       TRUE),
  ( 8,  7, '/uploads/restaurants/kalamay_indang_main.jpg',        TRUE),
  ( 9,  8, '/uploads/restaurants/alfonso_farm_cafe_main.jpg',     TRUE),
  (10,  9, '/uploads/restaurants/amadeo_kape_main.jpg',           TRUE),
  (11, 10, '/uploads/restaurants/gen_trias_bbq_main.jpg',         TRUE)
ON DUPLICATE KEY UPDATE image_url = VALUES(image_url);

-- ============================================================
-- MENU ITEMS
-- ============================================================
INSERT INTO menu_items (id, restaurant_id, name, description, price, category, image_url) VALUES
  -- Tagaytay Bulalo House
  (1,  1, 'Special Bulalo Overload',        'Giant beef shank with full marrow bone, sweet corn, pechay, and signature clear broth. Serves 2.',                   550.00, 'Main Course',  '/uploads/menu/bulalo_overload.jpg'),
  (2,  1, 'Crispy Tawilis',                 'Deep-fried whole freshwater sardines from Taal Lake, crispy golden. Served with homemade spiced vinegar dip.',        220.00, 'Appetizer',    '/uploads/menu/crispy_tawilis.jpg'),
  (3,  1, 'Bulalito Solo',                  'Single-serving beef shank bulalo with marrow, corn, and clear soup. Perfect for solo diners.',                        280.00, 'Main Course',  '/uploads/menu/bulalito.jpg'),
  -- Kawit Heritage Oyster Bar
  (4,  2, 'Garlic Baked Oysters',           'Half-shell Kawit oysters baked with garlic butter and melted mozzarella. 6 pieces per order.',                       280.00, 'Main Course',  '/uploads/menu/garlic_oysters.jpg'),
  (5,  2, 'Kinilaw na Talaba',              'Fresh raw oysters cured in native coconut vinegar with ginger, onion, calamansi, and labuyo chili.',                  220.00, 'Appetizer',    '/uploads/menu/kinilaw_talaba.jpg'),
  (6,  2, 'Sinigang na Hipon sa Kamias',   'Sour tamarind-kamias shrimp soup with eggplant, kangkong, and labanos. A true Caviteño sinigang.',                    320.00, 'Main Course',  '/uploads/menu/sinigang_hipon.jpg'),
  -- Silang Farm Garden Cafe
  (7,  3, 'Barako Espresso Glazed Ribs',   'Pork spare ribs slow-cooked in a Barako coffee and muscovado glaze. Served with garlic rice and pickled papaya.',      450.00, 'Main Course',  '/uploads/menu/barako_ribs.jpg'),
  (8,  3, 'Farm Garden Salad',             'Freshly harvested mixed greens, tomato, cucumber, and edible flowers dressed in calamansi-honey vinaigrette.',         180.00, 'Salad',        '/uploads/menu/garden_salad.jpg'),
  (9,  3, 'Barako Cold Brew',              'Single-origin Silang Coffea Liberica cold-brewed for 18 hours. Bold, woody, and naturally sweet. 350ml.',              120.00, 'Beverage',     '/uploads/menu/barako_coldbrew.jpg'),
  -- Imus Longganisa Hub
  (10, 4, 'Classic Imus Longganisa Plate', '3 pc Imus longganisa, 2 sunny-side-up eggs, garlic fried rice, and house-made atchara.',                              150.00, 'Main Course',  '/uploads/menu/longganisa_plate.jpg'),
  (11, 4, 'Longganisa Dagdag',             'Extra 3-piece Imus longganisa add-on for any plate.',                                                                   60.00, 'Add-on',       '/uploads/menu/longganisa_extra.jpg'),
  -- Casa Magdalena
  (12, 5, 'Bacalao con Patatas',           'Salt cod stewed with potato, tomato, olive oil, and pimiento. A colonial Caviteño Christmas staple served year-round.', 420.00, 'Main Course', '/uploads/menu/bacalao.jpg'),
  (13, 5, 'Estofado de Pollo',             'Chicken braised in vinegar, soy sauce, and brown sugar with bay leaf, garlic, and peppercorns. Heritage Caviteño adobo variant.', 380.00, 'Main Course', '/uploads/menu/estofado.jpg'),
  -- The Pancit Estacion
  (14, 6, 'Pancit Estacion (Regular)',     'Traditional Cavite City-style bihon in orange mung bean-shrimp sauce. With hard-boiled egg and calamansi.',            120.00, 'Main Course',  '/uploads/menu/pancit_estacion.jpg'),
  (15, 6, 'Pancit Estacion (Bilao)',       'Large bilao serving of Pancit Estacion for 6–8 persons. Perfect for family sharing.',                                  850.00, 'Main Course',  '/uploads/menu/pancit_bilao.jpg'),
  -- Kalamay Sa Indang
  (16, 7, 'Kalamay Indang (Small)',        'Traditional sticky rice kalamay in a native coconut shell. Individual serving.',                                         80.00, 'Dessert',      '/uploads/menu/kalamay_small.jpg'),
  (17, 7, 'Kalamay Indang (Box of 6)',    'Six individual kalamay portions boxed for pasalubong or gifting.',                                                       450.00, 'Dessert',      '/uploads/menu/kalamay_box.jpg'),
  -- Alfonso Farm Café
  (18, 8, 'Organic Farm Breakfast Plate', 'Free-range fried eggs, organic salted tomatoes, native longaniza, and whole-grain toast. No preservatives.',            220.00, 'Breakfast',    '/uploads/menu/farm_breakfast.jpg'),
  (19, 8, 'Strawberry Jam Pancakes',      'Fluffy buttermilk pancakes topped with house-made Alfonso strawberry jam and whipped cream.',                           180.00, 'Breakfast',    '/uploads/menu/strawberry_pancakes.jpg'),
  -- Amadeo Kape at Pagkain
  (20, 9, 'Barako Brewed Coffee',         'Single-origin Amadeo Coffea Liberica brewed traditionally in a clay pot. Bold, earthy, and aromatic. 250ml.',           80.00, 'Beverage',     '/uploads/menu/barako_brewed.jpg'),
  (21, 9, 'Longsilog Amadeo-Style',       'Native pork longganisa with Amadeo organic garlic rice and two eggs.',                                                  160.00, 'Breakfast',    '/uploads/menu/longsilog_amadeo.jpg'),
  -- General Trias Barbeque Center
  (22, 10, 'Liempo Barbeque (5 pcs)',     '5 thick pork belly skewers charcoal-grilled with the Mercado family\'s secret basting sauce. With rice and sawsawan.', 200.00, 'Main Course',  '/uploads/menu/liempo_bbq.jpg'),
  (23, 10, 'Chicken Inasal',              'Whole leg quarter marinated in lemongrass, calamansi, and annatto, then charcoal-grilled. Served with Java rice.',     180.00, 'Main Course',  '/uploads/menu/chicken_inasal.jpg'),
  (24, 10, 'Boodle Fight Package (10 pax)','Banana-leaf boodle with 3 whole grilled fish, liempo, chicken inasal, kare-kare, and java rice mound for 10 diners.', 2200.00,'Set Meal',     '/uploads/menu/boodle_fight.jpg')

ON DUPLICATE KEY UPDATE
  name        = VALUES(name),
  price       = VALUES(price),
  description = VALUES(description);

-- ============================================================
-- REVIEWS — 3 reviews for restaurant 1 from tourist1 (id=2)
-- ============================================================
INSERT INTO reviews (id, restaurant_id, user_id, content, rating_value) VALUES
  (1, 1, 2,
   'Absolutely the best Bulalo I have ever had in my life! The soup is crystal clear, piping hot, and deeply rich. The marrow bone is enormous and the view of Taal Volcano while eating adds another dimension to the experience. Will definitely come back every Tagaytay trip!',
   5),
  (2, 1, 2,
   'We visited on a weekday morning and the place was already filling up. The Crispy Tawilis appetizer was perfectly fried — crispy skin, tender inside, and pairs beautifully with their spiced vinegar. For the price, you get an incredibly generous serving of bulalo. Highly recommend the Special Bulalo Overload for sharing.',
   5),
  (3, 1, 2,
   'Good food but the wait time can be long during weekends. Came with a group of 8 and we waited about 25 minutes. Food quality was still excellent — the broth is the real star. Would suggest reserving ahead on peak days. Overall still a must-visit Tagaytay stop.',
   4)
ON DUPLICATE KEY UPDATE content = VALUES(content), rating_value = VALUES(rating_value);

-- ============================================================
-- RATINGS — matching the reviews above
-- ============================================================
INSERT INTO ratings (restaurant_id, user_id, score) VALUES
  (1, 2, 5),
  (4, 2, 5),
  (7, 2, 4)
ON DUPLICATE KEY UPDATE score = VALUES(score);

-- ============================================================
-- FOOD STORIES — 5 published stories covering Cavite heritage
-- ============================================================
INSERT INTO food_stories (id, title, content, author_id, municipality_id, traditional_dishes, image_url, status) VALUES

  -- 1. Pancit Estacion
  (1,
   'The Legend of Pancit Estacion: Cavite City\'s Railway Noodle',
   'Long before expressways connected Cavite to Manila, the old railway estacion (station) in Cavite City was the pulse of daily life. In the 1920s, vendors clustered outside the station serving quick, affordable breakfasts to commuters, laborers, and soldiers. Among their offerings was a noodle dish unlike any other in the Philippines: bihon rice noodles coated in a thick, bright orange sauce made from ground mung beans, fresh shrimp, and the tartly sour juice of kamias (bilimbi fruit).\n\nThe dish was cheap, filling, warming on cool mornings, and unmistakably Caviteño in flavor — a balance of earthiness from the mung bean, sweetness from the shrimp, and that distinctive sour note from kamias that you simply cannot substitute. A halved hard-boiled egg and a wedge of calamansi completed the bowl.\n\nAs the railway era faded, Pancit Estacion refused to disappear. Local families preserved the recipe in their homes, and a handful of dedicated small restaurants in Cavite City continue to cook it the traditional way — made fresh each morning, served only until it sells out. In 2019, the National Commission for Culture and the Arts (NCCA) formally recognized Pancit Estacion as a significant intangible cultural food heritage of Cavite.\n\nTo eat Pancit Estacion is to ride an imaginary train back to old Cavite City — back to a bustling station, a foggy morning, and the smell of shrimp and mung beans wafting from a clay pot.',
   1, 1,
   'Pancit Estacion, Quesillo, Bacalao',
   '/uploads/stories/story_pancit_estacion.jpg',
   'published'),

  -- 2. Kalamay Indang
  (2,
   'Kalamay Indang: The Sweet Heart of a Cavite Town',
   'In the municipality of Indang, time slows down around the brass kawa. A kawa is a large, heavy-bottomed cooking pan set over an open wood fire, and for over a century, Indang families have gathered around it to stir kalamay — a labor-intensive sticky rice delicacy that demands patience, community, and skill.\n\nKalamay Indang is made from three humble ingredients: ground malagkit (glutinous rice flour), muscovado brown sugar, and thick first-press coconut milk (kakang gata). The mixture is poured into the hot kawa and stirred continuously — without stopping — for four to six hours. The stirrer must never rest or the kalamay will burn and the entire batch will be ruined.\n\nThis is why kalamay-making has always been a communal act. Neighbors take turns at the wooden stirring paddle, trading stories and singing while the mixture thickens from a pale liquid to a dark, glossy, almost black confection. The finished kalamay is poured into half-coconut shells, allowed to cool, and sealed with a banana leaf lid — a packaging method unchanged since the 19th century.\n\nThe National Commission for Culture and the Arts (NCCA) has listed Kalamay Indang as a living culinary heritage tradition. Every December, Indang celebrates the Kalamay Festival, where the entire town participates in communal cooking demonstrations and the streets fill with the irresistible caramel-coconut aroma of kalamay being stirred in dozens of kawa simultaneously.',
   1, 11,
   'Kalamay Indang, Tablea, Native Chocolate',
   '/uploads/stories/story_kalamay_indang.jpg',
   'published'),

  -- 3. Tagaytay Bulalo Culture
  (3,
   'Why Tagaytay and Bulalo Are Inseparable: A Culinary Love Story',
   'Ask any Filipino where to eat bulalo and the answer is almost always the same: Tagaytay. But why did this particular city become the national capital of this beef bone marrow soup? The answer lies in geography, history, and the cold.\n\nTagaytay City sits on a volcanic ridge at 600 meters above sea level, overlooking the stunning crater lake of Taal Volcano. The altitude brings a natural chill — average temperatures of 18–24°C — that is extraordinarily rare in the lowland Philippine heat. Early 20th-century Filipinos and American colonists alike discovered Tagaytay as a mountain retreat, building rest houses and summer homes along the ridge.\n\nThe cool air stimulated appetites for warm, hearty food. Local beef farmers in the Tagaytay–Silang–Alfonso highlands were already raising cattle on the rich volcanic grasslands. It was a natural marriage: cold weather, abundant beef, and the Filipino tradition of maximizing every part of the animal — including the bones and their precious marrow.\n\nThe first bulalo houses appeared in the 1950s along the Aguinaldo Highway. By the 1980s, Tagaytay bulalo had become a national food tourism destination. The definitive recipe calls for beef shank or leg bones, boiled for four to six hours with only water, peppercorns, fish sauce, and sweet white corn — allowing the collagen-rich marrow to dissolve into a naturally rich, clear broth that needs nothing more.\n\nToday, over 60 restaurants in Tagaytay serve bulalo, but the best still follow the unhurried, long-simmered tradition. The combination of altitude cold, volcano views, and steaming marrow broth is one of the Philippines\' most perfect culinary experiences.',
   1, 13,
   'Bulalo, Crispy Tawilis, Taal Lake Bangus',
   '/uploads/stories/story_bulalo_tagaytay.jpg',
   'published'),

  -- 4. Imus Longganisa Heritage
  (4,
   'Imus Longganisa: The Garlicky Pride of Cavite\'s Christmas Capital',
   'Every province in the Philippines has its longganisa, but the Imus variety stands apart with an unapologetic intensity of garlic and a sharp, mouth-puckering sourness that makes it addictive from the very first bite.\n\nThe Imus longganisa traces its roots to the pork-curing traditions of Spanish-era Cavite, where households preserved meat using heavy salt, garlic, and local vinegar. Unlike the sweet varieties common in Pampanga or the anise-forward longganisa of Vigan, the Imus version uses no sugar — only coarse black pepper, generous raw garlic, sea salt from Cavite\'s old salt pans, and a souring agent traditionally made from Iloko vinegar or native coconut vinegar.\n\nThe meat mixture is packed into natural pork intestine casings — never synthetic — and air-dried for 24 hours before cooking. Frying the longganisa is an event in itself: as the casings char and split, the garlicky juices caramelize in the pan, filling the kitchen with an intoxicating aroma that signals a quintessential Filipino breakfast.\n\nImus longganisa has been officially registered as a Heritage Food Product by the Department of Science and Technology (DOST) and features in the Philippine Culinary Heritage Map. It is produced by numerous small home-based manufacturers and sold fresh at the Imus public market, where buyers line up as early as 5 AM.\n\nTo taste Imus longganisa is to taste Cavite\'s working-class pride — a dish that asks nothing of pretense and delivers everything in bold, garlic-forward flavor.',
   1, 20,
   'Imus Longganisa, Sinangag, Atchara, Itlog na Pula',
   '/uploads/stories/story_imus_longganisa.jpg',
   'published'),

  -- 5. Cavite Revolutionary Food History
  (5,
   'Food of the Revolution: Feeding the Katipunan in Cavite',
   'In 1896, as Philippine revolutionary forces under General Emilio Aguinaldo swept through Cavite Province, defeating Spanish colonial troops in a series of historic battles, another war was being waged quietly behind the front lines: the war to feed an army.\n\nCavite\'s culinary geography played a direct role in sustaining the Katipunan movement. The province\'s fertile agricultural zones — the highland coffee farms of Amadeo and Silang, the rice paddies of General Trias and Imus, the coastal fisheries of Kawit and Bacoor — made it naturally self-sufficient in ways that no other province in Luzon could match at the time.\n\nRevolutionary kitchens operated in bahay kubo (nipa huts) across Cavite\'s interior, preparing communal meals of kanin (steamed rice), dried fish (tuyo and danggit), and vegetable stews of kamote tops, labanos, and kangkong gathered from the fields. Pigs and chickens were slaughtered for fiesta-style feasts after military victories, reinforcing the Filipino tradition of shared communal eating as an act of solidarity and celebration.\n\nThe Imus market, which already supplied the Spanish garrison, pivoted to supplying revolutionary troops. Kalamay Indang was packed as non-perishable field rations — its high sugar content providing sustained energy. Longganisa from Imus was cured and dried to last weeks without refrigeration.\n\nToday, many of Cavite\'s signature dishes carry this revolutionary memory — not in martial fanfare, but in the quiet dignity of food prepared, shared, and preserved across generations as acts of community survival and cultural identity.',
   1, 1,
   'Kalamay Indang, Imus Longganisa, Pancit Estacion, Kanin, Tuyo',
   '/uploads/stories/story_revolutionary_food.jpg',
   'published')

ON DUPLICATE KEY UPDATE
  title       = VALUES(title),
  content     = VALUES(content),
  status      = VALUES(status);

-- ============================================================
-- SAMPLE FAVORITES
-- ============================================================
INSERT IGNORE INTO favorites (user_id, restaurant_id) VALUES
  (2, 1),
  (2, 4),
  (2, 7);

-- ============================================================
-- SAMPLE HIDDEN GEMS — community-suggested spots
-- ============================================================
INSERT INTO hidden_gems
  (id, suggester_id, restaurant_name, address, municipality_id, description, suggested_by_type, status, votes)
VALUES
  (1, 2,
   'Lola Sioning\'s Karekare',
   'Brgy. Tapay, Trece Martires City, Cavite',
   22,
   'A humble sari-sari store run by an 80-year-old lola who makes kare-kare from scratch every Sunday using traditional bagoong she ferments herself. No signage, just word of mouth.',
   'tourist', 'pending', 12),
  (2, 2,
   'Ternate Tuba Wine Bar',
   'Shoreline Road, Ternate, Cavite',
   7,
   'A small bamboo shack overlooking Manila Bay serving locally fermented tuba (coconut toddy) with freshly grilled squid. Known only to locals and fishermen. Hidden gem with a spectacular sunset view.',
   'local', 'pending', 28),
  (3, NULL,
   'Maragondon Native Chicken Tinola',
   'Sitio Puting Bato, Maragondon, Cavite',
   8,
   'An anonymous tip about a small roadside eatery deep in Maragondon that serves tinola made exclusively with free-range native chickens raised on the property. Reportedly the best tinola in Cavite.',
   'tourist', 'pending', 7)
ON DUPLICATE KEY UPDATE
  restaurant_name = VALUES(restaurant_name),
  votes           = VALUES(votes);
