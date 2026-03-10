'use client'

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Image from 'next/image';

const WhatsAppStatus = () => {
    const [status, setStatus] = useState<string>('INITIALIZING');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [lastMessage, setLastMessage] = useState<any>(null);

    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
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

        socket.on('whatsapp_message_received', (message: any) => {
            setLastMessage(message);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                WhatsApp Connection
                <span className={`w-3 h-3 rounded-full ${status === 'READY' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                    <div className="mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current Status</p>
                        <p className="text-lg font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            {status.replace(/_/g, ' ')}
                        </p>
                    </div>

                    {status === 'READY' ? (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                            <p className="text-green-700 dark:text-green-300 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Connected & Ready to send messages
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                            {status === 'AUTHENTICATING' ? 'Please scan the QR code with your phone to link your account.' : 'Initializing WhatsApp client...'}
                        </p>
                    )}
                </div>

                {qrCode && status === 'AUTHENTICATING' && (
                    <div className="relative p-2 bg-white border-4 border-blue-500 rounded-lg shadow-2xl">
                        <Image 
                            src={qrCode} 
                            alt="WhatsApp QR Code" 
                            width={256} 
                            height={256} 
                            className="rounded shadow-inner"
                        />
                        <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                            New QR Code
                        </div>
                    </div>
                )}
            </div>

            {lastMessage && (
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-tight">Latest Received Message</h3>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-blue-500 font-mono mb-1">{lastMessage.from}</p>
                            <p className="text-gray-800 dark:text-gray-200">{lastMessage.body}</p>
                        </div>
                        <span className="text-[10px] text-gray-400">{new Date(lastMessage.timestamp * 1000).toLocaleTimeString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WhatsAppStatus;
