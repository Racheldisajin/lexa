import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from localStorage on mount
        const storedUser = localStorage.getItem('lexa_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Cek pengguna bawaan (admin/user)
        if (password === 'password') {
            if (email === 'admin@lexa.com') {
                const adminUser = { id: 1, name: 'Administrator', email: 'admin@lexa.com', role: 'admin', plan: 'enterprise' };
                setUser(adminUser);
                localStorage.setItem('lexa_user', JSON.stringify(adminUser));
                return { success: true };
            } else if (email === 'user@lexa.com') {
                const regularUser = { id: 2, name: 'Rizky Pratama', email: 'user@lexa.com', role: 'user', plan: 'free' };
                setUser(regularUser);
                localStorage.setItem('lexa_user', JSON.stringify(regularUser));
                return { success: true };
            } else if (email === 'rachel@lexa.com') {
                const rachelUser = { id: 3, name: 'Rachel', email: 'rachel@lexa.com', role: 'user', plan: 'free' };
                setUser(rachelUser);
                localStorage.setItem('lexa_user', JSON.stringify(rachelUser));
                return { success: true };
            }
        }

        // Cek pengguna yang baru didaftarkan di localStorage
        const storedUsers = JSON.parse(localStorage.getItem('lexa_registered_users') || '[]');
        const existingUser = storedUsers.find(u => u.email === email && u.password === password);
        
        if (existingUser) {
            // Hilangkan password sebelum disimpan ke session
            const { password, ...userSession } = existingUser;
            setUser(userSession);
            localStorage.setItem('lexa_user', JSON.stringify(userSession));
            return { success: true };
        }

        return { success: false, message: 'Email atau password yang Anda masukkan salah.' };
    };

    const register = async (name, email, password) => {
        const storedUsers = JSON.parse(localStorage.getItem('lexa_registered_users') || '[]');
        
        // Cek apakah email sudah ada
        if (storedUsers.some(u => u.email === email) || email === 'admin@lexa.com' || email === 'user@lexa.com') {
            return { success: false, message: 'Email sudah terdaftar.' };
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role: 'user',
            plan: 'free',
            created_at: new Date().toISOString(),
        };

        storedUsers.push(newUser);
        localStorage.setItem('lexa_registered_users', JSON.stringify(storedUsers));

        // Auto login
        const { password: _, ...userSession } = newUser;
        setUser(userSession);
        localStorage.setItem('lexa_user', JSON.stringify(userSession));

        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('lexa_user');
    };

    const upgradePlan = (newPlan) => {
        if (user) {
            const updatedUser = { ...user, plan: newPlan };
            setUser(updatedUser);
            localStorage.setItem('lexa_user', JSON.stringify(updatedUser));
        }
    };

    const updateUser = (updatedFields) => {
        if (user) {
            const updatedUser = { ...user, ...updatedFields };
            setUser(updatedUser);
            localStorage.setItem('lexa_user', JSON.stringify(updatedUser));
            
            // Also update in registered users array if present
            const storedUsers = JSON.parse(localStorage.getItem('lexa_registered_users') || '[]');
            const index = storedUsers.findIndex(u => u.email === user.email);
            if (index !== -1) {
                storedUsers[index] = { ...storedUsers[index], ...updatedFields };
                localStorage.setItem('lexa_registered_users', JSON.stringify(storedUsers));
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, upgradePlan, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
