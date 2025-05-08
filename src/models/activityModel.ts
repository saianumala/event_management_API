import mongoose, { Document } from "mongoose";

interface ActivityInterface extends Document {
  organizer: mongoose.Schema.Types.ObjectId;
  title: string;
  description: string;
  activityType: "free" | "paid";
  price?: number;
  totalSeats: number;
  availableSeats?: number;
  location: string;
  date: Date;
}

const activitySchema = new mongoose.Schema<ActivityInterface>({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  totalSeats: {
    type: Number,
    required: true,
    min: 1,
  },
  availableSeats: {
    type: Number,
  },
  activityType: {
    type: String,
    enum: ["free", "paid"],
    default: "free",
  },
  price: {
    type: Number,
    validate: {
      validator: function (this: ActivityInterface) {
        return this.activityType === "free"
          ? this.price === 0 || this.price === null
          : true;
      },
      message: "Price must be 0 or null for free activities.",
    },
  },
  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

activitySchema.pre("save", function (next) {
  if (this.activityType === "free") {
    this.price = 0;
  }
  next();
});

const Activity = mongoose.model("Activity", activitySchema);

export { Activity };
