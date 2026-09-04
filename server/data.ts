import {
  Destination,
  POIMarker,
  VerifiedDriver,
  TravelService,
  LocalGuide,
  ArtisanBazaar,
  TravelGroup,
  TravellerReview,
  AppNotification,
  StateAdvisory,
  SeasonalDestinationInfo,
  TravelerCompanion,
  DestinationPhoto
} from '../src/types.ts';

export const DESTINATIONS: Destination[] = [
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    tagline: 'The Pink City • Forts, Palaces & Royal Craft',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'October – March',
    startingBudget: 9000,
    safetyScore: 94,
    categories: ['Heritage', 'Food', 'All'],
    temperature: '28°C',
    weatherStatus: 'Sunny & Pleasant',
    crowdLevel: 'Moderate',
    popularActivities: ['Amer Fort Sound & Light', 'Hawa Mahal Sunrise Walk', 'Johari Bazaar Jewellery', 'Chokhi Dhani Heritage Feast'],
    historicalBrief: {
      history: 'Founded in 1727 by Maharaja Sawai Jai Singh II, Jaipur was India’s first planned city designed by Vidyadhar Bhattacharya following Vastu Shastra.',
      culture: 'Known for Rajasthani hospitality, vibrant bandhani textiles, blue pottery, and classical Kathak gharana.',
      architecture: 'Distinguished terracotta-pink facades, sandstone jharokhas, stepwells like Panna Meena Ka Kund, and astronomical marvel Jantar Mantar.',
      localTraditions: 'Welcoming guests with "Khamma Ghani", royal Teej & Gangaur processions, and camel leather crafts.',
      localEtiquette: 'Remove shoes at temples and royal cenotaphs. Modest attire is appreciated in historic walled city bazaars.'
    },
    coordinates: { lat: 26.9124, lng: 75.7873 }
  },
  {
    id: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    tagline: 'Valley of the Gods • Snow Passes & Pine Forests',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'October – June',
    startingBudget: 11500,
    safetyScore: 89,
    categories: ['Mountains', 'Adventure', 'Nature', 'All'],
    temperature: '14°C',
    weatherStatus: 'Crisp Mountain Breeze',
    crowdLevel: 'Moderate',
    popularActivities: ['Solang Valley Paragliding', 'Atal Tunnel Transit to Lahaul', 'Old Manali Apple Orchards', 'Jogini Waterfall Trek'],
    historicalBrief: {
      history: 'Legend attributes Manali to sage Manu, who stepped off his ark to recreate human life after the great deluge.',
      culture: 'Kulluvi hill culture, local shawls, Pahari nati dance, and apple harvest traditions.',
      architecture: 'Indigenous Kath-Kuni architectural style (interlocking wood and stone without mortar for seismic resilience) seen in Hadimba Temple.',
      localTraditions: 'Honoring local devtas (deities), wood carving, and trout fishing in the Beas river.',
      localEtiquette: 'Do not touch sanctum sanctorum idols in village temples. Respect fragile Himalayan ecology—no plastic littering.'
    },
    coordinates: { lat: 32.2396, lng: 77.1887 }
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    tagline: 'Coastal Haven • Portuguese Heritage & Sunsets',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'November – April',
    startingBudget: 12000,
    safetyScore: 92,
    categories: ['Beaches', 'Food', 'Nature', 'All'],
    temperature: '30°C',
    weatherStatus: 'Tropical Sunshine',
    crowdLevel: 'High',
    popularActivities: ['Dudhsagar Waterfalls Trek', 'Fontainhas Heritage Latin Quarter Walk', 'Sunset Kayaking in Chapora', 'Anjuna Flea Market'],
    historicalBrief: {
      history: 'Ruled by Kadamba, Vijayanagara, and Bijapur dynasties before 450 years of Portuguese colonization ending in 1961.',
      culture: 'Susegad philosophy (relaxed contentment), fusion Indo-Portuguese cuisine, Konkani folk traditions, and vibrant carnivals.',
      architecture: 'UNESCO Basilica of Bom Jesus, Manueline church arches, terracotta-tiled mansions with oyster-shell windows.',
      localTraditions: 'Fishermen fishing cooperatives (Ramponkars), Shigmo spring festival, and feni distillation.',
      localEtiquette: 'Observe beach swim safety flags. Dress respectfully inside historical churches and chapels.'
    },
    coordinates: { lat: 15.2993, lng: 74.1240 }
  },
  {
    id: 'spiti',
    name: 'Spiti Valley',
    state: 'Himachal Pradesh',
    tagline: 'The Middle Land • High-Altitude Cold Desert',
    image: 'https://images.unsplash.com/photo-1590740608670-201a0fd7ff63?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'May – October',
    startingBudget: 16000,
    safetyScore: 82,
    categories: ['Mountains', 'Adventure', 'Hidden Gems', 'All'],
    temperature: '8°C',
    weatherStatus: 'Clear High-Altitude Sun',
    crowdLevel: 'Low',
    popularActivities: ['Key Monastery Sunrise', 'Highest Post Office at Hikkim', 'Chandratal Lake Camping', 'Fossil Hunting in Langza'],
    historicalBrief: {
      history: 'A remote cold-desert plateau nestled between Tibet and India, preserving intact 10th-century Buddhist monasteries.',
      culture: 'Tibetan Buddhist traditions, warm mud-house homestays, butter tea, and winter snow leopard tracking.',
      architecture: 'Whitewashed fort-like monasteries perched on sheer cliffs with ancient thangka murals.',
      localTraditions: 'Prayer flag hoisting, spinning Mani wheels, and community grain storage.',
      localEtiquette: 'Walk clockwise around chortens and gompas. Allow 48 hours for gradual acclimatization to avoid AMS.'
    },
    coordinates: { lat: 32.2461, lng: 78.0349 }
  },
  {
    id: 'munnar',
    name: 'Munnar',
    state: 'Kerala',
    tagline: 'Emerald Tea Terraces • Misty Western Ghats',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'September – May',
    startingBudget: 9500,
    safetyScore: 96,
    categories: ['Nature', 'Mountains', 'Food', 'All'],
    temperature: '19°C',
    weatherStatus: 'Misty & Refreshing',
    crowdLevel: 'Moderate',
    popularActivities: ['Eravikulam Nilgiri Tahr Trek', 'Tea Factory & Tasting Tour', 'Mattupetty Dam Boating', 'Spice Plantation Walk'],
    historicalBrief: {
      history: 'Once the summer resort of the British Presidency, Munnar was transformed into vast tea estates in the late 19th century.',
      culture: 'Harmonious blend of Tamil and Malayali plantation culture, traditional Ayurveda, and spices.',
      architecture: 'Colonial bungalows with gabled roofs, stone-built Christ Church, and eco-sustainable tea cottages.',
      localTraditions: 'Handcrafted tea leaf sorting, Neelakurinji bloom celebrations every 12 years, and organic spice drying.',
      localEtiquette: 'Drive slowly on winding hill hairpins. Never pick wild orchids or tea leaves without permission.'
    },
    coordinates: { lat: 10.0889, lng: 77.0595 }
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    tagline: 'City of Lakes • Mewar Valor & Marble Serenity',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'October – March',
    startingBudget: 10500,
    safetyScore: 95,
    categories: ['Heritage', 'Nature', 'All'],
    temperature: '27°C',
    weatherStatus: 'Clear Skies',
    crowdLevel: 'Moderate',
    popularActivities: ['Lake Pichola Sunset Boat Cruise', 'City Palace Royal Artifacts', 'Bagore Ki Haveli Folk Show', 'Sajjangarh Monsoon Palace'],
    historicalBrief: {
      history: 'Founded in 1559 by Maharana Udai Singh II as the final capital of the heroic Mewar Kingdom.',
      culture: 'Legendary Mewari chivalry, miniature Rajput painting, silver filigree work, and puppets.',
      architecture: 'Palatial white marble edifices hovering over shimmering interconnected freshwater lakes.',
      localTraditions: 'Ghoomar dance, royal boat regattas, and handcrafted leather journals.',
      localEtiquette: 'Hire licensed guides inside City Palace. Respect photography rules in sanctum areas.'
    },
    coordinates: { lat: 24.5854, lng: 73.7125 }
  },
  {
    id: 'leh',
    name: 'Leh-Ladakh',
    state: 'Ladakh',
    tagline: 'Land of High Passes • Monasteries & Starlit Skies',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'May – September',
    startingBudget: 18000,
    safetyScore: 88,
    categories: ['Mountains', 'Adventure', 'Spiritual', 'All'],
    temperature: '12°C',
    weatherStatus: 'Crisp High-Sun',
    crowdLevel: 'Moderate',
    popularActivities: ['Pangong Tso Crystal Lake Drive', 'Khardung La Pass Crossing', 'Thiksey Morning Chanting', 'Nubra Valley Sand Dunes'],
    historicalBrief: {
      history: 'Historical stopover on the ancient Silk Route connecting Punjab with Xinjiang and Central Asia.',
      culture: 'Mahayana Buddhist culture, Ladakhi apricot festivals, Losar new year, and organic barley farming.',
      architecture: 'Leh Palace modeled after Lhasa’s Potala Palace, rammed-earth stupas, and ancient cliff retreats.',
      localTraditions: 'Offering white silk Khata scarves to elders and lamas; community solar mud homes.',
      localEtiquette: 'Strict zero-waste policy. Drink ample electrolytes and rest the entire first day upon arrival.'
    },
    coordinates: { lat: 34.1526, lng: 77.5771 }
  },
  {
    id: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    tagline: 'The Eternal City • Sacred Ghats & Evening Aarti',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'October – March',
    startingBudget: 7500,
    safetyScore: 89,
    categories: ['Spiritual', 'Heritage', 'Food', 'All'],
    temperature: '26°C',
    weatherStatus: 'Pleasant River Breeze',
    crowdLevel: 'High',
    popularActivities: ['Dawn Subah-e-Banaras Boat Ride', 'Dashashwamedh Ghat Maha Aarti', 'Sarnath Buddha Enlightenment Site', 'Banarasi Silk Weaving Lanes'],
    historicalBrief: {
      history: 'One of the oldest continually inhabited cities in human civilization, sacred to Lord Shiva.',
      culture: 'Vedic chants, Hindustani classical music (Benares gharana), Banarasi kachori-jalebi, and silk saris.',
      architecture: 'Towering riverfront ghat steps built by Maratha, Scindia, and Holkar dynasties, along with narrow galis.',
      localTraditions: 'Diyas floating on Mother Ganga, wrestling akharas at dawn, and paan making.',
      localEtiquette: 'No photography at Manikarnika cremation ghat. Take boat rides only with registered boatmen.'
    },
    coordinates: { lat: 25.3176, lng: 82.9739 }
  },
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    tagline: 'Yoga Capital of the World • Ganges Rapids',
    image: 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'September – May',
    startingBudget: 8000,
    safetyScore: 95,
    categories: ['Adventure', 'Spiritual', 'Nature', 'All'],
    temperature: '23°C',
    weatherStatus: 'Fresh Mountain Valley',
    crowdLevel: 'Moderate',
    popularActivities: ['Grade 3+ River Rafting on Ganges', 'Triveni Ghat Sunset Aarti', 'Beatles Ashram Exploration', 'Cliff Jumping in Shivpuri'],
    historicalBrief: {
      history: 'Ancient gateway to the Char Dham pilgrimage in the Garhwal Himalayas where sages meditated on the divine.',
      culture: 'Sattvic food, yoga ashrams, Ayurvedic healing, and environmental river advocacy.',
      architecture: 'Iconic suspension footbridges Laxman Jhula & Ram Jhula spanning the rushing emerald Ganga.',
      localTraditions: 'Riverbank sound meditation, temple bell resonance, and organic cafe culture.',
      localEtiquette: 'Strictly vegetarian and alcohol-free municipality. Wear lifejackets during all river water activities.'
    },
    coordinates: { lat: 30.0869, lng: 78.2676 }
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    state: 'Meghalaya',
    tagline: 'Abode of the Clouds • Living Root Bridges & Waterfalls',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'October – April',
    startingBudget: 13000,
    safetyScore: 97,
    categories: ['Nature', 'Adventure', 'Hidden Gems', 'All'],
    temperature: '18°C',
    weatherStatus: 'Misty Cloud Shrouds',
    crowdLevel: 'Low',
    popularActivities: ['Double Decker Living Root Bridge Trek', 'Dawki River Crystal Boating', 'Nohkalikai Falls Vista', 'Mawlynnong Cleanest Village'],
    historicalBrief: {
      history: 'Home to the indigenous Khasi, Jaintia, and Garo matrilineal societies deeply connected with sacred groves.',
      culture: 'Matrilineal lineage where youngest daughter inherits, bamboo music, and rich community forest preservation.',
      architecture: 'Living bio-engineering: Ficus elastica roots woven across generations into durable suspension bridges.',
      localTraditions: 'Sacred grove protection rituals, organic bamboo architecture, and community cleanliness drives.',
      localEtiquette: 'Leave no footprint. Sacred forests forbid removal of even a fallen leaf.'
    },
    coordinates: { lat: 25.4670, lng: 91.3662 }
  },
  {
    id: 'kolhapur',
    name: 'Kolhapur',
    state: 'Maharashtra',
    tagline: 'Mahalaxmi Sanctum • Royal Wrestling & Maratha Heritage',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'October – March',
    startingBudget: 6500,
    safetyScore: 96,
    categories: ['Heritage', 'Food', 'Spiritual', 'All'],
    temperature: '27°C',
    weatherStatus: 'Pleasant & Breezy',
    crowdLevel: 'Moderate',
    popularActivities: ['Shri Ambabai Mahalaxmi Temple Darshan', 'Panhala Fort Bastion Exploration', 'Authentic Kolhapuri Misal & Tambda-Pandhra Rassa', 'Traditional Wrestling Akhara Visit'],
    historicalBrief: {
      history: 'Historic capital of the southern branch of the Maratha Empire, nurtured by the benevolent reformer Chhatrapati Shahu Maharaj.',
      culture: 'Valor, traditional wrestling (Kusti), handcrafted GI-tagged Kolhapuri chappals, and silver ornaments.',
      architecture: 'Hemadpanthi black basalt stone carvings, New Palace Indo-Saracenic mansion, and historic talabs.',
      localTraditions: 'Kusti bouts in red soil pits with clay blessings, Lavani folk theater, and festive Gudi Padwa.',
      localEtiquette: 'Maintain silence inside temple sanctum. Greet elders with "Jai Bhavani, Jai Shivaji".'
    },
    coordinates: { lat: 16.7050, lng: 74.2433 }
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    tagline: 'Oxford of the East • Peshwa Citadels & Hill Treks',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'July – February',
    startingBudget: 7500,
    safetyScore: 95,
    categories: ['Heritage', 'Adventure', 'Food', 'All'],
    temperature: '25°C',
    weatherStatus: 'Gentle Breeze',
    crowdLevel: 'Moderate',
    popularActivities: ['Sinhagad Fort Early Morning Trek', 'Shaniwar Wada Historical Walk', 'Aga Khan Palace Mahatma Gandhi Memorial', 'FC Road Street Food Walk'],
    historicalBrief: {
      history: 'The prime seat of the Peshwas during the Maratha Empire and later a pivotal center for India’s social reform movements.',
      culture: 'Academic excellence, classical music Sawai Gandharva festival, Ganeshotsav dhol-tasha pathaks, and bakery culture.',
      architecture: 'Timber-framed wadas with central courtyards, stone fortresses atop Sahyadri peaks, and Gothic-Victorian colleges.',
      localTraditions: 'Puneri patte, morning walks to Vetal Tekdi, and sipping Irani chai with bun maska.',
      localEtiquette: 'Wear sturdy sports shoes for Sahyadri fort treks. Afternoon siesta culture is respected in old Peth areas.'
    },
    coordinates: { lat: 18.5204, lng: 73.8567 }
  },
  {
    id: 'kashmir',
    name: 'Srinagar & Kashmir',
    state: 'Jammu & Kashmir',
    tagline: 'Paradise on Earth • Houseboats & Alpine Meadows',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'April – October & Winter Snow',
    startingBudget: 15000,
    safetyScore: 91,
    categories: ['Nature', 'Mountains', 'Heritage', 'All'],
    temperature: '16°C',
    weatherStatus: 'Pleasant Valley Air',
    crowdLevel: 'Moderate',
    popularActivities: ['Dal Lake Shikara Sunrise Ride', 'Mughal Gardens Nishat & Shalimar', 'Gulmarg Gondola Ride Phase 2', 'Pashmina & Walnut Wood Shopping'],
    historicalBrief: {
      history: 'Renowned for centuries as an oasis of poetry, Sufism, and Mughal imperial leisure gardens.',
      culture: 'Kashmiri Wazwan banquet, Kahwa saffron green tea, Pashmina shawls, and papier-mâché crafts.',
      architecture: 'Intricately carved cedar wood houseboats, Pinjrakari geometric screens, and Jamia Masjid deodar pillars.',
      localTraditions: 'Morning floating vegetable market on Dal Lake, Kangri charcoal wicker baskets, and Rouf folk dance.',
      localEtiquette: 'Bargain politely in houseboats. Always carry valid photo ID and permit documents in border valleys.'
    },
    coordinates: { lat: 34.0837, lng: 74.7973 }
  },
  {
    id: 'kerala',
    name: 'Kerala Backwaters',
    state: 'Kerala',
    tagline: 'God’s Own Country • Palm Canals & Houseboats',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    bestSeason: 'September – March',
    startingBudget: 11000,
    safetyScore: 98,
    categories: ['Nature', 'Beaches', 'Food', 'All'],
    temperature: '29°C',
    weatherStatus: 'Tropical Breeze',
    crowdLevel: 'Moderate',
    popularActivities: ['Alleppey Overnight Kettuvallam Houseboat', 'Marari Beach Quiet Sunset', 'Kumarakom Bird Sanctuary Kayak', 'Authentic Sadhya on Banana Leaf'],
    historicalBrief: {
      history: 'Ancient maritime spice hub trading pepper and cardamom with Phoenicians, Romans, and Arabs.',
      culture: 'Kathakali classical dance drama, Kalaripayattu martial arts, Vallam Kali snake boat races, and Ayurveda.',
      architecture: 'Thatched anjili-wood traditional kettuvallams, Nalukettu wooden courtyards with tiled sloping roofs.',
      localTraditions: 'Ayurvedic panchakarma retreats, toddy shop culinary delicacies, and coconut tree climbing.',
      localEtiquette: 'Support local coir and canoe operators directly. Do not discard non-biodegradable waste in backwaters.'
    },
    coordinates: { lat: 9.4981, lng: 76.3388 }
  }
];

export const POI_DATABASE: Record<string, POIMarker[]> = {
  jaipur: [
    {
      id: 'jp-poi-1',
      name: 'Sindhi Camp Central Bus Stand',
      category: 'Buses',
      distance: '0.8 km',
      distanceKm: 0.8,
      openingHours: '24 Hours • AC & Deluxe Platforms',
      isVerified: true,
      estimatedPrice: 'Interstate Buses ₹180 – ₹850',
      contactNumber: '+91 141 220 5555',
      rating: 4.7,
      address: 'Station Road, Sindhi Camp, Jaipur',
      coordinates: { lat: 26.9222, lng: 75.7967, x: 38, y: 44 }
    },
    {
      id: 'jp-poi-2',
      name: 'Polo Victory Prepaid Auto & Rickshaw Stand',
      category: 'Rickshaws',
      distance: '0.6 km',
      distanceKm: 0.6,
      openingHours: '24 Hours • Govt Regulated Prepaid Booth',
      isVerified: true,
      estimatedPrice: 'Base ₹30 + ₹12/km (Metered)',
      contactNumber: '+91 141 237 0101',
      rating: 4.8,
      address: 'Near Polovictory Cinema, Station Road, Jaipur',
      coordinates: { lat: 26.9215, lng: 75.7942, x: 40, y: 46 }
    },
    {
      id: 'jp-poi-3',
      name: 'Bapu Bazaar Artisan Quarter',
      category: 'Bazaars',
      distance: '1.4 km',
      distanceKm: 1.4,
      openingHours: '10:30 AM – 09:00 PM',
      isVerified: true,
      estimatedPrice: 'Mojaris ₹350 • Bandhani Dupattas ₹450',
      rating: 4.9,
      address: 'Bapu Bazaar, Pink City Outer Wall, Jaipur',
      coordinates: { lat: 26.9196, lng: 75.8219, x: 62, y: 55 }
    },
    {
      id: 'jp-poi-4',
      name: 'Johari Bazaar Gems & Jewellery Market',
      category: 'Bazaars',
      distance: '1.6 km',
      distanceKm: 1.6,
      openingHours: '10:30 AM – 08:30 PM',
      isVerified: true,
      estimatedPrice: 'Kundan & Silver Filigree Benchmark ₹800+',
      rating: 4.8,
      address: 'Johari Bazaar Road, Jaipur',
      coordinates: { lat: 26.9212, lng: 75.8256, x: 65, y: 50 }
    },
    {
      id: 'jp-poi-5',
      name: 'Hawa Mahal (Palace of Winds)',
      category: 'Tourist Places',
      distance: '1.8 km',
      distanceKm: 1.8,
      openingHours: '09:00 AM – 05:00 PM',
      isVerified: true,
      estimatedPrice: 'Entry: Indian ₹50 • Foreigner ₹200',
      contactNumber: '+91 141 261 8862',
      rating: 4.95,
      address: 'Hawa Mahal Rd, Badi Choupad, Pink City, Jaipur',
      coordinates: { lat: 26.9239, lng: 75.8267, x: 68, y: 48 }
    },
    {
      id: 'jp-poi-6',
      name: 'City Palace & Maharaja Sawai Man Singh II Museum',
      category: 'Tourist Places',
      distance: '2.0 km',
      distanceKm: 2.0,
      openingHours: '09:30 AM – 05:00 PM / Night Viewing 07:00 PM',
      isVerified: true,
      estimatedPrice: 'Entry: Adult ₹300 • Royal Grandeur ₹2,500',
      contactNumber: '+91 141 408 8888',
      rating: 4.92,
      address: 'Gangori Bazaar, J.D.A. Market, Pink City, Jaipur',
      coordinates: { lat: 26.9258, lng: 75.8236, x: 66, y: 42 }
    },
    {
      id: 'jp-poi-7',
      name: 'Amer Fort & Maota Lake Panorama',
      category: 'Tourist Places',
      distance: '4.8 km',
      distanceKm: 4.8,
      openingHours: '08:00 AM – 05:30 PM / Light & Sound 07:30 PM',
      isVerified: true,
      estimatedPrice: 'Entry: ₹100 • Light Show ₹250',
      contactNumber: '+91 141 253 0264',
      rating: 4.96,
      address: 'Devisinghpura, Amer, Jaipur',
      coordinates: { lat: 26.9855, lng: 75.8513, x: 75, y: 15 }
    },
    {
      id: 'jp-poi-8',
      name: 'ITC Rajputana Luxury Heritage Hotel',
      category: 'Hotels',
      distance: '0.9 km',
      distanceKm: 0.9,
      openingHours: '24/7 Concierge & Reception',
      isVerified: true,
      estimatedPrice: '₹8,500 – ₹16,000 / Night',
      contactNumber: '+91 141 510 0100',
      rating: 4.9,
      address: 'Palace Road, Gopalbari, Jaipur',
      coordinates: { lat: 26.9199, lng: 75.7885, x: 35, y: 52 }
    },
    {
      id: 'jp-poi-9',
      name: 'Zostel Jaipur Backpacker & Nomad Hub',
      category: 'Hotels',
      distance: '1.9 km',
      distanceKm: 1.9,
      openingHours: '24/7 Check-in • Rooftop Cafe',
      isVerified: true,
      estimatedPrice: 'Dorm Bed ₹799 • Private Room ₹2,400',
      contactNumber: '+91 141 260 5500',
      rating: 4.8,
      address: 'First Floor, Radhey Kunj, Hawa Mahal Rd, Jaipur',
      coordinates: { lat: 26.9220, lng: 75.8290, x: 70, y: 53 }
    },
    {
      id: 'jp-poi-10',
      name: 'Rawat Mishtan Bhandar & Kachori Hub',
      category: 'Food',
      distance: '0.5 km',
      distanceKm: 0.5,
      openingHours: '06:00 AM – 10:30 PM',
      isVerified: true,
      estimatedPrice: 'Famous Pyaaz Kachori ₹50 • Mawa Kachori ₹75',
      contactNumber: '+91 141 236 6888',
      rating: 4.9,
      address: 'Station Road, Opp Polovictory Cinema, Jaipur',
      coordinates: { lat: 26.9208, lng: 75.7925, x: 42, y: 50 }
    },
    {
      id: 'jp-poi-11',
      name: 'Laxmi Mishtan Bhandar (LMB Pink City)',
      category: 'Food',
      distance: '1.5 km',
      distanceKm: 1.5,
      openingHours: '07:00 AM – 11:00 PM',
      isVerified: true,
      estimatedPrice: 'Royal Rajasthani Thali ₹650 • Ghewar ₹320',
      contactNumber: '+91 141 256 5844',
      rating: 4.85,
      address: 'Johari Bazaar, Pink City, Jaipur',
      coordinates: { lat: 26.9225, lng: 75.8242, x: 64, y: 49 }
    },
    {
      id: 'jp-poi-12',
      name: 'SMS Govt Super Speciality Trauma Hospital',
      category: 'Hospitals',
      distance: '2.1 km',
      distanceKm: 2.1,
      openingHours: '24/7 Emergency & Trauma Care Unit',
      isVerified: true,
      estimatedPrice: 'Govt Emergency: Free / Subsidized',
      contactNumber: '102 / +91 141 256 0291',
      rating: 4.7,
      address: 'Jawahar Lal Nehru Marg, Jaipur',
      coordinates: { lat: 26.9048, lng: 75.8152, x: 60, y: 75 }
    },
    {
      id: 'jp-poi-13',
      name: 'Indian Oil 24x7 Eco-Fuel & EV Hub',
      category: 'Fuel',
      distance: '1.2 km',
      distanceKm: 1.2,
      openingHours: '24 Hours • High Speed 60kW DC EV Charger',
      isVerified: true,
      estimatedPrice: 'EV Fast Charge ₹18/unit • Petrol / Diesel',
      rating: 4.6,
      address: 'MI Road, Near Panch Batti, Jaipur',
      coordinates: { lat: 26.9155, lng: 75.8012, x: 46, y: 62 }
    },
    {
      id: 'jp-poi-14',
      name: 'Jaipur Police Tourist Assistance Cell',
      category: 'Emergency',
      distance: '1.7 km',
      distanceKm: 1.7,
      openingHours: '24/7 Dedicated Tourist Assistance & Helpdesk',
      isVerified: true,
      estimatedPrice: 'Govt Assistance: 100% Free',
      contactNumber: '112 / +91 141 261 4444',
      rating: 4.95,
      address: 'Near Hawa Mahal Northern Gate, Jaipur',
      coordinates: { lat: 26.9242, lng: 75.8262, x: 67, y: 46 }
    }
  ],
  manali: [
    {
      id: 'mn-poi-1',
      name: 'Mall Road Himachal Tourism Taxi Union',
      category: 'Rickshaws',
      distance: '0.3 km',
      distanceKm: 0.3,
      openingHours: '06:00 AM – 10:00 PM',
      isVerified: true,
      estimatedPrice: 'Solang ₹1,200 • Atal Tunnel ₹2,200 (Fixed Tariff)',
      contactNumber: '+91 1902 252 120',
      rating: 4.9,
      address: 'Mall Road Taxi Stand, Manali',
      coordinates: { lat: 32.2422, lng: 77.1891, x: 50, y: 50 }
    },
    {
      id: 'mn-poi-2',
      name: 'Manali Private Volvo Inter-State Bus Stand',
      category: 'Buses',
      distance: '0.6 km',
      distanceKm: 0.6,
      openingHours: '05:00 AM – 11:30 PM',
      isVerified: true,
      estimatedPrice: 'Delhi-Manali AC Sleeper ₹1,100 – ₹1,800',
      contactNumber: '+91 1902 252 350',
      rating: 4.7,
      address: 'Near Beas River Bank, Siyal, Manali',
      coordinates: { lat: 32.2384, lng: 77.1895, x: 48, y: 55 }
    },
    {
      id: 'mn-poi-3',
      name: 'Old Manali Himachali Weavers Guild',
      category: 'Bazaars',
      distance: '1.2 km',
      distanceKm: 1.2,
      openingHours: '10:00 AM – 08:30 PM',
      isVerified: true,
      estimatedPrice: 'Handloom Kullu Shawls ₹600 • Wool Socks ₹180',
      rating: 4.8,
      address: 'Club House Road, Old Manali',
      coordinates: { lat: 32.2520, lng: 77.1770, x: 32, y: 35 }
    },
    {
      id: 'mn-poi-4',
      name: 'Hadimba Devi Temple & Cedar Forest',
      category: 'Tourist Places',
      distance: '1.5 km',
      distanceKm: 1.5,
      openingHours: '08:00 AM – 06:00 PM',
      isVerified: true,
      estimatedPrice: 'Free Entry • Photography Allowed',
      rating: 4.9,
      address: 'Hadimba Temple Rd, Dungri Village, Manali',
      coordinates: { lat: 32.2483, lng: 77.1805, x: 38, y: 40 }
    },
    {
      id: 'mn-poi-5',
      name: 'Solang Valley Adventure & Paragliding Arena',
      category: 'Tourist Places',
      distance: '4.9 km',
      distanceKm: 4.9,
      openingHours: '09:00 AM – 05:00 PM (Weather Permitting)',
      isVerified: true,
      estimatedPrice: 'Paragliding ₹1,500 – ₹3,200 • Ropeway ₹650',
      rating: 4.85,
      address: 'Solang Village, Manali',
      coordinates: { lat: 32.3164, lng: 77.1583, x: 25, y: 12 }
    },
    {
      id: 'mn-poi-6',
      name: 'The Himalayan Luxury Castle & Resort',
      category: 'Hotels',
      distance: '1.4 km',
      distanceKm: 1.4,
      openingHours: '24/7 Mountain Lodge Check-in',
      isVerified: true,
      estimatedPrice: '₹9,500 – ₹18,000 / Night',
      contactNumber: '+91 1902 250 999',
      rating: 4.92,
      address: 'Hadimba Road, Manali',
      coordinates: { lat: 32.2472, lng: 77.1824, x: 42, y: 44 }
    },
    {
      id: 'mn-poi-7',
      name: 'Cafe 1947 by the River Stream',
      category: 'Food',
      distance: '1.6 km',
      distanceKm: 1.6,
      openingHours: '11:00 AM – 11:00 PM',
      isVerified: true,
      estimatedPrice: 'Woodfired Pizza ₹450 • Himalayan Trout ₹650',
      rating: 4.88,
      address: 'Old Manali Bridge, Near Club House, Manali',
      coordinates: { lat: 32.2536, lng: 77.1758, x: 30, y: 32 }
    },
    {
      id: 'mn-poi-8',
      name: 'Civil Hospital Manali & Mountain Trauma Center',
      category: 'Hospitals',
      distance: '1.8 km',
      distanceKm: 1.8,
      openingHours: '24/7 Oxygen & Acute High-Altitude Care',
      isVerified: true,
      estimatedPrice: 'Govt Emergency Services Free',
      contactNumber: '108 / +91 1902 252 384',
      rating: 4.7,
      address: 'Hospital Road, Siyal, Manali',
      coordinates: { lat: 32.2435, lng: 77.1868, x: 47, y: 52 }
    },
    {
      id: 'mn-poi-9',
      name: 'HPCL High-Altitude Fuel & EV Station',
      category: 'Fuel',
      distance: '1.9 km',
      distanceKm: 1.9,
      openingHours: '06:00 AM – 10:30 PM • Anti-Gel Diesel',
      isVerified: true,
      estimatedPrice: 'Winterized Fuel • 30kW EV Point',
      rating: 4.6,
      address: 'Leh-Manali Highway, Aleo, Manali',
      coordinates: { lat: 32.2312, lng: 77.1925, x: 55, y: 68 }
    },
    {
      id: 'mn-poi-10',
      name: 'Manali Police Station & Mountain Helpdesk',
      category: 'Emergency',
      distance: '0.4 km',
      distanceKm: 0.4,
      openingHours: '24/7 Dedicated Patrol & Pass Clearance Cell',
      isVerified: true,
      contactNumber: '112 / +91 1902 252 322',
      rating: 4.8,
      address: 'Mall Road, Manali',
      coordinates: { lat: 32.2410, lng: 77.1879, x: 49, y: 49 }
    }
  ],
  goa: [
    {
      id: 'ga-poi-1',
      name: 'Panaji KTC Central Bus Terminal',
      category: 'Buses',
      distance: '1.1 km',
      distanceKm: 1.1,
      openingHours: '24 Hours • Electric Bus Lines & Kadamba Express',
      isVerified: true,
      estimatedPrice: 'Airport AC Shuttle ₹150 • Local Bus ₹20',
      contactNumber: '+91 832 243 8515',
      rating: 4.7,
      address: 'Patto Centre, Panaji, Goa',
      coordinates: { lat: 15.4989, lng: 73.8345, x: 50, y: 50 }
    },
    {
      id: 'ga-poi-2',
      name: 'Calangute Tourist Taxi & Scooter Guild',
      category: 'Rickshaws',
      distance: '2.5 km',
      distanceKm: 2.5,
      openingHours: '07:00 AM – 11:30 PM',
      isVerified: true,
      estimatedPrice: 'Activa Scooter ₹400/day • Fixed Taxi Fare',
      rating: 4.8,
      address: 'Calangute Beach Circle, Goa',
      coordinates: { lat: 15.5435, lng: 73.7554, x: 35, y: 40 }
    },
    {
      id: 'ga-poi-3',
      name: 'Anjuna Wednesday Flea Market',
      category: 'Bazaars',
      distance: '3.8 km',
      distanceKm: 3.8,
      openingHours: 'Every Wednesday 09:00 AM – 07:00 PM',
      isVerified: true,
      estimatedPrice: 'Handmade Jewellery, Macrame, Spices',
      rating: 4.85,
      address: 'Monterio Vaddo, Anjuna, Goa',
      coordinates: { lat: 15.5786, lng: 73.7428, x: 28, y: 30 }
    },
    {
      id: 'ga-poi-4',
      name: 'Fort Aguada & Lighthouse',
      category: 'Tourist Places',
      distance: '3.2 km',
      distanceKm: 3.2,
      openingHours: '09:00 AM – 06:00 PM',
      isVerified: true,
      estimatedPrice: 'Entry ₹50',
      rating: 4.9,
      address: 'Aguada Fort Area, Candolim, Goa',
      coordinates: { lat: 15.4925, lng: 73.7736, x: 38, y: 55 }
    },
    {
      id: 'ga-poi-5',
      name: 'Basilica of Bom Jesus (UNESCO)',
      category: 'Tourist Places',
      distance: '4.2 km',
      distanceKm: 4.2,
      openingHours: '09:00 AM – 06:30 PM',
      isVerified: true,
      estimatedPrice: 'Free Entry • Audio Guides Available',
      rating: 4.95,
      address: 'Old Goa Road, Bainguinim, Goa',
      coordinates: { lat: 15.5009, lng: 73.9116, x: 70, y: 48 }
    },
    {
      id: 'ga-poi-6',
      name: 'Taj Fort Aguada Resort & Spa',
      category: 'Hotels',
      distance: '3.0 km',
      distanceKm: 3.0,
      openingHours: '24/7 Oceanfront Heritage Service',
      isVerified: true,
      estimatedPrice: '₹14,000 – ₹28,000 / Night',
      contactNumber: '+91 832 664 5858',
      rating: 4.94,
      address: 'Sinquerim, Candolim, Goa',
      coordinates: { lat: 15.4980, lng: 73.7710, x: 36, y: 52 }
    },
    {
      id: 'ga-poi-7',
      name: "Martin's Corner Authentic Goan Culinary",
      category: 'Food',
      distance: '4.5 km',
      distanceKm: 4.5,
      openingHours: '11:00 AM – 11:30 PM',
      isVerified: true,
      estimatedPrice: 'Goan Fish Curry Thali ₹380 • Crab Xec Xec ₹650',
      rating: 4.9,
      address: 'Ranvaddo, Betalbatim, Salcete, Goa',
      coordinates: { lat: 15.3050, lng: 73.9210, x: 65, y: 75 }
    },
    {
      id: 'ga-poi-8',
      name: 'Goa Medical College & Hospital (GMC Bambolim)',
      category: 'Hospitals',
      distance: '3.6 km',
      distanceKm: 3.6,
      openingHours: '24/7 Emergency, Trauma & Marine Sting Care',
      isVerified: true,
      contactNumber: '108 / +91 832 245 8700',
      rating: 4.8,
      address: 'NH-66, Bambolim, Goa',
      coordinates: { lat: 15.4600, lng: 73.8560, x: 55, y: 65 }
    },
    {
      id: 'ga-poi-9',
      name: 'IOCL Panaji Fast EV & Marine Fuel Hub',
      category: 'Fuel',
      distance: '1.4 km',
      distanceKm: 1.4,
      openingHours: '24 Hours • 50kW CCS-2 EV Fast Charger',
      isVerified: true,
      estimatedPrice: 'EV Quickcharge ₹17/unit',
      rating: 4.7,
      address: 'Dayanand Bandodkar Marg, Miramar, Panaji',
      coordinates: { lat: 15.4850, lng: 73.8180, x: 45, y: 55 }
    },
    {
      id: 'ga-poi-10',
      name: 'Panaji Tourist Police & Marine Rescue Cell',
      category: 'Emergency',
      distance: '0.9 km',
      distanceKm: 0.9,
      openingHours: '24/7 Lifeguard Liaison & Tourist Helpdesk',
      isVerified: true,
      contactNumber: '112 / +91 832 242 0821',
      rating: 4.9,
      address: 'Patto Plaza, Panaji, Goa',
      coordinates: { lat: 15.4950, lng: 73.8320, x: 51, y: 49 }
    }
  ]
};

export const VERIFIED_DRIVERS: VerifiedDriver[] = [
  {
    id: 'drv-1',
    name: 'Rajinder Singh & Sons',
    vehicleType: '4×4 High-Altitude Scorpio / Thar',
    isVerified: true,
    tariffType: 'Union Registered • Fixed Tariff',
    estimatedFare: '₹2,200 / Full Day Circuit',
    rating: 4.95,
    reviewsCount: 342,
    distance: '0.5 km away',
    availability: 'Available Now',
    unionBadge: 'Himachal Transport Union #HT-882'
  },
  {
    id: 'drv-2',
    name: 'Mahesh Meena Eco-Rickshaw',
    vehicleType: 'Electric Auto (EV Green Shield)',
    isVerified: true,
    tariffType: 'Govt Metered Tariff • Zero Surge',
    estimatedFare: '₹30 base + ₹12/km',
    rating: 4.89,
    reviewsCount: 512,
    distance: '0.2 km away',
    availability: 'Available Now',
    unionBadge: 'Jaipur Smart Mobility #JSM-401'
  },
  {
    id: 'drv-3',
    name: 'Gopal Krishna Cabs',
    vehicleType: 'AC Sedan (Innova Crysta / Dzire)',
    isVerified: true,
    tariffType: 'Fixed Outstation & Airport Radar',
    estimatedFare: '₹14/km • All Tolls Transparent',
    rating: 4.92,
    reviewsCount: 289,
    distance: '1.1 km away',
    availability: 'In 10 Mins',
    unionBadge: 'Rajasthan Tourism Permit #RT-9941'
  },
  {
    id: 'drv-4',
    name: 'Pramod Patil Konkan Rider',
    vehicleType: 'Royal Enfield Classic 350 Rental',
    isVerified: true,
    tariffType: 'Scam-Free Daily Tariff with Helmets',
    estimatedFare: '₹900 / Day • Zero Hidden Deposit',
    rating: 4.9,
    reviewsCount: 174,
    distance: '0.8 km away',
    availability: 'Available Now',
    unionBadge: 'Verified Two-Wheeler Guild #MH-09'
  }
];

export const VERIFIED_GUIDES: LocalGuide[] = [
  {
    id: 'gd-1',
    name: 'Devraj Rathore',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    region: 'Jaipur & Amer',
    speciality: 'Architectural Historian & Walled City Storyteller',
    isVerified: true,
    rating: 4.98,
    reviewsCount: 420,
    languages: ['Hindi', 'English', 'French'],
    bio: '14 years of uncovering hidden stepwells, royal secret chambers, and authentic artisan ateliers.',
    hourlyRate: '₹600 / Hour',
    followersCount: 1840
  },
  {
    id: 'gd-2',
    name: 'Tashi Namgyal',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    region: 'Spiti & Ladakh High Plateau',
    speciality: 'Wilderness High-Pass Trekker & Wildlife Tracker',
    isVerified: true,
    rating: 4.96,
    reviewsCount: 290,
    languages: ['English', 'Hindi', 'Ladakhi', 'Tibetan'],
    bio: 'Born in Kaza. Expert in cold-desert acclimation, high-altitude geology, and Snow Leopard spotting.',
    hourlyRate: '₹950 / Hour',
    followersCount: 3120
  },
  {
    id: 'gd-3',
    name: 'Ananya Deshpande',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    region: 'Western Ghats & Kolhapur',
    speciality: 'Maratha Forts & Culinary Heritage Explorer',
    isVerified: true,
    rating: 4.94,
    reviewsCount: 195,
    languages: ['Marathi', 'Hindi', 'English'],
    bio: 'Sahyadri rock mountaineer guiding heritage bastion treks and historic Maratha military history.',
    hourlyRate: '₹550 / Hour',
    followersCount: 1420
  }
];

export const ARTISAN_BAZAARS: ArtisanBazaar[] = [
  {
    id: 'bz-1',
    name: 'Bagru Natural Indigo & Block Print Collective',
    category: 'Textiles & Handlooms',
    location: 'Bagru Cluster, 24km outside Jaipur',
    isVerified: true,
    priceGuidance: 'Direct Weaver Fair Tariff (₹450 – ₹1,800)',
    description: '100% natural vegetable dyes with 350-year-old wooden blocks. Directly supports 40 Chippa artisan families.',
    zeroCommission: true,
    specialties: ['Dabu Mud-Resist Fabric', 'Indigo Stoles', 'Organic Cotton Quilts'],
    image: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'bz-2',
    name: 'Kullu Shawl & Handloom Weavers Union',
    category: 'Wool & Mountain Handlooms',
    location: 'Shangarh & Kullu Valley Highway',
    isVerified: true,
    priceGuidance: 'Govt GI-Certified Pricing (₹800 – ₹4,500)',
    description: 'Pure sheep & angora wool with traditional geometric border patterns. Verified anti-synthetic stamp.',
    zeroCommission: true,
    specialties: ['GI-Tagged Kullu Shawls', 'Pahari Pattus', 'Pure Woolen Socks'],
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'bz-3',
    name: 'Kolhapur Historic Chappal Artisans Galli',
    category: 'Leather Craft & Footwear',
    location: 'Bhausinghji Road, Kolhapur',
    isVerified: true,
    priceGuidance: 'Hand-Stitched Direct Benchmark (₹500 – ₹1,600)',
    description: 'Authentic vegetable-tanned leather footwear handcrafted without metal nails using traditional babul bark dye.',
    zeroCommission: true,
    specialties: ['GI Kolhapuri Chappals', 'Braided Belts', 'Traditional Mojaris'],
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'
  }
];

export const TRAVEL_GROUPS: TravelGroup[] = [
  {
    id: 'grp-1',
    name: 'Himalayan High Altitude Backpackers',
    destination: 'Spiti & Chandratal Lake',
    travelDates: 'Sep 22 – Sep 29',
    membersCount: 8,
    maxMembers: 12,
    travelStyle: 'Adventure',
    leaderName: 'Arjun K. (HMI Certified)',
    description: 'Autonomous camper group crossing Kunzum Pass with shared 4x4 transport and homestay logistics.',
    isVerifiedGroup: true
  },
  {
    id: 'grp-2',
    name: 'Rajasthan Royal Heritage & Food Explorers',
    destination: 'Jaipur & Udaipur',
    travelDates: 'Oct 14 – Oct 20',
    membersCount: 7,
    maxMembers: 10,
    travelStyle: 'Heritage',
    leaderName: 'Pooja Verma',
    description: 'Heritage walks, early morning architectural photography, and discovering authentic walled-city food stalls.',
    isVerifiedGroup: true
  },
  {
    id: 'grp-3',
    name: 'Western Ghats Monsoon Trekkers',
    destination: 'Munnar & Kolhapur Sahyadris',
    travelDates: 'Nov 02 – Nov 06',
    membersCount: 6,
    maxMembers: 8,
    travelStyle: 'Nature',
    leaderName: 'Vikram Shinde',
    description: 'Exploring ancient Maratha ridge lines, mist-covered tea terraces, and local farm stays.',
    isVerifiedGroup: true
  }
];

export const TRAVELLER_REVIEWS: TravellerReview[] = [
  {
    id: 'rev-1',
    userName: 'Kavita Iyer',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: '3 days ago',
    travelType: 'Solo Female Explorer',
    destination: 'Jaipur',
    reviewText: 'Apna Route’s timing conflict alert saved my morning! It flagged that Amer Fort opens early at 8:00 AM before tour bus crowds. The verified prepaid auto radar gave scam-free pricing.',
    verifiedVisit: true,
    sentiment: 'positive',
    images: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 'rev-2',
    userName: 'Aakash Mehra',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    date: '1 week ago',
    travelType: 'Roadtripper & Adventure',
    destination: 'Manali & Atal Tunnel',
    reviewText: 'The route safety intelligence was spot-on. It warned of black ice near the north portal before morning 9 AM and suggested a delayed departure. 10/10 safety reassurance.',
    verifiedVisit: true,
    sentiment: 'positive',
    images: [
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 'rev-3',
    userName: 'Sneha & Rohan Patel',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    rating: 4.5,
    date: '2 weeks ago',
    travelType: 'Family Vacation',
    destination: 'Munnar',
    reviewText: 'Clean and informative itinerary. The smart packing radar suggested water-resistant jackets and leech gaiters for rainforest trails, which was incredibly helpful.',
    verifiedVisit: true,
    sentiment: 'positive',
    images: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80'
    ]
  }
];

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'September Travel Index Active',
    message: 'High altitude passes in Spiti & Ladakh enter optimal autumn visibility. Clear skies expected.',
    severity: 'success',
    timestamp: '10 mins ago',
    isRead: false
  },
  {
    id: 'notif-2',
    title: 'Route Safety Alert: Rohtang / Atal Tunnel',
    message: 'Morning road maintenance cleared. Safe transit confirmed by Border Roads Organisation.',
    severity: 'info',
    timestamp: '1 hour ago',
    isRead: false
  },
  {
    id: 'notif-3',
    title: 'Weather Advisory: Coastal High Tides',
    message: 'Monsoon withdrawal brings gentle 0.8m surf along Goa and Konkan coastlines.',
    severity: 'warning',
    timestamp: '3 hours ago',
    isRead: true
  }
];

export const STATE_ADVISORIES: StateAdvisory[] = [
  {
    state: 'Rajasthan',
    stateCode: 'RJ',
    advisoryLevel: 'Green',
    permitsRequired: 'None for Indian citizens. Foreign nationals require Protected Area Permit only for restricted border zones near Jaisalmer border.',
    monsoonWinterAdvisories: 'Peak tourist winter season (Oct–Mar). Desert nighttime temperatures can drop to 6°C; carry warm layers.',
    roadConditionRating: 'Excellent 4-lane & 6-lane expressways (NH-48, Delhi-Mumbai Expressway).',
    culturalNorms: 'Remove shoes at temple premises, modest attire recommended at religious shrines, avoid public displays of affection in traditional areas.',
    emergencyNumbers: {
      police: '100 / 112',
      ambulance: '102 / 108',
      touristPolice: '0141-2822863'
    }
  },
  {
    state: 'Himachal Pradesh',
    stateCode: 'HP',
    advisoryLevel: 'Green',
    permitsRequired: 'Rohtang Pass Permit required for tourist vehicles via Manali. Green Tax entry applicable.',
    monsoonWinterAdvisories: 'Autumn (Sept-Nov) has crisp blue skies and low landslide hazard. Winter brings heavy snowfall; snow chains required on passes.',
    roadConditionRating: 'Four-lane Kiratpur-Manali highway operational. Atal Tunnel open 24x7 with standard clearance.',
    culturalNorms: 'Respect sacred village devta rules. Do not touch temple stones or wood carvings without permission.',
    emergencyNumbers: {
      police: '112',
      ambulance: '108',
      touristPolice: '0177-2625924'
    }
  },
  {
    state: 'Ladakh (UT)',
    stateCode: 'LA',
    advisoryLevel: 'Green',
    permitsRequired: 'Inner Line Permit (ILP) required for Nubra Valley, Pangong Tso, and Tso Moriri. Easily obtained online in 10 minutes.',
    monsoonWinterAdvisories: 'Zoji La & Manali-Leh corridors subject to seasonal winter closure starting mid-November. Flight access available year-round.',
    roadConditionRating: 'Border Roads Organisation (BRO) maintains high-quality paved surfaces along major defense highways.',
    culturalNorms: 'Circumambulate chortens and mani walls clockwise. Do not smoke or litter near sacred stupas.',
    emergencyNumbers: {
      police: '112',
      ambulance: '102',
      touristPolice: '01982-258880'
    }
  },
  {
    state: 'Kerala',
    stateCode: 'KL',
    advisoryLevel: 'Green',
    permitsRequired: 'None for general tourism. Forest department trekking passes required for Eravikulam & Periyar tiger reserves.',
    monsoonWinterAdvisories: 'Post-monsoon freshness makes September to March the prime backwaters & Ayurvedic rejuvenation window.',
    roadConditionRating: 'Smooth coastal highways (NH-66 expansion underway). Winding scenic ghat passes in Munnar & Wayanad.',
    culturalNorms: 'Traditional mundu or dhoti dress code required at select historic temples (like Padmanabhaswamy).',
    emergencyNumbers: {
      police: '112',
      ambulance: '108',
      touristPolice: '0471-2322525'
    }
  },
  {
    state: 'Meghalaya',
    stateCode: 'ML',
    advisoryLevel: 'Green',
    permitsRequired: 'None for domestic travelers. Registration at entry checkpost (Meghalaya Tourism App) recommended.',
    monsoonWinterAdvisories: 'October to April brings crystal clear waters in Dawki (Umngot River) and optimal trekking conditions.',
    roadConditionRating: 'Well-maintained Shillong bypass and Guwahati-Shillong 4-lane expressway.',
    culturalNorms: 'Respect sacred groves (Mawphlang). Strictly follow zero-plastic norms in Mawlynnong village.',
    emergencyNumbers: {
      police: '112',
      ambulance: '108',
      touristPolice: '0364-2500733'
    }
  },
  {
    state: 'Goa',
    stateCode: 'GA',
    advisoryLevel: 'Green',
    permitsRequired: 'None. Valid driving license mandatory for scooter and car rentals.',
    monsoonWinterAdvisories: 'Sea swimming permitted only in red-and-yellow flagged zones supervised by Drishti Marine Lifeguards.',
    roadConditionRating: 'Paved state highways; beware of narrow village curves in Old Goa and Siolim.',
    culturalNorms: 'Swimwear permitted exclusively on beach areas; casual modest attire required in market towns and heritage churches.',
    emergencyNumbers: {
      police: '112',
      ambulance: '108',
      touristPolice: '0832-2420821'
    }
  }
];

export const SEASONAL_DATA: Record<string, SeasonalDestinationInfo> = {
  Winter: {
    season: 'Winter',
    months: 'December – February',
    description: 'Crisp sunshine in Rajasthan & South India, snow passes in the Himalayas, and pleasant tropical warmth on the coasts.',
    climateHighlights: 'Comfortable day temperatures (18°C–24°C in plains), low humidity, pristine starlit nights, and snow sports in hill stations.',
    temperatureRange: '4°C to 26°C',
    recommendedDestinations: [
      {
        id: 'jaipur',
        name: 'Jaipur',
        state: 'Rajasthan',
        tagline: 'The Pink City • Forts, Royal Craft & Winter Festivals',
        startingBudget: 9000,
        image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Mild 22°C afternoons perfect for exploring Amer Fort ramparts, royal bazaars, and attending the Jaipur Literature Festival.',
        safetyAdvisory: 'Pleasant daytime visibility; carry light jackets for desert evening temperature drops.'
      },
      {
        id: 'manali',
        name: 'Manali & Solang',
        state: 'Himachal Pradesh',
        tagline: 'Snow Wonderland • Skiing, Snowboarding & Pine Forests',
        startingBudget: 11500,
        image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Active snowfall, skiing at Solang Valley, cozy wooden fireplace cafes in Old Manali, and clear snow vistas through Atal Tunnel.',
        safetyAdvisory: 'Use anti-skid tire chains on Rohtang/Solang approaches. Pack thermal base layers.'
      },
      {
        id: 'goa',
        name: 'Goa Coast',
        state: 'Goa',
        tagline: 'Sun-kissed Beaches • Susegad Culture & Sunset Markets',
        startingBudget: 12000,
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Peak coastal season with calm turquoise seas, lively flea markets, water sports, and vibrant music culture.',
        safetyAdvisory: 'Book stays in advance. Swim only in lifeguard-patrolled zones marked by flags.'
      },
      {
        id: 'varanasi',
        name: 'Varanasi',
        state: 'Uttar Pradesh',
        tagline: 'The Sacred Ghats • Morning Mist & Evening Aarti',
        startingBudget: 7500,
        image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Atmospheric morning mist over Mother Ganga, comfortable boat rides, hot malaiyo sweet delicacy available only in winter.',
        safetyAdvisory: 'Fog can cause rail/flight delays in late December and early January.'
      }
    ]
  },
  Summer: {
    season: 'Summer',
    months: 'March – May',
    description: 'Escape the heat to pristine high-altitude passes, tea estate hill stations, and alpine river valleys.',
    climateHighlights: 'Cool mountain air (12°C–22°C), long daylight hours for outdoor adventures, and river rafting season.',
    temperatureRange: '10°C to 24°C in Hills',
    recommendedDestinations: [
      {
        id: 'leh',
        name: 'Leh-Ladakh',
        state: 'Ladakh',
        tagline: 'Land of High Passes • Khardung La & Pangong Tso',
        startingBudget: 18000,
        image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'High Himalayan passes reopen in May. Crystal blue Pangong Tso, Nubra valley sand dunes, and vibrant monastery festivals.',
        safetyAdvisory: 'Mandatory 48-hour acclimatization in Leh town before crossing Khardung La or Chang La.'
      },
      {
        id: 'spiti',
        name: 'Spiti Valley',
        state: 'Himachal Pradesh',
        tagline: 'The Middle Land • Ancient Monasteries & Stargazing',
        startingBudget: 16000,
        image: 'https://images.unsplash.com/photo-1590740608670-201a0fd7ff63?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Cold-desert routes accessible via Shimla/Kinnaur. Highest post office Hikkim and Chandratal camping open in summer.',
        safetyAdvisory: 'Keep offline maps and emergency cash; mobile connectivity is limited to BSNL/Jio in Kaza.'
      },
      {
        id: 'munnar',
        name: 'Munnar',
        state: 'Kerala',
        tagline: 'Emerald Tea Terraces • Misty Western Ghats',
        startingBudget: 9500,
        image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Delightful 18°C–22°C mountain breeze, aromatic tea plantation tours, trekking in Eravikulam National Park.',
        safetyAdvisory: 'Afternoon mist requires slow driving on hairpin curves.'
      },
      {
        id: 'rishikesh',
        name: 'Rishikesh',
        state: 'Uttarakhand',
        tagline: 'Ganges Rapids • Yoga & High Adventure',
        startingBudget: 8000,
        image: 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Peak river rafting and cliff jumping season on emerald green Himalayan rapids. International yoga retreats.',
        safetyAdvisory: 'Wear certified life jackets and helmets for all grade 3+ river rapids.'
      }
    ]
  },
  Monsoon: {
    season: 'Monsoon',
    months: 'June – September',
    description: 'Witness nature at its most dramatic: roaring Sahyadri waterfalls, lush Western Ghats, and misty emerald valleys.',
    climateHighlights: 'Lush greenery, misty hill peaks, active waterfalls, and discounted off-season luxury resort tariffs.',
    temperatureRange: '19°C to 28°C',
    recommendedDestinations: [
      {
        id: 'meghalaya',
        name: 'Meghalaya',
        state: 'Meghalaya',
        tagline: 'Abode of the Clouds • Roaring Waterfalls & Root Bridges',
        startingBudget: 13000,
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Witness Nohkalikai and Seven Sisters falls in their thundering full glory. Cherrapunji is magic under cloud shrouds.',
        safetyAdvisory: 'Carry waterproof dry bags, anti-leech socks for jungle treks, and sturdy rain gear.'
      },
      {
        id: 'pune',
        name: 'Pune & Sahyadris',
        state: 'Maharashtra',
        tagline: 'Maratha Citadel Treks • Cascading Ghats & Misal',
        startingBudget: 7500,
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Sinhagad, Rajgad and Tamhini Ghat erupt in hundreds of silver waterfalls. Hot kanda bhaji and tea at fort top.',
        safetyAdvisory: 'Beware of slippery basalt rock faces on Sahyadri trails; wear trekking shoes with deep treads.'
      },
      {
        id: 'udaipur',
        name: 'Udaipur (Monsoon Palace)',
        state: 'Rajasthan',
        tagline: 'Sajjangarh Clouds • Full Lakes & Romantic Palaces',
        startingBudget: 10500,
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Lake Pichola and Fateh Sagar overflow with cool rain. Sajjangarh Monsoon Palace sits above dramatic cloud formations.',
        safetyAdvisory: 'Boat cruises operate based on wind advisories; check with jetty operators.'
      },
      {
        id: 'kolhapur',
        name: 'Kolhapur',
        state: 'Maharashtra',
        tagline: 'Panhala Bastions • Radhanagari Greenery & Tambda Rassa',
        startingBudget: 6500,
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Panhala fort enveloped in thick mist. Lush bison sanctuaries and traditional warm fiery cuisine during rains.',
        safetyAdvisory: 'Watch for sudden fog on Panhala-Pawankhind mountain routes.'
      }
    ]
  },
  Autumn: {
    season: 'Autumn',
    months: 'October – November',
    description: 'Golden hour season with festive lights, clear mountain skies, and post-monsoon waterfalls still flowing strong.',
    climateHighlights: 'Crisp sunny days, zero monsoon rainfall, crystal-clear Himalayan visibility, and festive celebrations.',
    temperatureRange: '16°C to 28°C',
    recommendedDestinations: [
      {
        id: 'kashmir',
        name: 'Srinagar & Kashmir',
        state: 'Jammu & Kashmir',
        tagline: 'Chinar Golden Foliage • Dal Lake & Houseboats',
        startingBudget: 15000,
        image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Mughal Gardens turn fiery crimson and amber as Chinar leaves change color. Pristine Dal Lake shikara rides in crisp autumn sun.',
        safetyAdvisory: 'Night temperatures drop sharply towards 4°C by November; bring heavy woolens.'
      },
      {
        id: 'kerala',
        name: 'Kerala Backwaters',
        state: 'Kerala',
        tagline: 'God’s Own Country • Houseboats & Palm Canals',
        startingBudget: 11000,
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Post-monsoon freshness makes October and November ideal for tranquil Alleppey kettuvallam cruises and Ayurvedic wellness.',
        safetyAdvisory: 'Book verified houseboats that adhere to zero plastic and eco-sanitation norms.'
      },
      {
        id: 'jaipur',
        name: 'Jaipur',
        state: 'Rajasthan',
        tagline: 'Diwali Illuminations • Palaces & Rooftop Dining',
        startingBudget: 9000,
        image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'The walled city is adorned with miles of golden fairy lights during Diwali. Ideal weather for outdoor terrace dining.',
        safetyAdvisory: 'High tourist footfall around festival weekends; pre-book heritage entry tickets.'
      },
      {
        id: 'rishikesh',
        name: 'Rishikesh',
        state: 'Uttarakhand',
        tagline: 'Spiritual Clean Air • Clear Ganges & Evening Bells',
        startingBudget: 8000,
        image: 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?auto=format&fit=crop&w=800&q=80',
        whyVisit: 'Post-monsoon Ganges waters turn crystal turquoise. Ideal season for yoga teacher training and mountain biking.',
        safetyAdvisory: 'River water is chilly in late November; wear wetsuits during rafting.'
      }
    ]
  }
};

export const TRAVELER_COMPANIONS: TravelerCompanion[] = [
  {
    id: 'trv-1',
    name: 'Rohan Sharma',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    location: 'Delhi',
    destination: 'Jaipur',
    dates: 'Oct 12 – Oct 16',
    budget: 12000,
    budgetFormatted: '₹12,000 / person',
    travelStyle: 'Heritage',
    interests: ['Photography', 'Heritage Walks', 'Street Food', 'Fort Treks'],
    bio: 'Architectural photographer visiting Jaipur for stepwells & sunrise at Amer Fort. Looking for 1-2 companions to split private cab and explore heritage bazaars.',
    compatibilityScore: 96,
    isVerified: true,
    groupType: 'Solo',
    contactAvailable: true
  },
  {
    id: 'trv-2',
    name: 'Ananya Deshmukh',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    location: 'Mumbai',
    destination: 'Manali',
    dates: 'Dec 20 – Dec 26',
    budget: 16500,
    budgetFormatted: '₹16,500 / person',
    travelStyle: 'Adventure',
    interests: ['Skiing', 'Snow Treks', 'Cafe Hopping', 'Atal Tunnel'],
    bio: 'Software engineer & weekend hiker heading to Manali for fresh winter snow! Planning a day trip through Atal Tunnel to Sissu and skiing at Solang.',
    compatibilityScore: 92,
    isVerified: true,
    groupType: 'Solo',
    contactAvailable: true
  },
  {
    id: 'trv-3',
    name: 'Pooja & Sneha',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    location: 'Bengaluru',
    destination: 'Goa',
    dates: 'Nov 18 – Nov 23',
    budget: 14000,
    budgetFormatted: '₹14,000 / person',
    travelStyle: 'Nature',
    interests: ['Sunset Kayaking', 'Heritage Fontainhas', 'Artisan Flea', 'Seafood'],
    bio: 'Two design friends looking for other solo female travelers or a duo to share a quaint Portuguese villa stay in Assagao and rent scooters together.',
    compatibilityScore: 89,
    isVerified: true,
    groupType: 'Women Only',
    contactAvailable: true
  },
  {
    id: 'trv-4',
    name: 'Vikram & Friends',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    location: 'Pune',
    destination: 'Munnar',
    dates: 'Sep 28 – Oct 02',
    budget: 11000,
    budgetFormatted: '₹11,000 / person',
    travelStyle: 'Nature',
    interests: ['Tea Terraces', 'Trekking', 'Wildlife', 'Spice Plantations'],
    bio: 'Group of 3 engineers traveling from Kochi airport in a hired Innova. Looking for 1-2 fellow travelers to join our vehicle and share fuel/rental costs.',
    compatibilityScore: 94,
    isVerified: true,
    groupType: 'Small Group (3-5)',
    contactAvailable: true
  },
  {
    id: 'trv-5',
    name: 'Arjun Sen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    location: 'Kolkata',
    destination: 'Varanasi',
    dates: 'Nov 04 – Nov 08',
    budget: 8500,
    budgetFormatted: '₹8,500 / person',
    travelStyle: 'Spiritual',
    interests: ['Boat Rides', 'Aarti Ceremonies', 'Classical Music', 'Silk Weaving'],
    bio: 'Documentary enthusiast exploring the historic ghats and weavers colony in Sarnath. Would love a curious travel buddy to share boat hire at dawn.',
    compatibilityScore: 88,
    isVerified: true,
    groupType: 'Solo',
    contactAvailable: true
  },
  {
    id: 'trv-6',
    name: 'Tanvi & Rahul',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    location: 'Hyderabad',
    destination: 'Udaipur',
    dates: 'Oct 24 – Oct 28',
    budget: 15000,
    budgetFormatted: '₹15,000 / person',
    travelStyle: 'Heritage',
    interests: ['Lake Pichola Boat', 'City Palace', 'Folk Dance', 'Rooftop Cafes'],
    bio: 'Duo passionate about Rajasthani folk music, miniature art workshops, and lakeside sunsets. Welcoming couple or solo companions.',
    compatibilityScore: 91,
    isVerified: true,
    groupType: 'Duo',
    contactAvailable: true
  }
];

export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

export const DESTINATION_PHOTOS: DestinationPhoto[] = [
  {
    id: 'photo_goa_1',
    destination_id: 'goa',
    destination_name: 'Goa',
    user_id: 'usr_ar_101',
    user_name: 'Ananya Sharma',
    photo_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1000&q=80',
    caption: 'Golden sunset over Palolem Beach with gentle waves and calm waters.',
    created_at: '2026-09-03T18:45:00.000Z'
  },
  {
    id: 'photo_goa_2',
    destination_id: 'goa',
    destination_name: 'Goa',
    user_id: 'usr_ar_102',
    user_name: 'Kunal Deshmukh',
    photo_url: 'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1000&q=80',
    caption: 'Heritage Portuguese villa facade in the historic Fontainhas Latin Quarter.',
    created_at: '2026-09-02T11:20:00.000Z'
  },
  {
    id: 'photo_goa_3',
    destination_id: 'goa',
    destination_name: 'Goa',
    user_id: 'usr_ar_103',
    user_name: 'Pooja Nair',
    photo_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
    caption: 'Quiet morning walk along the pristine sands of Morjim Beach.',
    created_at: '2026-08-31T07:15:00.000Z'
  },
  {
    id: 'photo_jpr_1',
    destination_id: 'jaipur',
    destination_name: 'Jaipur',
    user_id: 'usr_ar_201',
    user_name: 'Rohan Mehra',
    photo_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1000&q=80',
    caption: 'Hawa Mahal glowing in the soft amber dawn light.',
    created_at: '2026-09-03T06:30:00.000Z'
  },
  {
    id: 'photo_jpr_2',
    destination_id: 'jaipur',
    destination_name: 'Jaipur',
    user_id: 'usr_ar_202',
    user_name: 'Meera Rajput',
    photo_url: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=1000&q=80',
    caption: 'Amer Fort sandstone ramparts reflected in calm waters.',
    created_at: '2026-09-01T15:10:00.000Z'
  },
  {
    id: 'photo_mnl_1',
    destination_id: 'manali',
    destination_name: 'Manali',
    user_id: 'usr_ar_301',
    user_name: 'Vikram Thakur',
    photo_url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1000&q=80',
    caption: 'Pine ridges and mountain snow along Solang Valley.',
    created_at: '2026-09-02T14:00:00.000Z'
  }
];


