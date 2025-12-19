"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Card,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import Header from "../components/Header";
import axios from "axios";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export default function SignupPage() {
    const router = useRouter();

    const [id, setId] = useState("");
    const [pw, setPw] = useState("");
    const [pwCheck, setPwCheck] = useState("");

    const [dialog, setDialog] = useState({
        open: false,
        title: "",
        message: "",
        success: false,
    });

    const openDialog = (title, message, success = false) => {
        setDialog({ open: true, title, message, success });
    };

    const closeDialog = () => {
        setDialog((prev) => ({ ...prev, open: false }));
        if (dialog.success) {
            router.replace("/login");
        }
    };

    const handleSignup = async () => {
        // 🔹 입력값 검증
        if (!id || !pw || !pwCheck) {
            openDialog("입력 오류", "모든 항목을 입력해주세요.");
            return;
        }

        if (pw !== pwCheck) {
            openDialog("입력 오류", "비밀번호가 다릅니다.");
            return;
        }

        try {
            // 🔹 axios로 Next API Route 호출 → Next가 백엔드로 프록시
            const res = await axios.post(`${API_BASE_URL}/api/signup`, {
                loginId: id,
                password: pw,
            });

            if (res.status !== 200 && res.status !== 201) {
                throw new Error("회원가입에 실패했습니다.");
            }

            openDialog(
                "회원가입 완료",
                "회원가입이 완료되었습니다. 로그인해주세요.",
                true
            );
        } catch (e) {
            console.error("회원가입 오류:", e);
            openDialog(
                "회원가입 실패",
                e.response?.data?.message ||
                (e.message === "Network Error"
                    ? "서버와 통신 중 오류가 발생했습니다."
                    : e.message || "회원가입 중 오류가 발생했습니다.")
            );
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f7" }}>
            <Header />

            <Container
                maxWidth="sm"
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    pt: 8,
                    pb: 8,
                }}
            >
                <Card
                    sx={{
                        p: 4,
                        width: "100%",
                        borderRadius: 3,
                        boxShadow: "0 14px 40px rgba(15,23,42,0.12)",
                        border: "1px solid rgba(148,163,184,0.4)",
                        bgcolor: "white",
                    }}
                >
                    <Typography
                        variant="h4"
                        align="center"
                        fontWeight={800}
                        sx={{ mb: 1 }}
                    >
                        회원가입
                    </Typography>
                    <Typography
                        variant="body2"
                        align="center"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        도서 관리 서비스를 이용하려면 계정을 생성해주세요.
                    </Typography>

                    <TextField
                        fullWidth
                        label="아이디"
                        size="medium"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        sx={{ mb: 2.5 }}
                    />

                    <TextField
                        fullWidth
                        type="password"
                        label="비밀번호"
                        size="medium"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        sx={{ mb: 2.5 }}
                    />

                    <TextField
                        fullWidth
                        type="password"
                        label="비밀번호 확인"
                        size="medium"
                        value={pwCheck}
                        onChange={(e) => setPwCheck(e.target.value)}
                        sx={{ mb: 3 }}
                    />

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSignup}
                        sx={{ py: 1.4, mb: 2, fontWeight: 600 }}
                    >
                        회원가입
                    </Button>

                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => router.push("/login")}
                        sx={{ py: 1.1 }}
                    >
                        이미 계정이 있으신가요? 로그인하러 가기
                    </Button>
                </Card>
            </Container>

            <Dialog open={dialog.open} onClose={closeDialog}>
                <DialogTitle>{dialog.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialog.message}</DialogContentText>
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
