import axios from 'axios';

// Đọc địa chỉ Backend từ file .env.local
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Cấu hình axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Hàm gọi API lấy danh sách lịch sử
export const fetchSessions = async (userId: string) => {
  const response = await apiClient.get(`/sessions/${userId}`);
  return response.data;
};

// 2. Hàm gọi API lấy chi tiết một cuộc trò chuyện
export const fetchSessionHistory = async (userId: string, sessionId: string) => {
  const response = await apiClient.get(`/sessions/${userId}/${sessionId}`);
  return response.data;
};

// 3. Hàm gọi API gửi tin nhắn để AI tạo Plan
export const sendChatMessage = async (userId: string, message: string, sessionId?: string | null) => {
  const payload = {
    user_id: userId,
    message: message,
    session_id: sessionId || null, // Nếu null, Backend sẽ tự hiểu là tạo mới
  };
  const response = await apiClient.post('/chat-plan', payload);
  return response.data;
};