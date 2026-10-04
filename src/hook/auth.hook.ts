import { companyRegistration, companyVerification, userGetMe, userLogin, userLogout, userRegistration, userVerifyAccount } from "@/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useLogin() {
  return useMutation({
    mutationFn: userLogin,
  });
}

export function useRegistration() {
  return useMutation({
    mutationFn: userRegistration,
  });
}

export function useVerifyAccount() {
  return useMutation({
    mutationFn: userVerifyAccount,
  });
}
export function useGetMe() {
  return useQuery({
    queryKey: ["user"],  
    queryFn: userGetMe,
    retry: false,
  });
}
export function useLogout(){
  return useMutation({
    mutationFn: userLogout
    
  })
}

export function useCompanyRegistration() {
  return useMutation({
    mutationFn: companyRegistration,
  });
}

export function useCompanyVerfication() {
  return useMutation({
    mutationFn: companyVerification ,
  });
}
  