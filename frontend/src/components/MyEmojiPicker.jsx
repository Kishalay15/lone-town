import EmojiPicker from 'emoji-picker-react';

export default function MyEmojiPicker({ onEmojiClick }) {
    return (
        <EmojiPicker
            onEmojiClick={(emojiData) => onEmojiClick(emojiData.emoji)}
            theme="light"
        />
    );
}
