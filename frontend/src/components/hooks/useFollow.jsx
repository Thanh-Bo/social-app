import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast";

const useFollow = () => {

    const queryClient = useQueryClient();
    const {mutate : follow , isLoading} = useMutation({
        mutationFn : async (userId) => {
            try {
                const res = await fetch(`/api/users/follow/${userId}`, {
                    method : "POST",

                });
                const data = await res.json();
                if(!res.ok) throw new Error(data.error);
                return data;
            }
            catch(error){   
                throw new Error(error.message);
            }
        },
        onSuccess : () => {
            toast.success('Follow user successfully');
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["suggestedUser"] }),
                queryClient.invalidateQueries({ queryKey: ["authUser"] }),
                queryClient.invalidateQueries({ queryKey: ["posts"] }),
              ]);
            
        },
        onError : (error) => {
            toast.error(error.message);
           
        }
    })

    return {follow , isLoading};
}

export default useFollow