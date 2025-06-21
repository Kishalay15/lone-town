import { Brain } from 'lucide-react';
import { Sparkles, TrendingUp, Heart } from 'lucide-react';

const TraitsCard = ({ user }) => {
    const { emotionalIntelligence, behavioralPatterns, psychologicalTraits, relationshipValues } = user;

    const TraitItem = ({ label, value, icon }) => (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-purple-100/50 hover:bg-white/90 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <p className="text-sm font-medium text-gray-600">{label}</p>
            </div>
            <p className="text-lg font-bold text-purple-700">{value || "N/A"}</p>
        </div>
    );

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 px-8 py-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 relative z-10">
                    <div className="bg-white/20 rounded-xl p-2">
                        <Brain className="w-6 h-6" />
                    </div>
                    Personality Traits
                </h2>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full"></div>
            </div>
            <div className="p-8 space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100/50">
                    <h3 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Core Attributes
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <TraitItem
                            label="Emotional Intelligence"
                            value={emotionalIntelligence}
                            icon="🧠"
                        />
                        <TraitItem
                            label="Introversion"
                            value={behavioralPatterns?.introversion}
                            icon="🤔"
                        />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100/50">
                    <h3 className="font-bold text-indigo-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Psychological Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <TraitItem
                            label="Openness"
                            value={psychologicalTraits?.openness}
                            icon="🌟"
                        />
                        <TraitItem
                            label="Neuroticism"
                            value={psychologicalTraits?.neuroticism}
                            icon="💭"
                        />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100/50">
                    <h3 className="font-bold text-pink-800 mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Values
                    </h3>
                    <TraitItem
                        label="Honesty"
                        value={relationshipValues?.honesty}
                        icon="✨"
                    />
                </div>
            </div>
        </div>
    );
};

export default TraitsCard;
