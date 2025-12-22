"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Card,
    Container,
    Typography,
    Pagination,
} from "@mui/material";

import Header from "./components/Header";

// const API_BASE_URL =
//     process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const API_BASE_URL = "http://10.99.2.11:8080"

export default function HomePage() {
    const router = useRouter();

    const [loginUser, setLoginUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    // 페이지네이션 상태
    const [page, setPage] = useState(1);
    const pageSize = 5;

    // 로그인 사용자 정보
    useEffect(() => {
        const user = localStorage.getItem("loginUser");
        if (user) {
            setLoginUser(Number(user));
        }
    }, []);

    // 책 목록 조회
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/v1/books/list`
                );

                const list = response.data.data;
                if (Array.isArray(list)) {
                    setBooks(list);
                } else {
                    setBooks([]);
                }
            } catch (err) {
                console.error("❌ 책 목록 조회 실패:", err);
                setBooks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    const startIndex = (page - 1) * pageSize;
    const currentBooks = books.slice(startIndex, startIndex + pageSize);

    const handlePageChange = (_, value) => setPage(value);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f7" }}>
            <Header />

            <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
                {/* 상단 영역 */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        mb: 4,
                    }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                            도서 목록
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            등록한 도서를 관리하고, AI 표지를 생성해보세요.
                        </Typography>
                    </Box>

                    {/* {loginUser && (
                        <Button
                            variant="contained"
                            onClick={() => router.push("/books/edit")}
                            sx={{ borderRadius: 999, px: 3, py: 1 }}
                        >
                            새 도서 등록
                        </Button>
                    )} */}
                </Box>

                {/* 콘텐츠 */}
                <Card
                    sx={{
                        borderRadius: 3,
                        minHeight: 360,
                        p: 5,
                        bgcolor: "white",
                        boxShadow: "0 12px 32px rgba(15,23,42,0.08)",
                        border: "1px solid rgba(148,163,184,0.3)",
                    }}
                >
                    {loading ? (
                        <Typography textAlign="center">불러오는 중...</Typography>
                    ) : books.length === 0 ? (
                        <Box textAlign="center">
                            <Typography variant="h6" fontWeight={600}>
                                아직 등록된 도서가 없습니다.
                            </Typography>
                            <Typography color="text.secondary" sx={{ mb: 3 }}>
                                첫 도서를 등록하고 AI 표지를 생성해보세요.
                            </Typography>

                            <Button
                                variant="contained"
                                onClick={() => router.push("/books/edit")}
                                sx={{ px: 3, py: 1.1 }}
                            >
                                새 도서 등록하기
                            </Button>
                        </Box>
                    ) : (
                        <>
                            {currentBooks.map((book) => (
                                <Card
                                    key={book.book_id}
                                    sx={{
                                        p: 2,
                                        mb: 2,
                                        borderRadius: 2,
                                        border: "1px solid #e2e8f0",
                                        cursor: "pointer",
                                    }}
                                    onClick={() =>
                                        router.push(`/books/${book.book_id}`)
                                    }
                                >
                                    <Typography variant="h6" fontWeight={700}>
                                        {book.title}
                                    </Typography>
                                    <Typography color="text.secondary">
                                        {book.description}
                                    </Typography>
                                </Card>
                            ))}

                            <Box display="flex" justifyContent="center" mt={3}>
                                <Pagination
                                    count={Math.ceil(books.length / pageSize)}
                                    page={page}
                                    onChange={handlePageChange}
                                />
                            </Box>
                        </>
                    )}
                </Card>
            </Container>
        </Box>
    );
}
