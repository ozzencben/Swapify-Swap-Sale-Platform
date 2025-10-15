require('dotenv').config();

const express = require('express');
const { createServer } = require('http');
const { initSocket } = require('./config/socket');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');
const userRoutes = require('./routes/user');
const notificationRoutes = require('./routes/notification');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const favoriteRoutes = require('./routes/favorite');
const addressRoutes = require('./routes/address');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// 🚫 Tarayıcı cache'ini tamamen devre dışı bırak
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// routes
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/addresses', addressRoutes);

// global error handler
app.use(errorHandler);

// http server
const server = createServer(app);
initSocket(server);

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
