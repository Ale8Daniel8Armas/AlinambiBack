const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  description: { type: String, default: "" },
  imageId: { type: mongoose.Schema.Types.ObjectId, required: true },
  filename: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Crear el modelo TeamMember
const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

module.exports = TeamMember;
