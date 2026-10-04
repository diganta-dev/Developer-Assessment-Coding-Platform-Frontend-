import { userLogin, userRegistration } from "@/api";
import { useMutation } from "@tanstack/react-query";

export function useLogin(){
    return useMutation({
        mutationFn:userLogin,
    })
}

export function useRegistration(){
    return useMutation({
        mutationFn:userRegistration,
    })
}
    


































