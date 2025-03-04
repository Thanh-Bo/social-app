/* eslint-disable react/prop-types */
import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import ImageModal from './ImageModal';


const Posts = ({ feedType, username, userId }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedImage, setSelectedImage] = useState(null);
	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return "/api/posts/all";
			case "following":
				return "/api/posts/following";
			case "posts":
				return `/api/posts/user/${username}`;
			case "likes":
				return `/api/posts/likes/${userId}`;
			default:
				return "/api/posts/all";
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const {
		data: posts,
		isLoading,
		refetch,
		
	} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT);
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}

				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	useEffect(() => {
		refetch();
	}, [feedType, refetch]);
	const handleImageClick = (imgUrl) => {
		setIsModalOpen(true);
		setSelectedImage(imgUrl);
	}
	return (
		<>
			{isLoading  && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}  
			{!isLoading   && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading  && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} 	onImageClick = {handleImageClick}/>
					))}
				</div>
			)}
			<ImageModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				imgUrl={selectedImage}
			/>
		</>
	);
};
export default Posts;