import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Bell, X } from "lucide-react";
import toast from "react-hot-toast";

export default function NotificationPanel({ onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get("/notifications");
            setNotifications(Array.isArray(res.data?.notifications) ? res.data.notifications : []);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
            toast.error("Unable to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post("/notifications/mark-read");
            toast.success("All notifications marked as read");
            await fetchNotifications();
        } catch (err) {
            toast.error("Failed to mark as read");
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-purple-600 hover:text-purple-800"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                    <Bell className="w-6 h-6" />
                    Notifications
                </h2>

                {loading ? (
                    <p className="text-purple-500">Loading...</p>
                ) : notifications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No notifications yet</p>
                ) : (
                    <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {notifications.map((n) => (
                            <li
                                key={n._id}
                                className={`p-3 rounded-xl border ${n.read ? "bg-gray-50" : "bg-purple-50 border-purple-200"}`}
                            >
                                <p className="text-sm text-gray-800">{n.message}</p>
                                <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={markAllAsRead}
                        className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl"
                    >
                        Mark all as read
                    </button>
                </div>
            </div>
        </div>
    );
}
