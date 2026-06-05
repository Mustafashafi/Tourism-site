const Booking = require("../models/Booking");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendNotification } = require("../utils/emailService");

/**
 * List all bookings with paging, search, status filters
 */
exports.getBookings = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.status && req.query.status !== "all") {
      filter.bookingStatus = req.query.status;
    }

    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod;
    }

    if (req.query.search) {
      filter.$or = [
        { bookingId: { $regex: req.query.search, $options: "i" } },
        { "customerDetails.fullName": { $regex: req.query.search, $options: "i" } },
        { "customerDetails.email": { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }

    const [data, totalItems] = await Promise.all([
      Booking.find(filter)
        .populate("items.product", "name images category city")
        .populate("customer", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return res.status(200).json({
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Get Bookings error:", error);
    return res.status(500).json({ message: "Failed to fetch bookings." });
  }
};

/**
 * Create a new booking (called on checkout or from admin console)
 */
exports.createBooking = async (req, res) => {
  try {
    const {
      customerId,
      customerDetails,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus,
      bookingStatus,
      pickupLocation,
      remarks,
    } = req.body;

    if (!customerDetails || !customerDetails.fullName || !customerDetails.email || !customerDetails.phone) {
      return res.status(400).json({ message: "Customer details are required." });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Booking items are required." });
    }

    // Generate unique booking ID
    const bookingId = `BK-${Math.floor(100000 + Math.random() * 900000)}`;

    const bookingPayload = {
      bookingId,
      customerDetails,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentStatus || (paymentMethod === "spot" ? "pending" : "paid"),
      bookingStatus: bookingStatus || "new",
      pickupLocation,
      remarks,
    };

    if (customerId) {
      bookingPayload.customer = customerId;
    } else {
      // Find customer by email if exists
      const existingUser = await User.findOne({ email: customerDetails.email.toLowerCase().trim() });
      if (existingUser) {
        bookingPayload.customer = existingUser._id;
      }
    }

    const booking = new Booking(bookingPayload);
    await booking.save();

    // Populate product details for templates
    const populatedBooking = await Booking.findById(booking._id).populate("items.product", "name");

    // Send email notifications
    const tokens = {
      bookingId,
      customerName: customerDetails.fullName,
      customerEmail: customerDetails.email,
      totalAmount: String(totalAmount),
      paymentMethod: paymentMethod === "spot" ? "Pay on the Spot" : "Online Pre-paid",
      bookingStatus: booking.bookingStatus,
    };

    // Send customer confirmation
    await sendNotification("newBookingCustomer", customerDetails.email, tokens);

    // Send admin notification
    await sendNotification("newBookingAdmin", "admin@carthagetravel.com", tokens);

    return res.status(201).json({
      message: "Booking created successfully.",
      data: booking,
    });
  } catch (error) {
    console.error("Create Booking error:", error);
    return res.status(500).json({ message: "Failed to create booking." });
  }
};

/**
 * Update payment status or booking status
 */
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, bookingStatus, pickupLocation, remarks } = req.body;

    const booking = await Booking.findById(id).populate("items.product", "name");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    const oldStatus = booking.bookingStatus;

    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (pickupLocation !== undefined) booking.pickupLocation = pickupLocation;
    if (remarks !== undefined) booking.remarks = remarks;

    await booking.save();

    // If status transitioned to completed, send completed notification
    if (bookingStatus === "completed" && oldStatus !== "completed") {
      const tokens = {
        bookingId: booking.bookingId,
        customerName: booking.customerDetails.fullName,
        customerEmail: booking.customerDetails.email,
        totalAmount: String(booking.totalAmount),
        paymentMethod: booking.paymentMethod,
        bookingStatus: "completed",
      };
      await sendNotification("bookingCompleted", booking.customerDetails.email, tokens);
    }

    return res.status(200).json({
      message: "Booking updated successfully.",
      data: booking,
    });
  } catch (error) {
    console.error("Update Booking error:", error);
    return res.status(500).json({ message: "Failed to update booking." });
  }
};

/**
 * Get reports and analytical statistics
 */
exports.getReports = async (req, res) => {
  try {
    // 1. Total revenue & total booking counts
    const bookings = await Booking.find({});
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalBookingsCount = bookings.length;

    // 2. Booking status aggregations
    const statusCounts = { new: 0, in_progress: 0, completed: 0, cancelled: 0 };
    bookings.forEach((b) => {
      if (statusCounts[b.bookingStatus] !== undefined) {
        statusCounts[b.bookingStatus]++;
      }
    });

    // 3. Customers count
    const totalCustomers = await User.countDocuments({ role: "user" });

    // 4. Recently registered profiles (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newCustomersCount = await User.countDocuments({ role: "user", createdAt: { $gte: thirtyDaysAgo } });

    // 5. Monthly revenue timeline data (last 6 months)
    const monthlyRevenue = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthlyRevenue[label] = 0;
    }

    bookings.forEach((b) => {
      const date = new Date(b.createdAt);
      const label = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (monthlyRevenue[label] !== undefined) {
        monthlyRevenue[label] += b.totalAmount || 0;
      }
    });

    const revenueTimeline = Object.entries(monthlyRevenue).map(([name, amount]) => ({
      name,
      amount,
    }));

    return res.status(200).json({
      summary: {
        totalRevenue,
        totalBookings: totalBookingsCount,
        totalCustomers,
        newCustomers30d: newCustomersCount,
        statusCounts,
      },
      revenueTimeline,
    });
  } catch (error) {
    console.error("Reports aggregation error:", error);
    return res.status(500).json({ message: "Failed to aggregate reports." });
  }
};
