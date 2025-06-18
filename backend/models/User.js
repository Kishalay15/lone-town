import mongoose, { mongo } from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
});
