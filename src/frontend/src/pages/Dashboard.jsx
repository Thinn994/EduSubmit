import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, Bell, User, Book, Calendar, Folder, MoreVertical, GraduationCap, Clock, ChevronLeft, ChevronRight, Shield, Moon, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const { currentUser, userRole, userData, logoutUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('classes');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [showJoinCourseModal, setShowJoinCourseModal] = useState(false);
  const [courseInput, setCourseInput] = useState('');

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!currentUser) return;
      try {
        let endpoint = `${API_URL}/courses`;
        if (userRole === 'teacher') {
          endpoint += `?teacherId=${currentUser.uid}`;
        } else {
          endpoint += `?studentId=${currentUser.uid}`;
        }
        
        const response = await axios.get(endpoint);
        const fetchedCourses = response.data;
        setCourses(fetchedCourses);
        
        const fetchedAssignments = [];
        for (const course of fetchedCourses) {
           const assignRes = await axios.get(`${API_URL}/assignments?courseId=${course._id}`);
           fetchedAssignments.push(...assignRes.data);
        }
        setAssignments(fetchedAssignments);

      } catch (error) {
        console.error("Error fetching courses from MongoDB:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentUser, userRole]);

  const handleCreateCourse = async () => {
    if (!courseInput) return;
    
    try {
      const newCourse = {
        name: courseInput,
        code: `COURSE-${Math.floor(Math.random()*10000)}`,
        section: "Khóa mới",
        teacherId: currentUser.uid,
        teacher: userData?.name || 'Giảng viên',
        color: "bg-blue-600",
        enrolledStudents: []
      };
      const response = await axios.post(`${API_URL}/courses`, newCourse);
      setCourses([...courses, response.data]);
      alert(`Tạo lớp học thành công! Mã lớp của bạn là: ${response.data.classCode}`);
      setShowCreateCourseModal(false);
      setCourseInput('');
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tạo lớp học");
    }
  };

  const handleJoinCourse = async () => {
    if (!courseInput) return;

    try {
      await axios.post(`${API_URL}/courses/join`, { 
          classCode: courseInput,
          studentId: currentUser.uid 
      });
      alert("Tham gia thành công! Vui lòng tải lại trang.");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Mã lớp học không hợp lệ hoặc có lỗi xảy ra");
    }
  };

  const handleLogout = () => {
    try {
      logoutUser();
      navigate('/register');
    } catch (error) {
      console.error("Lỗi đăng xuất", error);
    }
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const bgMain = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const bgCard = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textMain = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderCol = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  const userInitials = userData?.name ? userData.name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className={`min-h-screen font-sans flex ${bgMain} ${textMain} transition-colors duration-300`}>

      {/* SIDEBAR TRÁI */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0 -ml-64'} transition-all duration-300 ease-in-out ${bgCard} border-r ${borderCol} h-screen sticky top-0 overflow-y-auto shrink-0 flex flex-col`}>
        <div className={`p-4 border-b ${borderCol} flex items-center gap-3 cursor-pointer`} onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold">EduSubmit</span>
        </div>

        <div className="flex-1 py-4">
          <div className="px-3 mb-2">
            <button onClick={() => setActiveView('classes')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${activeView === 'classes' ? 'bg-blue-500 text-white' : `${textMain} ${hoverBg}`}`}>
              <Book className="w-5 h-5" />
              <span className="font-medium">Lớp học</span>
            </button>
            <button onClick={() => setActiveView('calendar')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors mt-1 ${activeView === 'calendar' ? 'bg-blue-500 text-white' : `${textMain} ${hoverBg}`}`}>
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Lịch</span>
            </button>
          </div>

          <div className="mt-6">
            <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${textSub}`}>
              {userRole === 'teacher' ? 'Đang giảng dạy' : 'Đã đăng ký'}
            </div>

            <div className="mt-2 flex flex-col gap-1 px-3">
              <button className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-colors group ${hoverBg} ${textMain}`}>
                <div className={`w-8 h-8 rounded-full border ${borderCol} flex items-center justify-center ${textSub} group-hover:text-blue-500 group-hover:border-blue-300 transition-colors`}>
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm truncate">Việc cần làm</span>
              </button>

              {courses.map(course => (
                <button key={course._id} onClick={() => navigate(`/course/stream/${course._id}`)} className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-colors group ${hoverBg} ${textMain}`}>
                  <div className={`w-8 h-8 rounded-full ${course.color || 'bg-blue-600'} flex items-center justify-center text-white font-medium text-sm group-hover:shadow-md transition-shadow`}>
                    {course.name.charAt(0)}
                  </div>
                  <span className="font-medium text-sm truncate">{course.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* NỘI DUNG CHÍNH (BÊN PHẢI) */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <nav className={`h-16 ${bgCard} border-b ${borderCol} px-4 flex items-center justify-between shrink-0 transition-colors duration-300`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-2 rounded-full transition-colors ${hoverBg} ${textSub}`}>
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowAddMenu(!showAddMenu)} className={`p-2 rounded-full transition-colors ${hoverBg} ${textSub}`}>
                <Plus className="w-6 h-6" />
              </button>
              {showAddMenu && (
                <div className={`absolute right-0 mt-2 w-48 ${bgCard} border ${borderCol} rounded-lg shadow-lg py-1 z-50`}>
                  {userRole === 'teacher' ? (
                    <button onClick={() => { setShowAddMenu(false); setShowCreateCourseModal(true); }} className={`w-full text-left px-4 py-2 text-sm font-medium ${textMain} ${hoverBg}`}>Tạo lớp học</button>
                  ) : (
                    <button onClick={() => { setShowAddMenu(false); setShowJoinCourseModal(true); }} className={`w-full text-left px-4 py-2 text-sm font-medium ${textMain} ${hoverBg}`}>Tham gia lớp học</button>
                  )}
                </div>
              )}
            </div>

            <button className={`p-2 rounded-full transition-colors ${hoverBg} ${textSub}`}>
              <Bell className="w-6 h-6" />
            </button>

            <div className="relative ml-2">
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="p-1 border-2 border-transparent focus:border-blue-300 rounded-full transition-all">
                <div className="w-8 h-8 bg-blue-500 hover:bg-blue-600 transition-colors rounded-full flex items-center justify-center text-white font-medium shadow-sm">
                  {userInitials}
                </div>
              </button>

              {showProfileMenu && (
                <div className={`absolute right-0 mt-2 w-64 ${bgCard} border ${borderCol} rounded-xl shadow-xl py-2 z-50 animate-fade-in`}>
                  <div className={`px-4 py-3 border-b ${borderCol}`}>
                    <p className={`text-sm font-bold ${textMain}`}>{userData?.name || 'User'}</p>
                    <p className={`text-xs truncate mt-0.5 ${textSub}`}>
                      {userData?.email || ''}
                    </p>
                  </div>

                  <div className="py-2">
                    <button onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${hoverBg} ${textMain}`}>
                      <User className={`w-4 h-4 ${textSub}`} /><span className="font-medium">Thông tin cá nhân</span>
                    </button>

                    <button onClick={() => { setShowSecurityModal(true); setShowProfileMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${hoverBg} ${textMain}`}>
                      <Shield className={`w-4 h-4 ${textSub}`} /><span className="font-medium">Bảo mật</span>
                    </button>

                    <button onClick={toggleTheme} className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${hoverBg} ${textMain}`}>
                      <div className="flex items-center gap-3">
                        <Moon className={`w-4 h-4 ${textSub}`} /><span className="font-medium">Giao diện (Dark)</span>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-all duration-300 ${isDarkMode ? 'left-4' : 'left-1'}`}></div>
                      </div>
                    </button>
                  </div>

                  <div className={`border-t ${borderCol} py-2`}>
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 ${hoverBg}`}>
                      <LogOut className="w-4 h-4" /><span className="font-bold">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {loading ? (
             <div className="flex justify-center items-center h-full">Đang tải...</div>
          ) : activeView === 'classes' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(course => {
                const upcomingAssignment = assignments.find(a => a.courseId === course._id);
                return (
                <div key={course._id} className={`${bgCard} rounded-xl border ${borderCol} overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-[280px]`}>
                  <div className={`${course.color || 'bg-blue-600'} h-28 p-4 relative cursor-pointer`} onClick={() => navigate(`/course/stream/${course._id}`)}>
                    <div className="flex justify-between items-start text-white">
                      <div className="w-5/6">
                        <h2 className="text-xl font-bold truncate hover:underline">{course.name}</h2>
                        <p className="text-sm opacity-90 mt-1 truncate">{course.section}</p>
                        <p className="text-xs opacity-75 mt-1 truncate">{course.teacher}</p>
                      </div>
                      <button className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white" onClick={(e) => { e.stopPropagation(); alert(`Course ID (to join): ${course._id}`); }}>
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    <div className={`absolute -bottom-8 right-4 w-16 h-16 ${bgCard} rounded-full p-1 shadow-md transition-colors duration-300`}>
                      <div className={`w-full h-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center ${textSub}`}>
                        <User className="w-8 h-8" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-10 flex-1 flex flex-col cursor-pointer" onClick={() => upcomingAssignment && navigate(`/course/stream/${course._id}/assignment/${upcomingAssignment._id}`)}>
                    {upcomingAssignment ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-semibold text-orange-600">Sắp đến hạn: {upcomingAssignment.dueDate || 'Chưa rõ'}</span>
                        </div>
                        <p className={`text-sm line-clamp-2 hover:text-blue-500 hover:underline ${textMain}`}>
                          <span className="font-medium text-red-500 mr-1">📌</span>
                          {upcomingAssignment.title}
                        </p>
                      </>
                    ) : (
                        <p className={`text-sm text-gray-400 mt-2`}>Không có bài tập sắp tới</p>
                    )}
                  </div>

                  <div className={`px-4 py-3 border-t ${borderCol} flex justify-end gap-2 shrink-0 transition-colors duration-300`}>
                    <button className={`p-2 rounded-full transition-colors tooltip ${hoverBg} ${textSub}`} title="Mở Drive">
                      <Folder className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <div className={`${bgCard} rounded-xl border ${borderCol} p-6 h-full flex flex-col`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold ${textMain}`}>Lịch học & Deadline</h2>
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-medium ${textSub}`}>
                    Tháng {currentDate.getMonth() + 1}, {currentDate.getFullYear()}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={prevMonth} className={`p-2 rounded-full transition-colors border ${borderCol} ${hoverBg} ${textMain}`}><ChevronLeft className="w-5 h-5" /></button>
                    <button onClick={nextMonth} className={`p-2 rounded-full transition-colors border ${borderCol} ${hoverBg} ${textMain}`}><ChevronRight className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>

              <div className={`flex-1 border ${borderCol} rounded-xl overflow-hidden flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <div className={`grid grid-cols-7 border-b ${borderCol} ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                    <div key={day} className={`p-3 text-center font-bold text-sm ${textSub}`}>{day}</div>
                  ))}
                </div>

                <div className={`flex-1 grid grid-cols-7 grid-rows-5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} gap-px`}>
                  {[...Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay())].map((_, i) => (
                    <div key={`empty-${i}`} className={`${bgCard} p-2`}></div>
                  ))}

                  {[...Array(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate())].map((_, i) => {
                    const isToday = (i + 1) === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
                    
                    const dayAssignments = assignments.filter(a => {
                       if (!a.dueDate) return false;
                       return a.dueDate.includes(`${i + 1} `) || a.dueDate.includes(`${i + 1} thg`) || a.dueDate.includes(` ${i + 1} `); 
                    });

                    return (
                      <div key={i} className={`${bgCard} p-2 flex flex-col gap-1 transition-colors ${hoverBg}`}>
                        <span className={`font-medium text-sm ${textMain} ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-sm' : ''}`}>
                          {i + 1}
                        </span>

                        {dayAssignments.map((a, idx) => (
                          <div key={idx} onClick={() => navigate(`/course/stream/${a.courseId}/assignment/${a._id}`)} className="p-1.5 mt-1 bg-purple-100 text-purple-700 text-xs rounded-md truncate font-medium shadow-sm cursor-pointer hover:bg-purple-200">
                             {a.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* POPUP THÔNG TIN CÁ NHÂN */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className={`${bgCard} rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border ${borderCol}`}>
            <div className={`px-6 py-4 border-b ${borderCol} flex justify-between items-center`}>
              <h3 className={`text-lg font-bold ${textMain}`}>Thông tin cá nhân</h3>
              <button onClick={() => setShowProfileModal(false)} className={`p-1 rounded-full ${hoverBg} ${textSub}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">{userInitials}</div>
              <h2 className={`text-2xl font-bold ${textMain}`}>{userData?.name || 'Người dùng'}</h2>
              <p className={`text-sm ${textSub} mb-6`}>{userRole === 'teacher' ? 'Giảng viên' : 'Học sinh'}</p>
              <div className={`w-full bg-opacity-50 rounded-xl p-4 space-y-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between border-b border-gray-500/20 pb-2">
                  <span className={textSub}>Email</span>
                  <span className={`font-medium ${textMain}`}>{userData?.email || ''}</span>
                </div>
                <div className="flex justify-between border-b border-gray-500/20 pb-2">
                  <span className={textSub}>Mã số</span>
                  <span className={`font-medium ${textMain}`}>{currentUser?.uid?.substring(0,8) || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className={textSub}>Trạng thái</span>
                  <span className="font-medium text-green-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Đang hoạt động
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP BẢO MẬT */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className={`${bgCard} rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border ${borderCol}`}>
            <div className={`px-6 py-4 border-b ${borderCol} flex justify-between items-center`}>
              <h3 className={`text-lg font-bold ${textMain}`}>Bảo mật tài khoản</h3>
              <button onClick={() => setShowSecurityModal(false)} className={`p-1 rounded-full ${hoverBg} ${textSub}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className={`font-semibold mb-3 ${textMain}`}>Đổi mật khẩu</h4>
                <div className="space-y-3">
                  <input type="password" placeholder="Mật khẩu hiện tại" className={`w-full px-4 py-2 rounded-lg border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-blue-500`} />
                  <input type="password" placeholder="Mật khẩu mới" className={`w-full px-4 py-2 rounded-lg border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-blue-500`} />
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Cập nhật mật khẩu</button>
                </div>
              </div>
              <hr className={borderCol} />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold ${textMain}`}>Xác thực 2 bước (2FA)</h4>
                  <p className={`text-xs mt-1 ${textSub}`}>Tăng cường bảo mật bằng mã gửi về điện thoại</p>
                </div>
                <div className="w-12 h-6 bg-green-500 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-7 shadow"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP TẠO LỚP HỌC */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className={`${bgCard} rounded-xl max-w-md w-full shadow-2xl overflow-hidden border ${borderCol} p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${textMain}`}>Tạo lớp học mới</h3>
              <button onClick={() => setShowCreateCourseModal(false)} className={`p-1 rounded-full ${hoverBg} ${textSub}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSub} mb-1`}>Tên lớp học</label>
                <input 
                  type="text" 
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  placeholder="Nhập tên lớp học" 
                  className={`w-full px-4 py-2.5 rounded-lg border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-blue-500`} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowCreateCourseModal(false)} className={`px-4 py-2 font-medium ${textSub} hover:text-gray-700`}>Hủy</button>
                <button onClick={handleCreateCourse} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">Tạo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP THAM GIA LỚP HỌC */}
      {showJoinCourseModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className={`${bgCard} rounded-xl max-w-md w-full shadow-2xl overflow-hidden border ${borderCol} p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${textMain}`}>Tham gia lớp học</h3>
              <button onClick={() => setShowJoinCourseModal(false)} className={`p-1 rounded-full ${hoverBg} ${textSub}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSub} mb-1`}>Mã lớp học (Class Code)</label>
                <input 
                  type="text" 
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  placeholder="Nhập mã lớp gồm 6 ký tự" 
                  className={`w-full px-4 py-2.5 rounded-lg border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-blue-500 uppercase`} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowJoinCourseModal(false)} className={`px-4 py-2 font-medium ${textSub} hover:text-gray-700`}>Hủy</button>
                <button onClick={handleJoinCourse} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">Tham gia</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;