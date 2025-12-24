# Music_Discussion_Platform
附錄：系統安裝與操作手冊
  A. 環境準備

   在開始安裝之前，請確保系統已安裝以下必要的開發工具：
   1. Node.js (LTS 版本)：本專案基於 Node.js 環境運行。推薦安裝 LTS (長期支援) 版本，可從 Node.js 官方網站 (https://nodejs.org/en/) 下載。
   2. npm (Node Package Manager)：通常隨 Node.js 一併安裝。您也可以使用 yarn 或 pnpm 等其他套件管理器。
   3. Git：用於從版本控制系統中獲取專案程式碼。可從 Git 官方網站 (https://git-scm.com/) 下載。
   4. 網際網路連接：用於下載專案依賴和與 Firebase 進行通訊。
 B. 專案安裝與設定

   1. 克隆專案程式碼：
       打開您的終端機或命令提示字元 (Command Prompt/PowerShell)。
       導航到您希望存放專案的目錄。
       執行以下 Git 命令來克隆專案：

    git clone [您的專案 Git 倉庫位址]
    cd mdp # 進入專案目錄請將 `[您的專案 Git 倉庫位址]` 替換為您的實際倉庫 URL。
   2. 安裝專案依賴：
       在專案根目錄下，執行以下命令來安裝所有必要的 Node.js 套件：
npm install
或者如果您使用 yarn:
# yarn install
3. 設定環境變數 (Firebase & 本地儲存)：
       本專案使用 Google Firebase Firestore 作為核心資料庫。您需要一個 Firebase 專案來運行它。專案根目錄下，建立一個名為 .env.local 的檔案。從Firebase 專案設定中，獲取以下配置資訊，並將其填入 .env.local 檔案中：

# .env.local 範例配置
NEXT_PUBLIC_FIREBASE_API_KEY="您的Firebase API Key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="您的Firebase Auth Domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="您的Firebase Project ID"
EXT_PUBLIC_FIREBASE_STORAGE_BUCKET="您的Firebase Storage Bucket 名稱" # 例如：your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="您的Firebase Messaging Sender ID"
NEXT_PUBLIC_FIREBASE_APP_ID="您的Firebase App ID"
### 注意：NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET 這個變數，即使頭像改為本地儲存，專案程式碼中仍然會初始化 Firebase Storage 服務（但實際不會用於頭像上傳）。所以請確保這個值是Firebase 專案中 Storage 的正確 Bucket 名稱，否則可能會導致 Firebase 相關服務初始化失敗。
Firebase Firestore 權限設定：
           請確保您的 Firebase 專案中的 Firestore 資料庫設定了適當的讀寫權限。在 Firebase Console 的 Firestore -> Rules中，您可以暫時將規則設置為允許所有讀寫，以便於測試（注意：這在生產環境中非常不安全！）：

rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /{document=**} {
llow read, write: if true;
}}}
              本專案的 fsUtils.js 函式直接與 Firestore 集合互動，它不依賴 Firebase Authentication 的 request.auth.uid 進行驗證，而是假設其背後的 API Route 已經進行了權限判斷。因此，為了讓readCollection, setDocument 等操作能順利執行，您的 Firestore 規則需要允許這些操作。最簡單的方式是暫時設定 allow read, write: if true;。
  C. 啟動專案
   1. 啟動開發伺服器：
       在專案根目錄下，執行以下命令來啟動 Next.js 開發伺服器：
   1         npm run dev
   2         # 或者如果使用 yarn:
   3         # yarn dev
       伺服器啟動後，您通常會在終端機看到類似 ready - started server on 0.0.0.0:3000, url: http://localhost:3000 的訊息。
   2. 訪問應用程式：
        打開您的網路瀏覽器，訪問 http://localhost:3000。您應該能看到論壇的首頁。
  D. 核心功能操作指南
  以下是專案的關鍵功能操作步驟，旨在讓您快速體驗 MDP 論壇的各項特性：
 1. 使用者註冊與登入：
	註冊：點擊導航欄上的「註冊」連結或按鈕，填寫有效的電子郵件和至少包含一個字母的密碼來建立新帳戶。
	登入：使用註冊的帳號（電子郵件和密碼）在登入頁面進行身份驗證。
	登出：在登入狀態下，點擊導航欄上的「登出」按鈕以結束當前會話。
 2. 個人檔案管理：
	訪問個人檔案：登入後，點擊導航欄上的使用者名稱或頭像，即可進入您的個人檔案頁面。
	編輯個人檔案：在個人檔案頁面，點擊「編輯」按鈕，您可以修改顯示名稱、個人簡介 (Bio)。
	上傳頭像：在編輯個人檔案頁面，點擊頭像區域或相關按鈕，選擇一張圖片作為新的頭像。上傳成功後，頭像會即時更新。

 3. 貼文發布與互動：
建立新貼文：登入後，點擊「建立貼文」或類似按鈕。在建立頁面中，可以：
	輸入貼文標題和內容。
	選擇一個貼文分類。
	添加一個或多個標籤（例如：技術, 生活）。
	在內容中貼入 YouTube 影片或 Spotify 音樂連結，系統會自動嵌入播放器。
點擊「發表」發布貼文。
貼文互動方面則包括:
	瀏覽貼文：在首頁您可以瀏覽所有已發表的貼文。點擊貼文標題或卡片可進入詳細頁面。
	按讚貼文：在貼文詳細頁面或主頁的貼文卡片上，點擊「按讚」圖示。按讚數量會即時更新。
	發表留言：在貼文詳細頁面的下方留言區，輸入您的評論內容並提交。
	按讚留言：對其他使用者的留言點擊「按讚」圖示。

 4. 內容分類與探索：
	依分類瀏覽：點擊導航欄或側邊欄上的分類名稱，即可瀏覽該分類下的所有貼文。
	依標籤探索：在貼文詳細頁面或主頁的標籤區域，點擊任一標籤，即可查看所有包含該標籤的貼文。

 5. 管理員功能體驗：
        賦予管理員權限：
            重要步驟：需要先將自己的帳號設定為管理員。在瀏覽器打開任意頁面（例如 http://localhost:3000），按下 F12 打開開發者工具，切換到「主控台 (Console)」分頁。
           * 執行命令：貼上以下 JavaScript 程式碼，並將 jasonlin77777@gmail.com 替換為您自己的註冊郵箱，然後按下 Enter 執行：
fetch('/api/admin/promote', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({ email: '您的註冊郵箱' }), // 替換為郵箱
})
.then(res => res.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
成功後，主控台會顯示成功訊息。
重新登入：務必登出目前的帳號，然後再重新登入一次，以確保管理員權限生效。
訪問管理員儀表板：登入後，直接在瀏覽器中訪問 http://localhost:3000/admin。
管理被檢舉貼文：在管理員儀表板中，您可以看到所有被使用者檢舉的貼文列表。您可以：
點擊「查看」按鈕跳轉到貼文詳細頁面進行審閱。
點擊「刪除」按鈕以管理員身份強制刪除該不當貼文。
檢舉測試：可以先登入一個普通用戶帳號，隨意發布一篇文章或留言，然後用這個普通用戶帳號檢舉該貼文或留言。之後再切換回您的管理員帳號，到 /admin 頁面查看檢舉紀錄。
