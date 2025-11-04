const User = require("../model/user");


const registerUser = async(req,res)=>{

    const{username,password } = req.body;

    try{
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if(existingUser){
            return res.status(400).json({ message: "Username already exists" });
        }else{

            const newUser = new User({ username, password });
            await newUser.save();
            res.status(201).json({ message: "User registered successfully" });
        }
        

    }
    catch(error){
        res.status(500).json({ message: "Server error" });


} }

exports.module = { registerUser };
