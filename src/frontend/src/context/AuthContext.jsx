/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in using localStorage
        const storedUser = localStorage.getItem('edusubmit_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setCurrentUser(user);
                setUserRole(user.role);
                setUserData(user);
            } catch (err) {
                console.error("Lỗi khi đọc session:", err);
                localStorage.removeItem('edusubmit_user');
            }
        }
        setLoading(false);
    }, []);

    const loginUser = (user) => {
        localStorage.setItem('edusubmit_user', JSON.stringify(user));
        setCurrentUser(user);
        setUserRole(user.role);
        setUserData(user);
    };

    const logoutUser = () => {
        localStorage.removeItem('edusubmit_user');
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
    };

    const value = {
        currentUser,
        userRole,
        userData,
        setUserRole,
        loginUser,
        logoutUser
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
                    Đang kết nối hệ thống...
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};
