import path from "path";
import express from 'express';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js'
import postRoutes from './routes/post.route.js'
import notificationRoutes from './routes/notification.route.js'
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from 'cloudinary';
dotenv.config();
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});
const PORT = process.env.PORT || 8000;
const __dirname = path.resolve();

const app = express();


app.use(express.json({ limit: "10gb" })); // 10GB limit
app.use(express.urlencoded({ limit: "10gb", extended: true })); // Extend URL-encoded data size

app.use(cookieParser());
console.log(process.env.MONGO_URI);
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes);
app.use('/api/posts',postRoutes );
app.use('/api/notifications', notificationRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}
app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`);
    connectDB();
})