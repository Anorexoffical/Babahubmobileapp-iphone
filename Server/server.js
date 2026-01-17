const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');


const app = express();

// app.use(cors());
const allowedOrigins = env.CORS_ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: allowedOrigins,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // <-- needed for PayFast notifyurl


const productRoutes = require('./Routes/ProductRoute');
const notifyRoutes = require('./Routes/Payment/notifyurl.js');
const orderRoutes = require('./Routes/OrderRoute.js');
const UserRoutes = require("./Routes/UserRoute.js");




// app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/products', productRoutes);
app.use('/api/order', orderRoutes);
app.use('/payment', notifyRoutes);
app.use("/api/users", UserRoutes);



mongoose.connect(env.MONGODB_URI)
  .then(() => console.log('Connected to the database.'))
  .catch((err) => console.error('Failed to connect to the database.', err));

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT} (env: ${env.NODE_ENV})`);
});