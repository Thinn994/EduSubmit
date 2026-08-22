import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Users, UserPlus, Trash2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://localhost:5000/api';

export default function CoursePeople() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { isDarkMode } = useTheme();

  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

  const bgMain = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const bgCard = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textMain = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderCol = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  const fetchRoster = async () => {
    try {
      const [courseRes, studentsRes] = await Promise.all([
        axios.get(`${API_URL}/courses/${courseId}`),
        axios.get(`${API_URL}/courses/${courseId}/students`)
      ]);
      setCourse(courseRes.data);
      setStudents(studentsRes.data);
    } catch (error) {
      console.error("Error fetching roster:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoster();
  }, [courseId]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentEmail) return;
    setIsAdding(true);
    try {
      await axios.post(`${API_URL}/courses/${courseId}/students`, { email: newStudentEmail });
      setNewStudentEmail('');
      toast.success("Student added successfully");
    // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchRoster();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Error adding student");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;
    try {
      await axios.delete(`${API_URL}/courses/${courseId}/students/${studentToRemove.firebaseUid}`);
      toast.success("Student removed");
      setStudentToRemove(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchRoster();
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Error removing student");
    }
  };

  if (loading) return <div className="h-screen flex justify-center items-center">Loading...</div>;

  return (
    <div className={`min-h-screen ${bgMain} font-sans flex flex-col transition-colors duration-300`}>
      <nav className={`w-full ${bgCard} border-b ${borderCol} px-4 py-3 flex items-center gap-4 sticky top-0 z-50 shadow-sm`}>
        <button onClick={() => navigate(`/course/stream/${courseId}`)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <ArrowLeft className={`w-6 h-6 ${textSub}`} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${textMain}`}>People</h1>
            <p className={`text-xs ${textSub}`}>{course?.name}</p>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col gap-8">
        
        {/* Teacher Section */}
        <div>
          <h2 className={`text-2xl font-bold ${textMain} mb-4 flex items-center justify-between border-b ${borderCol} pb-2`}>
            Teacher
          </h2>
          <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm">
              {course?.teacher.charAt(0)}
            </div>
            <p className={`text-lg font-medium ${textMain}`}>{course?.teacher}</p>
          </div>
        </div>

        {/* Students Section */}
        <div>
          <h2 className={`text-2xl font-bold ${textMain} mb-4 flex items-center justify-between border-b ${borderCol} pb-2`}>
            Students
            <span className={`text-sm font-normal ${textSub}`}>{students.length} students</span>
          </h2>

          {userRole === 'teacher' && (
            <form onSubmit={handleAddStudent} className={`mb-6 flex gap-3 p-4 ${bgCard} rounded-lg border ${borderCol} shadow-sm`}>
              <div className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent">
                <Mail className={`w-5 h-5 ${textSub}`} />
                <input 
                  type="email" 
                  placeholder="Enter student email to invite..." 
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className={`flex-1 bg-transparent outline-none ${textMain}`}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isAdding || !newStudentEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" /> Add
              </button>
            </form>
          )}

          <div className={`${bgCard} rounded-xl border ${borderCol} overflow-hidden shadow-sm`}>
            {students.length === 0 ? (
              <p className={`p-6 text-center ${textSub}`}>No students enrolled yet.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b ${borderCol} ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <th className={`p-4 font-semibold ${textSub}`}>Name</th>
                    <th className={`p-4 font-semibold ${textSub}`}>Email</th>
                    {userRole === 'teacher' && <th className={`p-4 font-semibold text-right ${textSub}`}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student._id} className={`border-b ${borderCol} hover:${isDarkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                      <td className={`p-4 font-medium ${textMain} flex items-center gap-3`}>
                        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs">
                          {student.name.charAt(0)}
                        </div>
                        {student.name}
                      </td>
                      <td className={`p-4 ${textSub}`}>{student.email}</td>
                      {userRole === 'teacher' && (
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => setStudentToRemove(student)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                            title="Remove Student"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </main>

      {/* DELETE STUDENT MODAL */}
      {studentToRemove && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setStudentToRemove(null)}>
          <div className={`${bgCard} rounded-xl max-w-sm w-full shadow-2xl overflow-hidden border ${borderCol} p-6`} onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${textMain} mb-2`}>Remove Student?</h3>
                <p className={`text-sm ${textSub} leading-relaxed`}>
                  Are you sure you want to remove {studentToRemove.name} from the course?
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setStudentToRemove(null)} 
                className={`px-4 py-2 font-medium ${textSub} hover:text-gray-700 dark:hover:text-gray-300 transition-colors`}
              >
                Cancel
              </button>
              <button 
                onClick={handleRemoveStudent} 
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
