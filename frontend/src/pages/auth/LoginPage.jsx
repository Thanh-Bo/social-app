import XSvg from "../../components/svgs/X";
import { } from "react-icons/fa";
import {  PenLine, Lock} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
const LoginPage = () => {
    const [formData, setFormData] = useState({
        username : "",
        password : ""
    });
    const queryClient = useQueryClient();

    const handleInputChange = (e) => {
        setFormData({... formData , [e.target.name] : e.target.value})
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        mutate(formData);
    }
    const {mutate , isError , isLoading , error} = useMutation({
        mutationFn : async ({username , password}) => {
            try {
                const res = await fetch('/api/auth/login' , {
                    method : "POST",
                    headers : {
                        "Content-Type" : "application/json",
                    },
                    body : JSON.stringify({username , password}),
                })
                const data = await res.json();

                if(!res.ok) throw new Error(data.error);

                // console.log(data);
                return data;
            }
            catch(error){
                console.log(error.message);
                throw error;
                
            }      
        },
        onSuccess : () => {
            toast.success("Login successfully");
            queryClient.invalidateQueries({ queryKey : ['authUser']})
        },
    })
    return (
        <div className="max-w-screen-lg mx-auto h-screen px-10 flex justify-between ">
            <div className="flex-1 hidden lg:flex justify-center items-center mr-15">
                <XSvg className= 'lg:w-full fill-white' />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
                <form className="lg:w-full mx-auto flex gap-4 flex-col" onSubmit={handleSubmit}>
                    <XSvg className='w-24 lg:hidden fill-white'/>
                    <h1 className="text-4xl font-extrabold text-white">
                        Let&apos;s go
                    </h1>
                    {/* Username */}
                   
                    <label className="input rounded gap-2 ">
                        <PenLine />
                        <input 
                            type ='text'
                            className=""
                            placeholder="Usename"
                            name = 'username'
                            onChange={handleInputChange}
                            value = {formData.username}
                        />
                    </label>      
                    {/* Password */}
                    <label className="input rounded gap-2 ">
                        <Lock />
                        <input 
                            type ='password'    
                            className=""
                            placeholder="Password"
                            name = 'password'
                            onChange={handleInputChange}
                            value = {formData.password}
                        />
                    </label>
                    <button className="btn rounded-full text-white bg-blue-400" >
                        {isLoading ? "Loading..." : "Login"}
                    </button>
                    {isError && <p className="text-red-500">{error.message}</p>}
                </form>
                <div className="flex flex-col lg:w-full  gap-4 mt-4 ">
                    <p className="text-white text-lg">Don&apos;t have a account</p>
                    <Link to='/signup'>
                        <button className="btn bg-black text-blue-3 00 w-full bordroer rounded-full">Sign up</button>
                    </Link>
                </div>
            </div>
           
        </div>
    )
}

export default LoginPage;