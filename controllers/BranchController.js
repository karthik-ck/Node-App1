const Branch = require('../models/Branch')

exports.addBranch = async (req, res) => {
    try {
        const { branch_name } = req.body
        const branch = new Branch({ branch_name })
        const result = await branch.save()
        res.status(200).json({
            message: "Branch Added Successfully.",
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

exports.getBranch = async (req, res) => {
    try {
        const branch = await Branch.aggregate([
            {
                $project: {
                    branch_name: 1,
                    createdAt: 1
                }
            },
            {
                $sort:{
                    createdAt: -1
                }
            }
        ])
        res.status(200).json({
            data: branch
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}