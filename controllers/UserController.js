const User = require('../models/User');

exports.createUser = async (req, res) => {
    try {
        const { name, age, email, phone } = req.body;
        const user = new User({ name, age, email, phone });
        const result = await user.save();
        res.status(201).json(result);
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const message = `${field} already Exist.`;
            return res.status(400).json({ message });
        }
        res.status(400).json({ message: error.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 5
        const skip = (page - 1) * limit
        const searchQuery = req.query.search || ''
        const match = searchQuery ? { name: new RegExp(searchQuery, i) } : {}
        const totalDocs = await User.countDocuments(match)
        const user = await User.aggregate([
            {
                $match: match
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $project: {
                    name: 1,
                    age: 1,
                    email: 1,
                    phone: 1
                }
            }
        ])
        res.status(200).json({
            data: user,
            totalDocs,
            page: page,
            limit: limit,
            totalPages: Math.ceil(totalDocs / limit)
        })

        // const page = parseInt(req.query.page)
        // const limit = 5
        // const skip = (page - 1) * limit
        // const users = await User.find().skip(skip).limit(limit);
        // const totalDocs = await User.countDocuments();
        // res.status(200).json({
        //     data:users,
        //     totalDocs,
        //     totalPages: Math.ceil(totalDocs / limit),
        //     page: page,
        //     limit:limit
        // });;
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUserbyId = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        if (!user) {
            res.status(404).json({ message: 'User not found!' })
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.deleteUserbyId = async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await User.deleteOne({ _id: userId })
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'User not found!' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found!' });
        }

        if (updateData.email && updateData.email !== existingUser.email) {
            const emailExists = await User.findOne({ email: updateData.email });
            if (emailExists) {
                return res.status(400).json({ message: 'Duplicate email error: This email address is already in use.' });
            }
        }

        if (updateData.phone && updateData.phone !== existingUser.phone) {
            const phoneExists = await User.findOne({ phone: updateData.phone })
            if (phoneExists) {
                return res.status(400).json({ message: 'Phone Number Exist.' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getUserCount = async (req, res) => {
    try {
        const user = await User.find()
        const count = user.length
        res.status(200).json({ 'count': count })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
