import React, { useState, useEffect } from 'react';
import { FileText, MoreVertical, Send, User, ArrowLeft, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://localhost:5000/api';

export default function CourseStream() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { userData, userRole } = useAuth();
  const { isDarkMode } = useTheme();

  const [currentCourse, setCurrentCourse] = useState(null);
  const [streamPosts, setStreamPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseRes = await axios.get(`${API_URL}/courses/${courseId}`);
        setCurrentCourse(courseRes.data);
        
        // Fetch assignments
        const assignRes = await axios.get(`${API_URL}/assignments?courseId=${courseId}`);
        const posts = assignRes.data.map(data => ({
            id: data._id,
            type: 'assignment',
            author: data.teacher || 'Giảng viên',
            time: data.dueDate || 'Chưa có hạn',
            title: `Đã đăng một bài tập mới: ${data.title}`,
            content: data.description || '',
            icon: <FileText className="w-5 h-5 text-white" />
        }));

        setStreamPosts(posts);

      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);


  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
        <h2 className="text-2xl font-bold mb-4">Ối, không tìm thấy lớp học này!</h2>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Quay lại Bảng điều khiển
        </button>
      </div>
    );
  }

  const bgMain = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const bgCard = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textMain = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderCol = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  const userInitials = userData?.name ? userData.name.substring(0, 2).toUpperCase() : 'U';

  return (
    <div className={`min-h-screen font-sans flex flex-col items-center ${bgMain} ${textMain} transition-colors duration-300`}>
      <nav className={`w-full ${bgCard} border-b ${borderCol} px-4 py-3 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className={`p-2 rounded-full transition-colors tooltip hover:bg-gray-200 dark:hover:bg-gray-700`}>
            <ArrowLeft className={`w-6 h-6 ${textSub}`} />
          </button>
          <span className="text-xl font-medium hover:underline cursor-pointer">
            {currentCourse.name}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-1 border-2 border-transparent hover:border-gray-200 rounded-full">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">{userInitials}</div>
          </button>
        </div>
      </nav>

      <div className="w-full max-w-5xl px-4 flex flex-col gap-6 mt-6">
        <div className={`${currentCourse.color || 'bg-blue-600'} rounded-xl h-48 md:h-64 p-6 flex flex-col justify-end text-white shadow-sm relative overflow-hidden`}>
          <div className="absolute top-0 right-0 opacity-10">
            <svg width="400" height="400" fill="currentColor" viewBox="0 0 100 100"><path d="M50 0L100 50L50 100L0 50Z"></path></svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-1 tracking-tight">{currentCourse.name}</h1>
            <p className="text-lg md:text-xl opacity-90 font-medium">{currentCourse.section}</p>
            <p className="text-sm md:text-base opacity-80 mt-1">{currentCourse.teacher}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 pb-10">
          <div className="w-full md:w-56 lg:w-64 shrink-0">
            <div className={`${bgCard} border ${borderCol} rounded-lg p-4 shadow-sm`}>
              <h3 className={`font-medium mb-4 ${textMain}`}>Bài tập sắp tới</h3>
              <ul className="flex flex-col gap-4">
                {streamPosts.length > 0 ? (
                    streamPosts.map(post => (
                        <li key={post.id}>
                          <p className="text-sm font-semibold text-orange-600 mb-1">{post.time}</p>
                          <p onClick={() => navigate(`/course/stream/${courseId}/assignment/${post.id}`)} className={`text-sm ${textSub} hover:text-blue-600 cursor-pointer hover:underline line-clamp-2 leading-relaxed`}>
                            {post.title.replace('Đã đăng một bài tập mới: ', '')}
                          </p>
                        </li>
                    ))
                ) : (
                    <li><p className={`text-sm ${textSub}`}>Không có bài tập sắp tới.</p></li>
                )}
              </ul>
              <button className="mt-4 text-sm font-medium text-blue-600 w-full text-right p-2 rounded transition-colors hover:underline">
                Xem tất cả
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 md:gap-6">
            <div className={`${bgCard} border ${borderCol} rounded-lg p-4 shadow-sm flex items-center gap-4 cursor-text hover:shadow-md transition-shadow group`}
                 onClick={() => {
                   if (userRole === 'teacher') {
                      navigate(`/course/stream/${courseId}/create-assignment`);
                   }
                 }}>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium shrink-0">{userInitials}</div>
              <div className={`${textSub} text-sm md:text-base flex-1 group-hover:opacity-80 transition-opacity`}>
                {userRole === 'teacher' ? 'Tạo bài tập mới cho lớp học...' : 'Thông báo nội dung nào đó cho lớp học của bạn...'}
              </div>
            </div>

            {streamPosts.map(post => (
              <div
                key={post.id}
                onClick={() => {
                  if (post.type === 'assignment') {
                    navigate(`/course/stream/${courseId}/assignment/${post.id}`);
                  }
                }}
                className={`${bgCard} border ${borderCol} rounded-lg p-4 shadow-sm transition-shadow ${post.type === 'assignment' ? 'cursor-pointer hover:shadow-md hover:border-blue-300' : 'hover:shadow-md'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {post.type === 'assignment' ? (
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        {post.icon}
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                        {post.icon}
                      </div>
                    )}
                    <div>
                      <h2 className={`font-medium text-sm md:text-base ${post.type === 'assignment' ? 'text-blue-500 hover:underline' : textMain}`}>
                        {post.title}
                      </h2>
                      <p className={`text-xs ${textSub}`}>{post.author} • Đến hạn: {post.time}</p>
                    </div>
                  </div>
                  <button onClick={(e) => e.stopPropagation()} className={`p-2 rounded-full transition-colors -mt-2 ${textSub} hover:bg-gray-200 dark:hover:bg-gray-700`}>
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className={`${textMain} text-sm md:text-base mb-4 leading-relaxed whitespace-pre-line pl-13 md:pl-14`}>
                  {post.content}
                </div>

                <div className={`border-t ${borderCol} pt-3 flex items-center gap-3`} onClick={(e) => e.stopPropagation()}>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium shrink-0 text-xs">{userInitials}</div>
                  <div className={`flex-1 border ${borderCol} ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-full px-4 py-1.5 flex items-center justify-between cursor-text opacity-70 hover:opacity-100 transition-opacity`}>
                    <span className={`text-sm ${textSub}`}>Thêm nhận xét trong lớp học...</span>
                    <Send className={`w-4 h-4 ${textSub}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}