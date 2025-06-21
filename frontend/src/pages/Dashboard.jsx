import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, LayoutDashboard, MessageCircle, Heart } from "lucide-react";
import axios from "../api/axios";
import toast from "react-hot-toast";
import ProfileCard from "../components/ProfileCard";
import TraitsCard from "../components/TraitsCard";
import AnalyticsCard from "../components/AnalyticsCard";
import useLogout from "../utils/logout";
import NotificationPanel from "../components/NotificationsPanel";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [freezeLoading, setFreezeLoading] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const logout = useLogout();

    const fetchLatestAnalytics = async () => {
        try {
            const res = await axios.get(`/${user._id}/analytics/refresh`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });

            const updatedUser = {
                ...user,
                messageCount: res.data.messageCount,
                analytics: res.data.analytics,
            };

            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) {
            console.error("Failed to refresh analytics", err);
        }
    };


    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) return navigate("/login");

            const parsedUser = JSON.parse(storedUser);
            if (!parsedUser?._id) return navigate("/login");

            setUser(parsedUser);
        } catch {
            navigate("/login");
        }
    }, [navigate]);

    useEffect(() => {
        if (user && user._id) {
            fetchLatestAnalytics();
        }
    }, [user?._id]);


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

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 flex flex-col items-center gap-6 border border-white/20">
                    <div className="relative">
                        <Loader2 className="animate-spin h-12 w-12 text-purple-600" />
                        <div className="absolute inset-0 h-12 w-12 rounded-full bg-purple-100 animate-pulse"></div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-purple-800 mb-2">Loading Dashboard</h3>
                        <p className="text-purple-600">Preparing your profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl shadow-xl border-b border-white/20 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-800 to-indigo-800 bg-clip-text text-transparent flex items-center gap-3">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-2">
                            <LayoutDashboard className="w-8 h-8 text-white" />
                        </div>
                        Dashboard
                    </h1>
                    <button
                        onClick={() => setShowNotifications(true)}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition"
                    >
                        Notifications
                    </button>

                    <button
                        onClick={logout}
                        className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 transition-all duration-300 hover:shadow-xl transform hover:scale-105"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8 space-y-10">

                {/* Profile Card */}
                <div className="transform hover:scale-[1.01] transition-transform duration-500">
                    <ProfileCard
                        user={user}
                        onEditProfile={() => navigate("/edit-profile")}
                    />
                </div>
                {/* Enhanced Matches Button */}
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate("/matches")}
                        className="group relative bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:via-purple-700 hover:to-indigo-700 text-white px-12 py-6 rounded-3xl font-bold text-xl transition-all duration-500 hover:shadow-2xl transform hover:scale-110 flex items-center gap-4 min-w-[350px] justify-center"
                    >
                        <div className="relative">
                            <MessageCircle className="w-8 h-8 group-hover:scale-125 transition-transform duration-500" />
                            <Heart className="w-4 h-4 absolute -top-2 -right-2 text-pink-200 group-hover:text-pink-100 transition-colors duration-500 animate-pulse" />
                        </div>
                        <span>View Your Matches</span>
                        <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500 -z-10"></div>
                    </button>
                </div>

                {/* Cards Grid */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Traits Card */}
                    <div className="transform hover:scale-[1.02] transition-transform duration-300">
                        <TraitsCard user={user} />
                    </div>

                    {/* Analytics Card */}
                    <div className="transform hover:scale-[1.02] transition-transform duration-300">
                        <AnalyticsCard
                            user={user}
                            onToggleFreeze={handleToggleFreeze}
                            freezeLoading={freezeLoading}
                        />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-100 via-indigo-100 to-pink-100 rounded-3xl p-8 border-2 border-white/30 shadow-xl backdrop-blur-sm">
                    <div className="text-center">
                        <div className="mb-4">
                            <span className="text-4xl">{user.state === 'available' ? '🌟' : '⏸️'}</span>
                        </div>
                        <p className="text-lg text-purple-700 font-medium leading-relaxed">
                            Your profile is <span className="font-bold">{user.state === 'available' ? 'active and visible' : 'currently frozen'}</span>.
                            <br />
                            <span className="text-purple-600">
                                {user.state === 'available'
                                    ? '✨ You\'re ready to connect with new matches!'
                                    : '🧘‍♀️ Take your time to reflect and return when ready.'
                                }
                            </span>
                        </p>
                    </div>
                </div>
            </div>
            {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} />}
        </div>
    );
}
