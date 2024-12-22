# 音声からカルテを自動生成するアプリケーション

## 概要

このプロジェクトは、音声を録音して OpenAI の API を使用し、患者のカルテを自動生成する Web アプリケーションです。医療現場でのカルテ作成を効率化し、医師の負担を軽減することを目的としています。

## 主な機能

- **音声の録音と保存**
- **音声データのテキスト変換（トランスクリプション）**
- **初診・再診に対応したカルテの自動生成**
- **カルテの表示、コピー、クリア機能**
- **システムプロンプトや OpenAI API キーの設定編集機能**

## 動作環境

- [nvmを使用してNode.jsをインストールする](https://qiita.com/ymzkjpx/items/9658709eb51a23121098)
- **Node.js**（推奨バージョン 14 以上）
- **npm** または **yarn**
- **MUI** を使用しています

## OpenAI API キーの取得

[OpenAI API キーの取得](https://platform.openai.com/docs/api-reference/introduction)

[OpenAIのAPIキー取得方法|2024年7月最新版|料金体系や注意事項](https://qiita.com/kurata04/items/a10bdc44cc0d1e62dad3)

## windows版インストール(簡単になりました)

1. **リポジトリのクローン**
　　　[ZIPでダウンロード](https://github.com/Lorhlona/voicekarte/archive/refs/heads/main.zip)して解凍します。

2. **インストール**
  voiceaddフォルダ内にあるinstall.batを実行します(歯車アイコン)。これは最初の１回のみです。

3. **起動**
  voiceaddフォルダ内にあるapp.batを実行します(歯車アイコン)。カウントダウン後、ブラウザが自動的に起動します。

4. **終了**
  アプリの終了ボタンでサーバーが終了を安全に終了させてから、ウィンドウとターミナルを閉じてください。



## MAC版インストール

1. **リポジトリのクローン**
    ```bash
    git clone https://github.com/Lorhlona/voicekarte.git
    cd voicekarte
    ```
    または、[ZIPでダウンロード](https://github.com/Lorhlona/voicekarte/archive/refs/heads/main.zip)して解凍します。

2. **依存関係のインストール**
    プロジェクトフォルダ内でターミナルを開き、以下のコマンドを実行します。
    ```bash
    npm install
    ```
     または
    ```bash
    yarn install
    ```

## 依存関係の更新

1. **依存関係の更新**
    ```bash
    npm update
    ```

2. **依存関係のアップグレード**
    ```bash
    npx npm-check-updates -u
    npm install
    ```

## 起動方法

1. **開発サーバーを起動します。**
    ```bash
    npm run dev
    ```
    または
    ```bash
    yarn dev
    ```

2. **ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスして、アプリケーションを確認してください。**

## 使い方

1. **録音開始**
    - 「録音開始」ボタンをクリックし、患者の症状や状態を話してください。

2. **録音停止**
    - 録音が完了したら「録音停止」ボタンをクリックします。

3. **音声ファイルのアップロード**
    - 「ファイルアップロード」ボタンをクリックして、任意の音声ファイル（例：iPhoneのボイスレコードでつくったm4aファイルなど）を選択してください。

4. **カルテ作成**
    - 初診の場合：「初診カルテ作成」ボタンをクリック
    - 再診の場合：「再診カルテ作成」ボタンをクリック
    - 録音またはアップロードした音声がテキストに変換され、OpenAI API を使用してカルテが自動生成されます。

5. **カルテの操作**
    - **コピー**：「コピー」ボタンで生成されたカルテをクリップボードにコピーできます。
    - **クリア**：「クリア」ボタンで音声データやカルテ内容をリセットします。このため患者さんのデータはPC上には残りません

6. **設定変更**
    - 「設定」ボタンから以下の設定が行えます。
        - 初診カルテシステムプロンプト編集:先生の普段の診療録を例示してあげると、よりカルテが正確になります。
        - 再診カルテシステムプロンプト編集:先生の普段の診療録を例示してあげると、よりカルテが正確になります。
      
        - OpenAI APIキー設定
7. **終了**
    - 終わるときはこのボタンを必ず押し、サーバーを終了させてから、ウィンドウとターミナルを閉じてください。


## 注意事項

- **OpenAI API キーの管理**：API キーは個人情報です。第三者に共有しないようご注意ください。
- **API 利用料金**：OpenAI API の利用には料金が発生します。事前に利用料金をご確認ください。
- **動作確認**：本アプリケーションはローカル環境での動作を前提としています。サーバー環境での利用には追加の設定が必要になる場合があります。

## ライセンス

このコードの改変は許可されていますが、商用利用は禁止されています。自分のクリニックでの使用に限り許可されています。勤務医の先生は雇用先の院長やオーナーの許可を取ってください。

## 開発者向け情報

### ディレクトリ構成

- `/components`：React コンポーネント
- `/pages/api`：API ルート
- `/utils`：ユーティリティ関数
- `/hooks`：カスタムフック
- `/config`：設定ファイル

### 主なファイル

- `components/medical-chart-app.tsx`：メインのアプリケーションコンポーネント
- `utils/api.ts`：API 呼び出し用の関数
- `pages/api/uploadAudio.ts`：音声アップロード用の API エンドポイント
- `pages/api/generateRecord.ts`：カルテ生成用の API エンドポイント

### コントリビューション

バグの報告や機能の提案は Issues や Pull Requests を通じて受け付けています。ご協力よろしくお願いいたします。