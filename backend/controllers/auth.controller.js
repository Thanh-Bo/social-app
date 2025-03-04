import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../utils/jwt.js";
import bcrypt from 'bcryptjs';
export const signup = async (req, res) => {
    try {
        const {fullName , username , email , password} = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!fullName || !username || !email || !password){
            return res.status(400).json({ error : "All fields are required"});
        }
        if (!emailRegex.test(email)){
            return res.status(400).json({ error : "Invalid email format"});
        }
        const existingUser = await User.findOne({ username});
        if (existingUser) return res.status(400).json({ error : "Username is already taken"});
        const existingEmail = await User.findOne( {email});
        if(existingEmail){
            return res.status(400).json({ error : "Email is already taken"});
        }
        if (password.length < 6){
            return res.status(400).json({ error : "Password must be at least 6 characters long"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName, 
            username , 
            email , 
            password : hashedPassword,
        });

        await newUser.save();
        generateTokenAndSetCookie(newUser._id , res);

        res.status(201).json({
            message : "User created successfully",
            ...newUser._doc,
            password : undefined,
        })

    }
    catch(error){
        console.log("Error in signup controller : ", error.message);
        return res.status(400).json({ error : error.message})
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Ensure both username and password are provided
        if (!username || !password) {
            return res.status(400).json({ error: "We need both username and password" });
        }

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid username or password" });
        }

        // Generate token and set cookie
        generateTokenAndSetCookie(user._id, res);

        // Send user data as response
        res.status(200).json({
            message: "Login successfully",
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        });
    } catch (error) {
        console.log("Error in login controller: ", error.message);
        // Respond with a 500 error for server issues
        res.status(500).json({ error: "Internal server error" });
    }
};



export const logout = async  (req, res) => {
    try {
        res.cookie('jwt', "", {maxAge:0});
        res.status(200).json( {message : "Logged out successfully"})
    }
    catch(error){
        console.log("Error in logout controller : ", error.message);
        res.status(400).json({error : error.message});
    }
}
export const auth = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    }
    catch(error){
        console.log("Error in auth controller : ", error.message);
        res.status(400).json({ error : error.message});
    }
}

