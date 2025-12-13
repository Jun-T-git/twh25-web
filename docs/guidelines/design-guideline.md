# デザインガイドライン：Webアプリケーション共通仕様

本ドキュメントは、アプリケーション全体で適用するUI/UXデザインの原則と、具体的な実装パターンをまとめたものです。
「没入感」と「現代的な使いやすさ」を両立させることを目的とします。

---

## 1. コア・デザイン原則 (Core Principles)

### 1-1. Concept: Immersive "New Town" Pop
* **世界観:** 現代日本の地方都市（ベッドタウン）を舞台にした、明るくもどこかリアルな空気感。
* **キーワード:** 清潔感 (Clean), 透明感 (Translucent), 没入感 (Immersive)
* **ターゲット:** デジタルネイティブ世代。直感的で説明不要なUIを目指す。

### 1-2. Visual Hierarchy & Layering (Z-Index Strategy)
画面を複数の「レイヤー」として捉え、奥行きを作ることで情報を整理する。
1. **Background Layer (最背面):**
   * 全画面のハイクオリティなイラストや写真を使用。
   * オーバーレイ（`bg-white/30` 等）を重ねて視認性を確保する。
2. **Content Layer (中間):**
   * ユーザーが操作するメインコンテンツ（カード、リスト）。
   * 背景を透過させない、または強くぼかすことでコンテンツを際立たせる。
3. **Floating Interface Layer (最前面):**
   * ヘッダー、フッター、モーダルなどのナビゲーション要素。
   * **Glassmorphism (磨りガラス)** 効果を使用し、背景の気配を残しつつ情報を表示する。
   * 影 (`shadow-lg`, `shadow-xl`) を活用し、浮遊感を演出する。

---

## 2. 共通UIパターン (Universal UI Patterns)

### 2-1. Glassmorphism & Floating UI
要素を画面端にベタ塗り固定するのではなく、余白を持たせて「浮かせる」デザインを採用する。
* **コンテナ:** `rounded-2xl` 以上の大きな角丸。
* **スタイル:** `bg-white/90` or `bg-white/40` + `backdrop-blur-md`。
* **目的:** 圧迫感を減らし、モダンで軽快な印象を与える。

### 2-2. Micro-Interactions
ユーザーの操作に対して物理的なフィードバックを返す。
* **Tap/Click:** ボタンは押下時に `scale-95` 等で沈み込むアニメーションを入れる。
* **Feedback:** 投票や完了アクションには、チェックマークのアニメーションや色変化で明確な達成感を演出する。
* **Danger/Alert:** 注意が必要なステータス（パラメータ低下など）は、赤色の `animate-pulse` で鼓動させる。

### 2-3. Japanese Typography
* **Font:** 可読性の高いサンセリフ体 (System Font / Noto Sans JP 等)。
* **Labeling:**
    * 専門用語は避け、直感的な日本語（例: Economy -> 経済）を使用。
    * 補足的に英語を添えることでデザインのアクセントにする（例: VOTE / ID）。

---

## 3. 具体的なコンポーネント仕様 (Game Screen Case Study)

以下は、上記原則を「政治シミュレーションゲーム」画面に適用した具体的仕様である。

### Zone 1: Floating Header (Status Monitor)
* **配置:** 画面上部に浮遊させて配置 (`sticky top-0`).
* **デザイン:** 2列 x 3行のグリッドレイアウト。コンパクトなカード型。
* **表示要素:**
    * ターン数: `2xl` サイズで強調。
    * パラメータ: アイコン + 日本語ラベル + プログレスバー。危険域は赤く点滅。

### Zone 2: Glass Status Bar (Social Context)
* **配置:** ヘッダー直下。
* **デザイン:** `bg-white/40` の半透明バー。
* **表示要素:**
    * 参加者アバター: 明るい色枠で囲む。既読・投票済みは緑のチェックバッジで強調。
    * ステータス: 「考え中...」「投票済!」など、人間味のあるテキスト。

### Zone 3: Immersive Cards (Main Interaction)
* **配置:** 画面中央。
* **デザイン:** 背景イラストの上に配置される白いカード。
* **画像:** 政策やイベントを象徴するアイソメトリックイラストを使用。

### Zone 4: Floating Action Footer
* **配置:** 画面下部に浮遊。
* **構成:**
    1. **Secret Identity (長押し):**
       * 「学生証(ID)」モチーフ。
       * **Interaction:** 誤操作防止の観点から「長押し」でのみ情報を表示する（のぞき見防止）。
    2. **Vote Button (Main Action):**
       * 画面右側に大きく配置。
       * 投票箱アイコンなどを用い、アクションの意味を視覚的に伝える。

---

## 4. テクニカルスタック & 推奨ライブラリ
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS v4
    * `backdrop-blur-*`, `bg-opacity-*` を多用。
* **Icons:** Lucide React (汎用的でクリーンな線画アイコン)
* **Animation:** Framer Motion (複雑なインタラクションやモーダル制御)