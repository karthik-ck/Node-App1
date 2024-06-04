const Login = require('../models/Login')
const { jwtSecret } = require('../config')
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const userExist = await Login.findOne({ email })
        if (userExist) {
            return res.status(400).json({ message: 'User Already Exist.' })
        }
        const user = new Login({ name, email, password })
        const result = await user.save()
        const token = jwt.sign({ id: user._id }, jwtSecret, {
            expiresIn: '3h',
        });
        return res.status(201).json({
            token,
            user: result
        });
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.registerdUser = async (req, res) => {
    try {
        const user = await Login.aggregate([
            {
                $project: {
                    name: 1,
                    email: 1,
                    createdAt: 1
                }
            }
        ])
        res.status(200).json({
            data: user
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await Login.findOne()
        if (!user || !(await user.matchPassword(password))) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user._id }, jwtSecret, {
            expiresIn: '1h',
        });
        return res.json(
            {
                token,
                data: user
            }
        );
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}