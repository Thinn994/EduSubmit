import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MessageSquare, Send, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://localhost:5000/api';

export default function CourseForum() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userData, currentUser } = useAuth();
  const { isDarkMode } = useTheme();

  const [course, setCourse] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  
  const [replyContent, setReplyContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  const bgMain = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const bgCard = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textMain = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderCol = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  const fetchForumData = async () => {
    try {
      const [courseRes, threadsRes] = await Promise.all([
        axios.get(`${API_URL}/courses/${courseId}`),
        axios.get(`${API_URL}/discussions?courseId=${courseId}`)
      ]);
      setCourse(courseRes.data);
      setThreads(threadsRes.data);
    } catch (error) {
      console.error("Error fetching forum data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchForumData();
  }, [courseId]);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      await axios.post(`${API_URL}/discussions`, {
        courseId,
        authorId: currentUser.uid,
        authorName: userData?.name || 'Người dùng',
        title: newTitle,
        content: newContent
      });
      setNewTitle('');
      setNewContent('');
      setShowNewThread(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchForumData();
    } catch (error) {
      console.error("Lỗi tạo chủ đề:", error);
    }
  };

  const handleReply = async (threadId) => {
    if (!replyContent.trim()) return;
    try {
      await axios.post(`${API_URL}/discussions/${threadId}/reply`, {
        authorId: currentUser.uid,
        authorName: userData?.name || 'Người dùng',
        content: replyContent
      });
      setReplyContent('');
      setReplyingTo(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchForumData();
    } catch (error) {
      console.error("Lỗi gửi phản hồi:", error);
    }
  };

  if (loading) return <div className="h-screen flex justify-center items-center">Đang tải...</div>;

  return (
    <div className={`min-h-screen ${bgMain} font-sans flex flex-col transition-colors duration-300`}>
      <nav className={`w-full ${bgCard} border-b ${borderCol} px-4 py-3 flex items-center gap-4 sticky top-0 z-50 shadow-sm`}>
        <button onClick={() => navigate(`/course/stream/${courseId}`)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <ArrowLeft className={`w-6 h-6 ${textSub}`} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${textMain}`}>Diễn đàn Q&A</h1>
            <p className={`text-xs ${textSub}`}>{course?.name}</p>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        <div className="flex justify-between items-center">
          <h2 className={`text-2xl font-bold ${textMain}`}>Thảo luận chung</h2>
          <button onClick={() => setShowNewThread(!showNewThread)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition-colors">
            {showNewThread ? 'Hủy' : '+ Tạo chủ đề mới'}
          </button>
        </div>

        {showNewThread && (
          <form onSubmit={handleCreateThread} className={`${bgCard} p-5 rounded-xl border ${borderCol} shadow-sm flex flex-col gap-4 animate-fade-in`}>
            <input 
              type="text" 
              placeholder="Tiêu đề chủ đề..." 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-indigo-500`}
              required
            />
            <textarea 
              placeholder="Nội dung chi tiết..." 
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows="4"
              className={`w-full px-4 py-2 rounded-lg border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-indigo-500 resize-none`}
              required
            />
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
                Đăng
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-col gap-4">
          {threads.length === 0 ? (
            <p className={`text-center py-10 ${textSub}`}>Chưa có chủ đề thảo luận nào. Hãy là người đầu tiên bắt đầu!</p>
          ) : (
            threads.map(thread => (
              <div key={thread._id} className={`${bgCard} border ${borderCol} rounded-xl p-5 shadow-sm`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${textMain} mb-1`}>{thread.title}</h3>
                    <p className={`text-xs ${textSub} mb-3`}>{thread.authorName} • {new Date(thread.createdAt).toLocaleString('vi-VN')}</p>
                    <p className={`${textMain} text-sm whitespace-pre-line mb-4`}>{thread.content}</p>
                    
                    <div className={`flex items-center gap-4 border-t ${borderCol} pt-3`}>
                      <button onClick={() => setReplyingTo(replyingTo === thread._id ? null : thread._id)} className={`flex items-center gap-2 text-sm font-medium ${textSub} hover:text-indigo-600 transition-colors`}>
                        <MessageCircle className="w-4 h-4" /> {thread.replies.length} Phản hồi
                      </button>
                    </div>

                    {/* Replies Section */}
                    {(thread.replies.length > 0 || replyingTo === thread._id) && (
                      <div className={`mt-4 pl-4 border-l-2 ${borderCol} flex flex-col gap-4`}>
                        {thread.replies.map((reply, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className={`flex-1 ${isDarkMode ? 'bg-gray-750' : 'bg-gray-100'} p-3 rounded-lg`}>
                              <p className={`text-xs font-semibold ${textMain}`}>{reply.authorName} <span className={`font-normal ${textSub} ml-2`}>{new Date(reply.createdAt).toLocaleString('vi-VN')}</span></p>
                              <p className={`text-sm ${textMain} mt-1 whitespace-pre-line`}>{reply.content}</p>
                            </div>
                          </div>
                        ))}

                        {/* Reply Input */}
                        {replyingTo === thread._id && (
                          <div className="flex items-start gap-3 mt-2">
                            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div className="flex-1 flex gap-2">
                              <input 
                                type="text"
                                placeholder="Viết phản hồi..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className={`flex-1 px-4 py-2 rounded-full border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-indigo-500 text-sm`}
                              />
                              <button onClick={() => handleReply(thread._id)} disabled={!replyContent.trim()} className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                <Send className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
