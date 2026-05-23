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

// ... (giữ nguyên các hàm cũ ở trên)

// 4. Hàm gọi API Đăng nhập
export const loginUser = async (username: string, password: string) => {
  const response = await apiClient.post('/login', { username, password });
  return response.data;
};

// 5. Hàm gọi API Đăng ký
export const registerUser = async (username: string, password: string) => {
  const response = await apiClient.post('/register', { username, password });
  return response.data;
};

// 6. Hàm lấy số lượng Token đã dùng
export const fetchTokenUsage = async (username: string) => {
  const response = await apiClient.get(`/tokens/${username}`);
  return response.data;
};