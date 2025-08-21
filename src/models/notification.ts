// models/Notification.ts
import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema({
  doctor: { type: String, required: true },  // username del doctor
  patient: { type: String },
  message: { type: String, required: true },
  type: { type: String, default: "patientAlert" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Notification", notificationSchema);
