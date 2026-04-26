// ✅ ये कोड सबसे पहले डालो (लाइन नंबर 1)
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// फिर बाकी तुम्हारा कोड
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;