import { useState, useRef, useEffect } from "react";
import { Send, Smile } from "lucide-react";
import MyEmojiPicker from "./MyEmojiPicker";

export default function MessageInput({ onSend, loading = false }) {
    const [content, setContent] = useState("");
    const [showPicker, setShowPicker] = useState(false);
    const textareaRef = useRef();

    const handleSend = (e) => {
        e.preventDefault();
        const trimmed = content.trim();
        if (!trimmed) return;

        onSend(trimmed);
        setContent("");
        setShowPicker(false);
    };

    const handleEmojiSelect = (emoji) => {
        const ref = textareaRef.current;
        if (!ref) return;

        const start = ref.selectionStart;
        const end = ref.selectionEnd;
        const updatedText = content.slice(0, start) + emoji + content.slice(end);

        setContent(updatedText);

        // Restore cursor position after emoji
        setTimeout(() => {
            ref.selectionStart = ref.selectionEnd = start + emoji.length;
            ref.focus();
        }, 0);
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
        }
    }, [content]);

    return (
        <div className="bg-white/90 backdrop-blur-sm border-t border-purple-100/50 shadow-xl relative">
            <form onSubmit={handleSend} className="p-4">
                <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Message..."
                            rows={1}
                            disabled={loading}
                            className="w-full px-4 py-3 pr-12 rounded-full border-2 border-purple-200/50 bg-purple-50/30 min-h-[48px] max-h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-300 transition-all duration-300 placeholder-purple-400/70"
                            style={{ overflow: 'hidden' }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                        />

                        {/* Emoji button */}
                        <button
                            type="button"
                            onClick={() => setShowPicker((prev) => !prev)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-purple-100/70 transition-colors duration-200"
                        >
                            <Smile className="w-5 h-5 text-purple-500" />
                        </button>

                        {/* Emoji Picker dropdown */}
                        {showPicker && (
                            <div className="absolute bottom-14 right-0 z-50">
                                <div className="bg-white rounded-2xl shadow-2xl border border-purple-100/50 overflow-hidden">
                                    <MyEmojiPicker onEmojiClick={handleEmojiSelect} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Send button */}
                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:transform-none shadow-purple-200/50 shadow-lg"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
