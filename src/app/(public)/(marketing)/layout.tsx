import type { ReactNode } from "react";
import { Footer } from "@/components/layout/public/Footer";
import { Header } from "@/components/layout/public/Header";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
   <div>
     <div className="flex min-h-screen w-[80%] mx-auto  flex-col  text-white"> 
      <Header />
      <main className="flex-1">{children}</main>
      
      
    </div>
    <Footer />
   </div>
  );
}
