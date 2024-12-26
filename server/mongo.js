import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();
const MONGO_URL =
  "mongodb+srv://breechen88:Bree20058874824*@findash.lb1gi.mongodb.net/?retryWrites=true&w=majority&appName=FinDash";

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("mongodb connected");
  })
  .catch((e) => {
    console.log(e);
    console.log("failed");
  });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: false,
  },
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Record" }],
  alertType: {
    type: [String],
  },
  triggerType: {
    type: [String],
  },
  thresholds: {
    type: [Number],
  },
});

const symbolSchema = new mongoose.Schema({
  symbolName: { type: String, required: true },
  weight: { type: Number, required: true },
});

const recordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  portfolio: {
    type: [symbolSchema],
    required: true,
  },

  startTime: {
    type: Date,
    required: true,
  },

  endTime: {
    type: Date,
    required: true,
  },

  numSpan: {
    type: Number,
    required: true,
  },

  timeSpanUnit: {
    type: String,
    required: true,
  },

  optim: {
    type: [symbolSchema],
    required: false,
  },
});

export const user_collection = mongoose.model("User", userSchema);
export const record_collection = mongoose.model("Record", recordSchema);
