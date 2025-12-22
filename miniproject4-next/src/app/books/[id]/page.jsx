"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import Header from "../../components/Header";
import axios from "axios";
//import { useAuth } from "../../context/AuthContext";
import {useAuth} from "@/app/context/AuthContext";
import {ReflectAdapter as searchParams} from "next/dist/server/web/spec-extension/adapters/reflect";

// const API_BASE_URL =
//     process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

const API_BASE_URL = "http://10.99.2.11:8080"

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, logout } = useAuth();
    const bookId = params.id; // URL /books/[id]

    // 🔹 책 정보 (임시 더미)
    const [book, setBook] = useState({power: ""});

    // 🔹 Dialog 상태 (삭제 성공/실패 메시지용)
    const [dialogState, setDialogState] = useState({
        open: false,
        title: "",
        message: "",
    });

    const closeDialog = () => {
        setDialogState((prev) => ({ ...prev, open: false }));
    };

    // 🔹 (선택) 실제 상세 조회 API 필요하면 여기에 추가
    useEffect(() => {
        const postBooks = async () => {
            try {
                const book_res = await axios.post(`${API_BASE_URL}/api/v1/books/check`, {
                    book_id : bookId,
                    user_id: user,
                });

                const img_res = await axios.post(`${API_BASE_URL}/api/v1/image/check`, {
                    book_id : bookId,
                });


                setBook({
                    ...book_res.data,
                    ...img_res.data,
                    power: book_res.data.power
                });


            } catch (err) {
                console.error("❌ 책 목록 조회 실패:", err);
                setBooks([]);
            } finally {
                // setLoading(false);
                console.log(book);
            }

        };
        postBooks();
    }, []);

    // ✅ 삭제 API 호출 함수
    const deleteBook = async (id) => {
        // TODO: 나중에 loginUser를 localStorage나 AuthContext에서 받아오면 됨

        const res = await axios.delete(
            `${API_BASE_URL}/api/v1/books/delete`,
            {
                data: { user_id: user,
                        book_id: bookId },
            }
        );

        return res.data;
    };

    // ✅ 삭제 버튼 클릭 핸들러
    const handleDelete = async () => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            const result = await deleteBook(bookId);

            setDialogState({
                open: true,
                title: "삭제 완료",
                message: result.message || "도서가 삭제되었습니다.",
            });

            // 조금 있다가 목록으로 이동
            setTimeout(() => {
                router.push("/");
            }, 1000);
        } catch (e) {
            console.error(e);
            setDialogState({
                open: true,
                title: "삭제 실패",
                message:
                    e.response?.data?.message ||
                    "도서 삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
            });
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f7" }}>
            <Header />

            {/* 전체 폭을 편집 페이지처럼 넓게 사용 */}
            <Container maxWidth={false} sx={{ maxWidth: 1400, pt: 6, pb: 8 }}>
                {/* 상단 헤더 영역 */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 4,
                    }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                            도서 상세 정보
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            생성된 표지와 책 내용을 확인하고 관리할 수 있습니다.
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1 }}>
                    {book.power === "작성자" && (
                        <>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => router.push(`/books/edit?bookId=${bookId}`)}
                            >
                                수정
                            </Button>

                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleDelete}
                            >
                                삭제
                            </Button>
                        </>
                    )}
                </Box>
                </Box>

                {/* 표지 + 내용 레이아웃 */}
                <Box
                    mt={3}
                    display="flex"
                    flexDirection={{ xs: "column", md: "row" }}
                    gap={3}
                    alignItems="stretch"
                >
                    {/* 왼쪽: 표지 영역 */}
                    <Box flex={{ xs: "none", md: "0 0 32%" }}>
                        <Paper
                            elevation={3}
                            sx={{
                                borderRadius: 3,
                                minHeight: 520,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                overflow: "hidden",
                                boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
                            }}
                        >
                            {book.image_url ? (
                                <Box
                                    component="img"
                                    src={book.image_url}
                                    alt="도서 표지"
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: 2,
                                    }}
                                />
                            ) : (
                                <Typography variant="h6" color="text.secondary">
                                    표지 이미지 없음
                                </Typography>
                            )}
                        </Paper>
                    </Box>

                    {/* 오른쪽: 책 내용 카드 */}
                    <Box flex="1 1 0">
                        <Paper
                            elevation={1}
                            sx={{
                                borderRadius: 3,
                                p: 4,
                                minHeight: 520,
                                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                                bgcolor: "white",
                            }}
                        >
                            <Typography variant="h5" gutterBottom fontWeight={700}>
                                {book.title}
                            </Typography>

                            {/* <Typography
                                variant="subtitle1"
                                color="text.secondary"
                                sx={{ mb: 3 }}
                            >
                                저자: {book.author}
                            </Typography> */}

                            <Box
                                sx={{
                                    border: "1px solid rgba(148,163,184,0.6)",
                                    borderRadius: 2,
                                    p: 3,
                                    minHeight: 320,
                                    mb: 4,
                                    bgcolor: "#f9fafb",
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    sx={{ mb: 1, fontWeight: 600 }}
                                >
                                    {book.description}
                                </Typography>
                                <Typography variant="body1">{book.contents}</Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    gap: 3,
                                    color: "text.secondary",
                                    fontSize: 13,
                                }}
                            >
                                {/* <Typography>생성일: {book.createdAt}</Typography>
                                <Typography>수정일: {book.updatedAt}</Typography> */}
                            </Box>
                        </Paper>
                    </Box>
                </Box>

                {/* 뒤로가기 버튼 */}
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Button
                        variant="outlined"
                        component={Link}
                        href="/"
                        color="primary"
                    >
                        도서 목록으로 돌아가기
                    </Button>
                </Box>
            </Container>

            {/* 공용 Dialog (삭제 성공/실패 안내) */}
            <Dialog open={dialogState.open} onClose={closeDialog}>
                <DialogTitle>{dialogState.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialogState.message}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} autoFocus>
                        확인
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}