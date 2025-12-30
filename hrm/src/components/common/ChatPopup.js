import React, { useState, useEffect, useRef } from "react";
import { FaComments, FaTimes, FaPaperPlane, FaChevronDown, FaChevronUp, FaUserShield, FaUsers } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import { flushSync } from "react-dom";

export default function ChatPopup() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [activeTab, setActiveTab] = useState("dept"); // 'dept' or 'auth'
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [rooms, setRooms] = useState([]); // For Admins/HR
    const [selectedRoomId, setSelectedRoomId] = useState("");
    const [unreadCount, setUnreadCount] = useState(0);

    const scrollRef = useRef(null);
    const lastSeenRef = useRef({}); // { roomId: lastId }

    const isAdmin = user?.roles?.some(r => ["admin", "super_admin", "hr"].includes(r.toLowerCase())) ||
        ["admin", "super_admin", "hr"].includes(user?.role?.toLowerCase());

    const deptName = user?.Department || 'General';
    const deptRoomId = `DEPT_${deptName}`;
    const authRoomId = `AUTH_${user?.id}`;

    // Load last seen from local storage
    useEffect(() => {
        const stored = localStorage.getItem(`chat_last_seen_${user?.id}`);
        if (stored) lastSeenRef.current = JSON.parse(stored);
    }, [user]);

    // Save last seen
    const markAsSeen = (roomId, msgId) => {
        if (!msgId) return;
        lastSeenRef.current[roomId] = msgId;
        localStorage.setItem(`chat_last_seen_${user?.id}`, JSON.stringify(lastSeenRef.current));
        calculateUnread(messages);
    };

    const calculateUnread = (allMsgs) => {
        if (!allMsgs.length) return;
        const lastId = lastSeenRef.current[selectedRoomId] || 0;
        const unread = allMsgs.filter(m => m.id > lastId && Number(m.sender_id) !== Number(user.id)).length;
        setUnreadCount(unread);
    };

    // Use dept room by default for non-admins, if admin they might want to switch
    useEffect(() => {
        if (!selectedRoomId) {
            if (activeTab === 'dept') {
                setSelectedRoomId(deptRoomId);
            } else if (activeTab === 'auth' && !isAdmin && authRoomId) {
                setSelectedRoomId(authRoomId);
            }
        }
    }, [activeTab, deptRoomId, authRoomId, isAdmin, selectedRoomId]);

    const fetchMessages = async () => {
        if (!selectedRoomId) return;
        try {
            const { data } = await api.get(`/chat/messages/${selectedRoomId}`);
            setMessages(data);
            if (isOpen && !minimized) {
                const lastMsg = data[data.length - 1];
                if (lastMsg) markAsSeen(selectedRoomId, lastMsg.id);
            } else {
                calculateUnread(data);
            }
        } catch (e) {
            console.error("fetchMessages error", e);
        }
    };

    const fetchRooms = async () => {
        if (!isAdmin || !isOpen || activeTab !== 'auth') return;
        try {
            const { data } = await api.get("/chat/authority-rooms");
            setRooms(data);
        } catch (e) {
            console.error("fetchRooms error", e);
        }
    };

    const fetchUnreadCounts = async () => {
        // Only if closed or minimized
        if (isOpen && !minimized) return;

        const roomIds = [deptRoomId, authRoomId].filter(Boolean).join(",");
        const lastIds = [lastSeenRef.current[deptRoomId] || 0, lastSeenRef.current[authRoomId] || 0].filter((_, i) => [deptRoomId, authRoomId][i]).join(",");

        try {
            const { data } = await api.get(`/chat/unread?roomIds=${roomIds}&lastIds=${lastIds}`);
            // Sum all unread
            const total = Object.values(data).reduce((sum, val) => sum + Number(val), 0);
            setUnreadCount(total);
        } catch (e) {
            console.error("fetchUnreadCounts error", e);
        }
    };

    useEffect(() => {
        if (isOpen && !minimized) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        } else {
            // Background check every 30s
            fetchUnreadCounts();
            const interval = setInterval(fetchUnreadCounts, 30000);
            return () => clearInterval(interval);
        }
    }, [selectedRoomId, isOpen, minimized, deptRoomId, authRoomId]);

    useEffect(() => {
        if (isAdmin && activeTab === "auth" && isOpen) {
            fetchRooms();
        }
    }, [activeTab, isAdmin, isOpen]);

    useEffect(() => {
        if (scrollRef.current && isOpen && !minimized) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, minimized]);

    const handleSend = async (e) => {
        e.preventDefault();
        const msgToSend = text.trim();
        if (!msgToSend || !selectedRoomId) return;

        try {
            // Use flushSync to ensure text is cleared before any potential re-renders or API delays
            flushSync(() => {
                setText("");
            });
            await api.post("/chat/send", { roomId: selectedRoomId, message: msgToSend });
            fetchMessages();
        } catch (e) {
            console.error("handleSend error", e);
            // Optionally restore text if send fails
            setText(msgToSend);
        }
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="relative bg-customRed text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2"
                >
                    <FaComments size={24} />
                    <span className="font-semibold hidden sm:inline">Chat</span>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-white text-customRed text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-customRed animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                </button>
            ) : (
                <div className={`bg-white rounded-xl shadow-2xl border flex flex-col transition-all duration-300 ${minimized ? 'h-12 w-64' : 'h-[450px] w-80 sm:w-96'}`}>
                    {/* Header */}
                    <div className="bg-customRed text-white p-3 rounded-t-xl flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 truncate">
                            <FaComments />
                            <span className="font-bold text-sm">
                                {activeTab === 'dept' ? `Dept: ${deptName === 'General' ? 'Company Chat' : deptName}` : 'Higher Authorities'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setMinimized(!minimized)}>
                                {minimized ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                            <button onClick={() => setIsOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {!minimized && (
                        <>
                            {/* Tabs */}
                            <div className="flex border-b text-xs font-semibold uppercase">
                                <button
                                    onClick={() => { setActiveTab("dept"); setSelectedRoomId(deptRoomId); }}
                                    className={`flex-1 py-2 flex items-center justify-center gap-1 ${activeTab === "dept" ? "text-customRed border-b-2 border-customRed" : "text-gray-500"}`}
                                >
                                    <FaUsers /> Dept
                                </button>
                                <button
                                    onClick={() => { setActiveTab("auth"); setSelectedRoomId(isAdmin ? "" : authRoomId); }}
                                    className={`flex-1 py-2 flex items-center justify-center gap-1 ${activeTab === "auth" ? "text-customRed border-b-2 border-customRed" : "text-gray-500"}`}
                                >
                                    <FaUserShield /> Authority
                                </button>
                            </div>

                            {/* Authority Room List for Admins */}
                            {isAdmin && activeTab === "auth" && !selectedRoomId ? (
                                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase px-2">Support Threads</h4>
                                    {rooms.length === 0 ? (
                                        <div className="text-center text-xs text-gray-400 mt-10">No active threads</div>
                                    ) : (
                                        rooms.map(r => (
                                            <button
                                                key={r.room_id}
                                                onClick={() => setSelectedRoomId(r.room_id)}
                                                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left border border-transparent hover:border-gray-200 transition-all"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0">
                                                    {r.profile_img ? <img src={r.profile_img} className="w-full h-full rounded-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400">{r.user_name?.[0]}</div>}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs font-bold truncate">{r.user_name}</div>
                                                    <div className="text-[10px] text-gray-400">ID: {r.room_id}</div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Message Area */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50" ref={scrollRef}>
                                        {isAdmin && activeTab === 'auth' && selectedRoomId && (
                                            <button onClick={() => setSelectedRoomId("")} className="text-[10px] text-customRed mb-2 hover:underline">← Back to threads</button>
                                        )}
                                        {messages.length === 0 ? (
                                            <div className="text-center text-xs text-gray-400 mt-10">Start the conversation...</div>
                                        ) : (
                                            messages.map((m) => {
                                                const isMe = Number(m.sender_id) === Number(user.id);
                                                return (
                                                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                                        <div className={`max-w-[80%] rounded-2xl p-2.5 shadow-sm text-xs ${isMe ? "bg-customRed text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border"}`}>
                                                            {!isMe && <div className="font-bold text-[9px] mb-1 opacity-70">{m.sender_name}</div>}
                                                            <div className="whitespace-pre-wrap break-words">{m.message}</div>
                                                            <div className={`text-[8px] mt-1 text-right ${isMe ? "text-red-100" : "text-gray-400"}`}>
                                                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Input */}
                                    <form onSubmit={handleSend} className="p-3 border-t shrink-0 flex gap-2">
                                        <input
                                            value={text}
                                            onChange={(e) => setText(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 text-xs border rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-customRed"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!text.trim()}
                                            className="bg-customRed text-white p-2 rounded-full hover:scale-105 disabled:opacity-50 transition-all shadow-md flex items-center justify-center w-8 h-8"
                                        >
                                            <FaPaperPlane className="w-3.5 h-3.5" />
                                        </button>
                                    </form>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
