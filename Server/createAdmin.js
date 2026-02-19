const mongoose = require("mongoose");
const User = require("./Models/UserModel");

// connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27018/Babhub", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: "admin@babahub.com" });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0);
    }

    const admin = new User({
      name: "Super-Admin",
      email: "admin@babahub.com",
      dob: "2002/01/02",
      password: "Admin@002",
      role: "admin",
    });

    await admin.save();
    console.log("Admin user created:", admin);
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
