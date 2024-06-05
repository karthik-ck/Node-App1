const Attendance = require('../models/Attendance')
const mongoose = require('mongoose')
const Student = require('../models/Student')

exports.markAttendance = async (req, res) => {
    try {
        const { attendance_year, attendance_month, attendance_date, attendanceData } = req.body
        if (!Array.isArray(attendanceData)) {
            return res.status(400).json({ message: "AttendanceData Should be an Array." })
        }

        for (let data of attendanceData) {
            if (data.student_id.length !== 24) {
                return res.status(400).json({ message: `Invalid Id for student_id : ${data.student_id}` })
            }

            const attendanceRecord = await Attendance.findOne({
                attendance_year,
                attendance_month,
                attendance_date,
                'attendanceData.student_id': data.student_id
            })

            if (attendanceRecord) {
                await Attendance.updateOne(
                    {
                        _id: attendanceRecord._id,
                        'attendanceData.student_id': data.student_id
                    },
                    {
                        $set: {
                            'attendanceData.$.attendance': data.attendance
                        }
                    }
                )
            } else {
                const user = new Attendance({ attendance_year, attendance_month, attendance_date, attendanceData })
                await user.save()
            }
        }
        return res.status(201).json({ message: "Attendance Updated Successfully." })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.getAttandanceDetails = async (req, res) => {
    try {
        const filteredDate = req.query.filteredDate || ''
        const classId = req.query.classId || ''
        const sectionId = req.query.sectionId || ''
        const branchId = req.query.branchId || ''
        let match = {}
        if (filteredDate) {
            match.attendance_date = filteredDate
        }
        if (classId) {
            match.classId = new mongoose.Types.ObjectId(classId)
        }
        if (sectionId) {
            match.sectionId = new mongoose.Types.ObjectId(sectionId)
        }
        if (branchId) {
            match.branchId = new mongoose.Types.ObjectId(branchId)
        }

        const list = await Attendance.aggregate([
            {
                $unwind: '$attendanceData'
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'attendanceData.student_id',
                    foreignField: '_id',
                    as: 'studentData'
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'studentData.class_id',
                    foreignField: '_id',
                    as: 'classname'
                }
            },
            {
                $unwind: {
                    path: '$classname',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'sections',
                    localField: 'studentData.section_id',
                    foreignField: '_id',
                    as: 'sectionname'
                }
            },
            {
                $unwind: {
                    path: '$sectionname',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'studentData.branch_id',
                    foreignField: '_id',
                    as: 'branchname'
                }
            },
            {
                $unwind: {
                    path: '$branchname',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: '$studentData'
            },
            {
                $addFields: {
                    attendance: '$attendanceData.attendance',
                    name: '$studentData.name',
                    phone: '$studentData.phone',
                    _id: '$studentData._id',
                    class: '$classname.class_name',
                    classId: '$classname._id',
                    section: '$sectionname.section_name',
                    sectionId: '$sectionname._id',
                    branch: '$branchname.branch_name',
                    branchId: '$branchname._id'
                }
            },
            {
                $match: match
            },
            {
                $project: {
                    attendance_year: 1,
                    attendance_month: 1,
                    attendance_date: 1,
                    name: 1,
                    phone: 1,
                    attendance: 1,
                    class: 1,
                    section: 1,
                    branch: 1,
                    classId: 1,
                    sectionId: 1,
                    branchId: 1
                }
            }
        ])
        return res.status(201).json({ data: list })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.getStudentAttendance = async (req, res) => {
    try {
        const filteredDate = req.query.filteredDate || ''
        const classId = req.query.classId || ''
        const sectionId = req.query.sectionId || ''
        const branchId = req.query.branchId || ''
        const match = {}
        if (filteredDate) {
            match.attendanceDate = filteredDate
        }
        if (classId) {
            match.class_id = new mongoose.Types.ObjectId(classId)
        }
        if (sectionId) {
            match.section_id = new mongoose.Types.ObjectId(sectionId)
        }
        if (branchId) {
            match.branch_id = new mongoose.Types.ObjectId(branchId)
        }

        const list = await Student.aggregate([
            {
                $lookup: {
                    from: 'attendances',
                    let: { studentId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ['$$studentId', '$attendanceData.student_id']
                                }
                            }
                        },
                        {
                            $project: {
                                attendance_year: 1,
                                attendance_month: 1,
                                attendance_date: 1,
                                attendanceData: {
                                    $filter: {
                                        input: '$attendanceData',
                                        as: 'item',
                                        cond: { $eq: ['$$item.student_id', '$$studentId'] }
                                    }
                                }
                            }
                        }
                    ],
                    as: 'attendanceDetails'
                }
            },
            {
                $unwind: {
                    path: '$attendanceDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    attendanceData: '$attendanceDetails.attendanceData',
                    attendanceDate: '$attendanceDetails.attendance_date'
                }
            },
            {
                $unwind: {
                    path: '$attendanceData',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    attendance: '$attendanceData.attendance'
                }
            },
            {
                $lookup: {
                    from: 'classes',
                    localField: 'class_id',
                    foreignField: '_id',
                    as: 'className'
                }
            },
            {
                $unwind: {
                    path: '$className',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    class: '$className.class_name',
                    class_id: '$className._id'
                }
            },
            {
                $lookup: {
                    from: 'sections',
                    localField: 'section_id',
                    foreignField: '_id',
                    as: 'section'
                }
            },
            {
                $unwind: {
                    path: '$section',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    section: '$section.section_name',
                    section_id: '$section._id'
                }
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branch_id',
                    foreignField: '_id',
                    as: 'branch'
                }
            },
            {
                $unwind: {
                    path: '$branch',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    branch: '$branch.branch_name',
                    branch_id: '$branch._id'
                }
            },
            {
                $match: match
            },
            {
                $project: {
                    name: 1,
                    phone: 1,
                    attendance: 1,
                    class: 1,
                    section: 1,
                    branch: 1
                }
            }
        ])
        return res.status(201).json({ data: list })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}