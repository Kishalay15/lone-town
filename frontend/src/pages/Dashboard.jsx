import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [freezeLoading, setFreezeLoading] = useState(false);


    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return navigate("/login");

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
    }, [navigate]);

    if (!user) return <div className="text-center mt-20">Loading...</div>;

    const { name, email, state, emotionalIntelligence, behavioralPatterns, psychologicalTraits, relationshipValues, analytics } = user;

    const handleToggleFreeze = async () => {
        setFreezeLoading(true);
        try {
            const res = await axios.post(
                "/users/freeze-toggle",
                { userId: user._id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            toast.success(res.data.message);

            const updatedUser = {
                ...user,
                state: res.data.state,
                freezeEndTime: res.data.freezeEndTime || null,
            };

            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) {
            toast.error(err.response?.data?.message || "Freeze toggle failed");
        } finally {
            setFreezeLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-purple-50 p-6 flex flex-col items-center gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6">
                <h2 className="text-xl font-bold text-purple-700 mb-2">👤 Profile</h2>
                <p><strong>Name:</strong> {name}</p>
                <p><strong>Email:</strong> {email}</p>
                <p>
                    <strong>Status:</strong>{" "}
                    <span className={state === "available" ? "text-green-600" : "text-red-600"}>
                        {state}
                    </span>
                </p>
                <button
                    onClick={() => navigate("/edit-profile")}
                    className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                    Edit Profile
                </button>
            </div>

            {/* Traits Card */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6">
                <h2 className="text-xl font-bold text-purple-700 mb-4">🧠 Traits & Values</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>Emotional Intelligence: {emotionalIntelligence}</p>
                    <p>Introversion: {behavioralPatterns?.introversion}</p>
                    <p>Openness: {psychologicalTraits?.openness}</p>
                    <p>Neuroticism: {psychologicalTraits?.neuroticism}</p>
                    <p>Honesty: {relationshipValues?.honesty}</p>
                </div>
            </div>

            {/* Analytics Card */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6">
                <h2 className="text-xl font-bold text-purple-700 mb-4">📊 Activity Analytics</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>Messages Sent: {user.messageCount}</p>
                    <p>Avg Reply Time: {analytics?.avgReplyTime}s</p>
                    <p>Unpins: {analytics?.unpins}</p>
                    <p>Freezes: {analytics?.freezes}</p>
                    <p>Initiations: {analytics?.initiations}</p>
                </div>
                <button
                    onClick={handleToggleFreeze}
                    disabled={freezeLoading}
                    className={`mt-4 px-4 py-2 rounded-lg text-white ${state === "available"
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-600 hover:bg-gray-700"
                        } ${freezeLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    {freezeLoading
                        ? "Processing..."
                        : state === "available"
                            ? "Enter Reflection Freeze"
                            : "Unfreeze (if time passed)"}
                </button>

                {state === "frozen" && user.freezeEndTime && (
                    <p className="text-sm text-gray-500 mt-2">
                        Will unfreeze at: <strong>{new Date(user.freezeEndTime).toLocaleString()}</strong>
                    </p>
                )}

            </div>
        </div>
    );
}
