import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {toast} from 'react-hot-toast';
import EmojiPicker from "emoji-picker-react";
import ImageModal from "../../components/common/ImageModal";
const CreatePost = () => {
	const [text, setText] = useState("");
	const [img, setImg] = useState(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	
	const imgRef = useRef(null);

	const {data : authUser} = useQuery({queryKey : ["authUser"]});
	const queryClient = useQueryClient();
	
	const {	mutate : createPost , isPending , isError , error} = useMutation({
		mutationFn : async ({text , img}) => {
			try {
				const res = await fetch('/api/posts/create', {
					method : "POST",
					headers : {
						"Content-Type" : "application/json",
					},
					body : JSON.stringify({ text, img})
				});

				const data = await res.json();

				if(!res.ok) {
					throw new Error(data.error);
				}
			}
			catch(error){
				throw new Error(error);
			}
		},
		onSuccess : () => {
			setText('');
			setImg(null);
			toast.success("Post created successfully");
			queryClient.invalidateQueries({queryKey: ['posts']})
		}
		
	})

	

	const handleSubmit = (e) => {
		e.preventDefault();
		createPost({text, img});
	};

	const handleImgChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				alert("File is too large. Please upload an image smaller than 5MB.");
				return;
			}
	
			const reader = new FileReader();
			reader.onload = () => {
				setImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleEmojiClick = (emojiObject) => {
		setText((prevText) => prevText + emojiObject.emoji);
	};
	return (
		<div className='flex p-4 items-start gap-4 border-b border-gray-700'>
			<div className='avatar'>
				<div className='w-8 rounded-full'>
					<img src={authUser.profileImg || "/avatar-placeholder.png"} />
				</div>
			</div>
			<form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
				<textarea
					className='textarea w-full p-2 text-lg resize-none  border-gray-800'
					placeholder='What is happening?!'
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
				{img && (
					<div className='relative w-72 mx-auto'>
						<IoCloseSharp
							className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
							onClick={() => {
								setImg(null);
								imgRef.current.value = null;
							}}
						/>
						<img 
							src={img} 
							className='w-full mx-auto h-72 object-contain rounded' 
							onClick={() => setIsModalOpen(true)}
							/>
					</div>
				)}
				<ImageModal 
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					imgUrl={img}
				/>
				<div className='flex justify-between border-t py-2 border-t-gray-700'>
					<div className='flex gap-3 items-center'>
						{/* Image */}
						<CiImageOn
							className='fill-primary w-6 h-6 cursor-pointer'
							onClick={() => imgRef.current.click()}
						/>
						{/* Emoji */}
						<BsEmojiSmileFill
							className='w-6 h-6 fill-primary'
							value={showEmojiPicker}
							onClick={() => setShowEmojiPicker(!showEmojiPicker)}
						/>
						{/* Emoji Picker */}
						{showEmojiPicker && (
							<div className="">
								<div className="flex justify-center bg-white shadow-lg rounded-md p-2">
										<button
											className="text-red-500 hover:text-red-700 text-lg font-bold px-2 !important"
											onClick={() => setShowEmojiPicker(false)}
										>
											<span className="text-red-500">✖</span>
										</button>
									</div>
										<EmojiPicker onEmojiClick={handleEmojiClick} />
								</div>
						)}
					</div>
					<input type='file' accept="image/png, image/jpeg, image/gif" hidden ref={imgRef} onChange={handleImgChange} />
					<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
						{isPending ? "Posting..." : "Post"}
					</button>
				</div>
				{isError && <div className='text-red-500'>{error.message}</div>}
			</form>
		</div>
	);
};
export default CreatePost;