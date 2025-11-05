const User = require("../model/user");

const registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// SIGNIN
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        let existingUser = await User.findOne({ username });
        
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare password (assuming you have a comparePassword method in your User model)
        const isPasswordValid = await existingUser.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Successful login
        res.status(200).json({ 
            message: "Login successful",
            user: {
                id: existingUser._id,
                username: existingUser.username
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const getAllUser = async (req, res) => {
    try {
        const allUsers = await User.find().select('-password'); // Exclude password field
        res.status(200).json(allUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { registerUser, login, getAllUser };