const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const userExists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (userExists) return res.status(400).json({ message: "User already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { 
                name, 
                email: normalizedEmail, 
                password: hashedPassword,
                role: "user"  // Default to user, not admin
            },
        });

        res.status(201).json({ message: "User created successfully!", user: { id: newUser.id, email: newUser.email, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        // 1. Clean the input (remove spaces, newlines, and force lowercase)
        const email = req.body.email ? req.body.email.replace(/\s+/g, '').toLowerCase() : "";
        const password = req.body.password ? req.body.password.trim() : "";

        console.log(`🔍 Attempting login for: [${email}]`);

        // 2. Find user
        const user = await prisma.user.findUnique({ where: { email: email } });

        if (!user) {
            console.log(`❌ No user found in DB matching: [${email}]`);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log("✅ User found! Checking password...");

        // 3. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            console.log("❌ Password does not match.");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 4. Success - Generate Token
        const token = generateToken(user.id);
        
        res.status(200).json({
            message: "Login successful!",
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });

    } catch (error) {
        console.error("🔥 Login Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};