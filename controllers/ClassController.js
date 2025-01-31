const Class = require('../models/Class')
const mongoose = require('mongoose')

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.addClass = async (req, res) => {
    try {
        const { class_name, section, branch, subject } = req.body

        const parseJsonArray = (str) => {
            if (typeof str === 'string' && str.trim() !== '') {
                try {
                    return JSON.parse(str);
                } catch (error) {
                    throw new Error(`Invalid JSON format for ${str}.`);
                }
            }
            return [];
        };

        const sectionsArray = parseJsonArray(section);
        const branchesArray = parseJsonArray(branch);
        const subjectArray = parseJsonArray(subject)

        const validSections = sectionsArray.filter(isValidObjectId).map(id => new mongoose.Types.ObjectId(id));
        const validBranches = branchesArray.filter(isValidObjectId).map(id => new mongoose.Types.ObjectId(id));
        const validSubjects = subjectArray.filter(isValidObjectId).map(id => new mongoose.Types.ObjectId(id));

        const classes = new Class({
            class_name,
            section: validSections,
            branch: validBranches,
            subject: validSubjects
        })
        const result = await classes.save()
        res.status(200).json({
            message: 'Class Added Successfully.',
            data: result
        })
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const message = `${field} already Exist.`;
            return res.status(400).json({ message });
        }
        res.status(500).json({ message: error.message })
    }
}

exports.getAllClass = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 10
        const skip = (page - 1) * limit
        const searchQuery = req.query.search || ''
        const match = searchQuery ? { class_name: new RegExp(searchQuery, 'i') } : {}
        const totalDocs = await Class.countDocuments(match)

        const classes = await Class.aggregate([
            { $match: match },
            {
                $lookup: {
                    from: 'sections',
                    localField: 'section',
                    foreignField: '_id',
                    as: 'sectionData',
                    pipeline: [{
                        $project: {
                            section_name: 1
                        }
                    }]
                }
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branch',
                    foreignField: '_id',
                    as: 'branchData',
                    pipeline: [{
                        $project: {
                            branch_name: 1
                        }
                    }]
                }
            },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'subject',
                    foreignField: '_id',
                    as: 'subjectData',
                    pipeline: [{
                        $project: {
                            subject_name: 1
                        }
                    }]
                }
            },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    class_name: 1,
                    sectionData: 1,
                    branchData: 1,
                    subjectData: 1,
                    createdAt: 1
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ])
        return res.status(200).json({
            data: classes,
            page: page,
            limit: limit,
            totalDocs,
            totalPages: Math.ceil(totalDocs / limit)
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getClassbyId = async (req, res) => {
    try {
        const classId = req.params.id
        const classes = await Class.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(classId)
                }
            },
            {
                $lookup: {
                    from: 'sections',
                    localField: 'section',
                    foreignField: '_id',
                    as: 'sectionData',
                    pipeline: [{
                        $project: {
                            section_name: 1
                        }
                    }]
                }
            },
            {
                $lookup: {
                    from: 'branches',
                    localField: 'branch',
                    foreignField: '_id',
                    as: 'branchData',
                    pipeline: [{
                        $project: {
                            branch_name: 1
                        }
                    }]
                }
            },
            {
                $lookup: {
                    from: 'subjects',
                    localField: 'subject',
                    foreignField: '_id',
                    as: 'subjectData',
                    pipeline: [{
                        $project: {
                            subject_name: 1
                        }
                    }]
                }
            },
            {
                $project: {
                    class_name: 1,
                    sectionData: 1,
                    branchData: 1,
                    subjectData: 1
                }
            }
        ])
        if (!classes.length) {
            return res.status(404).json({ message: "Class Not Found..!" })
        }
        return res.status(200).json({
            data: classes[0]
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.updateClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const updateData = req.body

        const parseJsonArray = (str) => {
            if (typeof str === 'string' && str.trim() !== '') {
                try {
                    return JSON.parse(str)
                } catch (error) {
                    throw new Error(`Invalid JSON format for ${str}.`);
                }
            }
            return [];
        };

        const validateObjectIds = (array) => {
            return array.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => new mongoose.Types.ObjectId(id));
        };

        const existingClass = await Class.findById(classId)
        if (!existingClass) {
            return res.status(404).json({ message: 'Class Not Found..!' })
        }
        if (updateData.class_name && updateData.class_name !== existingClass.class_name) {
            const classExist = await Class.findOne({ class_name: updateData.class_name })
            if (classExist) {
                return res.status(400).json({ message: 'Class Already Exist.' })
            }
        }

        if (updateData.section) {
            //updateData.section = parseJsonArray(updateData.section);
            const newSections = parseJsonArray(updateData.section);
            const validNewSections = validateObjectIds(newSections);
            updateData.section = [...new Set([...existingClass.section, ...validNewSections])]; // Merge and remove duplicates
        } else {
            updateData.section = existingClass.section
        }

        if (updateData.branch) {
            //updateData.branch = parseJsonArray(updateData.branch);
            const newBranches = parseJsonArray(updateData.branch);
            const validNewBranches = validateObjectIds(newBranches);
            updateData.branch = [...new Set([...existingClass.branch, ...validNewBranches])]; // Merge and remove duplicates
        } else {
            updateData.branch = existingClass.branch
        }

        if (updateData.subject) {
            const newSubjects = parseJsonArray(updateData.subject)
            const validNewSubjects = validateObjectIds(newSubjects)
            updateData.subject = [...new Set([...existingClass.subject, ...validNewSubjects])]
        } else {
            updateData.subject = existingClass.subject
        }

        const updateClass = await Class.findByIdAndUpdate(classId, updateData, { new: true, runValidators: true })
        return res.status(200).json({
            message: 'Class Updated Successfully',
            updateClass
        })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.deleteClass = async (req, res) => {
    try {
        const classId = req.params.id
        if (classId.length > 24) {
            return res.status(400).json({ message: 'Invalid Id.' })
        }
        const classes = await Class.deleteOne({ _id: classId })
        if (classes.deletedCount === 0) {
            return res.status(404).json({ message: 'No Class Found.' })
        }
        return res.status(200).json({ message: 'Class Deleted Successfully.' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}