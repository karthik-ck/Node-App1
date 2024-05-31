const Party = require('../models/Parties')
const mongoose = require('mongoose')

exports.addParty = async (req, res) => {
    try {
        const { parties, amount } = req.body;
        if (!Array.isArray(parties)) {
            return res.status(400).json({ message: 'Party should be an array' });
        }
        const partyDocs = new Party({ parties, amount })
        const result = await partyDocs.save()
        return res.status(200).json({ message: 'Party added successfully', data: result })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.getParty = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10
        const skip = (page - 1) * limit
        const searchQuery = req.query.search || ''
        const match = searchQuery ? { party_name: new RegExp(searchQuery, 'i') } : {};
        const totalDocs = await Party.countDocuments(match)

        const customer = await Party.aggregate([
            { $match: match },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    parties: 1,
                    amount: 1,
                }
            }
        ])
        res.status(200).json({
            data: customer,
            page: page,
            limit: limit,
            totalDocs,
            totalPages: Math.ceil(totalDocs / limit)
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.getPartybyId = async (req, res) => {
    try {
        const customerId = req.params.id
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        const customer = await Party.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(customerId) } },
            {
                $project: {
                    parties: {
                        party_name: 1,
                        phone_number: 1,
                        email_id: 1,
                        address: 1
                    },
                    amount: 1,
                }
            }
        ])
        if (!customer.length) {
            return res.status(404).json({ message: 'Party Not Found.' })
        }
        return res.status(200).json({ data: customer[0] })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.updateParty = async (req, res) => {
    try {
        const partyId = req.params.id
        const updateData = req.body
        if (!mongoose.Types.ObjectId.isValid(partyId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        if (!Array.isArray(updateData.parties)) {
            return res.status(400).json({ message: 'Party should be an array' });
        }
        const existingParty = await Party.findById(partyId)
        if (!existingParty) {
            return res.status(404).json({ message: 'Party not found!' });
        }
        // for (const party of updateData.parties) {
        //     for (const val of existingParty.parties) {
        //         if (party.phone_number && party.phone_number !== val.phone_number) {
        //             const phoneExist = await Party.findOne({ 'parties.phone_number': party.phone_number });
        //             if (phoneExist) {
        //                 return res.status(400).json({ message: `${party.phone_number} Phone Number Already Exists.` });
        //             }
        //         }
        //         if (party.email_id && party.email_id !== val.email_id) {
        //             const emailExist = await Party.findOne({ 'parties.email_id': party.email_id });
        //             if (emailExist) {
        //                 return res.status(400).json({ message: `${party.email_id} Email Id Already Exists.` });
        //             }
        //         }
        //     }
        // }

        const updateCustomer = await Party.findByIdAndUpdate(partyId, updateData, { new: true, runValidators: true })
        return res.status(200).json({ message: 'Party Updated Successfully', data: updateCustomer })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.deleteParty = async (req, res) => {
    try {
        const customerId = req.params.id
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        const customer = await Party.deleteOne({ _id: customerId })
        if (customer.deletedCount === 0) {
            return res.status(404).json({ message: 'Party Not Found.' })
        }
        return res.status(200).json({ message: 'Party Deleted Successfully.' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}