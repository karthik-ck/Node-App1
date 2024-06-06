const AssignSubject = require('../models/AssignSubject')
const Subjects = require('../models/Subject')
const Student = require('../models/Student')

exports.assign = async (req, res) => {
    try {
        const { studentSubjects } = req.body
        if (!Array.isArray(studentSubjects)) {
            res.status(400).json({ message: 'studentSubjects Should be and array' })
        }

        for (let data of studentSubjects) {
            if (data.studentId.length !== 24) {
                return res.status(400).json({ message: `Invalid Id for studentId : ${data.studentId}` })
            }

            const existingData = await AssignSubject.findOne({
                'studentSubjects.studentId': data.studentId
            })

            if (existingData) {
                await AssignSubject.updateOne(
                    {
                        _id: existingData._id,
                        'studentSubjects.studentId': data.studentId
                    },
                    {
                        $set: {
                            'studentSubjects.$.subjectId': data.subjectId
                        }
                    }
                )
            } else {
                const user = new AssignSubject({ studentSubjects })
                await user.save()
            }
        }
        res.status(201).json({ message: 'Subjects assigned successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.listStudents = async (req, res) => {
    try {
        // const list = await AssignSubject.aggregate([
        //    {
        //     $project:{
        //            studentSubjects:1,
        //            subjectData:1
        //     }
        //    }
        // ])
        const list = await Student.aggregate([
            {
                $lookup: {
                    from: 'assignsubjects',
                    let : { studentId : '$_id'},
                    pipeline:[
                        {
                           $match:{
                              $expr:{
                                   $in: ['$$studentId','$studentSubjects.studentId']
                              }
                           }
                        },
                        {
                            $project : {
                                studentSubjects:{
                                    $filter:{
                                        input:'$studentSubjects',
                                        as:'item',
                                        cond: { $eq: ['$$item.studentId','$$studentId']}
                                    }
                                }
                            }
                        }
                    ],
                    as: 'subjectDetails'
                }
            },
            {
                $unwind:{
                    path:'$subjectDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields:{
                    subject_details:'$subjectDetails.studentSubjects'
                }
            },
            {
                $unwind:{
                    path:'$subject_details',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields:{
                    subject_details:'$subject_details.subjectId'
                }
            },
            {
                $project: {
                    name: 1,
                    phone: 1,
                    subject_details: 1
                }
            }
        ])
        const subject = await Subjects.aggregate([
            {
                $project: {
                    subject_name: 1
                }
            }
        ])
        return res.status(201).json(
            {
                studentData: list,
                subjectData: subject
            }
        )
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

