// Central State Store
const state = {
  user: null,
  favorites: [1],
  restaurants: [
    { id: 1, name: 'Tagaytay Bulalo House', address: 'Maharlika Highway East, Tagaytay City, Cavite', latitude: 14.1205, longitude: 120.9585, average_rating: 5.0, rating_count: 1, primary_image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80', municipality_name: 'Tagaytay City', description: 'Serving Cavite\'s most authentic premium beef bulalo with marrow bones in a rich slow-simmered broth.', contact_info: '+63 46 413 9999', business_hours: 'Mon-Sun 8:00 AM - 10:00 PM', history_story: 'Established in 1995, Tagaytay Bulalo House started as a small roadside carinderia servicing drivers braving the cold Tagaytay weather, eventually growing into a tourism landmark.', owner_id: 3, status: 'approved', menu: [{ name: 'Traditional Bulalo Overload', category: 'Main Course', price: 550 }, { name: 'Crispy Tawilis', category: 'Appetizer', price: 220 }], reviews: [{ id: 1, username: 'tourist_ph', first_name: 'Juan', last_name: 'Dela Cruz', rating_value: 5, content: 'Best Bulalo in Cavite! The soup is hot, and the bone marrow is absolutely huge. Great view and very cool weather.', comments: [] }] },
    { id: 2, name: 'Kawit Heritage Oyster & Seafood Bar', address: 'Tirona Highway, Kawit, Cavite', latitude: 14.4420, longitude: 120.9102, average_rating: 4.8, rating_count: 0, primary_image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=400&q=80', municipality_name: 'Kawit', description: 'Fresh oysters harvested straight from the shores of Bacoor Bay, prepared in both traditional and modern Caviteño styles.', contact_info: '+63 917 123 4567', business_hours: 'Tue-Sun 11:00 AM - 9:00 PM', history_story: 'Kawit is deeply linked to the sea. Our restaurant showcases the local oyster farming (talaba) heritage that has sustained Cavite families for generations.', owner_id: 2, status: 'pending', menu: [{ name: 'Fresh Oysters in Ice Box', category: 'Appetizer', price: 280 }, { name: 'Baked Garlic Butter Oysters', category: 'Main Course', price: 340 }], reviews: [] },
    { id: 3, name: 'Silang Farm Garden Cafe', address: 'Laguna-Bel Air Bypass Road, Silang, Cavite', latitude: 14.2185, longitude: 120.9820, average_rating: 2.5, rating_count: 2, primary_image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', municipality_name: 'Silang', description: 'A scenic farm-to-table dining experience nestled inside a tropical flower nursery. We roast organic Coffea Liberica (Barako) fresh.', contact_info: '+63 46 888 1234', business_hours: 'Wed-Mon 9:00 AM - 8:00 PM', history_story: 'Built as an extension of a family-run garden nursery, Silang Farm Cafe highlights the town\'s agricultural strength and provides a serene sanctuary for coffee lovers.', owner_id: 2, status: 'approved', menu: [{ name: 'Barako Coffee Glazed Ribs', category: 'Main Course', price: 420 }, { name: 'Fresh Barako Drip Coffee', category: 'Beverage', price: 110 }], reviews: [{ id: 2, username: 'tourist_ph', first_name: 'Juan', last_name: 'Dela Cruz', rating_value: 4, content: 'Very relaxing place! The coffee-glazed ribs were unique and delicious. A must-visit when exploring Silang.', comments: [] }, { id: 101, username: 'spammer_99', first_name: 'Promo', last_name: 'Bot', rating_value: 1, content: 'CHEAP WATCHES AND ADVERTISEMENTS! VISIT FAKE-URL.COM FOR DEALS!', flagged: true, comments: [] }] },
    { id: 4, name: 'Imus Longganisa Hub', address: 'Gen. Castañeda St, Imus, Cavite', latitude: 14.4312, longitude: 120.9388, average_rating: 4.5, rating_count: 0, primary_image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80', municipality_name: 'Imus City', description: 'Home of the signature garlicky, sour Imus longganisa, served with garlic fried rice and local vinegar.', contact_info: '+63 922 987 6543', business_hours: 'Mon-Sat 6:00 AM - 3:00 PM', history_story: 'Created to preserve the original 1950s recipe of Imus-style native longganisa, which uses natural pork casings, heavy garlic, black pepper, and local Cavite sea salt.', owner_id: 2, status: 'approved', menu: [{ name: 'Imus Longganisa Breakfast Platter', category: 'Main Course', price: 180 }], reviews: [] }
  ],
  stories: [
    { id: 1, title: 'The Legend of Cavite City\'s Pancit Estacion', content: 'Pancit Estacion is a unique Caviteño dish featuring rice noodles (bihon) topped with a savory orange sauce made from ground mung beans (togue), shrimp, and sour kamias. Its history traces back to the old railway station (estacion) in Cavite City where commuters grabbed a quick, sour noodle breakfast before catching the train.', author_name: 'Admin', municipality_name: 'Kawit', traditional_dishes: 'Pancit Estacion, Quesillo', image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=80', created_at: '2026-05-23T10:00:00Z' },
    { id: 2, title: 'The Sweet Tradition of Kalamay Indang', content: 'Kalamay Indang is a sticky sweet delicacy made from sticky rice flour (malagkit), brown sugar, and rich coconut milk, slow-stirred in large brass pans (kawa) for over four hours. In Indang, this sweet treat is a symbol of community cooperation, traditionally served during family gatherings, town fiestas, and milestones.', author_name: 'Admin', municipality_name: 'Indang', traditional_dishes: 'Kalamay Indang, Tablea', image_url: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=400&q=80', created_at: '2026-05-23T11:00:00Z' },
    { id: 3, title: 'Tagaytay\'s Cold Climate and the Rise of Bulalo Culture', content: 'Why did Bulalo become Tagaytay\'s signature dish? In the early 20th century, Tagaytay served as a cooling mountain retreat. The chilly winds and pastures of Cavite\'s highlands made beef raising popular. Visitors naturally craved a steaming bowl of beef marrow soup to combat the altitude cold, sparking a restaurant boom.', author_name: 'Admin', municipality_name: 'Tagaytay City', traditional_dishes: 'Bulalo, Crispy Tawilis', image_url: 'https://images.unsplash.com/photo-1547928576-a4a33237eceb?auto=format&fit=crop&w=400&q=80', created_at: '2026-05-23T12:00:00Z' }
  ],
  users: [
    { id: 1, username: 'admin', email: 'admin@eatywonders.gov.ph', first_name: 'EatyWonders', last_name: 'Admin', role_name: 'Admin', is_active: true },
    { id: 2, username: 'mang_tomas', email: 'tomas@caviteeats.com', first_name: 'Tomas', last_name: 'Alcantara', role_name: 'Food Business Owner', is_active: true },
    { id: 3, username: 'aling_nena', email: 'nena@tagaytaybulalohouse.com', first_name: 'Nena', last_name: 'Santos', role_name: 'Food Business Owner', is_active: true },
    { id: 4, username: 'tourist_ph', email: 'juan.delacruz@gmail.com', first_name: 'Juan', last_name: 'Dela Cruz', role_name: 'Tourist', is_active: true }
  ],
  photos: [
    { id: 1, url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80', caption: 'Steaming Bulalo bones in Tagaytay!' },
    { id: 2, url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', caption: 'Organic salad and Cavite tablea chocolate' },
    { id: 3, url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=400&q=80', caption: 'Traditional Pancit at Kawit Oysters' },
    { id: 4, url: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=400&q=80', caption: 'Kalamay Indang sweet treats!' }
  ],
  audits: [
    { id: 1, user: 'admin', action: 'APPROVE_RESTAURANT', entityType: 'Restaurant', entityId: 'Tagaytay Bulalo House', ip: '127.0.0.1', details: 'Approved listing for owner ID 3', timestamp: '2026-05-23 22:14:05' },
    { id: 2, user: 'admin', action: 'CREATE_STORY', entityType: 'Story', entityId: 'The Legend of Pancit Estacion', ip: '127.0.0.1', details: 'Created story about Kawit', timestamp: '2026-05-23 21:55:30' }
  ]
};

// Helper: System Audit Logger
function addAuditLogLocal(action, entityType, entityId, details = '') {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newAudit = {
    id: Date.now(),
    user: state.user ? state.user.username : 'guest',
    action: action,
    entityType: entityType,
    entityId: entityId,
    ip: '127.0.0.1',
    details: details,
    timestamp: timestamp
  };
  state.audits.unshift(newAudit);
}
