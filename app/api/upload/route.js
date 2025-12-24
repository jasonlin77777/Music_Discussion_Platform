import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { readCollection } from "@/app/lib/fsUtils";

export async function POST(req) {
    try {
        // 檢查使用者登入狀態
        const sessions = await readCollection("sessions");
        if (sessions.length === 0) {
            return NextResponse.json({ error: "尚未登入，無法上傳檔案" }, { status: 401 });
        }
        const user = sessions[0];

        const formData = await req.formData();
        const file = formData.get("file");
        const folder = formData.get("folder") || "general"; // 例如 'avatars' 或 'post-images'

        if (!file) {
            return NextResponse.json({ error: "沒有找到檔案" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // 建立一個安全且唯一的檔案名稱
        const uniqueSuffix = `${user.id}-${Date.now()}`;
        const fileExtension = path.extname(file.name);
        const originalFilename = path.basename(file.name, fileExtension);
        const safeOriginalFilename = originalFilename.replace(/[^a-zA-Z0-9_.-]/g, '');
        const filename = `${safeOriginalFilename}-${uniqueSuffix}${fileExtension}`;

        // 定義並確保上傳目錄存在
        const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        // 將檔案寫入本地檔案系統
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // 回傳檔案的公開 URL
        const publicUrl = `/uploads/${folder}/${filename}`;

        return NextResponse.json({ url: publicUrl });

    } catch (err) {
        console.error("檔案上傳失敗:", err);
        return NextResponse.json({ error: `檔案上傳失敗: ${err.message}` }, { status: 500 });
    }
}
