import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFeedbackFor, setShowFeedbackFor] = useState(null); // matchId
    const [feedbackText, setFeedbackText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("/matches", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log("Fetched matches response:", res.data);
                setMatches(res.data);
            } catch (err) {
                console.error("Failed to fetch matches", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, []);


    const handleUnpin = async (matchId) => {
        try {
            await axios.post("/unpin", {
                matchId,
                userId: user._id,
            });
            toast.success("Match unpinned.");
            setMatches((prev) =>
                prev.map((m) =>
                    m._id === matchId ? { ...m, pinned: false } : m
                )
            );
            setShowFeedbackFor(matchId);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to unpin.");
        }
    };

    const handleSubmitFeedback = async () => {
        if (!feedbackText.trim()) return;
        setSubmitting(true);
        try {
            const match = matches.find((m) => m._id === showFeedbackFor);
            const otherUser = match.users.find((u) => u._id !== user._id);
            await axios.post("/feedback", {
                matchId: match._id,
                from: user._id,
                to: otherUser._id,
                reason: feedbackText.trim(),
            });
            toast.success("Feedback submitted.");
            setShowFeedbackFor(null);
            setFeedbackText("");
        } catch (err) {
            toast.error("Feedback failed");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-purple-600 font-medium">Loading your matches...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-6">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
                        Your Matches
                    </h1>
                    <p className="text-gray-600">Connect with people who liked you back</p>
                </div>

                {matches.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
                            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches yet</h3>
                            <p className="text-gray-500 text-sm">Keep swiping to find your perfect match!</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {matches.map((match) => {
                            const otherUser = match.users.find(
                                (u) => u._id !== user._id
                            );
                            return (
                                <div
                                    key={match._id}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-purple-100"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-xl">
                                                        {otherUser.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-xl text-gray-800 mb-1">
                                                        {otherUser.name}
                                                    </h3>
                                                    {match.unreadCount > 0 && (
                                                        <div className="flex items-center space-x-2">
                                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                            <span className="text-red-500 font-medium text-sm">
                                                                {match.unreadCount} new message{match.unreadCount > 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/chat/${match._id}`)}
                                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-2 rounded-xl transition-all duration-200 transform hover:scale-105 shadow"
                                                >
                                                    Chat
                                                </button>
                                                {match.pinned && (
                                                    <button
                                                        onClick={() => handleUnpin(match._id)}
                                                        className="text-sm text-red-500 hover:text-red-700 underline"
                                                    >
                                                        Unpin Match
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-gradient-to-r from-purple-200 via-indigo-200 to-purple-200"></div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Feedback Modal */}
            {showFeedbackFor && (
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
                                onClick={() => setShowFeedbackFor(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitFeedback}
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
    );
}
