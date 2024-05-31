const Customer = require('../models/Customer')
const mongoose = require('mongoose')

exports.addCustomer = async (req, res) => {
    try {
        const customers = req.body.customers;
        const parseCustomer = JSON.parse(customers)
        if (!Array.isArray(parseCustomer)) {
            return res.status(400).json({ message: 'Customers should be an array' });
        }
        const result = await Customer.insertMany(parseCustomer)
        return res.status(200).json({ message: 'Customers added successfully', data: result })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.getCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10
        const skip = (page - 1) * limit
        const searchQuery = req.query.search || ''
        const match = searchQuery ? { customer_name: new RegExp(searchQuery, 'i') } : {};
        const totalDocs = await Customer.countDocuments(match)

        const customer = await Customer.aggregate([
            { $match: match },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    customer_name: 1,
                    phone_number: 1,
                    email_id: 1,
                    address: 1,
                    createdAt: 1
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

exports.getCustomerbyId = async (req, res) => {
    try {
        const customerId = req.params.id
        const customer = await Customer.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(customerId) } },
            {
                $project: {
                    customer_name: 1,
                    phone_number: 1,
                    email_id: 1,
                    address: 1,
                }
            }
        ])
        if (!customer.length) {
            return res.status(404).json({ message: 'Customer Not Found.' })
        }
        return res.status(200).json({ data: customer[0] })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.updateCustomer = async (req, res) => {
    try {
        const customerId = req.params.id
        const updateData = req.body
        const existingCustomer = await Customer.findById(customerId)
        if (!existingCustomer) {
            return res.status(404).json({ message: 'Customer not found!' });
        }
        if (updateData.phone_number && updateData.phone_number != existingCustomer.phone_number) {
            const phoneExist = await Customer.findOne({ phone_number: updateData.phone_number })
            if (phoneExist) {
                return res.status(400).json({ message: 'Phone Number Already Exist.' })
            }
        }
        if (updateData.email_id && updateData.email_id != existingCustomer.email_id) {
            const emailExist = await Customer.findOne({ email_id: updateData.email_id })
            if (emailExist) {
                return res.status(400).json({ message: 'Email Id Already Exist.' })
            }
        }

        const updateCustomer = await Customer.findByIdAndUpdate(customerId, updateData, { new: true, runValidators: true })
        return res.status(200).json({ message: 'Customers Updated Successfully', data: updateCustomer })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.deleteCustomer = async(req,res)=>{
    try{
        const customerId = req.params.id
        const customer = await Customer.deleteOne({ _id: customerId })
        if (customer.deletedCount === 0){
            return res.status(404).json({message : 'Customer Not Found.'})
        }
        return res.status(200).json({ message: 'Customer Deleted Successfully.' })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}