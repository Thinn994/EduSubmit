import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, CheckCircle, MessageSquare, Award, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'http://localhost:5000/api';

export default function GradeSubmission() {
    const { courseId, assignmentId, submissionId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();

    const [submission, setSubmission] = useState(null);
    const [assignment, setAssignment] = useState(null);
    const [score, setScore] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch submission details
                const subRes = await axios.get(`${API_URL}/submissions/${submissionId}`);
                setSubmission(subRes.data);
                
                if (subRes.data.grade) setScore(subRes.data.grade);
                if (subRes.data.feedback) setFeedback(subRes.data.feedback);

                // Fetch assignment details for max score
                const assignRes = await axios.get(`${API_URL}/assignments/${assignmentId}`);
                setAssignment(assignRes.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [submissionId, assignmentId]);

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.put(`${API_URL}/submissions/${submissionId}/grade`, {
                score: Number(score),
                feedback
            });
            
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                navigate(`/course/stream/${courseId}/assignment/${assignmentId}`); // back to submissions list
            }, 1500);
        } catch (error) {
            console.error("Lỗi khi chấm điểm:", error);
            alert("Có lỗi xảy ra khi lưu điểm.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
                Không tìm thấy bài nộp
            </div>
        );
    }

    const maxScore = assignment?.points || 100;

    return (
        <div className={`h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} overflow-hidden`}>
            
            {/* Top Navigation */}
            <nav className={`h-14 px-4 flex items-center justify-between border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shrink-0`}>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg leading-tight truncate max-w-md">{assignment?.title || 'Chấm điểm bài nộp'}</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sinh viên: {submission.studentName || 'Không xác định'}</p>
                    </div>
                </div>
            </nav>

            {/* Split Screen Content */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Left Panel: Document Viewer (70%) */}
                <div className={`w-full lg:w-[70%] h-full flex flex-col bg-gray-100 dark:bg-gray-950 relative`}>
                    {submission.fileUrl ? (
                        <iframe 
                            src={submission.fileUrl} 
                            title="File Viewer" 
                            className="w-full h-full border-none bg-white dark:bg-gray-900"
                            sandbox="allow-scripts allow-same-origin allow-popups"
                        >
                        </iframe>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Không có file đính kèm
                        </div>
                    )}
                </div>

                {/* Right Panel: Grading Form (30%) */}
                <div className={`hidden lg:flex w-[30%] h-full flex-col border-l ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} shadow-xl overflow-y-auto`}>
                    
                    <div className="p-6">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold mb-1">Chấm điểm</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="w-4 h-4" /> 
                                Đã nộp: {new Date(submission.createdAt).toLocaleString('vi-VN')}
                            </p>
                        </div>

                        <form onSubmit={handleGradeSubmit} className="space-y-6">
                            
                            {/* Score Input */}
                            <div className={`p-5 rounded-2xl border-2 ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-blue-100 bg-blue-50/30'}`}>
                                <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-blue-600 dark:text-blue-400">
                                    <Award className="w-5 h-5" />
                                    Điểm tổng kết
                                </label>
                                <div className="flex items-end gap-2">
                                    <input 
                                        type="number" 
                                        value={score}
                                        onChange={(e) => setScore(e.target.value)}
                                        max={maxScore}
                                        min="0"
                                        step="0.1"
                                        placeholder="0"
                                        required
                                        className={`w-24 text-4xl font-bold text-center bg-transparent border-b-2 focus:border-blue-500 focus:outline-none transition-colors ${isDarkMode ? 'text-white border-gray-600' : 'text-gray-900 border-gray-300'}`}
                                    />
                                    <span className="text-2xl font-bold text-gray-400 pb-1">/ {maxScore}</span>
                                </div>
                            </div>

                            {/* Feedback Input */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                                    <MessageSquare className="w-4 h-4" />
                                    Nhận xét (Tùy chọn)
                                </label>
                                <textarea 
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Tuyệt vời! Tuy nhiên bạn cần lưu ý phần..."
                                    rows="6"
                                    className={`w-full p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                                ></textarea>
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
                            >
                                {isSubmitting ? 'Đang lưu...' : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Lưu điểm
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in z-50">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-semibold">Đã lưu điểm thành công!</span>
                </div>
            )}
        </div>
    );
}
