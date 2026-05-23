"use client";
import { useState } from "react";
import { loginUser, registerUser } from "@/services/api";
import { useRouter } from "next/navigation";
import { KeyRound, User } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // ĐĂNG NHẬP
        const res = await loginUser(username, password);
        if (res.status === "success") {
          // Lưu Thẻ JWT và Username vào bộ nhớ trình duyệt
          localStorage.setItem("access_token", res.access_token);
          localStorage.setItem("username", res.username);
          router.push("/"); // Chuyển hướng vào màn hình Chat
        } else {
          setError(res.message);
        }
      } else {
        // ĐĂNG KÝ
        const res = await registerUser(username, password);
        if (res.status === "success") {
          alert("Đăng ký thành công! Hãy đăng nhập.");
          setIsLogin(true);
        } else {
          setError(res.message);
        }
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{isLogin ? "Đăng Nhập" : "Đăng Ký Tài Khoản"}</h1>
          <p className="text-gray-500 mt-2">Hệ thống AI Course Agent nội bộ</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" 
                placeholder="Nhập username..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500" 
                placeholder="Nhập mật khẩu..."
              />
            </div>
          </div>
          <button 
            type="submit" disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            {loading ? "Đang xử lý..." : (isLogin ? "Đăng Nhập" : "Đăng Ký")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline">
            {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}