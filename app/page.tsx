"use client";

import { useState, useEffect, useRef } from "react";
import { fetchSessions, sendChatMessage } from "../services/api";
import { MessageSquare, PlusCircle, Send, Loader2, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Các State cho khu vực Chat
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const USER_ID = "test_user_1";

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // Load Lịch sử (Sidebar)
  const loadSessions = async () => {
    try {
      const result = await fetchSessions(USER_ID);
      if (result.status === "success") setSessions(result.data);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => { loadSessions(); }, []);

  // Hàm xử lý khi bấm nút Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage = inputText;
    setInputText("");
    // Thêm tin nhắn của User vào màn hình ngay lập tức
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsTyping(true);

    try {
      // Gọi API sang Backend FastAPI
      const result = await sendChatMessage(USER_ID, userMessage, currentSessionId);
      
      if (result.status === "success") {
        // Lưu lại Session ID nếu là lần chat đầu tiên
        if (!currentSessionId) {
          setCurrentSessionId(result.session_id);
          loadSessions(); // Load lại Sidebar để hiện Plan mới
        }
        // Thêm câu trả lời của AI vào màn hình
        setMessages(prev => [...prev, { role: "model", text: result.data.response }]);
      } else {
        alert("Lỗi từ server: " + result.message);
      }
    } catch (error) {
      alert("Không thể kết nối đến máy chủ AI!");
    } finally {
      setIsTyping(false);
    }
  };

  // Hàm tạo Plan mới
  const handleNewPlan = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  return (
    <main className="flex h-screen bg-white">
      {/* CỘT TRÁI: SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <button 
          onClick={handleNewPlan}
          className="flex items-center gap-2 border border-gray-600 rounded-md p-3 hover:bg-gray-800 transition"
        >
          <PlusCircle size={20} />
          <span>New Plan</span>
        </button>

        <div className="mt-6 font-semibold text-xs text-gray-400 mb-2 px-2 uppercase">Lịch sử</div>
        
        <div className="flex-1 overflow-y-auto space-y-1">
          {loadingHistory ? (
            <p className="text-gray-500 text-sm italic px-2">Đang tải...</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-500 text-sm px-2">Chưa có dữ liệu</p>
          ) : (
            sessions.map((session, index) => (
              <div 
                key={session.session_id}
                className={`flex items-center gap-2 p-3 rounded-md cursor-pointer text-sm ${currentSessionId === session.session_id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <MessageSquare size={16} />
                <span className="truncate">Plan #{sessions.length - index} ({session.state?.plan_status || 'Draft'})</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CỘT PHẢI: KHU VỰC CHAT */}
      <div className="flex-1 flex flex-col bg-gray-50">
        
        {/* Nơi hiển thị tin nhắn */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Hãy nhập yêu cầu tạo khóa học để bắt đầu...</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl rounded-lg p-4 shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                  {msg.role === 'user' ? (
                    msg.text
                  ) : (
                    // Dùng ReactMarkdown để render chữ AI cho đẹp (có in đậm, danh sách...)
                    <div className="prose prose-sm md:prose-base">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* Hiệu ứng Loading xoay xoay khi chờ AI gõ */}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center gap-2 text-gray-500">
                 <Loader2 className="animate-spin" size={20} />
                 <span>AI đang suy nghĩ và viết kế hoạch...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Ô Nhập liệu (Input box) */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto relative flex items-center">
            <textarea
              className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 resize-none shadow-sm"
              rows={2}
              placeholder="Ví dụ: Tạo cho tôi khóa học Data Analyst 4 chương..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isTyping || !inputText.trim()}
              className="absolute right-3 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">AI có thể mắc sai lầm. Hãy kiểm tra lại thông tin quan trọng.</p>
        </div>
        
      </div>
    </main>
  );
}