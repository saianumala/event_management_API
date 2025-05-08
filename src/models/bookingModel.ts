import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity",
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "pending"],
    default: "pending",
  },
  bookingStatus: {
    type: String,
    enum: ["pending", "confirmed", "canceled"],
    default: "pending",
  },
  bookedDate: {
    type: Date,
    default: new Date(),
  },
});

export const Booking = mongoose.model("Booking", bookingSchema);
