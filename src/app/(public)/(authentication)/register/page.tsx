import Image from "next/image";
import Link from "next/link";
import loginImage from "@/assets/login-bg.jpg";
import { RegisterForm } from "@/components/form/register-from";
 
export default function RegisterPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex items-center gap-2">
              <span>Developer Assessment Platform</span>
            </div>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs"><RegisterForm /> </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src={loginImage}
          alt="Developer Assessment Platform"
          fill
          priority
          quality={100}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}