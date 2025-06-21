import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function MatchesList() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await axios.get(`/matches/${user._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setMatches(res.data);
            } catch (err) {
                console.error("Failed to load matches:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [user._id, token]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-purple-50">
                <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                <span className="ml-3 text-purple-700 font-medium">Loading matches...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-purple-50 p-6">
            <h1 className="text-2xl font-bold text-purple-700 mb-6">Your Matches</h1>
            {matches.length === 0 ? (
                <p className="text-gray-500">You have no matches yet.</p>
            ) : (
                <div className="grid gap-4">
                    {matches.map((match) => {
                        const partner = match.users.find((u) => u._id !== user._id);
                        return (
                            <div
                                key={match._id}
                                className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center"
                            >
                                <div>
                                    <p className="text-lg font-semibold text-purple-800">
                                        {partner?.name || "Unknown User"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Unread messages:{" "}
                                        <span className="font-medium text-purple-600">
                                            {match.unreadCount || 0}
                                        </span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigate(`/chat/${match._id}`)}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                                >
                                    Open Chat
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
