import { User, Edit2 } from 'lucide-react';

const ProfileCard = ({ user, onEditProfile }) => {
    const { name, email, state } = user;

    const getStatusColor = (status) => {
        return status === "available"
            ? "bg-green-100 text-green-800 border-green-200"
            : "bg-red-100 text-red-800 border-red-200";
    };

    const getStatusIcon = (status) => {
        return status === "available" ? "🟢" : "⏸️";
    };

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500">
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 px-8 py-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 relative z-10">
                    <div className="bg-white/20 rounded-xl p-2">
                        <User className="w-6 h-6" />
                    </div>
                    Profile Information
                </h2>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full"></div>
            </div>
            <div className="p-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">{name?.charAt(0) || 'U'}</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                                <span className="text-sm">{getStatusIcon(state)}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-800">{name || 'User'}</h3>
                            <p className="text-gray-600">{email || 'user@example.com'}</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(state)}`}>
                                {state ? state.charAt(0).toUpperCase() + state.slice(1) : 'Available'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onEditProfile}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileCard;
