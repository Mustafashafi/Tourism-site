const mongoose = require("mongoose");
const dotenv = require("dotenv");
const City = require("../models/City");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const TourType = require("../models/TourType");
const Product = require("../models/Product");
const Testimonial = require("../models/Testimonial");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

const citiesData = [
  {
    name: "Dubai",
    city_name: "Dubai",
    country_name: "United Arab Emirates",
    slug: "dubai",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop",
    categories: ["activities", "cruises", "holidays"],
    status: "active",
  },
  {
    name: "Abu Dhabi",
    city_name: "Abu Dhabi",
    country_name: "United Arab Emirates",
    slug: "abu-dhabi",
    image: "https://images.unsplash.com/photo-1544913716-6081a2fd3791?q=80&w=800&auto=format&fit=crop",
    categories: ["activities", "cruises", "holidays"],
    status: "active",
  },
  {
    name: "Sharjah",
    city_name: "Sharjah",
    country_name: "United Arab Emirates",
    slug: "sharjah",
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop",
    categories: ["activities", "cruises", "holidays"],
    status: "active",
  },
  {
    name: "Ras Al Khaimah",
    city_name: "Ras Al Khaimah",
    country_name: "United Arab Emirates",
    slug: "ras-al-khaimah",
    image: "https://images.unsplash.com/photo-1616391444190-845f061266e7?q=80&w=800&auto=format&fit=crop",
    categories: ["activities", "cruises", "holidays"],
    status: "active",
  },
];

const categoriesData = [
  {
    name: "Activities",
    slug: "activities",
    banners: [
      {
        url: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&auto=format&fit=crop&q=60",
        title: "Abu Dhabi Tours & Attractions",
        subtext: "Best Activities",
        description: "Experience the grandeur of the Sheikh Zayed Grand Mosque and the cultural wonders of the Louvre."
      },
      {
        url: "https://images.unsplash.com/photo-1545138697-45eb2968b249?q=80&w=1200&auto=format&fit=crop",
        title: "Desert Safari Adventure",
        subtext: "Thrilling rides",
        description: "Escape the city for a heart-pounding journey across the golden dunes of the Arabian desert."
      },
      {
        url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
        title: "Dubai Skyline & Luxury Cruises",
        subtext: "Premium experiences",
        description: "Witness the iconic Burj Khalifa and sail along the Dubai Marina on a private yacht."
      },
      {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        title: "Water Adventures",
        subtext: "Fun in the sun",
        description: "Explore the vibrant water parks and beachside activities in the UAE."
      }
    ]
  },
  {
    name: "Cruises",
    slug: "cruises",
    banners: [
      {
        url: "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?q=80&w=1200&auto=format&fit=crop",
        title: "Luxury Cruises Extravaganza",
        subtext: "Sail across the globe",
        description: "Experience world-class dining, spectacular entertainment, and unwinding onboard the most luxurious cruise ships."
      },
      {
        url: "https://images.unsplash.com/photo-1569996162383-7c2a4ddba29f?q=80&w=1200&auto=format&fit=crop",
        title: "Mediterranean Escapes",
        subtext: "From Barcelona to Rome",
        description: "Discover the breathtaking coastlines, ancient history, and vibrant cultures of the Mediterranean Sea."
      },
      {
        url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop",
        title: "Asian Wonders by Sea",
        subtext: "Singapore, Phuket & Beyond",
        description: "Immerse yourself in the exotic beauty of Southeast Asia. Enjoy tropical luxury and pristine beaches."
      },
      {
        url: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=800&q=80",
        title: "Sunset Yacht Cruises",
        subtext: "Exclusive Marina Views",
        description: "Indulge in private luxury yacht charters with gourmet catering and customized routes."
      }
    ]
  },
  {
    name: "Holidays",
    slug: "holidays",
    banners: [
      {
        url: "https://images.unsplash.com/photo-1546708973-b339540b5162?q=80&w=1200&auto=format&fit=crop",
        title: "Serene Sri Lanka Holidays",
        subtext: "7 Nights / 8 Days",
        description: "Journey through misty tea plantations in Ella and explore the ancient rock fortress of Sigiriya."
      },
      {
        url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200&auto=format&fit=crop",
        title: "Tropical Paradise in Maldives",
        subtext: "5 Nights / 6 Days",
        description: "Awaken in a private overwater villa surrounded by turquoise lagoons and vibrant coral reefs."
      },
      {
        url: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=1200&auto=format&fit=crop",
        title: "Honeymoon Bliss in Malaysia",
        subtext: "6 Nights / 7 Days",
        description: "Discover the perfect blend of urban luxury in Kuala Lumpur and the tranquil rainforests of Langkawi."
      },
      {
        url: "https://images.unsplash.com/photo-1528181304800-2f190854897d?q=80&w=1200&auto=format&fit=crop",
        title: "Cultural Wonders of Thailand",
        subtext: "4 Nights / 5 Days",
        description: "Immerse yourself in the bustling energy of Bangkok's night markets and the serene temples of Chiang Mai."
      }
    ]
  }
];

const subCategoriesRaw = [
  // Under Activities
  { name: "Desert Safari", slug: "desert-safari", categoryName: "Activities" },
  { name: "City Tours", slug: "city-tours", categoryName: "Activities" },
  { name: "Adventure Tours", slug: "adventure-tours", categoryName: "Activities" },
  
  // Under Cruises
  { name: "Luxury Yacht Tours", slug: "luxury-yacht-tours", categoryName: "Cruises" },
  { name: "Dhow Cruise", slug: "dhow-cruise", categoryName: "Cruises" },
  
  // Under Holidays
  { name: "City Tours Packages", slug: "holiday-city-tours", categoryName: "Holidays" },
  { name: "Adventure Packages", slug: "holiday-adventure-tours", categoryName: "Holidays" },
];

const tourTypesData = [
  { name: "Evening Experiences", slug: "evening-experiences" },
  { name: "Half-Day Tours", slug: "half-day-tours" },
  { name: "Full-Day Tours", slug: "full-day-tours" },
  { name: "Luxury Experiences", slug: "luxury-experiences" },
  { name: "Water Activities", slug: "water-activities" },
  { name: "Cultural & Heritage Tours", slug: "cultural-heritage-tours" },
  { name: "Adventure Experiences", slug: "adventure-experiences" },
  { name: "Family-Friendly Tours", slug: "family-friendly-tours" },
];

const testimonialsData = [
  { userName: "Sarah Jenkins", userImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop", rating: 5, comment: "Our desert safari in Dubai was absolute magic! The dune bashing was thrilling and the dinner show under the stars was unforgettable.", location: "London, UK" },
  { userName: "Markus Vance", userImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop", rating: 5, comment: "Louvre Abu Dhabi was breathtaking. The entire tour was perfectly organized with prompt pickups and knowledgeable guides.", location: "Berlin, Germany" },
  { userName: "Elena Rostova", userImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop", rating: 5, comment: "The private yacht charter in Dubai Marina exceeded all expectations. Exceptional crew, luxurious amenities, and gorgeous sunset views.", location: "Moscow, Russia" },
  { userName: "David Kim", userImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop", rating: 4, comment: "Sharjah Souk tour was fantastic for discovering local history. Highly recommend the cultural heritage experiences.", location: "Seoul, South Korea" },
  { userName: "Amélie Dupont", userImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop", rating: 5, comment: "Jebel Jais zipline in Ras Al Khaimah was an absolute thrill! The staff made us feel safe and the views were incredible.", location: "Paris, France" },
  { userName: "Rajesh Mehta", userImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop", rating: 5, comment: "Superb family holiday package! Everything from the hotel bookings to the theme park passes was seamlessly integrated.", location: "Mumbai, India" },
  { userName: "Emma Watson", userImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop", rating: 5, comment: "The traditional dhow cruise dinner in Deira Creek was so romantic. Beautiful music, delicious buffet, and nice skyline views.", location: "Sydney, Australia" },
  { userName: "Abdullah Al-Mansoor", userImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop", rating: 5, comment: "Incredible attention to detail. Carthage Travel is definitely my go-to choice for premium tours in the UAE.", location: "Riyadh, Saudi Arabia" },
  { userName: "John Smith", userImage: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop", rating: 5, comment: "The old Dubai heritage tour was a fascinating dive into the history of the creek. Excellent storytelling by our guide.", location: "New York, USA" },
  { userName: "Yuki Tanaka", userImage: "https://images.unsplash.com/photo-1534751516642-a131ffd473fd?w=100&auto=format&fit=crop", rating: 4, comment: "Had a great time on the speedboat tour around Palm Jumeirah. Lots of great photo opportunities!", location: "Tokyo, Japan" },
  { userName: "Carlos Santana", userImage: "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=100&auto=format&fit=crop", rating: 5, comment: "The Yas Island theme park pass was worth every dirham. Ferrari World and Warner Bros World were amazing.", location: "Madrid, Spain" },
  { userName: "Sofia Rodriguez", userImage: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=100&auto=format&fit=crop", rating: 5, comment: "Amazing sunset cruise along the Ras Al Khaimah coast. Very relaxing and the service was absolutely top-notch.", location: "Buenos Aires, Argentina" }
];

const toSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const seedDatabase = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    console.log("Clearing collections...");
    await Promise.all([
      City.deleteMany({}),
      Category.deleteMany({}),
      SubCategory.deleteMany({}),
      TourType.deleteMany({}),
      Product.deleteMany({}),
      Testimonial.deleteMany({}),
    ]);
    console.log("Collections cleared.");

    console.log("Seeding cities...");
    const seededCities = await City.create(citiesData);
    const cityMap = new Map(seededCities.map((c) => [c.name, c._id]));

    console.log("Seeding categories...");
    const seededCategories = await Category.create(categoriesData);
    const categoryMap = new Map(seededCategories.map((c) => [c.name, c._id]));

    console.log("Seeding subcategories...");
    const subCategoriesToSeed = subCategoriesRaw.map((sub) => ({
      name: sub.name,
      slug: sub.slug,
      category: categoryMap.get(sub.categoryName),
    }));
    const seededSubCategories = await SubCategory.create(subCategoriesToSeed);
    const subCategoryMap = new Map(
      seededSubCategories.map((s) => [s.category.toString() + "_" + s.name, s._id])
    );

    console.log("Seeding tour types...");
    const seededTourTypes = await TourType.create(tourTypesData);
    const tourTypeMap = new Map(seededTourTypes.map((t) => [t.name, t._id]));

    console.log("Seeding testimonials...");
    await Testimonial.create(testimonialsData);

    const productsToCreate = [];

    // ── 27 ACTIVITIES ──
    const activitiesRaw = [
      { city: "Dubai", subCategory: "Desert Safari", tourType: "Evening Experiences", name: "Morning Desert Safari Dubai", description: "Sunrise dune bashing, sandboarding, and camel trekking.", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600" },
      { city: "Dubai", subCategory: "City Tours", tourType: "Half-Day Tours", name: "Old Dubai Heritage Tour", description: "Explore Al Fahidi District, souks, and Dubai Creek.", image: "https://images.unsplash.com/photo-1546412414-e188526159ca?q=80&w=600" },
      { city: "Dubai", subCategory: "Adventure Tours", tourType: "Adventure Experiences", name: "Skydiving over Palm Jumeirah", description: "Tandem jump with breathtaking aerial views of Dubai.", image: "https://images.unsplash.com/photo-1524850011238-e3d235c7d4c9?q=80&w=600" },
      { city: "Dubai", subCategory: "Desert Safari", tourType: "Evening Experiences", name: "Premium Overnight Desert Safari Dubai", description: "Stay in a traditional bedouin camp with stargazing and early sunrise breakfast.", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600" },
      { city: "Dubai", subCategory: "City Tours", tourType: "Full-Day Tours", name: "Miracle Garden & Global Village Dubai", description: "Visit the world's largest natural flower garden and multicultural festival park.", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600" },
      { city: "Dubai", subCategory: "Adventure Tours", tourType: "Adventure Experiences", name: "Deep Dive Dubai Experience", description: "Explore the world's deepest pool with an underwater sunken city layout.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600" },
      { city: "Dubai", subCategory: "Desert Safari", tourType: "Adventure Experiences", name: "Dune Buggy Adventure Dubai", description: "Drive high-powered dune buggies across the giant desert red dunes.", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "Desert Safari", tourType: "Evening Experiences", name: "Morning Desert Safari Abu Dhabi", description: "Early dune drive with camel rides and sandboarding.", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "City Tours", tourType: "Full-Day Tours", name: "Heritage Village Tour Abu Dhabi", description: "Traditional Emirati village showcasing crafts and culture.", image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "Adventure Tours", tourType: "Adventure Experiences", name: "Desert Quad Biking Abu Dhabi", description: "Off-road quad biking adventure in desert dunes.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "City Tours", tourType: "Half-Day Tours", name: "Abu Dhabi Louvre Museum Tour", description: "Witness the iconic floating dome architecture and fine global art pieces.", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "Adventure Tours", tourType: "Adventure Experiences", name: "Yas Marina Circuit Karting Abu Dhabi", description: "Race on the world-famous Formula 1 track in premium high-speed karts.", image: "https://images.unsplash.com/photo-1544913716-6081a2fd3791?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "City Tours", tourType: "Cultural & Heritage Tours", name: "Qasr Al Hosn Cultural Tour Abu Dhabi", description: "Explore the oldest stone building in Abu Dhabi, representing emirate heritage.", image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "City Tours", tourType: "Cultural & Heritage Tours", name: "Al Ain Oasis & Palace Museum Tour Abu Dhabi", description: "Discover the UNESCO heritage date palm oasis and historical palace.", image: "https://images.unsplash.com/photo-1544913716-6081a2fd3791?q=80&w=600" },
      { city: "Sharjah", subCategory: "City Tours", tourType: "Cultural & Heritage Tours", name: "Sharjah Art Tour", description: "Visit Sharjah Art Museum and contemporary galleries.", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600" },
      { city: "Sharjah", subCategory: "Adventure Tours", tourType: "Adventure Experiences", name: "Sharjah Desert Adventure", description: "Camel trekking and dune bashing near Mleiha.", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600" },
      { city: "Sharjah", subCategory: "City Tours", tourType: "Cultural & Heritage Tours", name: "Sharjah Souk Tour", description: "Explore Central Souk and traditional markets.", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=600" },
      { city: "Sharjah", subCategory: "City Tours", tourType: "Half-Day Tours", name: "Sharjah Rain Room Tour", description: "Walk through continuous rain without getting wet at the rain room installation.", image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800" },
      { city: "Sharjah", subCategory: "City Tours", tourType: "Cultural & Heritage Tours", name: "Sharjah Museum of Islamic Civilization", description: "Discover scientific and cultural treasures of the Islamic golden age.", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600" },
      { city: "Ras Al Khaimah", subCategory: "Desert Safari", tourType: "Evening Experiences", name: "Desert Safari Ras Al Khaimah", description: "Evening desert safari with BBQ and cultural shows.", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600" },
      { city: "Ras Al Khaimah", subCategory: "City Tours", tourType: "Half-Day Tours", name: "Ras Al Khaimah City Tour", description: "Visit National Museum, old souks, and coastal landmarks.", image: "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?q=80&w=600" },
      { city: "Ras Al Khaimah", subCategory: "Adventure Tours", tourType: "Adventure Experiences", name: "Jebel Jais Zipline Adventure Ras Al Khaimah", description: "Ride the world's longest zipline at the highest peak in the UAE.", image: "https://images.unsplash.com/photo-1616391444190-845f061266e7?q=80&w=800" },
      { city: "Ras Al Khaimah", subCategory: "City Tours", tourType: "Cultural & Heritage Tours", name: "Ras Al Khaimah Dhayah Fort Expedition", description: "Climb the historical hilltop fort with panoramas of mountains and sea.", image: "https://images.unsplash.com/photo-1616391444190-845f061266e7?q=80&w=800" },
      // Padding to 27 activities
      { city: "Dubai", subCategory: "Desert Safari", tourType: "Evening Experiences", name: "Desert Camel Trekking Dubai", description: "Uncover the slow beauty of the desert dunes atop a majestic camel.", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600" },
      { city: "Dubai", subCategory: "Adventure Tours", tourType: "Adventure Experiences", name: "Sandboarding & Dune Slide Dubai", description: "Slide down the steep sand slopes of the Dubai desert on boards.", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "Adventure Tours", tourType: "Water Activities", name: "Yas Island Kayaking Adventure", description: "Explore the peaceful mangrove forest waterways of Abu Dhabi.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600" },
      { city: "Sharjah", subCategory: "Adventure Tours", tourType: "Adventure Experiences", name: "Sharjah Safari Park Tour", description: "Explore the massive wildlife park representing African biodiversity.", image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800" }
    ];

    const categoryActivitiesId = categoryMap.get("Activities");

    for (const act of activitiesRaw) {
      const subCategoryId = subCategoryMap.get(categoryActivitiesId.toString() + "_" + act.subCategory);

      productsToCreate.push({
        name: act.name,
        slug: toSlug(act.name),
        city: cityMap.get(act.city),
        category: categoryActivitiesId,
        subCategory: subCategoryId,
        tourType: tourTypeMap.get(act.tourType),
        images: [act.image],
        location: `${act.city}, UAE`,
        rating: 4.8,
        reviews: 25,
        pricing: {
          actualPrice: 200,
          discountPrice: 150,
          currency: "AED",
        },
        highlights: [{ title: "Highlight", description: act.description, icon: "Zap" }],
        contentSections: [{ title: "Description", description: act.description }],
      });
    }

    // ── 24 CRUISES ──
    const cruisesRaw = [
      { city: "Dubai", subCategory: "Luxury Yacht Tours", tourType: "Luxury Experiences", name: "Sunset Yacht Cruise Dubai", description: "Private yacht with sunset views over Palm Jumeirah.", image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "Luxury Yacht Tours", tourType: "Water Activities", name: "Sunset Yacht Cruise Abu Dhabi", description: "Scenic yacht ride along Corniche at sunset.", image: "https://images.unsplash.com/photo-1605281317010-fe5fed93d44e?q=80&w=600" },
      { city: "Sharjah", subCategory: "Dhow Cruise", tourType: "Evening Experiences", name: "Sharjah Dhow Cruise", description: "Cruise along Khalid Lagoon with dinner and views.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600" },
      { city: "Ras Al Khaimah", subCategory: "Luxury Yacht Tours", tourType: "Luxury Experiences", name: "Ras Al Khaimah Yacht Cruise", description: "Private yacht along Arabian Gulf coastline.", image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=600" },
      { city: "Dubai", subCategory: "Dhow Cruise", tourType: "Evening Experiences", name: "Dubai Creek Historical Dhow Dinner Cruise", description: "Sail on a historic wooden ship along Deira Creek with a luxury buffet.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "Luxury Yacht Tours", tourType: "Luxury Experiences", name: "Abu Dhabi Corniche Sunset Cruise", description: "Stunning night skyline tour onboard our premium catamaran yacht.", image: "https://images.unsplash.com/photo-1605281317010-fe5fed93d44e?q=80&w=600" },
      { city: "Dubai", subCategory: "Dhow Cruise", tourType: "Evening Experiences", name: "Dubai Marina Buffet Dinner Cruise", description: "Modern glass dhow cruise with high-end dining and live Tanoura shows.", image: "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?q=80&w=600" },
      { city: "Ras Al Khaimah", subCategory: "Dhow Cruise", tourType: "Full-Day Tours", name: "Musandam Khasab Day Cruise from Ras Al Khaimah", description: "Ride traditional dhows to the fjords of Musandam for dolphin watching.", image: "https://images.unsplash.com/photo-1548574505-12caf0050b5b?q=80&w=600" },
      { city: "Dubai", subCategory: "Luxury Yacht Tours", tourType: "Luxury Experiences", name: "Dubai Canal Water Canal Luxury Cruise", description: "Sail past the new waterfall bridge and design districts on a yacht.", image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "Dhow Cruise", tourType: "Family-Friendly Tours", name: "Yas Island Sightseeing Boat Tour Abu Dhabi", description: "Family boat sightseeing around Yas Marina and Ferrari World views.", image: "https://images.unsplash.com/photo-1524311583162-8404a3ad52f8?q=80&w=600" },
      { city: "Ras Al Khaimah", subCategory: "Luxury Yacht Tours", tourType: "Luxury Experiences", name: "Al Hamra Marina Sunset Sailing Ras Al Khaimah", description: "Beautiful private sailing charter past Al Hamra Island resort.", image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=600" },
      { city: "Dubai", subCategory: "Luxury Yacht Tours", tourType: "Luxury Experiences", name: "Dubai Marina Elegant Dhow Cruise", description: "Elegant cruising inside the world's largest artificial marina.", image: "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "Luxury Yacht Tours", tourType: "Water Activities", name: "Abu Dhabi Yas Marina Yacht Charter", description: "Charter yachts at Yas Marina with access to coastal bays.", image: "https://images.unsplash.com/photo-1569996162383-7c2a4ddba29f?q=80&w=600" },
      { city: "Sharjah", subCategory: "Dhow Cruise", tourType: "Evening Experiences", name: "Sharjah Khalid Lagoon Premium Cruise", description: "Premium traditional dhow sail along the iconic Sharjah corniche.", image: "https://images.unsplash.com/photo-1548574505-12caf0050b5b?q=80&w=600" },
      { city: "Ras Al Khaimah", subCategory: "Luxury Yacht Tours", tourType: "Water Activities", name: "Ras Al Khaimah Coastline Cruise", description: "Coastal yacht sightseeing for capturing local mountain views.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600" },
      { city: "Dubai", subCategory: "Luxury Yacht Tours", tourType: "Luxury Experiences", name: "Palm Jumeirah Luxury Sunset Cruise", description: "Unrivalled sunset tours around the Palm Jumeirah crescent.", image: "https://images.unsplash.com/photo-1524311583162-8404a3ad52f8?q=80&w=600" },
      { city: "Dubai", subCategory: "Dhow Cruise", tourType: "Evening Experiences", name: "Dubai Creek Traditional Dhow Dinner", description: "Romantic dinner cruise through historic trade routes.", image: "https://images.unsplash.com/photo-1583422409516-1500d05a011f?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "Luxury Yacht Tours", tourType: "Water Activities", name: "Abu Dhabi Corniche Sightseeing Yacht", description: "Sightseeing yacht tour showcasing skyscrapers and city beach.", image: "https://images.unsplash.com/photo-1513622470522-26c36f368915?q=80&w=600" },
      { city: "Ras Al Khaimah", subCategory: "Luxury Yacht Tours", tourType: "Water Activities", name: "Ras Al Khaimah Marjan Island Sailing", description: "Relaxing catamaran cruise around artificial Al Marjan island resort.", image: "https://images.unsplash.com/photo-1569996162383-7c2a4ddba29f?q=80&w=600" },
      { city: "Dubai", subCategory: "Luxury Yacht Tours", tourType: "Water Activities", name: "Dubai Marina Speedboat Luxury Experience", description: "High-speed tour past Dubai Eye, Palm Jumeirah, and Marina canals.", image: "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?q=80&w=600" },
      { city: "Ras Al Khaimah", subCategory: "Luxury Yacht Tours", tourType: "Family-Friendly Tours", name: "Musandam Dibba Cruise from Ras Al Khaimah", description: "Swim and snorkel in pristine waters during a full-day cruise.", image: "https://images.unsplash.com/photo-1548574505-12caf0050b5b?q=80&w=600" },
      { city: "Dubai", subCategory: "Luxury Yacht Tours", tourType: "Water Activities", name: "Dubai Marina Catamaran Sailing Tour", description: "Sail the open seas on a high-end catamaran boat with barbecue lunch.", image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=600" },
      { city: "Abu Dhabi", subCategory: "Luxury Yacht Tours", tourType: "Water Activities", name: "Abu Dhabi Lulu Island Yacht Cruise", description: "Relaxing cruise with a swimming stop at the pristine sandbars of Lulu Island.", image: "https://images.unsplash.com/photo-1605281317010-fe5fed93d44e?q=80&w=600" },
      { city: "Sharjah", subCategory: "Luxury Yacht Tours", tourType: "Luxury Experiences", name: "Sharjah Corniche Private Yacht Cruise", description: "Exclusive yacht cruise past high-rises and Khalid Lagoon fountains.", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600" }
    ];

    const categoryCruisesId = categoryMap.get("Cruises");

    for (const cruise of cruisesRaw) {
      const subCategoryId = subCategoryMap.get(categoryCruisesId.toString() + "_" + cruise.subCategory);

      productsToCreate.push({
        name: cruise.name,
        slug: toSlug(cruise.name),
        city: cityMap.get(cruise.city),
        category: categoryCruisesId,
        subCategory: subCategoryId,
        tourType: tourTypeMap.get(cruise.tourType),
        images: [cruise.image],
        location: `${cruise.city}, UAE`,
        rating: 4.7,
        reviews: 42,
        pricing: {
          actualPrice: 400,
          discountPrice: 350,
          currency: "AED",
        },
        cruiseLine: "Carthage Premium Fleet",
        departureCity: cruise.city,
        duration: "2-4 Hours",
        highlights: [{ title: "Overview", description: cruise.description, icon: "Ship" }],
        contentSections: [{ title: "Details", description: cruise.description }],
      });
    }

    // ── 24 HOLIDAYS ──
    const holidaysRaw = [
      { city: "Dubai", subCategory: "City Tours Packages", tourType: "Full-Day Tours", name: "Dubai Golden Sands Explorer Package", description: "Exciting holiday package in Dubai." },
      { city: "Abu Dhabi", subCategory: "City Tours Packages", tourType: "Family-Friendly Tours", name: "Abu Dhabi Cultural & Theme Park Holiday", description: "Explore Yas Island theme parks and Louvre culture." },
      { city: "Sharjah", subCategory: "Adventure Packages", tourType: "Full-Day Tours", name: "Sharjah Heritage & Mleiha Adventure", description: "Historical tours and stargazing in the Mleiha desert." },
      { city: "Ras Al Khaimah", subCategory: "Adventure Packages", tourType: "Family-Friendly Tours", name: "Ras Al Khaimah Mountain & Beach Escape", description: "Mountain toboggan ride and beach resort staycation." },
      { city: "Dubai", subCategory: "City Tours Packages", tourType: "Full-Day Tours", name: "Ultimate Dubai & Abu Dhabi Dual Tour", description: "Dual-city packages spanning both emirates." },
      { city: "Sharjah", subCategory: "City Tours Packages", tourType: "Family-Friendly Tours", name: "Sharjah & Dubai Twin City Highlights Tour", description: "Twin city tour package." },
      { city: "Ras Al Khaimah", subCategory: "Adventure Packages", tourType: "Full-Day Tours", name: "Ras Al Khaimah Jebel Jais Thrill Seeker Package", description: "Sledder and zipline adventures at high altitudes." },
      { city: "Dubai", subCategory: "City Tours Packages", tourType: "Full-Day Tours", name: "Dubai Luxury Oasis Resort Gateway", description: "Premium desert oasis getaway." },
      { city: "Abu Dhabi", subCategory: "City Tours Packages", tourType: "Family-Friendly Tours", name: "Abu Dhabi Yas Island Ultimate Family Vacation", description: "Family package at theme parks." },
      { city: "Sharjah", subCategory: "City Tours Packages", tourType: "Full-Day Tours", name: "Cultural Sharjah & Scenic East Coast Gateway", description: "East coast scenic drive." },
      { city: "Dubai", subCategory: "City Tours Packages", tourType: "Full-Day Tours", name: "Dubai Shopping & Skyline Extravaganza", description: "Dubai mall shopping tour." },
      { city: "Ras Al Khaimah", subCategory: "City Tours Packages", tourType: "Full-Day Tours", name: "Ras Al Khaimah Historical Al Hamra Staycation", description: "Heritage hotel package." },
      // 12 new holidays
      { city: "Dubai", subCategory: "City Tours Packages", tourType: "Luxury Experiences", name: "Dubai Romance & Luxury Honeymoon Package", description: "5-star hotel accommodations with private sunset cruises and fine dining." },
      { city: "Abu Dhabi", subCategory: "Adventure Packages", tourType: "Family-Friendly Tours", name: "Abu Dhabi Theme Park Bonanza Holiday", description: "Unlimited passes to Ferrari World, Warner Bros, and Yas Waterworld." },
      { city: "Sharjah", subCategory: "Adventure Packages", tourType: "Full-Day Tours", name: "Sharjah Archaeology & Desert Star Gazing Holiday", description: "A unique night camping and learning experience at historical sites." },
      { city: "Ras Al Khaimah", subCategory: "City Tours Packages", tourType: "Family-Friendly Tours", name: "Ras Al Khaimah Coastal Beach Resort Package", description: "Relaxing beachfront luxury stays with pool access and water sports." },
      { city: "Ras Al Khaimah", subCategory: "Adventure Packages", tourType: "Full-Day Tours", name: "Dubai & Ras Al Khaimah Twin Destination Escape", description: "Combine high-energy city vibes in Dubai with quiet mountain peaks of RAK." },
      { city: "Sharjah", subCategory: "City Tours Packages", tourType: "Cultural & Heritage Tours", name: "Sharjah & Abu Dhabi Cultural Grand Tour", description: "Explore majestic mosques, museums, and historical heritage quarters." },
      { city: "Dubai", subCategory: "City Tours Packages", tourType: "Full-Day Tours", name: "Dubai Heritage, Safari & Shopping Holiday", description: "A balanced weekly itinerary covering markets, old quarters, and sand dunes." },
      { city: "Abu Dhabi", subCategory: "City Tours Packages", tourType: "Luxury Experiences", name: "Abu Dhabi Yas Island & Louvre Luxury Getaway", description: "Bespoke hotel stay next to Yas Marina with cultural visits." },
      { city: "Sharjah", subCategory: "City Tours Packages", tourType: "Cultural & Heritage Tours", name: "Sharjah Art, Culture & Heritage Discovery Package", description: "Guided tour through art biennials and calligraphic heritage centers." },
      { city: "Ras Al Khaimah", subCategory: "Adventure Packages", tourType: "Adventure Experiences", name: "Ras Al Khaimah Mountain Sledder & Beach Package", description: "Ride the Jais Sledder coaster and unwind on golden beaches." },
      { city: "Dubai", subCategory: "City Tours Packages", tourType: "Family-Friendly Tours", name: "Dubai Family Explorer & Waterpark Holiday", description: "An action-packed package featuring Atlantis Aquaventure and Legoland." },
      { city: "Dubai", subCategory: "City Tours Packages", tourType: "Full-Day Tours", name: "UAE Grand Highlights Tour (7 Days, 6 Cities)", description: "The ultimate weekly tour covering all main landmarks and sights of the UAE." }
    ];

    const categoryHolidaysId = categoryMap.get("Holidays");

    for (const hol of holidaysRaw) {
      const subCategoryId = subCategoryMap.get(categoryHolidaysId.toString() + "_" + hol.subCategory);

      productsToCreate.push({
        name: hol.name,
        slug: toSlug(hol.name),
        city: cityMap.get(hol.city),
        category: categoryHolidaysId,
        subCategory: subCategoryId,
        tourType: tourTypeMap.get(hol.tourType),
        images: ["https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600"],
        location: `${hol.city}, UAE`,
        rating: 4.9,
        reviews: 18,
        pricing: {
          actualPrice: 1800,
          discountPrice: 1500,
          currency: "AED",
        },
        duration: "5 Days, 4 Nights",
        highlights: [{ title: "Package Details", description: hol.description, icon: "Globe" }],
        contentSections: [{ title: "Overview", description: hol.description }],
      });
    }

    console.log("Inserting products...");
    const seededProducts = await Product.create(productsToCreate);
    console.log(`Seeded ${seededProducts.length} products total.`);

    console.log("Database seeded successfully! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed database:", error);
    process.exit(1);
  }
};

seedDatabase();
