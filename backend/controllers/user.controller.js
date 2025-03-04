import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import {v2 as cloudinary} from 'cloudinary';
import mongoose from "mongoose";
export const getUserProfile = async (req, res) => {
    const {username} = req.params;
    try {
        const user = await User.findOne( {username }).select('-password');
        if (!user) return res.status(404).json({ error : "User not found"});
        res.status(200).json(user);
    }
    catch(error){
        console.log("Error in getUserProfile : ", error.message);
        res.status(500).json({ error : error.message});
    }
};

export const followUnfollowUser = async (req, res) => {
    try {
        // id user want to follow or unfollow
        const {id}  = req.params;
        // Check if the id is a valid ObjectId
        // Missing 1 or 2 will throw this error
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid User ID format" });
        }
        //This is user want to follow or unfollow
        const userToModify = await User.findById(id);
        // User current logged-in
        const currentUser = await User.findById(req.user._id);
        // You can't follow or unfollow yourself
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error : "You can't follow or unfollow yourself"})
        }
        // User not found when u type wrong but with 24-characters string
        if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });
        // Check if current user already follow the other user
        const isFollowing = currentUser.following.includes(id);
        // Unfollow user
        if (isFollowing){
            // Remove follower 
            await User.findByIdAndUpdate(id , {$pull : {followers : req.user._id}})
            // Remove following in current account
            await User.findByIdAndUpdate(req.user._id , {$pull : {following : id}});
            
            res.status(200).json({ message : "User unfollowed successfully"});
        }
        else {
            // Add current user in user followers
            await User.findByIdAndUpdate(id , {$push : {followers : req.user._id}})
            // Adding user want to add  in current user
            await User.findByIdAndUpdate(req.user._id , {$push : {following : id}});
            /// Send notification to the user
            const newNotification = new Notification({
                type : "follow",
                from : req.user._id,
                // add ._id mean conver it to subject not string (id);
                to : userToModify._id,
            });

            await newNotification.save();

            res.status(200).json({ message : "User followed successfully"})
        }
    }
    catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
}

export const setSuggestedUsers = async (req, res) => {
    try {   
        /// current user id
        const userId = req.user._id;
        // find current user following
        const usersFollwedByMe = await User.findById(userId).select('following');
        // find random user (excluding current user)
        const users = await User.aggregate([
            {
                $match : {
                    _id : { $ne : userId},
                },
            },
            {
                $sample : {size : 10}
            },
        ])
        // Filter out users the current user is already following
        const filteredUsers = users.filter(( user) => !usersFollwedByMe.following.includes(user._id));
        
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);
    }
    catch (error) {
		console.log("Error in getSuggestedUsers: ", error.message);
		res.status(500).json({ error: error.message });
	}
}

export const updatedUser = async (req, res) => {
    // i dont get currentPassword and newPassword
    const {fullName , email , username, currentPassword , newPassword, bio , link} = req.body;
    // use can modify image, const not
    let {profileImg , coverImg} = req.body;

    const userId = req.user._id;

    try {
        let user = await User.findById(userId);
        if (!user ) return res.status(404).json({ error : "User not found"})

        if ((!newPassword && currentPassword) || (newPassword && !currentPassword)){
            return res.status(400).json({ error  : "Please provide both current password and new password"})
        }

        if (newPassword && currentPassword) {
            // check if it match
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) return res.status(400).json({ error : "Current password is incorrect"});
            // Check length new password
            if (newPassword.length < 6){
                return res.status(400).json({error : "Password must be at least 6 characters long"});
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword , salt);
        }

        if (profileImg) {
			if (user.profileImg) {
				// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}


        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;
        
        user = await user.save();

        // modify password null in response
        user.password = null ; 
        res.status(200).json(user);
    }
    catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}  
}


