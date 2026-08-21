import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, UploadCloud, File, FileText, CheckCircle, X, Type, Tag, AlignLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const API_URL = 'http://localhost:5000/api';

export default function UploadMaterial() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const { userData } = useAuth();
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Bài giảng');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);

    const [recentMaterials, setRecentMaterials] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const bgMain = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
    const bgCard = isDarkMode ? 'bg-gray-800' : 'bg-white';
    const textMain = isDarkMode ? 'text-gray-100' : 'text-gray-800';
    const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
    const borderCol = isDarkMode ? 'border-gray-700' : 'border-gray-200';

    useEffect(() => {
        fetchMaterials();
    }, [courseId]);

    const fetchMaterials = async () => {
        try {
            const res = await axios.get(`${API_URL}/materials?courseId=${courseId}`);
            setRecentMaterials(res.data.slice(0, 5)); // show top 5 recent
        } catch (error) {
            console.error("Lỗi khi tải tài liệu:", error);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileExtension = (filename) => {
        return filename.split('.').pop().toLowerCase();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Vui lòng chọn một file để tải lên.');
            return;
        }
        if (!title.trim()) {
            alert('Vui lòng nhập tiêu đề.');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            // 1. Upload to Firebase Storage
            const fileExt = getFileExtension(selectedFile.name);
            const storageRef = ref(storage, `materials/${courseId}/${Date.now()}_${selectedFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, selectedFile);

            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(Math.round(progress));
                }, 
                (error) => {
                    console.error("Firebase upload error:", error);
                    alert("Lỗi tải file lên server.");
                    setIsUploading(false);
                }, 
                async () => {
                    // Upload completed successfully
                    const downloadURL = await getDownloadURL(uploadTask.ref);

                    // 2. Save to MongoDB
                    const newMaterial = {
                        courseId,
                        title,
                        description,
                        category,
                        visibility,
                        fileUrl: downloadURL,
                        fileName: selectedFile.name,
                        fileSize: formatFileSize(selectedFile.size),
                        type: fileExt
                    };

                    await axios.post(`${API_URL}/materials`, newMaterial);
                    
                    // Reset form and refresh list
                    setTitle('');
                    setDescription('');
                    setCategory('Bài giảng');
                    setSelectedFile(null);
                    setUploadProgress(0);
                    setIsUploading(false);
                    fetchMaterials();
                    
                    alert('Đăng tài liệu thành công!');
                }
            );

        } catch (error) {
            console.error("Lỗi submit:", error);
            alert("Có lỗi xảy ra khi lưu tài liệu.");
            setIsUploading(false);
        }
    };

    const renderFileIcon = (ext) => {
        if (['pdf'].includes(ext)) return <div className="p-2 bg-red-100 text-red-600 rounded-lg"><FileText className="w-5 h-5" /></div>;
        if (['doc', 'docx'].includes(ext)) return <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText className="w-5 h-5" /></div>;
        if (['ppt', 'pptx'].includes(ext)) return <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><FileText className="w-5 h-5" /></div>;
        if (['xls', 'xlsx'].includes(ext)) return <div className="p-2 bg-green-100 text-green-600 rounded-lg"><FileText className="w-5 h-5" /></div>;
        if (['jpg', 'png', 'jpeg', 'gif'].includes(ext)) return <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><File className="w-5 h-5" /></div>;
        return <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><File className="w-5 h-5" /></div>;
    };

    return (
        <div className={`min-h-screen flex flex-col ${bgMain} font-sans transition-colors duration-300`}>
            {/* Header */}
            <nav className={`w-full ${bgCard} border-b ${borderCol} px-4 py-3 flex items-center gap-4 sticky top-0 z-50 shadow-sm`}>
                <button onClick={() => navigate(`/course/stream/${courseId}`)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                    <ArrowLeft className={`w-6 h-6 ${textSub}`} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                        <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Đăng tài liệu lớp học</h1>
                        <p className={`text-xs ${textSub}`}>Upload Materials</p>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-8">
                
                {/* Left Column: Form */}
                <div className="flex-[2]">
                    <div className={`${bgCard} rounded-2xl shadow-sm border ${borderCol} p-6 md:p-8`}>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                            
                            {/* Drag and Drop Zone */}
                            <div>
                                <label className={`block text-sm font-semibold mb-3 ${textMain}`}>Tập tin đính kèm <span className="text-red-500">*</span></label>
                                
                                {!selectedFile ? (
                                    <div 
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed ${borderCol} rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-400 group`}
                                    >
                                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
                                            <UploadCloud className="w-8 h-8" />
                                        </div>
                                        <h3 className={`text-lg font-bold ${textMain} mb-1`}>Nhấn để tải lên hoặc Kéo thả</h3>
                                        <p className={`text-sm ${textSub} text-center`}>Hỗ trợ PDF, DOCX, PPTX, hình ảnh... (Tối đa 50MB)</p>
                                    </div>
                                ) : (
                                    <div className={`border ${borderCol} rounded-2xl p-6 flex flex-col gap-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {renderFileIcon(getFileExtension(selectedFile.name))}
                                                <div>
                                                    <p className={`font-semibold ${textMain} break-all`}>{selectedFile.name}</p>
                                                    <p className={`text-sm ${textSub}`}>{formatFileSize(selectedFile.size)}</p>
                                                </div>
                                            </div>
                                            {!isUploading && (
                                                <button type="button" onClick={() => setSelectedFile(null)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 transition-colors">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                        
                                        {isUploading && (
                                            <div className="mt-2">
                                                <div className="flex justify-between text-xs font-semibold text-indigo-600 mb-1">
                                                    <span>Đang tải lên...</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${textMain}`}>
                                        <Type className="w-4 h-4 text-indigo-500" /> Tiêu đề tài liệu <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="VD: Slide Bài giảng Chương 1"
                                        className={`w-full px-4 py-3 rounded-xl border ${borderCol} ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
                                        required
                                        disabled={isUploading}
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${textMain}`}>
                                        <Tag className="w-4 h-4 text-indigo-500" /> Danh mục
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        disabled={isUploading}
                                        className={`w-full px-4 py-3 rounded-xl border ${borderCol} ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer`}
                                    >
                                        <option value="Bài giảng">Bài giảng (Slides/Lý thuyết)</option>
                                        <option value="Tài liệu tham khảo">Tài liệu tham khảo</option>
                                        <option value="Đề thi cũ">Đề thi / Đề cương</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>

                                {/* Visibility Toggle */}
                                <div className="flex flex-col justify-center">
                                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${textMain}`}>
                                        {visibility ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-gray-500" />} Hiển thị với học sinh
                                    </label>
                                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                                        <input type="checkbox" checked={visibility} onChange={() => setVisibility(!visibility)} disabled={isUploading} className="sr-only peer" />
                                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-500 peer-checked:bg-indigo-600"></div>
                                        <span className={`ml-3 text-sm font-medium ${visibility ? 'text-indigo-600' : textSub}`}>
                                            {visibility ? 'Đang bật' : 'Đang ẩn'}
                                        </span>
                                    </label>
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className={`flex items-center gap-2 text-sm font-semibold mb-2 ${textMain}`}>
                                        <AlignLeft className="w-4 h-4 text-indigo-500" /> Mô tả (Tùy chọn)
                                    </label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Nhập mô tả nội dung tài liệu..."
                                        rows={4}
                                        disabled={isUploading}
                                        className={`w-full px-4 py-3 rounded-xl border ${borderCol} ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-50 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-y`}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isUploading || !selectedFile}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                                    isUploading || !selectedFile 
                                    ? 'bg-indigo-300 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5'
                                }`}
                            >
                                {isUploading ? 'Đang xử lý...' : (
                                    <>
                                        <CheckCircle className="w-5 h-5" /> Đăng tài liệu
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Recent Uploads */}
                <div className="flex-1">
                    <div className={`${bgCard} rounded-2xl shadow-sm border ${borderCol} p-6`}>
                        <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${textMain}`}>
                            <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                            Tài liệu vừa tải lên
                        </h2>
                        
                        <div className="flex flex-col gap-3">
                            {recentMaterials.length === 0 ? (
                                <p className={`text-sm ${textSub} text-center py-6`}>Chưa có tài liệu nào trong lớp học này.</p>
                            ) : (
                                recentMaterials.map((mat) => (
                                    <a key={mat._id} href={mat.fileUrl} target="_blank" rel="noreferrer" className={`group p-3 border ${borderCol} rounded-xl flex items-start gap-3 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                        {renderFileIcon(mat.type)}
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-semibold truncate ${textMain} group-hover:text-indigo-600 transition-colors`}>{mat.title}</h4>
                                            <p className={`text-xs ${textSub} mt-0.5 truncate`}>{mat.fileName || 'Document'}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>{mat.category}</span>
                                                <span className={`text-xs ${textSub}`}>{mat.fileSize || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </a>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
