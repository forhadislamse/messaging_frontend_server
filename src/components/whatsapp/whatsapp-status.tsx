'use client'

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Image from 'next/image';
import { IoLogoWhatsapp, IoMdLogOut, IoMdCheckmarkCircle, IoMdInformationCircle } from 'react-icons/io';
import { MdQrCodeScanner, MdSync, MdMessage } from 'react-icons/md';
import { useLogoutWhatsAppMutation, useGetWhatsAppStatusQuery } from '@/redux/api/whatsappApi';
import { toast } from 'sonner';

interface Message {
  from: string;
  body: string;
  timestamp: number;
  fromMe?: boolean;
}

const WhatsAppStatus = () => {
    const [status, setStatus] = useState<string>('INITIALIZING');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // RTK Query Hooks
    const { data: initialStatusData } = useGetWhatsAppStatusQuery({});
    const [logoutWhatsApp, { isLoading: isLoggingOut }] = useLogoutWhatsAppMutation();

    useEffect(() => {
        // Set initial status from RTK Query if available
        if (initialStatusData?.success) {
            setStatus(initialStatusData.data.status);
            if (initialStatusData.data.qrCode) {
                setQrCode(initialStatusData.data.qrCode);
            }
        }
    }, [initialStatusData]);
    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:13077';
        const socket: Socket = io(socketUrl);

        socket.on('whatsapp_status', (newStatus: string) => {
            setStatus(newStatus);
            if (newStatus === 'READY') {
                setQrCode(null);
            }
        });

        socket.on('whatsapp_qr', (qr: string) => {
            setQrCode(qr);
            setStatus('AUTHENTICATING');
        });

        socket.on('whatsapp_message_received', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleLogout = async () => {
        if (!confirm('Are you sure you want to disconnect?')) return;
        
        try {
            const res: any = await logoutWhatsApp({}).unwrap();
            if (res.success) {
                setStatus('INITIALIZING');
                setQrCode(null);
                setMessages([]);
                toast.success('Disconnected successfully');
            }
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Failed to disconnect');
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[85vh] gap-6 animate-in fade-in zoom-in duration-500">
            {/* Sidebar / Status Area */}
            <div className="lg:w-1/3 flex flex-col gap-6">
                <div className="bg-white dark:bg-[#1f2c33] rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all">
                    <div className="bg-[#075e54] p-6 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <IoLogoWhatsapp size={32} />
                            <h2 className="text-xl font-bold tracking-tight">Status</h2>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            status === 'READY' ? 'bg-[#25D366] text-white shadow-[0_0_15px_rgba(37,211,102,0.4)]' : 
                            status === 'AUTHENTICATING' ? 'bg-yellow-400 text-black' : 'bg-gray-500 text-white'
                        }`}>
                            {status.replace(/_/g, ' ')}
                        </span>
                    </div>

                    <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                        {status === 'READY' ? (
                            <div className="text-center space-y-4">
                                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-[#25D366] animate-bounce-subtle">
                                    <IoMdCheckmarkCircle size={64} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">WhatsApp is Ready</h3>
                                <p className="text-gray-500 dark:text-gray-400 px-4">Your account is connected and ready to send/receive messages.</p>
                                <button 
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    className="mt-4 flex items-center gap-2 mx-auto bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 px-6 py-2 rounded-xl text-sm font-semibold transition-all border border-red-100 dark:border-red-900/30"
                                >
                                    <IoMdLogOut size={18} />
                                    {isLoggingOut ? 'Disconnecting...' : 'Disconnect Account'}
                                </button>
                            </div>
                        ) : qrCode && status === 'AUTHENTICATING' ? (
                            <div className="text-center space-y-6">
                                <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-[#25D366]/20 inline-block">
                                    <Image src={qrCode} alt="WhatsApp QR" width={220} height={220} className="rounded-lg" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-2">
                                        <MdQrCodeScanner className="text-[#25D366]" />
                                        Scan QR Code
                                    </h3>
                                    <p className="text-xs text-gray-500 max-w-[200px] mx-auto">Open WhatsApp on your phone &gt; Settings &gt; Linked Devices &gt; Link a Device</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <MdSync size={64} className="mx-auto text-gray-300 dark:text-gray-700 animate-spin-slow" />
                                <p className="text-gray-500 dark:text-gray-400">Initializing connection...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions / Info */}
                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-4">
                    <IoMdInformationCircle className="text-blue-500 shrink-0" size={24} />
                    <div className="space-y-1">
                        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300">Server Info</h4>
                        <p className="text-[11px] text-blue-700/70 dark:text-blue-400/70 leading-relaxed">
                            Endpoint: {process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:13077'}<br/>
                            Session: LocalAuth (Persistent)
                        </p>
                    </div>
                </div>
            </div>

            {/* Message Stream Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#111b21] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-4 border-b dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
                            <MdMessage size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">Live Message Stream</h3>
                            <span className="text-[10px] text-green-500 flex items-center gap-1 font-medium italic">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                monitoring incoming-outgoing events
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#efeae2] dark:bg-opacity-5 dark:bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                            <MdMessage size={48} />
                            <p className="text-sm italic">Waiting for incoming-outgoing messages...</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col animate-in ${msg.fromMe ? 'slide-in-from-right' : 'slide-in-from-left'} duration-300`}>
                                <div className={`max-w-[85%] ${msg.fromMe ? 'self-end bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tl-xl rounded-tr-none' : 'self-start bg-white dark:bg-[#1f2c33] rounded-tr-xl rounded-tl-none'} p-3 rounded-br-xl rounded-bl-xl shadow-sm border-l-4 ${msg.fromMe ? 'border-[#34b7f1]' : 'border-[#25D366]'}`}>
                                    <div className="flex justify-between items-center gap-4 mb-1">
                                        <span className={`text-[10px] font-bold ${msg.fromMe ? 'text-[#34b7f1]' : 'text-[#25D366]'} truncate`}>
                                            {msg.fromMe ? 'You' : msg.from.split('@')[0]}
                                        </span>
                                        <span className="text-[9px] text-gray-400 shrink-0">{new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className={`text-[13px] ${msg.fromMe ? 'text-gray-800 dark:text-gray-100' : 'text-gray-700 dark:text-gray-200'} leading-snug whitespace-pre-wrap`}>{msg.body}</p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <style jsx>{`
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                .animate-bounce-subtle {
                    animation: bounce-subtle 3s ease-in-out infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes bounce-subtle {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                }
            `}</style>
        </div>
    );
};

export default WhatsAppStatus;
