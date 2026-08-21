import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Mail, Lock, User as UserIcon, BookOpen, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export default function Register() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoginView, setIsLoginView] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setStep(2);
    setErrorMsg(''); 
  };

  const handleBackToRoleSelection = () => {
    setStep(1);
    setSelectedRole(null);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isLoginView) {
        // Login Flow
        const response = await axios.post(`${API_URL}/login`, { email, password });
        loginUser(response.data.user);
        navigate('/dashboard');
      } else {
        // Registration Flow
        if (password.length < 6) {
            setErrorMsg('Mật khẩu quá yếu (cần ít nhất 6 ký tự).');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/register`, { 
                name, 
                email, 
                password, 
                role: selectedRole 
            });
            // Auto login after registration
            loginUser(response.data.user);
            navigate('/dashboard');
        } catch (err) {
            if (err.response && err.response.status === 400) {
                setErrorMsg('Email này đã được đăng ký');
                
                // Automatically redirect to Login view after a short delay
                setTimeout(() => {
                    setIsLoginView(true);
                    setErrorMsg('');
                }, 1500);
                
                setIsLoading(false);
                return;
            }
            throw err;
        }
      }

    } catch (error) {
      console.error("Lỗi Auth:", error);
      if (error.response && error.response.status === 401) {
        setErrorMsg('Email hoặc mật khẩu không đúng!');
      } else {
        setErrorMsg('Có lỗi xảy ra: Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl flex overflow-hidden min-h-[550px]">

        {/* Cột trái */}
        <div className="hidden md:flex md:w-5/12 bg-blue-600 flex-col justify-between p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12 cursor-pointer" onClick={handleBackToRoleSelection}>
              <GraduationCap className="w-10 h-10" />
              <span className="text-2xl font-bold">EduSubmit</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Quản lý học tập<br />Dễ dàng hơn bao giờ hết
            </h2>
            <p className="text-blue-100 text-lg">
              Tham gia cùng hàng ngàn giảng viên và sinh viên trên nền tảng của chúng tôi.
            </p>
          </div>
          <BookOpen className="absolute -bottom-10 -left-10 w-64 h-64 text-blue-500 opacity-50" />
        </div>

        {/* Cột phải */}
        <div className="w-full md:w-7/12 p-8 sm:px-12 flex flex-col justify-center">

          {step === 1 && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">Bạn là ai?</h2>
                <p className="text-gray-500 text-lg">Vui lòng chọn vai trò để bắt đầu</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button
                  onClick={() => handleSelectRole('student')}
                  className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                >
                  <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-10 h-10" />
                  </div>
                  <span className="text-xl font-bold text-gray-800 group-hover:text-blue-700">Học sinh</span>
                </button>

                <button
                  onClick={() => handleSelectRole('teacher')}
                  className="group flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300"
                >
                  <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-10 h-10" />
                  </div>
                  <span className="text-xl font-bold text-gray-800 group-hover:text-orange-700">Giáo viên</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in relative h-full flex flex-col justify-center py-4">

              <button onClick={handleBackToRoleSelection} className="absolute -top-2 sm:-top-4 left-0 flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Đổi vai trò</span>
              </button>

              <div className="text-center mb-6 mt-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  {isLoginView ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
                </h2>
                <p className="text-gray-500 flex items-center justify-center gap-2">
                  Đăng nhập dưới quyền:
                  <span className={`font-bold ${selectedRole === 'teacher' ? 'text-orange-600' : 'text-blue-600'}`}>
                    {selectedRole === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                  </span>
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center font-medium">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {!isLoginView && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" placeholder="Họ và tên" required
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="email" required
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'teacher' ? 'Email (VD: teacher@gmail.com)' : 'Email (VD: student@gmail.com)'}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="password" placeholder="Mật khẩu" required
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 mt-4 rounded-lg font-bold text-white shadow-md transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    } ${selectedRole === 'teacher' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {isLoading ? 'Đang xử lý...' : (isLoginView ? 'Đăng nhập' : 'Tạo tài khoản')}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-600">
                {isLoginView ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                <button
                  onClick={() => setIsLoginView(!isLoginView)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  {isLoginView ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}