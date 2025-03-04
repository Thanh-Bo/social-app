import { useState } from "react"
import XSvg from "../../components/svgs/X";
import { } from "react-icons/fa";
import { Mail, PenLine, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";
import {useQueryClient , useMutation} from "@tanstack/react-query";
import toast from "react-hot-toast";
const SignUpPage = () => {  
    const [formData, setFormData] = useState({
        email : "",
        username : "",
        fullName : "",
        password : ""
    });
   
  
    const queryClient = useQueryClient();

    const {mutate , isError , isLoading , error} = useMutation({
        mutationFn: async ({ email, username, fullName, password }) => {
            try {
                const res = await fetch("/api/auth/signup" , {
                    method : "POST", 
                    headers : { 
                        "Content-Type" : "application/json",
                    },
                    body : JSON.stringify({  email, username, fullName, password  }),
                });
                const data = await res.json();
                
                if (!res.ok) throw new Error(data.error || "Failed to create account");
              
                
                console.log(data);
                return data;
            }
            catch(error){
                console.error(error);   
                throw error ;

            }
        },
        onSuccess : () => {
            toast.success("Account created successfully");
            queryClient.invalidateQueries({ queryKey : ['authUser']})
        }
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        mutate(formData);
    };
    const handleInputChange = (e) => {
        setFormData({...formData , [e.target.name]: e.target.value});
    };
  
    return (
        <div className="max-w-screen-xl mx-auto h-screen px-10 flex justify-between ">
            <div className="flex-1 hidden lg:flex justify-center items-center mr-15">
                <XSvg className= 'lg:w-3/3 fill-white' />
            </div>
            <div className="flex-1 flex flex-col justify-center items-center">
                <form className="lg:w-3/3 mx-auto flex gap-4 flex-col" onSubmit={handleSubmit}>
                    <XSvg className='w-24 lg:hidden fill-white'/>
                    <h1 className="text-4xl font-extrabold text-white">
                        Join today
                    </h1>
                    {/* Mail */}
                    <label className="input rounded gap-2 ">
                        <Mail />
                        <input 
                            type ='email'
                            className="grow"
                            placeholder="Email"
                            name = 'email'
                            onChange={handleInputChange}
                            value = {formData.email}
                        />
                    </label>
                    {/* Username */}
                    <label className="input rounded gap-2 ">
                        <User />
                        <input 
                            type ='text'
                            className=""
                            placeholder="Username"
                            name = 'username'
                            onChange={handleInputChange}
                            value = {formData.username}
                        />
                    </label>
                    {/* Full name */}
                   
                    <label className="input rounded gap-2 ">
                        <PenLine />
                        <input 
                            type ='text'
                            className=""
                            placeholder="Full Name"
                            name = 'fullName'
                            onChange={handleInputChange}
                            value = {formData.fullName}
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
                        {isLoading ? "Loading..." : "Sign up"}
                    </button>
                    {isError && <p className="text-red-500">{error.message}</p>}
                </form>
                <div className="flex flex-col lg:w-3/3 gap-4 mt-4 ">
                    <p className="text-white text-lg">Already have an account?</p>
                    <Link to='/login'>
                        <button className="btn bg-black text-blue-3  w-full bordroer rounded-full">Login</button>
                    </Link>
                </div>
            </div>
           
        </div>
    )
}

export default SignUpPage