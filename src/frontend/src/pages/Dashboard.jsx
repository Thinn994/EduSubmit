import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, Bell, User, Book, Calendar, Folder, MoreVertical, GraduationCap, Clock, ChevronLeft, ChevronRight, Shield, Moon, LogOut, X, CheckCircle, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCourse, setCreatedCourse] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeCourseMenu, setActiveCourseMenu] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const [courseInput, setCourseInput] = useState('');
  const [courseSchedule, setCourseSchedule] = useState('');
  const [courseMaxStudents, setCourseMaxStudents] = useState('');

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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

      if (userRole === 'student') {
         const subRes = await axios.get(`${API_URL}/submissions?studentId=${currentUser.uid}`);
         setSubmissions(subRes.data);
      }

    } catch (error) {
      console.error("Error fetching courses from MongoDB:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userRole]);

  const handleCreateCourse = async () => {
    if (!courseInput) return;
    
    try {
      const newCourse = {
        name: courseInput,
        code: `COURSE-${Math.floor(Math.random()*10000)}`,
        section: "New Section",
        teacherId: currentUser.uid,
        teacher: userData?.name || 'Instructor',
        color: "bg-blue-600",
        enrolledStudents: [],
        schedule: courseSchedule,
        maxStudents: courseMaxStudents ? parseInt(courseMaxStudents) : null
      };
      const response = await axios.post(`${API_URL}/courses`, newCourse);
      setCourses([...courses, response.data]);
      setCreatedCourse(response.data);
      setShowCreateCourseModal(false);
      setShowSuccessModal(true);
      setCourseInput('');
      setCourseSchedule('');
      setCourseMaxStudents('');
    } catch (error) {
      console.error(error);
      toast.error("Error creating course");
    }
  };

  const handleCopyCode = () => {
    if (createdCourse && createdCourse.classCode) {
      navigator.clipboard.writeText(createdCourse.classCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      await axios.delete(`${API_URL}/courses/${courseToDelete._id}`);
      setCourses(courses.filter(c => c._id !== courseToDelete._id));
      setCourseToDelete(null);
      toast.success("Course deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting course");
    }
  };

  const handleJoinCourse = async () => {
    if (!courseInput) return;

    try {
      await axios.post(`${API_URL}/courses/join`, { 
          classCode: courseInput,
          studentId: currentUser.uid 
      });
      toast.success("Successfully joined the course!");
      setShowJoinCourseModal(false);
      setCourseInput('');
    // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCourses();
    } catch (error) {
      console.error(error);
      toast.error("Invalid class code or an error occurred");
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

      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? 'w-64 border-r' : 'w-0 border-r-0'} overflow-hidden transition-all duration-300 ease-in-out ${bgCard} ${borderCol} h-screen sticky top-0 shrink-0 flex flex-col whitespace-nowrap`}>
        <div className={`p-4 border-b ${borderCol} flex items-center gap-3 cursor-pointer`} onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold">EduSubmit</span>
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 mb-2">
            <button onClick={() => setActiveView('classes')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${activeView === 'classes' ? 'bg-blue-500 text-white' : `${textMain} ${hoverBg}`}`}>
              <Book className="w-5 h-5 shrink-0" />
              <span className="font-medium">Classes</span>
            </button>
            <button onClick={() => setActiveView('calendar')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors mt-1 ${activeView === 'calendar' ? 'bg-blue-500 text-white' : `${textMain} ${hoverBg}`}`}>
              <Calendar className="w-5 h-5 shrink-0" />
              <span className="font-medium">Calendar</span>
            </button>
          </div>

          <div className="mt-6">
            <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${textSub}`}>
              {userRole === 'teacher' ? 'Teaching' : 'Enrolled'}
            </div>

            <div className="mt-2 flex flex-col gap-1 px-3">
              <button className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-colors group ${hoverBg} ${textMain}`}>
                <div className={`w-8 h-8 rounded-full border ${borderCol} shrink-0 flex items-center justify-center ${textSub} group-hover:text-blue-500 group-hover:border-blue-300 transition-colors`}>
                  <Clock className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm truncate">To-do</span>
              </button>

              {courses.map(course => (
                <button key={course._id} onClick={() => navigate(`/course/stream/${course._id}`)} className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-xl transition-colors group ${hoverBg} ${textMain}`}>
                  <div className={`w-8 h-8 rounded-full ${course.color || 'bg-blue-600'} shrink-0 flex items-center justify-center text-white font-medium text-sm group-hover:shadow-md transition-shadow`}>
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
                    <button onClick={() => { setShowAddMenu(false); setShowCreateCourseModal(true); }} className={`w-full text-left px-4 py-2 text-sm font-medium ${textMain} ${hoverBg}`}>Create Course</button>
                  ) : (
                    <button onClick={() => { setShowAddMenu(false); setShowJoinCourseModal(true); }} className={`w-full text-left px-4 py-2 text-sm font-medium ${textMain} ${hoverBg}`}>Join Course</button>
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
                      <User className={`w-4 h-4 ${textSub}`} /><span className="font-medium">Profile</span>
                    </button>

                    <button onClick={() => { setShowSecurityModal(true); setShowProfileMenu(false); }} className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${hoverBg} ${textMain}`}>
                      <Shield className={`w-4 h-4 ${textSub}`} /><span className="font-medium">Security</span>
                    </button>

                    <button onClick={toggleTheme} className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${hoverBg} ${textMain}`}>
                      <div className="flex items-center gap-3">
                        <Moon className={`w-4 h-4 ${textSub}`} /><span className="font-medium">Dark Mode</span>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isDarkMode ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 shadow transition-all duration-300 ${isDarkMode ? 'left-4' : 'left-1'}`}></div>
                      </div>
                    </button>
                  </div>

                  <div className={`border-t ${borderCol} py-2`}>
                    <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 ${hoverBg}`}>
                      <LogOut className="w-4 h-4" /><span className="font-bold">Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex gap-6">
          
          {/* Main Content Area */}
          <div className="flex-1 min-w-0 flex flex-col h-full">
            {loading ? (
               <div className="flex justify-center items-center h-full">Loading...</div>
            ) : activeView === 'classes' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
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
                        <div className="relative">
                          <button className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white" onClick={(e) => { e.stopPropagation(); setActiveCourseMenu(activeCourseMenu === course._id ? null : course._id); }}>
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {activeCourseMenu === course._id && (
                            <div className={`absolute right-0 mt-2 w-48 ${bgCard} border ${borderCol} rounded-md shadow-lg z-50`} onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(course.classCode || course._id);
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 2000);
                                  setActiveCourseMenu(null);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm ${textMain} hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors flex justify-between items-center`}
                              >
                                {copied ? 'Copied!' : 'Copy Class Code'}
                              </button>
                              {userRole === 'teacher' && (
                                <button 
                                  onClick={() => {
                                    setCourseToDelete(course);
                                    setActiveCourseMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                >
                                  Delete Course
                                </button>
                              )}
                            </div>
                          )}
                        </div>
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
                            <span className="text-xs font-semibold text-orange-600">Due: {upcomingAssignment.dueDate || 'Unknown'}</span>
                          </div>
                          <p className={`text-sm line-clamp-2 hover:text-blue-500 hover:underline ${textMain}`}>
                            <span className="font-medium text-red-500 mr-1">📌</span>
                            {upcomingAssignment.title}
                          </p>
                        </>
                      ) : (
                          <p className={`text-sm text-gray-400 mt-2`}>No upcoming assignments</p>
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
                  <h2 className={`text-2xl font-bold ${textMain}`}>Calendar & Deadlines</h2>
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-medium ${textSub}`}>
                      {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={prevMonth} className={`p-2 rounded-full transition-colors border ${borderCol} ${hoverBg} ${textMain}`}><ChevronLeft className="w-5 h-5" /></button>
                      <button onClick={nextMonth} className={`p-2 rounded-full transition-colors border ${borderCol} ${hoverBg} ${textMain}`}><ChevronRight className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>

                <div className={`flex-1 border ${borderCol} rounded-xl overflow-hidden flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <div className={`grid grid-cols-7 border-b ${borderCol} ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
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

          {/* Right Sidebar: Analytics & Deadlines (Students Only) */}
          {userRole === 'student' && !loading && (
            <div className="w-80 shrink-0 flex flex-col gap-6">
              
              {/* Progress Analytics Widget */}
              <div className={`${bgCard} rounded-xl border ${borderCol} p-4 shadow-sm group h-16 hover:h-[220px] overflow-hidden transition-all duration-500 ease-in-out`}>
                <h3 className={`font-bold text-lg mb-6 flex items-center gap-2 ${textMain}`}>
                  <span className="w-2 h-5 bg-green-500 rounded-full shrink-0"></span> Learning Progress
                </h3>
                
                <div className="mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className={textSub}>Completed Tasks</span>
                    <span className={textMain}>{submissions.length} / {assignments.length}</span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500" 
                      style={{ width: `${assignments.length ? (submissions.length / assignments.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 ${isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'}`}>
                  <div>
                    <p className={`text-xs font-semibold uppercase ${textSub}`}>Average Grade</p>
                    <p className={`text-2xl font-bold ${textMain}`}>
                      {(() => {
                        const graded = submissions.filter(s => s.grade !== undefined);
                        if (graded.length === 0) return 'N/A';
                        const avg = graded.reduce((acc, s) => acc + s.grade, 0) / graded.length;
                        return avg.toFixed(1);
                      })()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Upcoming Deadlines Widget */}
              <div className={`${bgCard} rounded-xl border ${borderCol} p-4 shadow-sm group h-16 hover:h-[400px] overflow-hidden transition-all duration-500 ease-in-out flex flex-col`}>
                <h3 className={`font-bold text-lg mb-6 flex items-center gap-2 ${textMain} shrink-0`}>
                  <span className="w-2 h-5 bg-orange-500 rounded-full shrink-0"></span> Upcoming Deadlines
                </h3>
                <div className="flex flex-col gap-3 overflow-y-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pr-1">
                  {assignments.slice(0, 5).map(a => (
                    <div key={a._id} onClick={() => navigate(`/course/stream/${a.courseId}/assignment/${a._id}`)} className={`p-3 rounded-lg border ${borderCol} cursor-pointer transition-colors shrink-0 ${hoverBg}`}>
                      <h4 className={`text-sm font-semibold truncate ${textMain} mb-1`}>{a.title}</h4>
                      <p className={`text-xs flex items-center gap-1 ${textSub}`}>
                        <Clock className="w-3 h-3 text-orange-500" />
                        {a.dueDate || 'No deadline'}
                      </p>
                    </div>
                  ))}
                  {assignments.length === 0 && (
                    <p className={`text-sm text-center py-4 ${textSub}`}>Awesome, no upcoming deadlines!</p>
                  )}
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
              <h3 className={`text-lg font-bold ${textMain}`}>Profile Information</h3>
              <button onClick={() => setShowProfileModal(false)} className={`p-1 rounded-full ${hoverBg} ${textSub}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">{userInitials}</div>
              <h2 className={`text-2xl font-bold ${textMain}`}>{userData?.name || 'User'}</h2>
              <p className={`text-sm ${textSub} mb-6`}>{userRole === 'teacher' ? 'Teacher' : 'Student'}</p>
              <div className={`w-full bg-opacity-50 rounded-xl p-4 space-y-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex justify-between border-b border-gray-500/20 pb-2">
                  <span className={textSub}>Email</span>
                  <span className={`font-medium ${textMain}`}>{userData?.email || ''}</span>
                </div>
                <div className="flex justify-between border-b border-gray-500/20 pb-2">
                  <span className={textSub}>ID</span>
                  <span className={`font-medium ${textMain}`}>{currentUser?.uid?.substring(0,8) || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className={textSub}>Status</span>
                  <span className="font-medium text-green-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
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
              <h3 className={`text-lg font-bold ${textMain}`}>Account Security</h3>
              <button onClick={() => setShowSecurityModal(false)} className={`p-1 rounded-full ${hoverBg} ${textSub}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className={`font-semibold mb-3 ${textMain}`}>Change Password</h4>
                <div className="space-y-3">
                  <input type="password" placeholder="Current Password" className={`w-full px-4 py-2 rounded-lg border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-blue-500`} />
                  <input type="password" placeholder="New Password" className={`w-full px-4 py-2 rounded-lg border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-blue-500`} />
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">Update Password</button>
                </div>
              </div>
              <hr className={borderCol} />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold ${textMain}`}>Two-Factor Authentication (2FA)</h4>
                  <p className={`text-xs mt-1 ${textSub}`}>Enhance security with a code sent to your phone</p>
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
              <h3 className={`text-xl font-bold ${textMain}`}>Create New Course</h3>
              <button onClick={() => setShowCreateCourseModal(false)} className={`p-1 rounded-full ${hoverBg} ${textSub}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSub} mb-1`}>Course Name</label>
                <input 
                  type="text" 
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  placeholder="Enter course name" 
                  className={`w-full px-4 py-2.5 rounded-lg border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-blue-500`} 
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSub} mb-1`}>Schedule (Date/Time)</label>
                <input 
                  type="text" 
                  value={courseSchedule}
                  onChange={(e) => setCourseSchedule(e.target.value)}
                  placeholder="e.g. Mon/Wed 10:00 AM" 
                  className={`w-full px-4 py-2.5 rounded-lg border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-blue-500`} 
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${textSub} mb-1`}>Maximum Students</label>
                <input 
                  type="number" 
                  value={courseMaxStudents}
                  onChange={(e) => setCourseMaxStudents(e.target.value)}
                  placeholder="e.g. 50" 
                  className={`w-full px-4 py-2.5 rounded-lg border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-blue-500`} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowCreateCourseModal(false)} className={`px-4 py-2 font-medium ${textSub} hover:text-gray-700`}>Cancel</button>
                <button onClick={handleCreateCourse} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">Create</button>
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
              <h3 className={`text-xl font-bold ${textMain}`}>Join Course</h3>
              <button onClick={() => setShowJoinCourseModal(false)} className={`p-1 rounded-full ${hoverBg} ${textSub}`}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${textSub} mb-1`}>Class Code</label>
                <input 
                  type="text" 
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  placeholder="Enter 6-character class code" 
                  className={`w-full px-4 py-2.5 rounded-lg border ${borderCol} ${bgMain} ${textMain} focus:outline-none focus:border-blue-500 uppercase`} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowJoinCourseModal(false)} className={`px-4 py-2 font-medium ${textSub} hover:text-gray-700`}>Cancel</button>
                <button onClick={handleJoinCourse} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">Join</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL (CREATE COURSE) */}
      {showSuccessModal && createdCourse && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className={`${bgCard} rounded-xl max-w-md w-full shadow-2xl overflow-hidden border ${borderCol} p-6`}>
            
            <div className="flex flex-col items-center justify-center text-center mb-6 mt-2">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className={`text-2xl font-bold ${textMain}`}>Course Created!</h3>
              <p className={`text-sm ${textSub} mt-2`}>Your new course has been successfully set up.</p>
            </div>

            <div className={`p-4 rounded-lg border ${borderCol} ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} mb-6`}>
              <h4 className={`font-semibold ${textMain} text-lg mb-1`}>{createdCourse.name}</h4>
              {createdCourse.schedule && <p className={`text-sm ${textSub}`}>Schedule: {createdCourse.schedule}</p>}
              {createdCourse.maxStudents && <p className={`text-sm ${textSub}`}>Max Students: {createdCourse.maxStudents}</p>}
            </div>

            <div className="mb-8">
              <label className={`block text-sm font-medium ${textSub} mb-2 text-center`}>Share this class code with your students:</label>
              <div className={`flex items-center justify-between p-3 rounded-lg border-2 border-blue-500 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                <span className={`text-2xl font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400 pl-4`}>
                  {createdCourse.classCode}
                </span>
                <button 
                  onClick={handleCopyCode}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-100 dark:hover:bg-blue-700'
                  }`}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setShowSuccessModal(false)} 
                className={`px-4 py-2 font-medium ${textSub} hover:text-gray-700 dark:hover:text-gray-300`}
              >
                Edit Details
              </button>
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate(`/course/stream/${createdCourse._id}`);
                }} 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE COURSE MODAL */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setCourseToDelete(null)}>
          <div className={`${bgCard} rounded-xl max-w-sm w-full shadow-2xl overflow-hidden border ${borderCol} p-6`} onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <X className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${textMain} mb-2`}>Delete Course?</h3>
                <p className={`text-sm ${textSub} leading-relaxed`}>
                  Are you sure you want to completely remove this course? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setCourseToDelete(null)} 
                className={`px-4 py-2 font-medium ${textSub} hover:text-gray-700 dark:hover:text-gray-300 transition-colors`}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteCourse} 
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

export default Dashboard;
