const School = require('../models/School')
const mongoose = require('mongoose')

exports.createSchool = async (req, res) => {
    try {
        const { school_name, school_address } = req.body
        const school_logo = req.file ? req.file.filename : null
        const school = new School({ school_name, school_address, school_logo })
        const result = await school.save()
        res.status(200).json({ message: 'School Added Successfully.!' })
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const message = `${field} already Exist.`;
            return res.status(400).json({ message });
        }
        res.status(400).json({ message: error.message })
    }
}

exports.getAllSchool = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 5
        const skip = (page - 1) * limit
        const searchQuery = req.query.search || ''
        const match = searchQuery ? { school_name: new RegExp(searchQuery, 'i') } : {}
        const totalDocs = await School.countDocuments(match)

        const school = await School.aggregate([
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
                    school_name: 1,
                    school_address: 1,
                    school_logo: 1,
                    createdAt: 1,
                    updatedAt: 1
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ])
        res.status(200).json({
            data: school,
            page: page,
            limit: limit,
            totalDocs,
            totalPages: Math.ceil(totalDocs / limit)
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getSchoolbyId = async (req, res) => {
    try {
        const userId = req.params.id
        //const user = await School.findById(userId)
        const user = await School.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(userId) } },
            {
                $project: {
                    school_name: 1,
                    school_address: 1,
                    school_logo: 1
                }
            }
        ])
        if (!user.length) {
            res.status(404).json({ message: 'School Not Found!' })
        }
        res.status(200).json(user[0])
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.updateSchool = async (req, res) => {
    try {
        const userId = req.params.id
        const updateData = req.body
        if (req.file) {
            updateData.school_logo = req.file.filename;
        }else{
            delete updateData.school_logo
        }
        const existingUser = await School.findById(userId)
        if (!existingUser) {
            return res.status(404).json({ message: 'School not found!' });
        }

        if (updateData.school_name && updateData.school_name !== existingUser.school_name){
            const schoolExists = await School.findOne({ school_name: updateData .school_name})
            if (schoolExists) {
                return res.status(400).json({ message: 'School Number Exist.' });
            }
        }

        const updateUser = await School.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
        res.status(200).json({ message: 'School Updated Successfully.!' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}