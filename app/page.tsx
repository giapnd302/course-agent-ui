"use client";
import { useState, useEffect, useRef } from "react";
import { fetchSessions, sendChatMessage, fetchTokenUsage } from "@/services/api";
import { MessageSquare, PlusCircle, Send, Loader2, LogOut, Coins } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  
  // Thông tin User đăng nhập
  const [currentUser, setCurrentUser] = useState("");
  const [tokenUsed, setTokenUsed] = useState(0);

  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // KIỂM TRA ĐĂNG NHẬP (Chạy ngay khi mở web)
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (!storedUser) {
      router.push("/login"); // Nếu chưa đăng nhập thì đuổi ra trang Login
    } else {
      setCurrentUser(storedUser);
      loadUserData(storedUser);
    }
  }, []);

  const loadUserData = async (username: string) => {
    try {
      const [sessionResult, tokenResult] = await Promise.all([
        fetchSessions(username),
        fetchTokenUsage(username)
      ]);
      if (sessionResult.status === "success") setSessions(sessionResult.data);
      if (tokenResult.status === "success") setTokenUsed(tokenResult.total_tokens_used);
    } catch (error) {
      console.error("Lỗi tải dữ liệu", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping || !currentUser) return;
    const userMessage = inputText;
    setInputText("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setIsTyping(true);

    try {
      const result = await sendChatMessage(currentUser, userMessage, currentSessionId);
      if (result.status === "success") {
        if (!currentSessionId) setCurrentSessionId(result.session_id);
        setMessages(prev => [...prev, { role: "model", text: result.data.response }]);
        loadUserData(currentUser); // Load lại để update số Token mới nhất
      } else {
        alert("Lỗi: " + result.message);
      }
    } catch (error) {
      alert("Mất kết nối máy chủ AI.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewPlan = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  // NẾU CHƯA LOAD XONG THÔNG TIN THÌ HIỆN MÀN HÌNH TRẮNG ĐỂ TRÁNH NHÁY GIAO DIỆN
  if (!currentUser) return <div className="h-screen bg-gray-50 flex justify-center items-center">Loading...</div>;

  return (
    <main className="flex h-screen bg-white">
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
        <button onClick={handleNewPlan} className="flex items-center gap-2 border border-gray-600 rounded-md p-3 hover:bg-gray-800 transition">
          <PlusCircle size={20} /><span>New Plan</span>
        </button>

        <div className="mt-6 font-semibold text-xs text-gray-400 mb-2 px-2 uppercase">Lịch sử của {currentUser}</div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {loadingHistory ? (
            <p className="text-gray-500 text-sm italic px-2">Đang tải...</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-500 text-sm px-2">Chưa có dữ liệu</p>
          ) : (
            sessions.map((session, index) => (
              <div key={session.session_id} className={`flex items-center gap-2 p-3 rounded-md cursor-pointer text-sm ${currentSessionId === session.session_id ? 'bg-gray-700' : 'hover:bg-gray-800'}`}>
                <MessageSquare size={16} />
                <span className="truncate">Plan #{sessions.length - index} ({session.state?.plan_status || 'Draft'})</span>
              </div>
            ))
          )}
        </div>

        {/* THÔNG TIN USER & TOKEN (TÍT DƯỚI CÙNG) */}
        <div className="mt-auto border-t border-gray-700 pt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-yellow-500 px-2">
            <Coins size={16} />
            <span>Tokens đã dùng: <b>{tokenUsed.toLocaleString()}</b></span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-2 transition w-full">
            <LogOut size={16} />
            <span>Đăng xuất ({currentUser})</span>
          </button>
        </div>
      </div>

      {/* KHU VỰC CHAT (Giữ nguyên như cũ) */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Hãy nhập yêu cầu tạo khóa học để bắt đầu...</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl rounded-lg p-4 shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                  {msg.role === 'user' ? msg.text : (
                    <div className="prose prose-sm md:prose-base max-w-none"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                  )}
                </div>
              </div>
            ))
          )}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center gap-2 text-gray-500">
                 <Loader2 className="animate-spin" size={20} /><span>AI đang suy nghĩ...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto relative flex items-center">
            <textarea
              className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-blue-500 resize-none shadow-sm"
              rows={2} placeholder="Nhập yêu cầu..." value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            />
            <button onClick={handleSendMessage} disabled={isTyping || !inputText.trim()} className="absolute right-3 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}