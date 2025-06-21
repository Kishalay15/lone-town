import { BarChart3, Snowflake, Flame, Loader2, Rocket, MessageCircle, Clock, TrendingUp } from 'lucide-react';

const AnalyticsCard = ({ user, onToggleFreeze, freezeLoading }) => {
    const { state, analytics, messageCount, freezeEndTime } = user;

    const formatTime = (seconds) => {
        if (!seconds) return "N/A";
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
        return `${Math.round(seconds / 3600)}h`;
    };

    const StatCard = ({ value, label, icon, gradient }) => (
        <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-5 text-center hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center justify-center mb-2">
                <div className="bg-white/30 rounded-xl p-2">
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-white/80 font-medium">{label}</p>
        </div>
    );

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500">
            <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-700 px-8 py-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 relative z-10">
                    <div className="bg-white/20 rounded-xl p-2">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    Activity Analytics
                </h2>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full"></div>
            </div>
            <div className="p-8">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <StatCard
                        value={messageCount || 0}
                        label="Messages Sent"
                        icon={<MessageCircle className="w-5 h-5 text-white" />}
                        gradient="from-blue-500 to-blue-600"
                    />
                    <StatCard
                        value={formatTime(analytics?.avgReplyTime)}
                        label="Avg Reply Time"
                        icon={<Clock className="w-5 h-5 text-white" />}
                        gradient="from-purple-500 to-purple-600"
                    />
                    <StatCard
                        value={analytics?.unpins || 0}
                        label="Unpins"
                        icon={<TrendingUp className="w-5 h-5 text-white" />}
                        gradient="from-orange-500 to-orange-600"
                    />
                    <StatCard
                        value={analytics?.freezes || 0}
                        label="Freezes"
                        icon={<Snowflake className="w-5 h-5 text-white" />}
                        gradient="from-cyan-500 to-cyan-600"
                    />
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6 border border-indigo-100/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-indigo-800 text-lg">Initiations</p>
                            <p className="text-3xl font-bold text-indigo-700">{analytics?.initiations || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4">
                            <Rocket className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>

                <button
                    onClick={onToggleFreeze}
                    disabled={freezeLoading}
                    className={`w-full py-4 px-6 rounded-2xl text-white font-semibold transition-all duration-300 ${state === "available"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl"
                        : "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                        } ${freezeLoading ? "opacity-50 cursor-not-allowed" : "transform hover:scale-105 shadow-lg"}`}
                >
                    {freezeLoading ? (
                        <div className="flex items-center justify-center gap-3">
                            <Loader2 className="animate-spin h-5 w-5" />
                            <span className="text-lg">Processing...</span>
                        </div>
                    ) : state === "available" ? (
                        <div className="flex items-center justify-center gap-3">
                            <Snowflake className="w-5 h-5" />
                            <span className="text-lg">Enter Reflection Freeze</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-3">
                            <Flame className="w-5 h-5" />
                            <span className="text-lg">Unfreeze (if time passed)</span>
                        </div>
                    )}
                </button>

                {state === "frozen" && freezeEndTime && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200">
                        <div className="text-center">
                            <p className="text-rose-700 font-medium mb-1">🕐 Frozen until:</p>
                            <p className="text-rose-800 font-bold text-lg">{new Date(freezeEndTime).toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsCard;
