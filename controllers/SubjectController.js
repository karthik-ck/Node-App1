const Subject = require("../models/Subject");
const xlsx = require("xlsx");

exports.addSubject = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const excelData = xlsx.utils.sheet_to_json(sheet);

        const errors = [];
        for (let record of excelData) {
            const existingSubject = await Subject.findOne({
                $or: [
                    { subject_name: record.subject_name },
                    { subject_code: record.subject_code },
                ],
            });

            if (existingSubject) {
                errors.push(
                    `Duplicate subject: ${record.subject_name} (${record.subject_code})`
                );
                continue;
            }

            const newSubject = new Subject({
                subject_name: record.subject_name,
                subject_code: record.subject_code,
                subject_type: record.subject_type,
            });

            await newSubject.save();
        }

        if (errors.length > 0) {
            return res
                .status(400)
                .json({ message: "Errors occurred during upload", errors });
        }

        return res.status(200).json({ message: "Subjects uploaded successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.getSubjects = async (req, res) => {
    try {
        const subject = await Subject.aggregate([
            {
                $project: {
                    subject_name: 1,
                    subject_code: 1,
                    subject_type: 1,
                    createdAt: 1,
                },
            },
        ]);
        return res.status(200).json({ data: subject });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

exports.downloadSubject = async (req, res) => {
    try {
        const subject = await Subject.aggregate([
            {
                $project: {
                    subject_name: 1,
                    subject_code: 1,
                    subject_type: 1,
                    createdAt: 1,
                },
            },
        ]);

        if (subject.length === 0) {
            return res.status(404).json({ message: "No subjects found." });
        }

        const subjectsData = subject.map((sub) => ({
            subject_name: sub.subject_name,
            subject_code: sub.subject_code,
            subject_type: sub.subject_type,
            createdAt: sub.createdAt,
        }));

        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(subjectsData);

        // Append the worksheet to the workbook
        xlsx.utils.book_append_sheet(workbook, worksheet, "Subjects");

        // Write the workbook to a buffer
        const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="subjects.xlsx"'
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.send(buffer);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
