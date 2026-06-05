const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Booking = require("../models/Booking");
const Product = require("../models/Product");
const User = require("../models/User");
const Settings = require("../models/Settings");
// Ensure Category model is registered so populate() can resolve refs
const Category = require("../models/Category");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

const sampleUsers = [
  { name: "Aisha Khan", email: "aisha.khan@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop", role: "user" },
  { name: "Omar Aziz", email: "omar.aziz@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop", role: "user" },
  { name: "Nadia Saleh", email: "nadia.saleh@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop", role: "user" },
  { name: "Mark Thomas", email: "mark.thomas@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop", role: "user" },
  { name: "Sara Malik", email: "sara.malik@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=100&auto=format&fit=crop", role: "user" },
  { name: "Amir Hassan", email: "amir.hassan@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=100&auto=format&fit=crop", role: "user" },
  { name: "Priya Sharma", email: "priya.sharma@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop", role: "user" },
  { name: "David Lee", email: "david.lee@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop", role: "user" },
  { name: "Anna Petrov", email: "anna.petrov@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop", role: "user" },
  { name: "Karim Saleh", email: "karim.saleh@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&auto=format&fit=crop", role: "user" },
  { name: "Maya Johnson", email: "maya.johnson@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop", role: "user" },
  { name: "Hassan Ali", email: "hassan.ali@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop", role: "user" },
  { name: "Lina Hassan", email: "lina.hassan@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop", role: "user" },
  { name: "Alex Carter", email: "alex.carter@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop", role: "user" },
  { name: "Rania Faris", email: "rania.faris@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop", role: "user" }
];

const samplePhones = [
  "+971501234567",
  "+971509876543",
  "+971528765432",
  "+971542345678",
  "+971557654321",
  "+971582345678",
  "+971564321098",
  "+971553216789"
];

const statusWeights = [
  { status: "completed", weight: 40 },
  { status: "new", weight: 25 },
  { status: "in_progress", weight: 20 },
  { status: "cancelled", weight: 15 },
];

const paymentMethods = ["card", "etihad", "spot"];
const transferOptions = ["without_transfer", "shared", "private"];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPick = (array) => array[randomInt(0, array.length - 1)];

const chooseStatus = () => {
  const total = statusWeights.reduce((sum, item) => sum + item.weight, 0);
  let threshold = Math.random() * total;
  for (const item of statusWeights) {
    threshold -= item.weight;
    if (threshold <= 0) return item.status;
  }
  return "new";
};

const buildUsers = async () => {
  const existingUsers = await User.find({ role: "user" }).lean();
  const required = 20;
  const users = [...existingUsers];

  for (const userData of sampleUsers) {
    if (users.length >= required) break;
    const exists = users.some((u) => String(u.email).toLowerCase() === userData.email.toLowerCase());
    if (!exists) {
      const created = await User.create(userData);
      users.push(created);
    }
  }

  // If we still don't have enough users, create additional synthetic users
  let idx = 1;
  while (users.length < required) {
    const email = `guest${idx}@carthagetravel.com`;
    if (!users.some((u) => u.email === email)) {
      const created = await User.create({ name: `Guest ${idx}`, email, role: 'user' });
      users.push(created);
    }
    idx += 1;
  }

  return users;
};

const seedBookings = async (products) => {
  if (!products.length) {
    console.error("No products found in the database. Run the product seeder first.");
    process.exit(1);
  }

  const users = await buildUsers();
  if (!users.length) {
    console.error("Unable to seed users.");
    process.exit(1);
  }

  const now = new Date();
  // Seed bookings across the last 8 months (~240 days)
  const daysRange = 240;
  const bookingsToCreate = 70;
  const createPromises = [];

  // Ensure each existing user gets at least one booking first (for the current customers)
  for (let i = 0; i < users.length && i < bookingsToCreate; i++) {
    const selectedProduct = randomPick(products);
    const selectedCustomer = users[i];
    const daysAgo = randomInt(1, daysRange);
    const bookedAt = new Date(now);
    bookedAt.setDate(now.getDate() - daysAgo);

    const bookingStatus = chooseStatus();
    const paymentMethod = randomPick(paymentMethods);
    const paymentStatus = bookingStatus === "completed" ? "paid" : bookingStatus === "cancelled" ? "refunded" : paymentMethod === "spot" ? "pending" : randomPick(["paid", "pending"]);
    const price = selectedProduct.pricing?.discountPrice || selectedProduct.pricing?.actualPrice || randomInt(150, 850);
    const itemDate = new Date(bookedAt);
    itemDate.setDate(bookedAt.getDate() + randomInt(1, 30));

    const bookingPayload = {
      bookingId: `BK-${Date.now().toString().slice(-5)}-${i}-${randomInt(1000, 9999)}`,
      customer: selectedCustomer._id,
      customerDetails: {
        fullName: selectedCustomer.name || (selectedCustomer.email || '').split("@")[0],
        email: selectedCustomer.email,
        phone: randomPick(samplePhones),
      },
      items: [
        {
          product: selectedProduct._id,
          transferOption: randomPick(transferOptions),
          guests: { adult: randomInt(1, 3), child: randomInt(0, 2), infant: randomInt(0, 1) },
          price,
          date: itemDate,
        },
      ],
      totalAmount: price,
      paymentMethod,
      paymentStatus,
      bookingStatus,
      pickupLocation: selectedProduct.city?.name ? `Pickup from ${selectedProduct.city.name}` : "Airport pickup",
      remarks: "Generated booking for admin testing.",
        createdAt: bookedAt
    };

    createPromises.push(Booking.updateOne(
      { bookingId: bookingPayload.bookingId },
      { $setOnInsert: bookingPayload },
      { upsert: true }
    ));
  }

  // Create remaining bookings (if any) and assign to random users for realistic distribution
  for (let i = users.length; i < bookingsToCreate; i++) {
    const selectedProduct = randomPick(products);
    const selectedCustomer = randomPick(users);
    const daysAgo = randomInt(1, daysRange);
    const bookedAt = new Date(now);
    bookedAt.setDate(now.getDate() - daysAgo);

    const bookingStatus = chooseStatus();
    const paymentMethod = randomPick(paymentMethods);
    const paymentStatus = bookingStatus === "completed" ? "paid" : bookingStatus === "cancelled" ? "refunded" : paymentMethod === "spot" ? "pending" : randomPick(["paid", "pending"]);
    const price = selectedProduct.pricing?.discountPrice || selectedProduct.pricing?.actualPrice || randomInt(150, 850);
    const itemDate = new Date(bookedAt);
    itemDate.setDate(bookedAt.getDate() + randomInt(1, 30));

    const bookingPayload = {
      bookingId: `BK-${Date.now().toString().slice(-5)}-${i}-${randomInt(1000, 9999)}`,
      customer: selectedCustomer._id,
      customerDetails: {
        fullName: selectedCustomer.name || (selectedCustomer.email || '').split("@")[0],
        email: selectedCustomer.email,
        phone: randomPick(samplePhones),
      },
      items: [
        {
          product: selectedProduct._id,
          transferOption: randomPick(transferOptions),
          guests: { adult: randomInt(1, 3), child: randomInt(0, 2), infant: randomInt(0, 1) },
          price,
          date: itemDate,
        },
      ],
      totalAmount: price,
      paymentMethod,
      paymentStatus,
      bookingStatus,
      pickupLocation: selectedProduct.city?.name ? `Pickup from ${selectedProduct.city.name}` : "Airport pickup",
      remarks: "Generated booking for admin testing.",
        createdAt: bookedAt
    };

    createPromises.push(Booking.updateOne(
      { bookingId: bookingPayload.bookingId },
      { $setOnInsert: bookingPayload },
      { upsert: true }
    ));
  }

  await Promise.all(createPromises);
  console.log(`Seeded ${bookingsToCreate} booking records over the last 6 months.`);
};

const updateSettings = async (products) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings();

  if (!settings.siteContent?.aboutUs?.title) {
    settings.siteContent = {
      aboutUs: {
        title: "Welcome to Carthage Travel & Tourism",
        content: "We craft unforgettable UAE experiences with flexibility, transparency, and local expertise.",
        mission: "Deliver seamless travel experiences across the UAE for leisure and business travelers.",
        vision: "Be the first choice for travelers seeking premium UAE itineraries and reliable support.",
        heroImageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop",
        sectionImageUrl: "https://images.unsplash.com/photo-1551882547-ff37f1db8f69?q=80&w=1000&auto=format&fit=crop",
      },
    };
  }

  if (!settings.homepageCuration || !settings.homepageCuration.activities?.length) {
    const activityProducts = productsByCategory(products, ["activities"]);
    const cruiseProducts = productsByCategory(products, ["cruises"]);
    const holidayProducts = productsByCategory(products, ["holidays"]);
    settings.homepageCuration = {
      activities: activityProducts.slice(0, 8).map((p) => p._id),
      cruises: cruiseProducts.slice(0, 8).map((p) => p._id),
      holidays: holidayProducts.slice(0, 8).map((p) => p._id),
    };
  }

  if (!settings.contactDetails?.phone) {
    settings.contactDetails = {
      phone: "+971 4 123 4567",
      email: "info@carthagetravel.com",
      address: "Office 504, Business Bay, Dubai, UAE",
      description: "For bookings, support or partnerships, contact our UAE travel experts.",
    };
  }

  await settings.save();
  console.log("Updated site settings and homepage curation defaults.");
};

const productsByCategory = (productList, categoryKeywords) => {
  return productList.filter((product) => {
    const slug = String(product.category?.slug || "").toLowerCase();
    const name = String(product.category?.name || "").toLowerCase();
    return categoryKeywords.some((keyword) => slug.includes(keyword) || name.includes(keyword));
  });
};

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    const products = await Product.find({}).populate("category", "slug name").limit(500);
    await seedBookings(products);
    await updateSettings(products);

    console.log("Dummy booking seed complete. You can now refresh the admin dashboard.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed dummy data:", error);
    process.exit(1);
  }
}

run();
