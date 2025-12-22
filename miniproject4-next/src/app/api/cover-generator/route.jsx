// Next.js App Router의 API Route
// app/api/cover-generator/route.jsx

import { NextResponse } from 'next/server';
// 스프링 백엔드 주소
const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

// OpenAI SDK가 없다고 가정하고, Node.js의 fetch를 사용한 기본적인 로직만 구현합니다.

export async function POST(request) {
    try {
        const { apiKey, title, content, model } = await request.json();

        if (!apiKey || !title || !content || !model) {
            return NextResponse.json({ error: 'API Key, 책 제목, 책 내용, 모델은 필수입니다.' }, { status: 400 });
        }

        // **경고:** 이 예시 코드에서는 클라이언트에서 받은 apiKey를 사용합니다.
        // **실제 운영 환경에서는 절대 이렇게 하지 말고, 서버의 환경 변수 (process.env.OPENAI_API_KEY)를 사용해야 합니다.**

        const openaiUrl = 'https://api.openai.com/v1/images/generations';

        // DALL-E 3는 직사각형 비율을 지원하며, DALL-E 2는 정사각형만 지원합니다.
        const size = model === 'dall-e-3' ? '1024x1792' : '1024x1024';
        const quality = model === 'dall-e-3' ? 'standard' : undefined;

        const finalPrompt = `
        A professional, minimalist book cover illustration. 
        The scene depicts: [${content}] with the atmosphere matching the title: [${title}].
        The subject focus should be clear and realistic and must reflect the description.
        
        CRITICAL INSTRUCTIONS: Do not generate any text, letters, numbers, symbols, or logos anywhere in the image. 
        The entire image must be a visual illustration only.
        `;

        const response = await fetch(openaiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`, // 클라이언트에서 받은 키를 사용 (보안 취약)
            },
            body: JSON.stringify({
                model: model,
                prompt: finalPrompt,
                n: 1,
                size: size,
                quality: quality,
                response_format: 'url',
            }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            console.error("OpenAI API Error:", data.error);
            return NextResponse.json({
                error: data.error?.message || 'OpenAI API 호출에 실패했습니다.'
            }, { status: response.status });
        }

        const imageUrl = data.data[0].url;

        // 1️⃣ 생성된 이미지 URL을 DB 저장용 백엔드 API로 전송하는 코드 추가
        try {
            const saveResponse = await fetch(`${API_BASE_URL}/api/v1/image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content,
                    imageUrl,
                }),
            });

            if (!saveResponse.ok) {
                console.error("Failed to save image URL to backend");
            }

        } catch (e) {
            console.error("Error sending image URL to backend:", e);
        }

        // 2️⃣ 그리고 나서 프론트로도 결과 반환 (추후 해당 로직은 백에서 받아서 띄우는 걸로 수정)
        return NextResponse.json({ imageUrl });

    } catch (error) {
        console.error("Server processing error:", error);
        return NextResponse.json({ error: '서버에서 요청을 처리하는 중 오류가 발생했습니다.' }, { status: 500 });
    }
}