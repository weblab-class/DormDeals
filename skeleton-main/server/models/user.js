const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  picture: Image,
  description: String,
  email: String,
});

// compile model from schema
module.exports = mongoose.model("user", UserSchema);
