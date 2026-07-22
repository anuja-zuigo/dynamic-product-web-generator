import mongoose from "mongoose";

const importLogSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    insertedCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
    },
  },
  { timestamps: true }
);

const ImportLog = mongoose.model("ImportLog", importLogSchema);

export default ImportLog;
