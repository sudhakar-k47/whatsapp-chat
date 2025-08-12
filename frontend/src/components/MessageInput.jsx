import React, { useRef, useState, useEffect, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, X, Paperclip, FileText, Plus, Send } from "lucide-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  const { sendMessage, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  const emitTyping = useCallback(
    (typing) => {
      if (!socket || !selectedUser) return;
      const userId = selectedUser._id || selectedUser.id;
      socket.emit("typing", { receiverId: userId, isTyping: typing });
    },
    [socket, selectedUser]
  );

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Auto-resize textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (newText && !isTyping) {
      setIsTyping(true);
      emitTyping(true);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        emitTyping(false);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTyping) emitTyping(false);
    };
  }, [isTyping, emitTyping]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    if (isTyping) {
      setIsTyping(false);
      emitTyping(false);
    }

    sendMessage({ text: text.trim(), image: imagePreview });
    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = null;

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="p-3 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative bg-transparent">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border"
            />
            <button
              onClick={removeImagePreview}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSendMessage}
        className="flex items-end gap-2 w-full"
      >
        <div className="relative flex-1 flex items-end bg-base-100 border rounded-lg p-2">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Type a message..."
              value={text}
              onChange={handleTextChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              className="w-full resize-none bg-transparent outline-none text-base max-h-40 overflow-y-auto"
              style={{ lineHeight: "1.4" }}
            />
          <button
            onClick={() => fileInputRef.current.click()}
            type="button"
            className="ml-2 text-zinc-500 hover:text-zinc-700 cursor-pointer"
            aria-label="Attach image"
          >
            <Image size={20} />
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary rounded-lg p-3 flex items-center justify-center"
          aria-label="Send message"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
