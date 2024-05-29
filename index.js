const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/UserRoutes');
const adminRoutes = require('./routes/AdminRoutes')
const schoolRoutes = require('./routes/SchoolRoutes')
const studentRoutes = require('./routes/StudentRoutes')

const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/testDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

// Use routes
app.use('/api', userRoutes);
app.use('/admin', adminRoutes)
app.use('/school',schoolRoutes)
app.use('/student',studentRoutes)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
