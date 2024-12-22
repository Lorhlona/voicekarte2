@echo off
chcp 65001 > nul
echo インストールを開始します...

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

echo 必要なパッケージをインストールしています...
echo しばらくお待ちください...
echo.

npm install

if %errorlevel% neq 0 (
    echo.
    echo エラー: インストールに失敗しました。
    echo インターネット接続を確認し、再度実行してください。
    pause
    exit /b 1
)

echo.
echo インストールが完了しました！
echo 次は app.bat を実行してアプリケーションを起動してください。
echo.
pause
