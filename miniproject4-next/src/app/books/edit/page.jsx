import { Suspense } from "react";
import BookEditClient from "./BookEditClient";

export default function Page() {
    return (
        <Suspense fallback={<div>로딩 중...</div>}>
            <BookEditClient />
        </Suspense>
    );
}
