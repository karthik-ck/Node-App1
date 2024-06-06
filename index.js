const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const protect = require('./middleware/auth')
const userRoutes = require('./routes/UserRoutes');
const adminRoutes = require('./routes/AdminRoutes')
const schoolRoutes = require('./routes/SchoolRoutes')
const studentRoutes = require('./routes/StudentRoutes')
const sectionRoutes = require('./routes/SectionRoutes')
const branchRoutes = require('./routes/BranchRoutes')
const classRoutes = require('./routes/ClassRoutes')
const authRoutes = require('./routes/AuthRoutes')
const customerRoutes = require('./routes/CustomerRoutes')
const partyRoutes = require('./routes/PartyRoutes')
const subjectRoutes = require('./routes/SubjectRoutes')
const attendanceRoutes = require('./routes/AttendanceRoutes')
const assignStudentRoutes = require('./routes/AssignSubjectRoutes')

dotenv.config();

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
app.use('/api/auth',authRoutes)
app.use(protect)
app.use('/api', userRoutes);
app.use('/admin', adminRoutes)
app.use('/school',schoolRoutes)
app.use('/student',studentRoutes)
app.use('/section',sectionRoutes)
app.use('/branch',branchRoutes)
app.use('/class',classRoutes)
app.use('/customer',customerRoutes)
app.use('/party',partyRoutes)
app.use('/subject',subjectRoutes)
app.use('/attendance',attendanceRoutes)
app.use('/assign-subject-student',assignStudentRoutes)

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
