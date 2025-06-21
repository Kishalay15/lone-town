import { useEffect, useRef } from "react";

export default function MessageList({ messages, currentUserId }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const groupMessagesByTime = (messages) => {
        const grouped = [];
        let currentGroup = [];

        messages.forEach((msg, idx) => {
            const showTime = idx === 0 ||
                new Date(msg.timestamp).getTime() - new Date(messages[idx - 1].timestamp).getTime() > 300000;

            if (showTime && currentGroup.length > 0) {
                grouped.push(currentGroup);
                currentGroup = [];
            }

            currentGroup.push({ ...msg, showTime });
        });

        if (currentGroup.length > 0) {
            grouped.push(currentGroup);
        }

        return grouped;
    };

    const groupedMessages = groupMessagesByTime(messages);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6">
            {groupedMessages.map((group, groupIdx) => (
                <div key={groupIdx} className="mb-6">
                    {group[0].showTime && (
                        <div className="text-center mb-4">
                            <span className="text-xs text-purple-400 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-purple-100/50">
                                {formatTime(group[0].timestamp)}
                            </span>
                        </div>
                    )}

                    <div className="space-y-1">
                        {group.map((msg, idx) => {
                            const isOwn = msg.sender === currentUserId;
                            const isFirst = idx === 0;
                            const isLast = idx === group.length - 1;
                            const isConsecutive = !isFirst && group[idx - 1].sender === msg.sender;

                            return (
                                <div key={idx} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                                    <div className="max-w-[75%] sm:max-w-md">
                                        <div
                                            className={`relative px-4 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md ${isOwn
                                                    ? `bg-gradient-to-r from-purple-500 to-purple-600 text-white ${isFirst && !isConsecutive ? 'rounded-t-2xl' : 'rounded-t-lg'
                                                    } ${isLast ? 'rounded-bl-2xl rounded-br-md' : 'rounded-bl-lg rounded-br-lg'
                                                    }`
                                                    : `bg-white text-gray-800 border border-purple-100/50 shadow-purple-100/30 ${isFirst && !isConsecutive ? 'rounded-t-2xl' : 'rounded-t-lg'
                                                    } ${isLast ? 'rounded-br-2xl rounded-bl-md' : 'rounded-bl-lg rounded-br-lg'
                                                    }`
                                                }`}
                                        >
                                            <p className="text-sm leading-relaxed break-words">
                                                {msg.content}
                                            </p>
                                        </div>

                                        {isLast && (
                                            <div className={`mt-1 px-1 ${isOwn ? "text-right" : "text-left"}`}>
                                                <span className="text-xs text-purple-400/70">
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            <div ref={bottomRef}></div>
        </div>
    );
}
