// src/app/api/signup/route.js
import { NextResponse } from "next/server";
import axios from "axios";

// 스프링 백엔드 주소
// const API_BASE_URL =
//     process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const API_BASE_URL = "http://10.99.2.11:8080"

export async function POST(request) {
    try {
        // 프론트에서 온 값: { loginId, password }
        const body = await request.json();

        const payload = {
            user_id: null,            // 스펙에 맞게 항상 null
            login_id: body.loginId,   // loginId → login_id 로 변환
            password: body.password,
        };

        // 🔹 스펙에 맞는 URL로 호출
        const res = await axios.post(
            `${API_BASE_URL}/api/v1/users/signup`,
            payload,
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        // 그대로 응답 전달 (예: { "user_id": 1 })
        return NextResponse.json(res.data, { status: res.status });
    } catch (error) {
        console.error(
            "signup proxy error:",
            error.response?.status,
            error.response?.data
        );

        const status = error.response?.status || 500;
        const message =
            error.response?.data?.message ||
            (status === 404
                ? "아이디와 비밀번호를 다시 확인해주세요."
                : "백엔드 통신 중 오류가 발생했습니다.");

        return NextResponse.json({ message }, { status });
    }
}
