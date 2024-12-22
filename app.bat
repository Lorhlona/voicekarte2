@echo off
chcp 65001 > nul
echo アプリケーションを起動しています...

:: Node.jsがインストールされているか確認
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo エラー: Node.jsがインストールされていません。
    echo READMEの手順に従って、Node.jsをインストールしてください。
    echo 詳細: https://nodejs.org/
    pause
    exit /b 1
)

:: npmが利用可能か確認
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo エラー: npmが見つかりません。
    echo Node.jsを再インストールしてください。
    pause
    exit /b 1
)

echo サーバーを起動しています...
start cmd /k "npm run dev"

echo ブラウザが開くまでしばらくお待ちください...
timeout /t 15

:: localhost:3000が応答するか確認
curl -s http://localhost:3000 >nul
if %errorlevel% neq 0 (
    echo サーバーの起動に時間がかかっています...
    timeout /t 10
)

start http://localhost:3000

echo.
echo アプリケーションが起動しました！
echo ブラウザが自動的に開かない場合は、以下のURLにアクセスしてください：
echo http://localhost:3000
echo.
echo 終了する場合は、必ずアプリ内の「終了」ボタンを押してください。
