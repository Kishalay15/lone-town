// /pages/ChatPage.jsx
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import socket from "../socket";
import { Send } from "lucide-react";

export default function ChatPage() {
    const { matchId } = useParams();
    const [messages, setMessages] = useState([]);
    const [match, setMatch] = useState(null);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user"));

    // Scroll to bottom when new message appears
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch match & messages
    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const res = await axios.get(`/matches/${user._id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const found = res.data.find((m) => m._id === matchId);
                if (found) {
                    setMatch(found);
                    setMessages(found.messages || []);
                }
            } catch (err) {
                console.error("Failed to fetch match:", err);
            }
        };

        fetchMatch();
    }, [matchId, user._id]);

    // Join socket room
    useEffect(() => {
        socket.emit("joinMatchRoom", { matchId, userId: user._id });

        socket.on("newMessage", ({ message }) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off("newMessage");
        };
    }, [matchId, user._id]);

    const sendMessage = () => {
        if (!input.trim()) return;

        socket.emit("sendMessage", {
            matchId,
            senderId: user._id,
            content: input,
        });

        setInput("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const partner = match?.users.find((u) => u._id !== user._id);

    return (
        <div className="min-h-screen flex flex-col bg-purple-50">
            {/* Header */}
            <div className="bg-white shadow px-6 py-4 flex items-center justify-between border-b border-purple-100">
                <h2 className="text-xl font-bold text-purple-700">
                    Chat with {partner?.name || "Partner"}
                </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`max-w-xs px-4 py-2 rounded-xl text-sm ${msg.sender === user._id
                                ? "ml-auto bg-purple-600 text-white"
                                : "mr-auto bg-white text-gray-800 border"
                            }`}
                    >
                        {msg.content}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t bg-white p-4 flex gap-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-xl p-2 resize-none focus:outline-purple-500"
                />
                <button
                    onClick={sendMessage}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}
