import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, MessageCircle, Phone, Video, MoreVertical } from "lucide-react";
import axios from "../api/axios";
import socket from "../socket";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import toast from "react-hot-toast";

export default function ChatRoom() {
    const { matchId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [matchInfo, setMatchInfo] = useState(null);
    const [isOnline, setIsOnline] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    const otherUser = matchInfo?.users?.find(p => p._id !== user._id);
    const otherUserInitial = otherUser?.name?.[0]?.toUpperCase();
    const otherUserName = otherUser?.name;

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                // console.log("Current Match ID:", matchId);
                const res = await axios.get(`/match/${matchId}`);
                setMessages(res.data.messages || []);

                // console.log("Fetched match data:", res.data.match);

                setMatchInfo(res.data.match || null);
            } catch (err) {
                console.error("Failed to load messages:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [matchId]);

    useEffect(() => {
        if (!matchInfo || !otherUser) return;

        if (!socket.connected) {
            console.log("Reconnecting socket...");
            socket.connect();
        }

        socket.emit("joinMatchRoom", {
            matchId,
            userId: user._id,
        });

        const handleNewMessage = ({ message }) => {
            setMessages((prev) => [...prev, message]);
        };

        const handleUserOnline = ({ userId }) => {
            if (userId === otherUser._id) {
                setIsOnline(true);
            }
        };

        const handleUserOffline = ({ userId }) => {
            if (userId === otherUser._id) {
                setIsOnline(false);
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("userOnline", handleUserOnline);
        socket.on("userOffline", handleUserOffline);

        return () => {
            socket.emit("leaveRoom", matchId);
            socket.off("newMessage", handleNewMessage);
            socket.off("userOnline", handleUserOnline);
            socket.off("userOffline", handleUserOffline);
        };
    }, [matchInfo, otherUser?._id, matchId, user._id]);


    const handleSend = async (content) => {
        const message = {
            matchId,
            senderId: user._id,
            content,
        };
        // console.log("Message to send:", message);
        console.log("Socket connected?", socket.connected);
        socket.emit("sendMessage", message);
        // console.log("Sending message:", content);
    };

    const handleUnpin = async () => {
        try {
            await axios.post("/unpin", {
                matchId,
                userId: user._id,
            });
            toast.success("Match unpinned successfully.");
            setShowFeedback(true);
            setMatchInfo(prev => ({ ...prev, pinned: false }));
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to unpin.");
        }
    };

    const handleFeedbackSubmit = async () => {
        if (!feedbackText.trim()) return;
        setSubmitting(true);
        try {
            await axios.post("/feedback", {
                matchId,
                to: otherUser._id,
                from: user._id,
                reason: feedbackText.trim(),
            });
            toast.success("Feedback submitted.");
            setShowFeedback(false);
            setFeedbackText("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit feedback.");
        } finally {
            setSubmitting(false);
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/30 flex flex-col">
            <div className="bg-white/95 backdrop-blur-md shadow-lg border-b border-purple-100/50 sticky top-0 z-20">
                <div className="px-4 py-3 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full hover:bg-purple-100/70 transition-colors duration-200"
                    >
                        <ArrowLeft className="w-5 h-5 text-purple-600" />
                    </button>

                    <div className="flex items-center gap-3 flex-1">
                        <div className="relative">
                            <div className="w-11 h-11 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg text-lg">
                                {loading ? "?" : otherUserInitial || "?"}
                            </div>
                            {isOnline && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="font-semibold text-purple-800 text-lg truncate">
                                {loading ? "Chat" : otherUserName || "Chat"}
                            </h1>
                            <p className="text-sm text-purple-500">
                                {isOnline ? "Active now" : "Last seen recently"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button className="p-2.5 rounded-full hover:bg-purple-100/70 transition-colors duration-200">
                            <Phone className="w-5 h-5 text-purple-600" />
                        </button>
                        <button className="p-2.5 rounded-full hover:bg-purple-100/70 transition-colors duration-200">
                            <Video className="w-5 h-5 text-purple-600" />
                        </button>
                        <button className="p-2.5 rounded-full hover:bg-purple-100/70 transition-colors duration-200">
                            <MoreVertical className="w-5 h-5 text-purple-600" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-hidden relative">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-2 border-2 border-purple-100 border-b-purple-400 rounded-full animate-spin animate-reverse"></div>
                            </div>
                            <span className="text-purple-600 font-medium">Loading conversation...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center p-8">
                                <div className="text-center max-w-sm">
                                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                        <MessageCircle className="w-10 h-10 text-purple-500" />
                                    </div>
                                    <h3 className="font-semibold text-purple-800 mb-3 text-xl">Start your conversation</h3>
                                    <p className="text-purple-600 leading-relaxed">
                                        Say hello to {loading ? "your match" : otherUserName || "your match"} and break the ice! 👋
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <MessageList messages={messages} currentUserId={user._id} />
                        )}
                    </>
                )}
                {matchInfo?.videoUnlocked && (
                    <div className="bg-green-100 text-green-800 font-semibold px-4 py-3 rounded-xl mb-4 shadow-md border border-green-200 mx-4 mt-4 text-center">
                        Video call unlocked! You’ve exchanged 100+ messages in 48 hours.
                    </div>
                )}
                {/* {matchInfo?.pinned && (
                    <div className="flex justify-center mt-4 mb-2">
                        <button
                            onClick={handleUnpin}
                            className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white px-5 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
                        >
                            Unpin Match
                        </button>
                    </div>
                )} */}
                {showFeedback && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                            <h2 className="text-xl font-bold text-purple-700 mb-3">Tell us why you unpinned</h2>
                            <textarea
                                rows={4}
                                value={feedbackText}
                                onChange={(e) => setFeedbackText(e.target.value)}
                                placeholder="Optional feedback..."
                                className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                            ></textarea>
                            <div className="mt-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowFeedback(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFeedbackSubmit}
                                    disabled={submitting}
                                    className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                                >
                                    {submitting ? "Sending..." : "Submit"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <MessageInput onSend={handleSend} loading={loading} />
        </div>
    );
}
