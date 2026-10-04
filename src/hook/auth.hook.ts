import { userLogin, userRegistration, userVerifyAccount } from "@/api";
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

export function useVerifyAccount(){
    return useMutation({
        mutationFn:userVerifyAccount,
    })
}
    


































