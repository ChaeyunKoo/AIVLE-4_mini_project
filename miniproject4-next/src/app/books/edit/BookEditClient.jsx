"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../components/Header";
import {
    Box,
    Button,
    Card,
    Container,
    FormControl,
    MenuItem,
    Select,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress,
} from "@mui/material";
import {useAuth} from "@/app/context/AuthContext";

/*
 const API_BASE_URL =
     process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
*/

const API_BASE_URL = "http://10.99.2.11:8080"

export default function BookEditPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const bookId = searchParams.get("bookId");
    const isEditMode = !!bookId;

    // 🔹 Dialog 상태
    const [dialogState, setDialogState] = useState({
        open: false,
        title: "",
        message: "",
    });
    const closeDialog = () =>
        setDialogState((prev) => ({
            ...prev,
            open: false,
        }));

    // 🔹 로그인 체크
    useEffect(() => {
        const user = localStorage.getItem("loginUser");
        if (!user) {
            setDialogState({
                open: true,
                title: "접근 제한",
                message: "로그인 후 이용할 수 있습니다.",
            });
            setTimeout(() => router.replace("/login"), 1000);
        }
    }, [router]);

    // 🔹 입력 상태
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState("dall-e-2");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); //추가

    const { user } = useAuth();

    // (선택) 수정 모드일 때 기존 책 정보 불러오기
    useEffect(() => {
        const fetchBook = async () => {
            if (!isEditMode) return;
            try {
                const book_res = await axios.post(`${API_BASE_URL}/api/v1/books/check`, {
                    book_id : bookId,
                    user_id: user,
                });

                const img_res = await axios.post(`${API_BASE_URL}/api/v1/image/check`, {
                    book_id : bookId,
                });

                setTitle(book_res.data.title || "");
                setContent(book_res.data.description || "");
                setCoverUrl(img_res.data.image_url || "");

            } catch (e) {
                console.error(e);
                setDialogState({
                    open: true,
                    title: "불러오기 실패",
                    message: e.message,
                });
            }
        };
        fetchBook();
    }, [isEditMode, bookId]);


    // ✅ 책 생성 API
    const createBook = async () => {

        const res = await axios.post(`${API_BASE_URL}/api/v1/books`, {
            title: title,
            description: content,
            user_id: user,
        });

        return res.data.book_id;
    };


    // ✅ 책 수정 API
    const updateBook = async () => {

        const res = await axios.put(`${API_BASE_URL}/api/v1/books/put`, {
            book_id: bookId,
            title : title,
            description: content,
            user_id: user,
        });

        return res.data;
    };

    // ✅ 책 수정 API
    const updateImage = async () => {

        const res = await axios.put(`${API_BASE_URL}/api/v1/image/put`, {
            book_id: bookId,
            image_url: coverUrl,
            user_id: user
        });

        return res.data;
    };

    // ✅ 이미지 생성 API
    const createImage = async (bookId, coverUrl) => {
        if (!bookId) throw new Error("book_id가 없습니다.");
        if (!coverUrl) throw new Error("image_url이 비어있습니다.");

        const res = await axios.post(`${API_BASE_URL}/api/v1/image`, {
            image_url: coverUrl,
            book_id: bookId,
        });

        return res.data;
    };

    // 🔹 API 요청 함수 (1209 추가)
    const generateCoverApi = async ({ apiKey, title, content, model }) => {
        const response = await fetch(`${API_BASE_URL}/api/cover-generator`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey, title, content, model }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "표지 생성 중 알 수 없는 오류가 발생했습니다.");
        }

        if (!result.imageUrl) {
            throw new Error("서버로부터 유효한 이미지 URL을 받지 못했습니다.");
        }

        return result.imageUrl;
    };

    // 🔹 표지 생성
    const handleGenerateCover = async () => {
        if (!title.trim() || !content.trim() || !apiKey.trim()) {
            setDialogState({
                open: true,
                title: "입력 오류",
                message: "API Key, 책 제목, 내용을 모두 입력해야 합니다.",
            });
            return;
        }

        // 🔥 2000자 제한 체크
        if (content.length > 2000) {
            setDialogState({
                open: true,
                title: "글자수 초과",
                message: "책 내용은 최대 2000자까지 가능합니다.",
            });
            return;
        }

        setIsGenerating(true);
        setCoverUrl("");

        try {
            const imageUrl = await generateCoverApi({ apiKey, title, content, model });
            setCoverUrl(imageUrl);
            setDialogState({
                open: true,
                title: "생성 완료",
                message: "AI 표지 생성이 완료되었습니다. 등록을 진행하세요.",
            });
        } catch (error) {
            console.error("표지 생성 실패:", error.message);
            setDialogState({
                open: true,
                title: "생성 실패",
                message:
                    error.message ||
                    "표지 생성 요청에 실패했습니다. API Key와 내용을 확인해주세요.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // 🔹 등록 / 수정
    const handleSubmit = async () => {
        if (!title.trim() || !content.trim() || !coverUrl) {
            setDialogState({
                open: true,
                title: "필수 항목 누락",
                message: "책 제목, 내용, 표지가 모두 필요합니다.",
            });
            return;
        }

        // 🔥 2000자 제한 체크
        if (content.length > 2000) {
            setDialogState({
                open: true,
                title: "글자수 초과",
                message: "책 내용은 최대 2000자까지 가능합니다.",
            });
            return;
        }

        setIsSubmitting(true); // 🔥 버튼 비활성화 시작

        try {
            if (isEditMode) {
                await updateBook();
                await updateImage();
                setDialogState({
                    open: true,
                    title: "수정 완료",
                    message: `도서(id: ${bookId}) 수정이 완료되었습니다.`,
                });
            } else {
                const newBookId  = await createBook();

                await createImage(newBookId, coverUrl);

                setDialogState({
                    open: true,
                    title: "등록 완료",
                    message: "새 도서 등록이 완료되었습니다.",
                });
            }

            setTimeout(() => router.push("/"), 1000);
        } catch (e) {
            console.error(e);
            setDialogState({
                open: true,
                title: "요청 실패",
                message: e.message || "요청 처리 중 오류가 발생했습니다.",
            });
            setIsSubmitting(false); // 🔥 요청 끝 → 다시 버튼 활성화
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f7" }}>
            <Header />

            <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
                {/* 제목 영역 */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }} align="left">
                        AI 표지 생성
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        책 내용을 입력하고 OpenAI를 통해 표지를 생성해보세요.
                    </Typography>
                </Box>

                {/* API Key + 모델 선택 */}
                <Card
                    sx={{
                        borderRadius: 3,
                        p: 3,
                        mb: 3,
                        boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                        border: "1px solid rgba(148,163,184,0.4)",
                    }}
                >
                    <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            API 입력
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="OpenAI API Key 입력 (보안에 취약함)"
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                            모델 선택
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select value={model} onChange={(e) => setModel(e.target.value)}>
                                <MenuItem value="dall-e-2">DALL·E 2 (기본)</MenuItem>
                                <MenuItem value="dall-e-3">DALL·E 3 (고품질)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Card>

                {/* 표지 + 내용 */}
                <Box
                    mt={3}
                    display="flex"
                    flexDirection={{ xs: "column", md: "row" }}
                    gap={3}
                    alignItems="stretch"
                >
                    {/* 표지 카드 */}
                    <Box flex={{ xs: "none", md: "0 0 32%" }}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                minHeight: 480,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid rgba(148,163,184,0.6)",
                                boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
                                bgcolor: "white",
                            }}
                        >
                            {isGenerating ? (
                                <CircularProgress size={50} />
                            ) : coverUrl ? (
                                <Box
                                    component="img"
                                    src={coverUrl}
                                    alt="AI 생성 표지"
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: 3,
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <Typography variant="h5" color="text.secondary">
                                    표지 미리보기
                                </Typography>
                            )}
                        </Card>
                    </Box>

                    {/* 책 내용 입력 */}
                    <Box flex="1 1 0">
                        <Card
                            sx={{
                                width: "100%",
                                borderRadius: 3,
                                minHeight: 480,
                                p: 3,
                                border: "1px solid rgba(148,163,184,0.6)",
                                boxShadow: "0 10px 28px rgba(15,23,42,0.12)",
                                bgcolor: "white",
                            }}
                        >
                            <Typography
                                variant="h6"
                                textAlign="center"
                                fontWeight={800}
                                sx={{ mb: 3 }}
                            >
                                책 내용
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                label="책 제목 (입력)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                sx={{ mb: 3 }}
                            />

                            {/* 🔥 2000자 제한 적용된 TextField */}
                            <TextField
                                fullWidth
                                multiline
                                minRows={7}
                                label="책 내용 (입력)"
                                value={content}
                                onChange={(e) => {
                                    const text = e.target.value;
                                    if (text.length <= 2000) {
                                        setContent(text);
                                    } else {
                                        setDialogState({
                                            open: true,
                                            title: "글자수 초과",
                                            message:
                                                "책 내용은 최대 2000자까지 입력 가능합니다.",
                                        });
                                    }
                                }}
                                helperText={`${content.length}/2000`}
                                FormHelperTextProps={{
                                    style: {
                                        textAlign: "right",
                                        color: content.length > 2000 ? "red" : "gray",
                                    },
                                }}
                            />
                        </Card>
                    </Box>
                </Box>

                {/* 버튼 영역 */}
                <Box mt={3} display="flex" justifyContent="flex-end" gap={1.5}>
                    <Button
                        variant="outlined"
                        onClick={handleGenerateCover}
                        disabled={isGenerating}
                    >
                        {isGenerating ? "생성 중..." : "표지 생성"}
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isSubmitting || isGenerating}
                    >
                        {isSubmitting ? (isEditMode ? "수정 중..." : "등록 중...") : (isEditMode ? "수정" : "등록")}
                    </Button>
                </Box>

                <Box mt={2} textAlign="center">
                    <Button variant="text" onClick={() => router.push("/")}>
                        도서 목록으로 돌아가기
                    </Button>
                </Box>
            </Container>

            {/* 공용 Dialog */}
            <Dialog open={dialogState.open} onClose={closeDialog}>
                <DialogTitle>{dialogState.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialogState.message}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary" autoFocus>
                        확인
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
