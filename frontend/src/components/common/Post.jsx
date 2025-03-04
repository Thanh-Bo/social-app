/* eslint-disable react/prop-types */
import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { formatPostDate } from "../utils/date";

const Post = ({ post , onImageClick}) => {
	const [comment, setComment] = useState("");
	const postOwner = post.user;
	

	const {data : authUser } = useQuery({ queryKey : ['authUser']});
	const isMyPost = authUser._id === post.user._id;
	const formattedDate = formatPostDate(post.createdAt);
	const isLiked = post.likes.includes(authUser._id);


	const handleDeletePost = () => {
		deletePost();
	};

	const handlePostComment = (e) => {
		e.preventDefault();
		commentPost();
	};

	const handleLikePost = () => {
		likedPost();
	};	

	const queryClient = useQueryClient();

	const {mutate : deletePost , isPending : isDeleting} = useMutation({
		mutationFn : async () => {
			try {
				const res = await fetch(`/api/posts/${post._id}`,{
					method : "DELETE",
				})
				const data = await res.json();
				if(!res.ok){
					throw new Error(data.error);
				}
				return data;
			}
			catch(error){
				throw new Error(error);
			}
		},
		onSuccess : () => {
			toast.success("Post deleted successfully");
			queryClient.invalidateQueries({ queryKey : ['posts']})
		}
	})
	const { mutate : likedPost , isPending : isLiking} = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/posts/like/${post._id}` , {
					method : "POST"
				});
				const data = res.json();
				if(!res.ok){
					throw new Error(data.error);
				}
				return data;
			}
			catch(error){
				throw new Error(error);
			}
		},																					
		onSuccess : (data) => {
			if (data.Liked){
				toast.success('Liked post successfully');
			}
			
			queryClient.invalidateQueries({ queryKey : ['posts']})
		}
	})

	const {mutate : commentPost , isPending : isCommenting} = useMutation({
		mutationFn : async () => {
			try {
				const res = await fetch(`/api/posts/comment/${post._id}` , {
					method : "POST",
					headers : {
						"Content-Type" : 'application/json',
					},
					body : JSON.stringify({ text : comment})
				});
				const data = res.json();
				if (!res.ok) throw new Error(data.error);
				return data;
			}
			catch(error){
				throw new Error(error.data);
			}
		},
		onSuccess : () => {
			toast.success('Comment posted successfully');
			setComment('');
			queryClient.invalidateQueries({ queryKey : ['posts']});
		},
		onError : (error) => {
			toast.error(error.message);
		}
	})
	return (
		<>
			<div className='flex gap-2 items-start p-4 border-b border-gray-700'>
                
                {/* Avatar */}
				<div className='avatar'>
					<Link to={`/profile/${postOwner.username}`} className='w-8 rounded-full overflow-hidden'>
						<img src={postOwner.profileImg || "/avatar-placeholder.png"} />
					</Link>
				</div>
                
				<div className='flex flex-col flex-1'>
					<div className='flex gap-2 items-center'>
                        {/* Full name , username , time */}
						<Link to={`/profile/${postOwner.username}`} className='font-bold'>
							{postOwner.fullName}
						</Link>
						<span className='text-gray-700 flex gap-1 text-sm'>
							<Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{/* Delete */}
						{isMyPost && (
						<span className='flex justify-end flex-1'>
							{!isDeleting && (
							<FaTrash 
								className='cursor-pointer hover:text-red-500' 
								onClick={() => document.getElementById(`delete_modal_${post._id}`).showModal()}
							/>
							)}
							{isDeleting && <LoadingSpinner size='lg' />}
							
							{/* Delete Confirmation Modal */}
							<dialog id={`delete_modal_${post._id}`} className='modal'>
								<div className='modal-box border border-gray-600 relative'>
									<button 
										className="absolute top-2 right-2 btn btn-circle"
										onClick={() => document.getElementById(`delete_modal${post._id}`).close()}
									>
										✕
									</button>
									<h3 className='font-bold text-lg'>Delete Post?</h3>
									<p className='py-4'>Do u want to delete this post</p>
									<div className='modal-action'>
										<form method='dialog' className='flex gap-3'>
											<button className='btn'>Cancel</button>
											<button 
												className='btn btn-error'
												onClick={handleDeletePost}
												>
												Delete
											</button>
										</form>	
									</div>
								</div>
								<form method='dialog' className='modal-backdrop'>
									<button>close</button>
								</form>
							</dialog>
						</span>
						)}
					</div>
                    {/* Text and image post */}
					<div className='flex flex-col gap-3 overflow-hidden'>
						<span>{post.text}</span>
						{post.img && (
							<img
								src={post.img}
								className='h-80 object-contain rounded-lg border border-gray-700'
								onClick={() => onImageClick(post.img)} 
								alt=''
							/>
						)}
					</div>
					<div className='flex justify-between mt-3'>
						<div className='flex gap-4 items-center w-2/3 justify-between'>
							{/* Like */}
							<div className='flex gap-1 items-center group cursor-pointer' onClick={handleLikePost}>
								{isLiking && <LoadingSpinner  size='sm'/>}
								{!isLiked && !isLiking && (
									<FaRegHeart className='w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500' />
								)}
								{isLiked && !isLiking && <FaRegHeart className='w-4 h-4 cursor-pointer text-pink-500 ' />}

								<span
									className={`text-sm text-slate-500 group-hover:text-pink-500 ${
										isLiked ? "text-pink-500" : ""
									}`}
								>
									{post.likes.length}
								</span>
							</div>
                            {/* Comment */}
							<div
								className='flex gap-1 items-center cursor-pointer group'
								onClick={() => document.getElementById("comments_modal" + post._id).showModal()}
							>
								<FaRegComment className='w-4 h-4  text-slate-500 group-hover:text-sky-400' />
								<span className='text-sm text-slate-500 group-hover:text-sky-400'>
									{post.comments.length}
								</span>
							</div>


							{/* We're using Modal Component from DaisyUI */}
							<dialog id={`comments_modal${post._id}`} className='modal border-none outline-none'>
							{/* Modal box where the content is displayed */}
							<div className='modal-box rounded border border-gray-600'>
								{/* Title of the Modal */}
								<h3 className='font-bold text-lg mb-4'>COMMENTS</h3>

								{/* Container for the comments, with a scrollbar if there are too many comments */}
								<div className='flex flex-col gap-3 max-h-60 overflow-auto'>
								
								{/* If no comments are available, show a message */}
								{post.comments.length === 0 && (
									<p className='text-sm text-slate-500'>
									No comments yet 🤔 Be the first one 😉
									</p>
								)}
								
								{/* Loop over all the comments and display them */}
								{post.comments.map((comment) => (
									<div key={comment._id} className='flex gap-2 items-start'>
									
									{/* Avatar section for the user who commented */}
									<div className='avatar'>
										<div className='w-8 rounded-full'>
										{/* Display the user's profile image or a placeholder if unavailable */}
										<img
											src={comment.user.profileImg || "/avatar-placeholder.png"}
											alt="User Avatar"
										/>
										</div>
									</div>
									
									{/* Display the commenter's name and the comment text */}
									<div className='flex flex-col'>
										<div className='flex items-center gap-1'>
										{/* Display the full name of the user */}
										<span className='font-bold'>{comment.user.fullName}</span>
										<span className='text-gray-700 text-sm'>
											@{comment.user.username}  {/* Display the username */}
										</span>
										</div>
										{/* Display the actual comment text */}
										<div className='text-sm'>{comment.text}</div>
									</div>
									</div>
								))}
								</div>

								{/* Form to post a new comment */}
								<form
								className='flex gap-2 items-center mt-4 border-t border-gray-600 pt-2'
								onSubmit={handlePostComment}
								>
								{/* Textarea for the user to input a comment */}
								<textarea
									className='textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800'
									placeholder='Add a comment...'
									value={comment}
									onChange={(e) => setComment(e.target.value)}  /* Update the comment state */
								/>
								
								{/* Submit button to post the comment */}
								<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
									{/* Show a loading spinner while the comment is being posted */}
									{isCommenting ? (
									<span className='loading loading-spinner loading-md'></span>
									) : (
									"Post"  /* Show 'Post' when not commenting */
									)}
								</button>
								</form>
							</div>

							{/* Backdrop and close button for the modal */}
							<form method='dialog' className='modal-backdrop'>
								<button className='outline-none'>close</button> {/* Close the modal */}
							</form>
							</dialog>



							<div className='flex gap-1 items-center group cursor-pointer'>
								<BiRepost className='w-6 h-6  text-slate-500 group-hover:text-green-500' />
								<span className='text-sm text-slate-500 group-hover:text-green-500'>0</span>
							</div>
							
						</div>
						<div className='flex w-1/3 justify-end gap-2 items-center'>
							<FaRegBookmark className='w-4 h-4 text-slate-500 cursor-pointer' />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default Post;