const Admin = require('../models/Admin')

exports.createAdmin = async (req, res) => {
    try {
        const { username, password, phone } = req.body
        const user = new Admin({ username, password, phone })
        const result = await user.save()
        res.status(200).json(result)
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const message = `${field} already Exist.`;
            return res.status(400).json({ message });
        }
        res.status(400).json({ message: error.message })
    }
}

exports.getAllAdmin = async (req, res) => {
    try {
        //const user = await Admin.find()
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(5)
        const skip = (page - 1) * limit
        const searchQuery = req.query.search || ''
        const match = searchQuery ? { username: new RegExp(searchQuery, 'i') } : {};
        const totalDocs = await Admin.countDocuments(match)
        const user = await Admin.aggregate([
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
                    username: 1,
                    password: 1,
                    phone: 1,
                    createdAt:1,
                    updatedAt:1
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
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getAdminbyId = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await Admin.findById(userId)
        if (!user) {
            res.status(404).json({ message: 'Admin Not Found!' })
        }
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.updateAdmin = async (req, res) => {
    try {
        const userId = req.params.id
        const updateData = req.body
        const existingUser = await Admin.findById(userId)
        if (!existingUser) {
            return res.status(404).json({ message: 'Admin not found!' });
        }

        if (updateData.username && updateData.username !== existingUser.username) {
            const emailExists = await Admin.findOne({ username: updateData.username })
            if (emailExists) {
                return res.status(400).json({ message: 'Duplicate email error: This email address is already in use.' });
            }
        }

        if (updateData.phone && updateData.phonen !== existingUser.phone) {
            const phoneExists = await Admin.findOne({ phone: updateData.phone })
            if (phoneExists) {
                return res.status(400).json({ message: 'Phone Number Exist!' });
            }
        }

        const updateUser = await Admin.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
        res.status(200).json(updateUser)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.deleteAdmin = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await Admin.deleteOne({ _id: userId })
        if (user.deletedCount === 0) {
            res.status(404).json({ message: 'Admin Not Found!' })
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}