import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, FileText, Bot, Plus, UploadCloud, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const API_URL = 'http://localhost:5000/api';

export default function CreateAssignment() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { userData } = useAuth();
  const { isDarkMode } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [points, setPoints] = useState(100);
  const [generateAI, setGenerateAI] = useState(false);
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter an assignment title.');
      return;
    }

    setIsSubmitting(true);
    let attachedFileUrl = '';
    let attachedFileName = '';

    try {
      // 1. Upload file if selected
      if (selectedFile) {
        const storageRef = ref(storage, `assignments/${courseId}/${Date.now()}_${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);
        
        await new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
                null,
                (error) => reject(error),
                async () => {
                    attachedFileUrl = await getDownloadURL(uploadTask.ref);
                    attachedFileName = selectedFile.name;
                    resolve();
                }
            );
        });
      }

      // 2. Save Assignment to DB
      const formattedDueDate = dueDate ? `${dueDate} ${dueTime}`.trim() : 'No deadline';

      const newAssignment = {
        courseId,
        title,
        description,
        dueDate: formattedDueDate,
        points: parseInt(points, 10) || 100,
        teacher: userData?.name || 'Instructor',
        generateAI,
        attachedFileUrl,
        attachedFileName
      };

      await axios.post(`${API_URL}/assignments`, newAssignment);
      
      toast.success('Assignment created successfully!');
      navigate(`/course/stream/${courseId}`);
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error('Could not create assignment at this time.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bgMain = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const bgCard = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const textMain = isDarkMode ? 'text-gray-100' : 'text-gray-800';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const borderCol = isDarkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgMain} ${textMain} font-sans flex flex-col transition-colors duration-300`}>
      {/* HEADER */}
      <nav className={`w-full ${bgCard} border-b ${borderCol} px-4 py-3 flex items-center gap-4 sticky top-0 z-50 shadow-sm`}>
        <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <ArrowLeft className={`w-6 h-6 ${textSub}`} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Create New Assignment</h1>
            <p className={`text-xs ${textSub}`}>Current Course</p>
          </div>
        </div>
      </nav>

      {/* FORM CONTAINER */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* ASSIGNMENT DETAILS */}
          <div className={`${bgCard} rounded-2xl p-6 shadow-sm border ${borderCol}`}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              General Information
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className={`block text-sm font-semibold mb-2 ${textMain}`}>Assignment Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title (e.g., Lab Report 1)"
                  className={`w-full px-4 py-3 rounded-xl border ${borderCol} ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${textMain}`}>Instructions & Requirements</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed instructions for students..."
                  rows={6}
                  className={`w-full px-4 py-3 rounded-xl border ${borderCol} ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y`}
                />
              </div>

              {/* ATTACH FILE SECTION */}
              <div>
                <label className={`block text-sm font-semibold mb-2 ${textMain}`}>Attach File (Optional)</label>
                {selectedFile ? (
                  <div className={`flex items-center justify-between p-4 rounded-xl border ${borderCol} ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className={`text-sm font-medium truncate ${textMain}`}>{selectedFile.name}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setSelectedFile(null)} 
                      className={`p-1.5 rounded-full hover:bg-red-100 text-red-500 transition-colors shrink-0`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${borderCol} rounded-xl cursor-pointer ${isDarkMode ? 'hover:bg-gray-700 bg-gray-800' : 'hover:bg-gray-50 bg-white'} transition-colors group`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className={`w-8 h-8 mb-2 ${textSub} group-hover:text-blue-500 transition-colors`} />
                      <p className={`text-sm ${textSub} group-hover:text-blue-500 transition-colors`}>
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        if(e.target.files[0]) setSelectedFile(e.target.files[0]);
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* TIMELINE & SCORING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`${bgCard} rounded-2xl p-6 shadow-sm border ${borderCol}`}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
                Deadline
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${textSub}`}>Due Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${borderCol} ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${textSub}`}>Due Time (Optional)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${borderCol} ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={`${bgCard} rounded-2xl p-6 shadow-sm border ${borderCol}`}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                Scoring
              </h2>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textSub}`}>Maximum Score</label>
                <input 
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  min="1"
                  className={`w-full px-4 py-2.5 rounded-lg border ${borderCol} ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-lg`}
                />
              </div>

              <div className="mt-6 pt-5 border-t border-dashed border-gray-300 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${generateAI ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${generateAI ? 'text-purple-600 dark:text-purple-400' : textMain}`}>AI Assistant</p>
                    <p className={`text-xs ${textSub}`}>Generate AI Quiz with this assignment</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={generateAI} onChange={() => setGenerateAI(!generateAI)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 mt-4 mb-8">
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              className={`px-6 py-3 rounded-xl font-semibold transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} border ${borderCol}`}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Plus className="w-5 h-5" />
              {isSubmitting ? 'Uploading...' : 'Create Assignment'}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
