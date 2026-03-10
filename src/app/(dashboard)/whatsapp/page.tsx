import WhatsAppStatus from "@/components/whatsapp/whatsapp-status";
import React from "react";
import { IoLogoWhatsapp } from 'react-icons/io';

const WhatsAppPage = () => {
  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#111b21] p-4 md:p-10 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header section with glassmorphism */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 dark:bg-[#1f2c33]/50 backdrop-blur-md p-8 rounded-3xl border border-white/20 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-[#25D366] rounded-2xl shadow-lg shadow-green-500/20 text-white">
              <IoLogoWhatsapp size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                WhatsApp <span className="text-[#25D366]">Control</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium truncate max-w-[300px] md:max-w-none">
                Enterprise messaging & real-time event monitoring system
              </p>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end">
             {/* <div className="px-4 py-2 bg-white dark:bg-[#202c33] rounded-full border dark:border-gray-800 shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest">System Cloud Node: Active</span>
             </div> */}
          </div>
        </header>

        {/* Main Workspace */}
        <main className="relative">
          <WhatsAppStatus />
        </main>

        {/* Dynamic Footer Info */}
        <footer className="pt-10 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
           <div>© 2026 MESSAGING SYSTEM LLC. All rights reserved.</div>
           {/* <div className="flex gap-6 uppercase">
              <span className="hover:text-[#25D366] cursor-pointer transition-colors">Documentation</span>
              <span className="hover:text-[#25D366] cursor-pointer transition-colors">API Keys</span>
              <span className="hover:text-[#25D366] cursor-pointer transition-colors">Support</span>
           </div> */}
        </footer>
      </div>
    </div>
  );
};

export default WhatsAppPage;
