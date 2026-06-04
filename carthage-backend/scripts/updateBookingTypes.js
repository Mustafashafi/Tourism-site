require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const activitiesCategory = await Category.findOne({ slug: 'activities' });
        
        if (!activitiesCategory) {
            console.error("Activities category not found");
            process.exit(1);
        }

        // Update all products in Activities category
        const result1 = await Product.updateMany(
            { category: activitiesCategory._id },
            { $set: { bookingType: 'check_availability' } }
        );
        console.log(`Updated ${result1.modifiedCount} activities products to check_availability`);

        // Update all other products
        const result2 = await Product.updateMany(
            { category: { $ne: activitiesCategory._id } },
            { $set: { bookingType: 'email' } }
        );
        console.log(`Updated ${result2.modifiedCount} other products to email`);

        console.log("Database update completed successfully.");
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
});
