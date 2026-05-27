// Premium Mock Tourist Feed Posts for HungryLakwatsero
// Includes realistic Cavite foodie and travel discovery content

export const MOCK_TOURIST_POSTS = [
  {
    id: 'mock-1',
    author: 'Sophia Mendoza',
    authorAvatar: 'SM',
    authorRole: 'Food Storyteller',
    municipality: 'Tagaytay',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    category: 'Restaurants',
    title: 'Sinful Bulalo & Taal Lake Views at Balay Dako! 🍲✨',
    content: "Nothing beats the classic Tagaytay Bulalo on a cold, breezy afternoon. Balay Dako's serving is huge, perfect for the family! The beef is melt-in-your-mouth tender, and the broth is incredibly rich. Pro-tip: get there by 11 AM to secure a window table for the best view of Taal Volcano!",
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&q=80',
    likes: 184,
    commentsCount: 24,
    comments: [
      { id: 101, author: 'Marc Santos', avatar: 'MS', content: 'Balay Dako is a classic! Did you try their coco jam?' },
      { id: 102, author: 'Enzo Cruz', avatar: 'EC', content: 'Wow, looks perfect for the cold weather.' }
    ],
    restaurantId: 1,
    isFollowed: true,
    hashtags: ['#Tagaytay', '#Bulalo', '#BalayDako', '#CaviteEats']
  },
  {
    id: 'mock-2',
    author: 'Marc Santos',
    authorAvatar: 'MS',
    authorRole: 'Tourist',
    municipality: 'Kawit',
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5 hours ago
    category: 'Destinations',
    title: 'A Walk Through History: Aguinaldo Shrine 🇵🇭',
    content: 'Spent my afternoon exploring the Aguinaldo Shrine in Kawit, Cavite. The architecture is incredibly preserved, and the history is so rich. Seeing the actual balcony where independence was declared gave me chills! Entrance is free, but donations are welcome. Best historical spot in Cavite!',
    image: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=1000&q=80',
    likes: 95,
    commentsCount: 12,
    comments: [
      { id: 201, author: 'Sophia Mendoza', avatar: 'SM', content: 'So beautiful! Cavite has so much history.' }
    ],
    restaurantId: null,
    isFollowed: false,
    hashtags: ['#Kawit', '#History', '#AguinaldoShrine', '#ExploreCavite']
  },
  {
    id: 'mock-3',
    author: 'Cafe Hiraya',
    authorAvatar: 'CH',
    authorRole: 'Verified Business',
    municipality: 'Silang',
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(), // 8 hours ago
    category: 'Promos',
    title: '☕ HungryLakwatsero Exclusive: 15% Off at Cafe Hiraya!',
    content: 'Flash this post at our counter and get 15% off your total bill when you order any of our signature Cavite Liberica blends! 🌿 Valid from Monday to Thursday. Come relax in our outdoor garden and enjoy the fresh breeze. See you there!',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=80',
    likes: 312,
    commentsCount: 56,
    comments: [
      { id: 301, author: 'Maria Clara', avatar: 'MC', content: 'Omg! Will definitely drop by this Wednesday!' },
      { id: 302, author: 'Enzo Cruz', avatar: 'EC', content: 'Awesome promo! Love your Spanish Latte.' }
    ],
    restaurantId: 2,
    isFollowed: true,
    hashtags: ['#Silang', '#CafeHiraya', '#Promo', '#CaviteCoffee']
  },
  {
    id: 'mock-4',
    author: 'Maria Clara',
    authorAvatar: 'MC',
    authorRole: 'Tourist',
    municipality: 'Cavite City',
    created_at: new Date(Date.now() - 20 * 3600 * 1000).toISOString(), // 20 hours ago
    category: 'Restaurants',
    title: "Beat the Heat: Digman's Original Halo-Halo! 🍧",
    content: "You can't go to Cavite City without stopping by Digman! This is the legendary original halo-halo. The ingredients are so fresh, the leche flan is extremely creamy, and they don't over-sweeten it. Perfectly balanced and hits the spot every single time.",
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1000&q=80',
    likes: 215,
    commentsCount: 41,
    comments: [
      { id: 401, author: 'Sophia Mendoza', avatar: 'SM', content: 'My favorite childhood snack!' }
    ],
    restaurantId: 3,
    isFollowed: false,
    hashtags: ['#CaviteCity', '#Digman', '#HaloHalo', '#PinoyDesserts']
  },
  {
    id: 'mock-5',
    author: 'Enzo dela Cruz',
    authorAvatar: 'ED',
    authorRole: 'Food Storyteller',
    municipality: 'Maragondon',
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), // 36 hours ago
    category: 'Destinations',
    title: 'Chasing Sunsets at Riverfront Garden 🌅',
    content: "Discovered this hidden garden resort along the Maragondon river. It's incredibly peaceful, surrounded by bamboo trees. The sunset views here are cinematic! They have a small cafe serving local Kapeng Barako and Cavite-style bibingka. The perfect escape from the city.",
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&q=80',
    likes: 153,
    commentsCount: 19,
    comments: [
      { id: 501, author: 'Marc Santos', avatar: 'MS', content: 'Maragondon is so underrated! Great share.' }
    ],
    restaurantId: null,
    isFollowed: true,
    hashtags: ['#Maragondon', '#Riverfront', '#Nature', '#CaviteTravels']
  }
];

export const MOCK_RESTAURANTS = [
  {
    id: 1,
    name: 'Balay Dako',
    municipality: 'Tagaytay',
    rating: 4.8,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=80',
    category: 'Filipino Heritage'
  },
  {
    id: 2,
    name: 'Cafe Hiraya',
    municipality: 'Silang',
    rating: 4.6,
    image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=120&q=80',
    category: 'Specialty Cafe'
  },
  {
    id: 3,
    name: 'Digman Original Halo-Halo',
    municipality: 'Cavite City',
    rating: 4.5,
    image_url: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=120&q=80',
    category: 'Dessert Spot'
  }
];

export const MOCK_FOOD_SPOTS = [
  {
    id: 101,
    name: "Sonya's Garden",
    municipality: 'Alfonso',
    rating: 4.7,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80',
    description: 'Bucolic organic farm and restaurant hidden away.'
  },
  {
    id: 102,
    name: 'Aguinaldo Shrine Cafe',
    municipality: 'Kawit',
    rating: 4.4,
    image_url: 'https://images.unsplash.com/photo-1590001155093-a3c66ab0c3ff?w=300&q=80',
    description: 'Heritage dining right by the historic shrine.'
  }
];
