import React, { useState } from "react";
import {
  useSendMessageMutation,
  useGetMessagesQuery,
} from "@/features/api/messageApi";
import { useSelector } from "react-redux";

const SimpleMessaging = ({ courseId, receiverId }) => {
  const [content, setContent] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [sendMessage] = useSendMessageMutation();
  const { data, refetch } = useGetMessagesQuery({ courseId, receiverId });

  const handleSend = async () => {
    if (!content.trim()) return;
    await sendMessage({ courseId, receiverId, content });
    setContent("");
    refetch();
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Messagerie</h3>
      <div className="h-60 overflow-y-auto mb-3 bg-gray-50 p-2 rounded">
        {data?.messages?.map((msg, idx) => (
          <div key={idx} className="mb-2">
            <span className="font-semibold">{msg.sender.name}</span>: {msg.content}
          </div>
        ))}
      </div>

      <textarea
        className="w-full border p-2 mb-2"
        rows={3}
        placeholder="Écrire un message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSend}
      >
        Envoyer
      </button>
    </div>
  );
};

export default SimpleMessaging;
