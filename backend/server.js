require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const crudRoutes = require('./routes/crudRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', crudRoutes);

// Root
app.get('/', (req, res) => res.send('API Running...'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
