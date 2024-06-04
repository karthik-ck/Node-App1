const School = require('../models/School')
const Student = require('../models/Student')
const mongoose = require('mongoose')

exports.createStudent = async (req, res) => {
    try {
        const { name, address, phone, class_id, section_id } = req.body
        const profile_image = req.file ? req.file.filename : null
        const getSchoolData = await School.find()
        let school_id = ""
        if (getSchoolData.length > 1) {
            school_id = getSchoolData[0]._id
        } else {
            school_id = ""
        }
        const branch_id = req.body.branch_id ? req.body.branch_id : null
        const user = new Student({ name, address, phone, profile_image, school_id, class_id, section_id, branch_id })
        const result = await user.save()
        res.status(200).json({ message: "Student Added Successfully..!" })
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const message = `${field} already Exist.`;
            return res.status(400).json({ message });
        }
        res.status(500).json({ message: error.message })
    }
}

exports.getAllStudent = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 5
        const skip = (page - 1) * limit
        const searchQuery = req.query.search || ''
        const schoolId = req.query.school_id || ''

        const match = {}
        if (searchQuery) {
            match.name = new RegExp(searchQuery, 'i')
        }
        if (schoolId) {
            match.school_id = new mongoose.Types.ObjectId(schoolId)
        }
        const totalDocs = await Student.countDocuments(match)

        const student = await Student.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'schools', // name of the collection to join
                    localField: 'school_id', // field from the Student collection
                    foreignField: '_id', // field from the School collection
                    as: 'school_details', // name of the array field to be added,
                    pipeline: [{
                        $project: {
                            school_name: 1,
                            school_address: 1,
                            school_logo: 1
                        }
                    }]
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'class_id',
                    foreignField: '_id',
                    as: 'class_name'
                }
            },
            {
                $lookup: {
                    from: 'sections',
                    localField: 'section_id',
                    foreignField: '_id',
                    as: 'section_name'
                }
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branch_id',
                    foreignField: '_id',
                    as: 'branch_name'
                }
            },
            {
                $unwind: "$school_details",
            },
            {
                $unwind: {
                    path: '$class_name',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$section_name',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: '$branch_name',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    school_name: "$school_details.school_name",
                    class_name: '$class_name.class_name',
                    section_name: '$section_name.section_name',
                    branch_name: '$branch_name.branch_name'
                }
            },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    address: 1,
                    phone: 1,
                    profile_image: 1,
                    school_details: 1,
                    school_name: 1,
                    class_name: 1,
                    section_name: 1,
                    branch_name: 1,
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
            data: student,
            page: page,
            limit: limit,
            totalDocs,
            totalPages: Math.ceil(totalDocs / limit)
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getStudentbyId = async (req, res) => {
    try {
        const studentId = req.params.id
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ message: "Invalid student ID" });
        }
        const student = await Student.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(studentId) } },
            {
                $lookup: {
                    from: 'schools',
                    localField: 'school_id',
                    foreignField: '_id',
                    as: 'school_details',
                    pipeline: [{
                        $project: {
                            school_name: 1,
                            school_address: 1,
                            school_logo: 1
                        }
                    }]
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'class_id',
                    foreignField: '_id',
                    as: 'class_name'
                }
            },
            {
                $lookup: {
                    from: 'sections',
                    localField: 'section_id',
                    foreignField: '_id',
                    as: 'section_name'
                }
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branch_id',
                    foreignField: '_id',
                    as: 'branch_name'
                }
            },
            {
                $unwind: '$school_details'
            },
            {
                $unwind: '$class_name',
            },
            {
                $unwind: '$section_name'
            },
            {
                $unwind: {
                    path: '$branch_name',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    school_name: '$school_details.school_name',
                    school_address: '$school_details.school_address',
                    school_logo: '$school_details.school_logo',
                    class_name: '$class_name.class_name',
                    section_name: '$section_name.section_name',
                    branch_name: '$branch_name.branch_name'
                }
            },
            {
                $project: {
                    name: 1,
                    address: 1,
                    phone: 1,
                    profile_image: 1,
                    school_name: 1,
                    school_address: 1,
                    school_logo: 1,
                    class_name: 1,
                    section_name: 1,
                    branch_name: 1,
                }
            }
        ])
        if (!student.length) {
            return res.status(404).json({ message: "Student Not Found..!" })
        }
        return res.status(200).json({
            data: student[0]
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.updateStudent = async (req, res) => {
    try {
        const studentId = req.params.id
        const updateData = req.body
        if (req.file) {
            updateData.profile_image = req.file.filename
        } else {
            delete updateData.profile_image
        }

        if (updateData.branch_id) {
            updateData.branch_id
        } else {
            updateData.branch_id = null
        }

        const existingUser = await Student.findById(studentId)
        if (!existingUser) {
            return res.status(404).json({ message: 'Student Not Found..!' })
        }

        if (updateData.phone && updateData.phone != existingUser.phone) {
            const phoneExist = await Student.findOne({ phone: updateData.phone })
            if (phoneExist) {
                return res.status(400).json({ message: 'Phone Number Already Exist..!' })
            }
        }

        const updateStudent = await Student.findByIdAndUpdate(studentId, updateData, { new: true, runValidators: true })
        return res.status(200).json({
            message: 'Student Updated Successfully..!',
            data: updateStudent
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id
        const student = await Student.deleteOne({ _id: studentId })
        if (student.deletedCount === 0) {
            return res.status(404).json({ message: 'Student Not Found..!' })
        }
        return res.status(200).json({ message: 'Student Deleted Successfully..!' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}