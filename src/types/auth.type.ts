export interface LoginPayload{
    email:string;
    password:string;
}
export interface UserRegistrationPayload{
    name:string;
    email:string;
    password:string;
    candidateProfile:{
        phone:string;
        location:string; 
        
    }
} 

export interface VerifyAccountPayload{
    email:string;
    otp:string;
} 