"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// const API_BASE_URL =
//     process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const API_BASE_URL = "/api"

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // 로그인 user_id 저장
    const [username, setUsername] = useState(null); // 로그인 user_id 저장

    // ✔ 새로고침 시 로그인 유지
    useEffect(() => {
        if (typeof window === "undefined") return;
        const savedUser = localStorage.getItem("loginUser");
        const savedName = localStorage.getItem("loginUsername");

        if (savedUser) setUser(savedUser);
        if (savedName) setUsername(savedName);
    }, []);

    // ----------------------------------------------------------------------------------------
    // ✅ axios 로그인 함수
    // ----------------------------------------------------------------------------------------
    const login = async (id, pw) => {
        const url = `${API_BASE_URL}/api/v1/users/login`;
        console.log("📌 로그인 요청 URL:", url);

        try {
            const res = await axios.post(url, {
                login_id: id,
                password: pw
            });

            // ✔ 정상 응답이면 user_id 저장
            const userId = res.data.user_id;
            if (!userId) {
                throw new Error("user_id가 응답에 없습니다.");
            }

            setUser(userId);
            setUsername(id);

            localStorage.setItem("loginUser", userId);
            localStorage.setItem("loginUsername", id);
            return userId;

        } catch (err) {
            // Axios 에러 구조 분석
            if (err.response) {
                console.error("❌ 서버 응답 오류:", err.response.data);
                throw new Error(err.response.data.message || "로그인 실패");
            } else if (err.request) {
                console.error("❌ 서버에 연결되지 않음:", err.request);
                throw new Error("백엔드 서버에 연결할 수 없습니다.");
            } else {
                console.error("❌ 요청 설정 중 오류:", err.message);
                throw new Error("요청을 처리할 수 없습니다.");
            }
        }
    };

    // ----------------------------------------------------------------------------------------
    // 로그아웃
    // ----------------------------------------------------------------------------------------
    const logout = () => {
        setUser(null);
        localStorage.removeItem("loginUser");
    };

    return (
        <AuthContext.Provider value={{ user, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth는 AuthProvider 내부에서만 사용해야 합니다.");
    return ctx;
}
