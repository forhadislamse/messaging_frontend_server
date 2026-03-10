/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Image from 'next/image';
import { IoLogoWhatsapp, IoMdLogOut, IoMdCheckmarkCircle, IoMdArrowRoundBack, IoMdSend, IoMdAdd } from 'react-icons/io';
import {  MdSync, MdGroups, MdPerson, MdChat, MdNumbers } from 'react-icons/md';
import { useLogoutWhatsAppMutation, useGetWhatsAppStatusQuery, useGetWhatsAppChatsQuery, useGetWhatsAppChatMessagesQuery, useSendMessageMutation } from '@/redux/api/whatsappApi';
import { toast } from 'sonner';

interface Message {
  from: string;
  to: string;
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
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState<string>('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [showDirectMsg, setShowDirectMsg] = useState(false);
    const [directNumber, setDirectNumber] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // RTK Query Hooks
    const { data: initialStatusData } = useGetWhatsAppStatusQuery({});
    const { data: chatsData, isLoading: isLoadingChats } = useGetWhatsAppChatsQuery({}, {
        pollingInterval: 10000,
        skip: status !== 'READY'
    });
    
    // Fetch History for selected chat
    const { data: historyData, isFetching: isFetchingHistory } = useGetWhatsAppChatMessagesQuery(
        { chatId: selectedChat?.id || '', limit: 40 },
        { skip: !selectedChat || status !== 'READY' }
    );

    const [logoutWhatsApp, { isLoading: isLoggingOut }] = useLogoutWhatsAppMutation();
    const [sendMessageMutation] = useSendMessageMutation();

    useEffect(() => {
        if (initialStatusData?.success) {
            setStatus(initialStatusData.data.status);
            if (initialStatusData.data.qrCode) {
                setQrCode(initialStatusData.data.qrCode);
            }
        }
    }, [initialStatusData]);

    // Update messages when history is loaded
    useEffect(() => {
        if (historyData?.success && selectedChat) {
            setMessages(historyData.data);
        }
    }, [historyData, selectedChat]);

    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:13077';
        const s: Socket = io(socketUrl);
        setSocket(s);

        s.on('whatsapp_status', (newStatus: string) => {
            setStatus(newStatus);
            if (newStatus === 'READY') {
                setQrCode(null);
            }
        });

        s.on('whatsapp_qr', (qr: string) => {
            setQrCode(qr);
            setStatus('AUTHENTICATING');
        });

        s.on('whatsapp_message_received', (message: Message) => {
            if (selectedChat) {
                const isFromSelected = message.from === selectedChat.id || (message.fromMe && message.to === selectedChat.id);
                if (isFromSelected) {
                    setMessages(prev => [...prev, message]);
                }
            }
        });

        return () => {
            s.disconnect();
        };
    }, [selectedChat]);

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
                setSelectedChat(null);
                toast.success('Disconnected successfully');
            }
        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Failed to disconnect');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        let phoneNumber = '';
        if (showDirectMsg) {
            phoneNumber = directNumber.trim();
        } else if (selectedChat) {
            phoneNumber = selectedChat.id.split('@')[0];
        }

        if (!phoneNumber) {
            toast.error('Please select a chat or enter a phone number');
            return;
        }

        const payload = {
            phoneNumber,
            message: messageInput.trim()
        };

        try {
            // Priority: Send via Socket for low latency, fallback to Mutation
            if (socket?.connected) {
                socket.emit('send_message', payload);
            } else {
                await sendMessageMutation(payload).unwrap();
            }
            
            setMessageInput('');
            if (showDirectMsg) {
                toast.success('Message sent successfully');
                setShowDirectMsg(false);
                setDirectNumber('');
            }
        } catch (error: any) {
            console.error('Failed to send message:', error);
            const errorMsg = error.data?.message || 'Failed to send message';
            toast.error(errorMsg);
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
                <div className={`${selectedChat ? 'hidden lg:flex' : 'flex'} lg:w-1/3 flex flex-col gap-4 h-full min-h-0`}>
                    {/* Status Card */}
                    <div className="bg-white dark:bg-[#1f2c33] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden shrink-0">
                        <div className="bg-[#00a884] p-4 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <IoLogoWhatsapp size={24} />
                                <h2 className="font-bold text-sm">WhatsApp Client</h2>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                                status === 'READY' ? 'bg-[#25D366] text-white shadow-[0_0_10px_rgba(37,211,102,0.3)]' : 
                                status === 'AUTHENTICATING' ? 'bg-yellow-400 text-black' : 'bg-gray-500 text-white'
                            }`}>
                                {status.replace(/_/g, ' ')}
                            </span>
                        </div>

                        <div className="p-4 flex flex-col items-center justify-center min-h-[100px]">
                            {status === 'READY' ? (
                                <div className="text-center w-full flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-[#25D366]">
                                            <IoMdCheckmarkCircle size={24} />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">Connected</h3>
                                            <p className="text-[10px] text-gray-500">Live & Ready</p>
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
                                        <Image src={qrCode} alt="WhatsApp QR" width={120} height={120} className="rounded-lg" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1 font-bold">
                                         Scan to Link Device
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
                            <h3 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Chats</h3>
                            <button 
                                onClick={() => setShowDirectMsg(!showDirectMsg)}
                                className={`p-1.5 rounded-full transition-all ${showDirectMsg ? 'bg-[#00a884] text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500'}`}
                                title="Direct Message"
                            >
                                <MdChat size={18} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {showDirectMsg && (
                                <div className="p-4 bg-[#f8f9fa] dark:bg-[#202c33] border-b dark:border-gray-800 animate-in slide-in-from-top duration-300">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Direct Message</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Phone Number (e.g. 8801...)" 
                                            value={directNumber}
                                            onChange={(e) => setDirectNumber(e.target.value)}
                                            className="flex-1 px-3 py-2 text-xs bg-white dark:bg-[#2a3942] dark:text-white rounded-lg border dark:border-gray-700 focus:ring-1 focus:ring-[#00a884] outline-none"
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-500 mt-2 font-medium">Type message below and click send</p>
                                </div>
                            )}

                            {status !== 'READY' ? (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-2 opacity-50">
                                    <MdChat size={32} />
                                    <p className="text-[10px] italic leading-tight">Connect WhatsApp to view chats</p>
                                </div>
                            ) : chatsData?.data?.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400 text-xs italic p-4 text-center">
                                    Fetching chats...
                                </div>
                            ) : (
                                chatsData?.data?.map((chat: Chat) => (
                                    <div 
                                        key={chat.id} 
                                        onClick={() => { setSelectedChat(chat); setShowDirectMsg(false); }}
                                        className={`p-3 border-b dark:border-gray-800/50 hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] transition-all cursor-pointer group ${selectedChat?.id === chat.id ? 'bg-[#f0f2f5] dark:bg-[#2a3942] border-l-4 border-l-[#00a884]' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${chat.isGroup ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                                {chat.isGroup ? <MdGroups size={24} /> : <MdPerson size={24} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h4 className={`text-sm font-bold truncate pr-1 transition-colors ${selectedChat?.id === chat.id ? 'text-[#00a884]' : 'text-gray-800 dark:text-gray-100'}`}>{chat.name}</h4>
                                                    <span className="text-[10px] text-gray-400">{chat.lastMessage ? formatTimestamp(chat.lastMessage.timestamp) : ''}</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate leading-tight flex items-center gap-1">
                                                    {chat.lastMessage ? (
                                                        <>
                                                            {chat.lastMessage.body}
                                                        </>
                                                    ) : 'No typical messages'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Section: Selected Chat Messages */}
                <div className={`${!selectedChat && !showDirectMsg ? 'hidden lg:flex' : 'flex'} flex-1 flex flex-col bg-white dark:bg-[#111b21] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden h-full min-h-0`}>
                    {!selectedChat && !showDirectMsg ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 bg-[#f8f9fa] dark:bg-[#222e35] relative">
                            <div className="absolute top-0 w-full h-1.5 bg-[#00a884]"></div>
                            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center shadow-inner">
                                <IoLogoWhatsapp size={48} className="text-[#00a884] opacity-20" />
                            </div>
                            <div className="text-center max-w-sm px-6">
                                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300">WhatsApp Web Clone</h3>
                                <p className="text-xs opacity-60 mt-2">Send and receive messages without keeping your phone online. Use the sidebar to select a conversation.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-3 border-b dark:border-gray-800 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => { setSelectedChat(null); setShowDirectMsg(false); }} className="lg:hidden p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                                        <IoMdArrowRoundBack size={20} />
                                    </button>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${showDirectMsg ? 'bg-[#00a884] text-white' : selectedChat?.isGroup ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                                        {showDirectMsg ? <MdNumbers size={24} /> : selectedChat?.isGroup ? <MdGroups size={24} /> : <MdPerson size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-gray-800 dark:text-white leading-tight">
                                            {showDirectMsg ? 'Direct Message' : selectedChat?.name}
                                        </h3>
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                                            {showDirectMsg ? (
                                                `Target: ${directNumber || 'None'}`
                                            ) : (
                                                <>
                                                    <span className="opacity-60">ID: {selectedChat?.id.split('@')[0]}</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                     {isFetchingHistory && <MdSync size={16} className="text-gray-400 animate-spin-slow" />}
                                </div>
                            </div>

                            {/* Message Stream */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[#efeae2] dark:bg-opacity-5 dark:bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat min-h-0">
                                {showDirectMsg ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 text-center max-w-xs mx-auto">
                                        <MdNumbers size={48} className="opacity-20" />
                                        <div>
                                            <h4 className="font-bold text-sm">Direct Messaging Mode</h4>
                                            <p className="text-[10px] opacity-70 mt-1">Enter a phone number above and type your message. This message will be sent to the specific number even if it's not in your chat list.</p>
                                        </div>
                                    </div>
                                ) : messages.length === 0 && !isFetchingHistory ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-50">
                                        <p className="text-[10px] font-bold bg-[#dcf8c6] dark:bg-[#005c4b] text-gray-700 dark:text-white px-4 py-1.5 rounded-lg shadow-sm uppercase tracking-widest">End-to-End Encrypted</p>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-200`}>
                                            <div className={`max-w-[70%] px-3 py-1.5 rounded-lg shadow-sm relative group ${
                                                msg.fromMe 
                                                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none' 
                                                : 'bg-white dark:bg-[#1f2c33] rounded-tl-none'
                                            }`}>
                                                {!msg.fromMe && !selectedChat?.isGroup && (
                                                    <div className="text-[10px] font-bold text-[#00a884] mb-0.5">{selectedChat?.name}</div>
                                                )}
                                                <p className="text-[13px] text-gray-800 dark:text-gray-100 leading-normal break-words">{msg.body}</p>
                                                <div className="flex justify-end items-center gap-1 mt-1">
                                                    <span className="text-[9px] text-gray-500 dark:text-gray-400 opacity-70">
                                                        {formatTimestamp(msg.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input Footer */}
                            <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-3 shrink-0">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                    <input 
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a message"
                                        className="flex-1 bg-white dark:bg-[#2a3942] dark:text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#00a884] shadow-sm transition-all"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!messageInput.trim() || (showDirectMsg && !directNumber.trim())}
                                        className={`p-2.5 rounded-full transition-all flex items-center justify-center ${
                                            (messageInput.trim() && (!showDirectMsg || directNumber.trim()))
                                            ? 'bg-[#00a884] text-white hover:bg-[#008f72] shadow-md' 
                                            : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <IoMdSend size={22} className={messageInput.trim() ? 'animate-in zoom-in' : ''} />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
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
