import { useState, useEffect } from 'react';
import { FileText, MoreVertical, Send, User, ArrowLeft, Loader, X, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

export default function CourseStream() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { userData, userRole } = useAuth();
  const { isDarkMode } = useTheme();

  const [currentCourse, setCurrentCourse] = useState(null);
  const [streamPosts, setStreamPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcementText, setAnnouncementText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Edit/Delete state
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [postToDelete, setPostToDelete] = useState(null);

  const fetchCourseData = async () => {
    try {
      const courseRes = await axios.get(`${API_URL}/courses/${courseId}`);
      setCurrentCourse(courseRes.data);
      
      // Fetch assignments
      const assignRes = await axios.get(`${API_URL}/assignments?courseId=${courseId}`);
      const assignPosts = assignRes.data.map(data => ({
          id: data._id,
          type: 'assignment',
          author: data.teacher || 'Instructor',
          time: data.dueDate || 'No deadline',
          title: `Posted a new assignment: ${data.title}`,
          content: data.description || '',
          attachedFileUrl: data.attachedFileUrl,
          attachedFileName: data.attachedFileName,
          icon: <FileText className="w-5 h-5 text-white" />,
          createdAt: new Date(data.createdAt || data.dueDate || Date.now()).getTime()
      }));

      // Fetch announcements
      const annRes = await axios.get(`${API_URL}/announcements?courseId=${courseId}`);
      const annPosts = annRes.data.map(data => ({
          id: data._id,
          type: 'announcement',
          author: data.teacherName || 'Instructor',
          time: new Date(data.createdAt).toLocaleDateString('vi-VN'),
          title: 'New announcement',
          content: data.content,
          icon: <User className="w-5 h-5 text-gray-500" />,
          createdAt: new Date(data.createdAt).getTime()
      }));

      const combinedPosts = [...assignPosts, ...annPosts].sort((a, b) => b.createdAt - a.createdAt);
      setStreamPosts(combinedPosts);

    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourseData();
  }, [courseId]);

  const handlePostAnnouncement = async () => {
    if (!announcementText.trim()) return;
    setIsPosting(true);
    try {
      await axios.post(`${API_URL}/announcements`, {
        courseId,
        teacherId: userData?._id || 'unknown',
        teacherName: userData?.name || 'Instructor',
        content: announcementText
      });
      setAnnouncementText('');
    // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCourseData(); // reload stream
    } catch (error) {
      console.error("Error posting announcement:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    try {
      if (postToDelete.type === 'assignment') {
        await axios.delete(`${API_URL}/assignments/${postToDelete.id}`);
      } else {
        await axios.delete(`${API_URL}/announcements/${postToDelete.id}`);
      }
      toast.success("Post deleted");
      setPostToDelete(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCourseData();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Error deleting post");
    }
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    try {
      if (editingPost.type === 'assignment') {
        await axios.put(`${API_URL}/assignments/${editingPost.id}`, {
          title: editTitle,
          description: editContent
        });
      } else {
        await axios.put(`${API_URL}/announcements/${editingPost.id}`, {
          content: editContent
        });
      }
      setEditingPost(null);
      toast.success("Post updated");
    // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCourseData();
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Error updating post");
    }
  };


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
        <h2 className="text-2xl font-bold mb-4">Oops, course not found!</h2>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Dashboard
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
              <h3 className={`font-medium mb-4 ${textMain}`}>Upcoming assignments</h3>
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
                    <li><p className={`text-sm ${textSub}`}>No upcoming assignments.</p></li>
                )}
              </ul>
              <button className="mt-4 text-sm font-medium text-blue-600 w-full text-right p-2 rounded transition-colors hover:underline">
                View all
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4 md:gap-6">
            <div className={`${bgCard} border ${borderCol} rounded-lg p-4 shadow-sm flex flex-col gap-3 transition-shadow`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium shrink-0">{userInitials}</div>
                <textarea 
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder={userRole === 'teacher' ? 'Post an announcement for your class...' : 'Share something with your class...'}
                  rows="2"
                  className={`flex-1 resize-none bg-transparent outline-none pt-2 text-sm md:text-base ${textMain} placeholder-gray-500 border-b ${borderCol} focus:border-blue-500 transition-colors`}
                />
              </div>
              <div className="flex justify-between items-center pl-14 mt-1">
                <div className="flex items-center gap-2">
                  {userRole === 'teacher' && (
                    <button onClick={() => navigate(`/course/stream/${courseId}/create-assignment`)} className="px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold rounded-md hover:bg-blue-100 transition-colors">
                      + Create Assignment
                    </button>
                  )}
                  <button onClick={() => navigate(`/course/stream/${courseId}/forum`)} className={`px-3 py-1.5 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} text-xs font-semibold rounded-md transition-colors`}>
                    💬 Q&A Forum
                  </button>
                  <button onClick={() => navigate(`/course/stream/${courseId}/people`)} className={`px-3 py-1.5 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} text-xs font-semibold rounded-md transition-colors`}>
                    👥 People
                  </button>
                </div>
                <button 
                  onClick={handlePostAnnouncement}
                  disabled={!announcementText.trim() || isPosting}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold text-white transition-colors flex items-center gap-2 ${
                    !announcementText.trim() || isPosting ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Send className="w-4 h-4" /> {isPosting ? 'Posting...' : 'Post'}
                </button>
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
                  <div className="relative">
                    {userRole === 'teacher' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === post.id ? null : post.id); }} 
                        className={`p-2 rounded-full transition-colors -mt-2 ${textSub} hover:bg-gray-200 dark:hover:bg-gray-700`}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    )}
                    {activeMenu === post.id && (
                      <div className={`absolute right-0 mt-2 w-32 ${bgCard} border ${borderCol} rounded-md shadow-lg z-10`}>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingPost(post); 
                            setEditTitle(post.type === 'assignment' ? post.title.replace('Đã đăng một bài tập mới: ', '') : post.title); 
                            setEditContent(post.content); 
                            setActiveMenu(null); 
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${textMain} hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors`}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setPostToDelete(post); setActiveMenu(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`${textMain} text-sm md:text-base mb-4 leading-relaxed whitespace-pre-line pl-13 md:pl-14`}>
                  {post.content}
                  
                  {post.attachedFileUrl && (
                      <div className="mt-3">
                          <a 
                              href={post.attachedFileUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                          >
                              <FileText className="w-4 h-4" />
                              {post.attachedFileName || 'Download Attachment'}
                          </a>
                      </div>
                  )}
                </div>

                <div className={`border-t ${borderCol} pt-3 flex items-center gap-3`} onClick={(e) => e.stopPropagation()}>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium shrink-0 text-xs">{userInitials}</div>
                  <div className={`flex-1 border ${borderCol} ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-full px-4 py-1.5 flex items-center justify-between cursor-text opacity-70 hover:opacity-100 transition-opacity`}>
                    <span className={`text-sm ${textSub}`}>Add class comment...</span>
                    <Send className={`w-4 h-4 ${textSub}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {editingPost && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className={`${bgCard} rounded-xl max-w-md w-full shadow-2xl overflow-hidden border ${borderCol} p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${textMain}`}>Edit {editingPost.type === 'assignment' ? 'Assignment' : 'Announcement'}</h3>
              <button onClick={() => setEditingPost(null)} className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${textSub}`}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdatePost} className="space-y-4">
              {editingPost.type === 'assignment' && (
                <div>
                  <label className={`block text-sm font-medium ${textSub} mb-1`}>Title</label>
                  <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-lg border ${borderCol} ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} ${textMain} focus:outline-none focus:border-blue-500`} 
                  />
                </div>
              )}
              <div>
                <label className={`block text-sm font-medium ${textSub} mb-1`}>Content</label>
                <textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows="4"
                  className={`w-full px-4 py-2.5 rounded-lg border ${borderCol} ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} ${textMain} focus:outline-none focus:border-blue-500 resize-none`} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingPost(null)} className={`px-4 py-2 font-medium ${textSub} hover:text-gray-700`}>Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE POST MODAL */}
      {postToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setPostToDelete(null)}>
          <div className={`${bgCard} rounded-xl max-w-sm w-full shadow-2xl overflow-hidden border ${borderCol} p-6`} onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${textMain} mb-2`}>Delete Post?</h3>
                <p className={`text-sm ${textSub} leading-relaxed`}>
                  Are you sure you want to completely remove this post? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setPostToDelete(null)} 
                className={`px-4 py-2 font-medium ${textSub} hover:text-gray-700 dark:hover:text-gray-300 transition-colors`}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeletePost} 
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
