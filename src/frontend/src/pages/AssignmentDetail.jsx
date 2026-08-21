import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, FileText, Plus, X, File, User, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const API_URL = 'http://localhost:5000/api';

export default function AssignmentDetail() {
    const navigate = useNavigate();
    const { courseId, assignmentId } = useParams();
    const { currentUser, userData, userRole } = useAuth();
    const { isDarkMode } = useTheme();

    const fileInputRef = useRef(null);

    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [teacherSubmissions, setTeacherSubmissions] = useState([]);
    const [uploadedFile, setUploadedFile] = useState(null);
    
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Assignment
                const assignRes = await axios.get(`${API_URL}/assignments/${assignmentId}`);
                setAssignment(assignRes.data);

                // Fetch Submission for this student
                if (userRole === 'student') {
                    const subRes = await axios.get(`${API_URL}/submissions?assignmentId=${assignmentId}&studentId=${currentUser.uid}`);
                    if (subRes.data.length > 0) {
                        const subData = subRes.data[0];
                        setSubmission(subData);
                        setIsSubmitted(true);
                        setUploadedFile({
                            name: subData.fileName || 'Tài liệu đã nộp',
                            size: '',
                            url: subData.fileUrl,
                            isExisting: true
                        });
                    }
                } else if (userRole === 'teacher') {
                    const subsRes = await axios.get(`${API_URL}/submissions?assignmentId=${assignmentId}`);
                    setTeacherSubmissions(subsRes.data);
                }
            } catch (error) {
                console.error("Error fetching assignment data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [assignmentId, currentUser, userRole]);


    const handleFileUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            let fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
            if (file.size < 1024 * 1024) {
                fileSize = (file.size / 1024).toFixed(2) + ' KB';
            }
            setUploadedFile({
                name: file.name,
                size: fileSize,
                rawFile: file,
                isExisting: false
            });
        }
        event.target.value = null;
    };

    const handleSubmit = async () => {
        if (!uploadedFile || uploadedFile.isExisting) return;
        setUploading(true);

        try {
            const file = uploadedFile.rawFile;
            // 1. Upload to Firebase Storage
            const storageRef = ref(storage, `assignments/${assignmentId}/${currentUser.uid}/${file.name}`);
            const uploadTask = await uploadBytesResumable(storageRef, file);
            const downloadURL = await getDownloadURL(uploadTask.ref);

            // 2. Save metadata to MongoDB via Express
            const submissionData = {
                assignmentId: assignmentId,
                courseId: courseId,
                studentId: currentUser.uid,
                studentName: userData?.name || 'Sinh viên',
                fileUrl: downloadURL,
                fileName: file.name
            };

            const response = await axios.post(`${API_URL}/submissions`, submissionData);
            
            setSubmission(response.data);
            setUploadedFile({ ...uploadedFile, url: downloadURL, isExisting: true });
            setIsSubmitted(true);
            alert("Nộp bài thành công!");

        } catch (error) {
            console.error("Lỗi nộp bài:", error);
            alert("Đã xảy ra lỗi khi nộp bài.");
        } finally {
            setUploading(false);
        }
    };

    const handleCancelSubmit = async () => {
        if (!submission) return;
        
        try {
            // Delete doc from MongoDB
            await axios.delete(`${API_URL}/submissions/${submission._id}`);
            
            // Delete file from Firebase Storage
            if (uploadedFile && uploadedFile.name) {
                 const storageRef = ref(storage, `assignments/${assignmentId}/${currentUser.uid}/${uploadedFile.name}`);
                 await deleteObject(storageRef).catch(e => console.log("File possibly not in storage or error deleting", e));
            }

            setSubmission(null);
            setUploadedFile(null);
            setIsSubmitted(false);
            alert("Đã hủy nộp bài!");
        } catch (error) {
             console.error("Lỗi hủy nộp:", error);
             alert("Không thể hủy nộp bài lúc này.");
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
                <Loader className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (!assignment) {
         return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
                <h2 className="text-2xl font-bold mb-4">Bài tập không tồn tại!</h2>
                <button onClick={() => navigate(-1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Quay lại
                </button>
            </div>
        );
    }

    const bgMain = isDarkMode ? 'bg-gray-900' : 'bg-white';
    const bgCard = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const textMain = isDarkMode ? 'text-gray-100' : 'text-gray-800';
    const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const borderCol = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    const userInitials = userData?.name ? userData.name.substring(0, 2).toUpperCase() : 'U';

    return (
        <div className={`min-h-screen ${bgMain} font-sans flex flex-col transition-colors duration-300`}>
            {/* TOP NAVBAR */}
            <nav className={`w-full ${bgCard} border-b ${borderCol} px-4 py-3 flex items-center justify-between sticky top-0 z-50`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition-colors tooltip ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <ArrowLeft className={`w-6 h-6 ${textSub}`} />
                    </button>
                    <span className={`text-xl font-medium ${textMain}`}>
                        Chi tiết bài tập
                    </span>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium cursor-pointer">
                    {userInitials}
                </div>
            </nav>

            <main className="max-w-6xl mx-auto w-full p-4 md:p-6 lg:p-8 flex-1">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* CỘT TRÁI: Nội dung đề bài */}
                    <div className="flex-1">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-medium text-blue-500 mb-2">{assignment.title}</h1>
                                <p className={`font-medium ${textMain}`}>{assignment.teacher || 'Giảng viên'}</p>
                                <div className={`flex items-center gap-4 text-sm mt-1 font-medium ${textSub}`}>
                                    <span>{assignment.points ? `${assignment.points} điểm` : '100 điểm'}</span>
                                    <span>•</span>
                                    <span className={`${textMain}`}>Đến hạn: {assignment.dueDate || 'Chưa rõ'}</span>
                                </div>
                            </div>
                        </div>

                        <div className={`border-t ${borderCol} pt-6`}>
                            <p className={`${textMain} whitespace-pre-line leading-relaxed text-sm md:text-base`}>
                                {assignment.description || 'Không có mô tả chi tiết.'}
                            </p>
                        </div>

                        <div className={`border-t ${borderCol} pt-6 mt-8`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center shrink-0 ${textSub}`}>
                                    <User className="w-6 h-6" />
                                </div>
                                <div className={`flex-1 border ${borderCol} rounded-full px-4 py-2 text-sm ${textSub} cursor-text ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                    Thêm nhận xét của lớp học...
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: Form nộp bài */}
                    <div className="w-full lg:w-[350px] shrink-0">
                        {userRole === 'student' ? (
                            <div className={`${bgCard} border ${borderCol} rounded-xl p-5 shadow-sm`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className={`text-xl font-medium ${textMain}`}>Bài tập của bạn</h2>
                                    <span className={`text-sm font-medium ${submission?.grade !== undefined ? 'text-blue-500' : 'text-green-500'}`}>
                                        {submission?.grade !== undefined ? 'Đã chấm điểm' : (isSubmitted ? 'Đã nộp' : 'Đã giao')}
                                    </span>
                                </div>

                                {/* KẾT QUẢ CHẤM ĐIỂM (STUDENT FLOW) */}
                                {submission?.grade !== undefined && (
                                    <div className={`mb-6 p-4 rounded-xl border ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-sm font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Điểm số:</span>
                                            <span className={`text-xl font-bold px-3 py-1 rounded-lg ${
                                                submission.grade >= (assignment?.points || 100) / 2 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                                {submission.grade} / {assignment?.points || 100}
                                            </span>
                                        </div>
                                        
                                        {submission.feedback && (
                                            <div className={`mt-3 p-3 rounded-lg border-l-4 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    Giáo viên nhận xét
                                                </p>
                                                <p className={`text-sm italic ${textMain}`}>{submission.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {uploadedFile && (
                                    <div className={`border ${borderCol} rounded-lg p-3 flex items-center gap-3 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} relative group`}>
                                        <File className="w-8 h-8 text-blue-500" />
                                        <div className="flex-1 min-w-0">
                                            {uploadedFile.url ? (
                                                 <a href={uploadedFile.url} target="_blank" rel="noreferrer" className={`text-sm font-medium ${textMain} truncate hover:underline hover:text-blue-500 block`} title={uploadedFile.name}>
                                                    {uploadedFile.name}
                                                </a>
                                            ) : (
                                                 <p className={`text-sm font-medium ${textMain} truncate block`} title={uploadedFile.name}>
                                                    {uploadedFile.name}
                                                </p>
                                            )}
                                            {uploadedFile.size && <p className={`text-xs ${textSub}`}>{uploadedFile.size}</p>}
                                        </div>
                                        {!isSubmitted && (
                                            <button
                                                onClick={() => setUploadedFile(null)}
                                                className={`p-1 rounded-full ${textSub} ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                <input
                                    type="file"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />

                                {!isSubmitted ? (
                                    <div className="flex flex-col gap-3">
                                        {!uploadedFile && (
                                            <button
                                                onClick={handleFileUploadClick} 
                                                className={`w-full py-2.5 px-4 flex items-center justify-center gap-2 border ${borderCol} rounded-md text-blue-500 font-medium ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'} transition-colors`}
                                            >
                                                <Plus className="w-5 h-5" />
                                                Thêm hoặc tạo
                                            </button>
                                        )}
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!uploadedFile || uploading}
                                            className={`w-full py-2.5 px-4 rounded-md font-medium transition-colors ${uploadedFile && !uploading
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            {uploading ? 'Đang nộp...' : 'Nộp bài'}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleCancelSubmit}
                                        className={`w-full py-2.5 px-4 border ${borderCol} rounded-md ${textMain} font-medium ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors mt-2`}
                                    >
                                        Hủy nộp bài
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={`${bgCard} border ${borderCol} rounded-xl p-5 shadow-sm`}>
                                <h2 className={`text-xl font-medium ${textMain} mb-4 flex items-center justify-between`}>
                                    <span>Danh sách bài nộp</span>
                                    <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">{teacherSubmissions.length} bài</span>
                                </h2>
                                
                                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
                                    {teacherSubmissions.length === 0 ? (
                                        <p className="text-gray-500 text-sm text-center py-4">Chưa có sinh viên nào nộp bài.</p>
                                    ) : (
                                        teacherSubmissions.map(sub => (
                                            <div key={sub._id} className={`p-4 border ${borderCol} rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors flex flex-col gap-2`}>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-semibold text-sm">{sub.studentName || 'Sinh viên'}</h3>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(sub.createdAt).toLocaleString('vi-VN')}
                                                        </p>
                                                    </div>
                                                    {sub.grade !== undefined ? (
                                                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md">
                                                            {sub.grade} / {assignment.points || 100}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-md">
                                                            Chưa chấm
                                                        </span>
                                                    )}
                                                </div>
                                                <button 
                                                    onClick={() => navigate(`/course/stream/${courseId}/assignment/${assignmentId}/grade/${sub._id}`)}
                                                    className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                                                >
                                                    Chấm bài
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-4 flex items-center gap-3 cursor-text">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0">{userInitials}</div>
                            <div className={`flex-1 border ${borderCol} rounded-full px-4 py-1.5 text-sm ${textSub} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                Nhận xét riêng tư...
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}