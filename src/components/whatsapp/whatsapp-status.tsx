'use client'

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Image from 'next/image';
import { IoLogoWhatsapp, IoMdLogOut, IoMdCheckmarkCircle, IoMdInformationCircle } from 'react-icons/io';
import { MdQrCodeScanner, MdSync, MdMessage, MdGroups, MdPerson } from 'react-icons/md';
import { useLogoutWhatsAppMutation, useGetWhatsAppStatusQuery, useGetWhatsAppChatsQuery } from '@/redux/api/whatsappApi';
import { toast } from 'sonner';

interface Message {
  from: string;
  body: string;
  timestamp: number;
  fromMe?: boolean;
}

interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  timestamp: number;
  lastMessage?: {
    body: string;
    timestamp: number;
  } | null;
}

const WhatsAppStatus = () => {
    const [status, setStatus] = useState<string>('INITIALIZING');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // RTK Query Hooks
    const { data: initialStatusData } = useGetWhatsAppStatusQuery({});
    const { data: chatsData, isLoading: isLoadingChats } = useGetWhatsAppChatsQuery({}, {
        pollingInterval: 30000,
        skip: status !== 'READY'
    });
    const [logoutWhatsApp, { isLoading: isLoggingOut }] = useLogoutWhatsAppMutation();

    useEffect(() => {
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

    const formatTimestamp = (ts: number) => {
        const date = new Date(ts * 1000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-[85vh] animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col lg:flex-row h-full gap-6">
                
                {/* Left Section: Status & Chat List */}
                <div className="lg:w-1/3 flex flex-col gap-4 h-full min-h-0">
                    {/* Status Card */}
                    <div className="bg-white dark:bg-[#1f2c33] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden shrink-0">
                        <div className="bg-[#075e54] p-4 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <IoLogoWhatsapp size={24} />
                                <h2 className="font-bold">Status</h2>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                                status === 'READY' ? 'bg-[#25D366] text-white shadow-[0_0_10px_rgba(37,211,102,0.3)]' : 
                                status === 'AUTHENTICATING' ? 'bg-yellow-400 text-black' : 'bg-gray-500 text-white'
                            }`}>
                                {status.replace(/_/g, ' ')}
                            </span>
                        </div>

                        <div className="p-4 flex flex-col items-center justify-center min-h-[120px]">
                            {status === 'READY' ? (
                                <div className="text-center w-full flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-[#25D366]">
                                            <IoMdCheckmarkCircle size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">Connected</h3>
                                            <p className="text-[10px] text-gray-500">System is live</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 p-2 rounded-lg text-sm transition-all border border-red-100 dark:border-red-900/30"
                                        title="Disconnect Account"
                                    >
                                        <IoMdLogOut size={18} />
                                    </button>
                                </div>
                            ) : qrCode && status === 'AUTHENTICATING' ? (
                                <div className="text-center space-y-3">
                                    <div className="p-2 bg-white rounded-xl shadow-lg border-2 border-[#25D366]/20 inline-block">
                                        <Image src={qrCode} alt="WhatsApp QR" width={140} height={140} className="rounded-lg" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1 font-bold">
                                        <MdQrCodeScanner className="text-[#25D366]" /> Scan to Link
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center flex items-center gap-2">
                                    <MdSync className="text-gray-400 animate-spin-slow" size={20} />
                                    <p className="text-xs text-gray-500">Initializing...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat/Group List Sidebar */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-[#111b21] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden min-h-0">
                        <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-3 border-b dark:border-gray-800 flex items-center justify-between shrink-0">
                            <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">Groups & Chats</h3>
                            {isLoadingChats && <MdSync className="text-gray-400 animate-spin-slow" size={14} />}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {status !== 'READY' ? (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-2 opacity-50">
                                    <MdGroups size={32} />
                                    <p className="text-[10px] italic leading-tight">Authentication required to view chats</p>
                                </div>
                            ) : chatsData?.data?.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">
                                    No chats found
                                </div>
                            ) : (
                                chatsData?.data?.map((chat: Chat) => (
                                    <div key={chat.id} className="p-3 border-b dark:border-gray-800/50 hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${chat.isGroup ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'}`}>
                                                {chat.isGroup ? <MdGroups size={24} /> : <MdPerson size={24} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate pr-2 group-hover:text-[#25D366] transition-colors">{chat.name}</h4>
                                                    <span className="text-[9px] text-gray-400 whitespace-nowrap">{chat.lastMessage ? formatTimestamp(chat.lastMessage.timestamp) : ''}</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate leading-tight">
                                                    {chat.lastMessage ? chat.lastMessage.body : 'No messages'}
                                                </p>
                                            </div>
                                            {chat.unreadCount > 0 && (
                                                <span className="bg-[#25D366] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-[#111b21]">
                                                    {chat.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Section: Live Stream Area */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#111b21] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden h-full min-h-0">
                    <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-4 border-b dark:border-gray-800 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
                                <MdMessage size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white">Live Event Stream</h3>
                                <span className="text-[10px] text-green-500 flex items-center gap-1 font-medium italic">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    monitoring global activity
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#efeae2] dark:bg-opacity-5 dark:bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat min-h-0">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                                <MdMessage size={48} />
                                <p className="text-sm italic">Waiting for activity...</p>
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
            </div>

            <style jsx>{`
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
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
