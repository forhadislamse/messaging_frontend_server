import WhatsAppStatus from "@/components/whatsapp/whatsapp-status";
import React from "react";

const WhatsAppPage = () => {
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          WhatsApp Integration
        </h1>
        <p className="text-muted-foreground text-lg italic">
          Manage your WhatsApp Web session and monitor real-time message streams.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <WhatsAppStatus />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-sm">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">Instructions</h3>
        <ul className="list-disc list-inside space-y-2 text-blue-700/80 dark:text-blue-400/80">
          <li>Ensure the backend server is running and accessible at <code>http://localhost:13077</code>.</li>
          <li>If the status shows <strong>INITIALIZING</strong>, wait a few seconds for the client to start.</li>
          <li>If a <strong>QR Code</strong> appears, scan it using the "Linked Devices" feature in your WhatsApp mobile app.</li>
          <li>Once connected, the status will change to <strong>READY</strong> and you can start sending messages via the API.</li>
        </ul>
      </div>
    </div>
  );
};

export default WhatsAppPage;
