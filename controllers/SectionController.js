const Section = require('../models/Section')

exports.addSection = async (req, res) => {
    try {
        const { section_name } = req.body
        const section = new Section({ section_name })
        const result = await section.save()
        res.status(200).json({
            message: "Section Added Successfully.",
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

exports.getSection=async(req,res)=>{
    try{
        const section = await Section.aggregate([
            {
                $project : {
                    section_name : 1,
                    createdAt:1
                }
            },
            {
                $sort : {
                    createdAt: -1
                }
            }
        ])
        res.status(200).json({
            data:section
        })
    }catch(error){
        res.status(500).json({ message: error.message })
    }
}
