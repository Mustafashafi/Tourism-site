const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("MONGO_URI is missing in .env");
  process.exit(1);
}

const customerData = [
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
  { name: "Rania Faris", email: "rania.faris@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop", role: "user" },
  { name: "Zain Malik", email: "zain.malik@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&auto=format&fit=crop", role: "user" },
  { name: "Leila Nasser", email: "leila.nasser@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1545996124-7b1b2b9f6c3b?w=100&auto=format&fit=crop", role: "user" },
  { name: "Omid Rahman", email: "omid.rahman@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop", role: "user" },
  { name: "Fatima Al Zahra", email: "fatima.alzahra@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop", role: "user" },
  { name: "Samir Qureshi", email: "samir.qureshi@carthagetravel.com", profilePicture: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop", role: "user" }
];

const seedDummyCustomers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    for (const customer of customerData) {
      await User.updateOne(
        { email: customer.email.toLowerCase() },
        {
          $set: {
            name: customer.name,
            profilePicture: customer.profilePicture,
            role: customer.role,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            email: customer.email.toLowerCase(),
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    const count = await User.countDocuments({ role: "user" });
    console.log(`Dummy customers seeded. Total user count: ${count}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed dummy customers:", error);
    process.exit(1);
  }
};

seedDummyCustomers();
