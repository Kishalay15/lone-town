import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import socket from "../socket";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";

export default function Chat() {
    const { matchId } = useParams();
    const [messages, setMessages] = useState([]);
    const [partner, setPartner] = useState(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    const bottomRef = useRef(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchChat = async () => {
            try {
                const res = await axios.get(`/matches/${user._id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const match = res.data.find((m) => m._id === matchId);
                if (match) {
                    setMessages(match.messages || []);
                    const other = match.users.find((u) => u._id !== user._id);
                    setPartner(other);
                }
            } catch (err) {
                console.error("Failed to load chat", err);
            }
        };

        fetchChat();
        socket.emit("joinRoom", matchId);

        socket.on("newMessage", (msg) => {
            if (msg.matchId === matchId) {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            }
        });

        return () => {
            socket.emit("leaveRoom", matchId);
            socket.off("newMessage");
        };
    }, [matchId, token, user._id]);

    const handleSend = (text) => {
        const newMsg = {
            matchId,
            senderId: user._id,
            content: text,
        };
        socket.emit("sendMessage", newMsg);
    };

    return (
        <div className="min-h-screen bg-purple-50 flex flex-col p-4">
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h2 className="text-xl font-bold text-purple-700">
                    Chat with {partner?.name || "..."}
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto mb-2">
                <MessageList messages={messages} currentUserId={user._id} />
                <div ref={bottomRef}></div>
            </div>

            <ChatInput onSend={handleSend} />
        </div>
    );
}
