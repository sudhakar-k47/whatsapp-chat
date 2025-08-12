import React, { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, X, Send } from "lucide-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { sendMessage } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e) => {
    handleImageChange(e);
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    fileInputRef.current.value = null;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (text.trim() || imagePreview) {
      sendMessage({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border [border-zinc-700]"
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

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message ... "
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileInputChange}
          />

          <button
            onClick={() => fileInputRef.current.click()}
            className="btn btn-primary"
            type="button"
          >
            <Image size={20} />
          </button>

          <button
            onClick={handleSendMessage}
            className="btn btn-primary"
            type="submit"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
