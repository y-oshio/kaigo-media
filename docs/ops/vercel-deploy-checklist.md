# Vercelデプロイ チェックリスト(44章M0 #4)

- 作成日: 2026-07-07
- 対象: `prestail/kaigo-media`(GitHub private repo)→ Vercel 連携 → `mamoribi.jp` 接続
- 前提: #1(GitHubリポジトリ作成+push)・#2(routeRules/ISR+og:image)・#3(about/contact実在情報)は完了済み
- 対象外(このチェックリストには含めない): #5 GSC・GA4本番ID設定の実操作、#6 旧サイト(`aff-v1-kaigo-shindan`)の301統合(`docs/kaigo-media-plan/03-site-architecture.md` §2 参照・別タスク)

---

## 1. Vercel向け設定確認

- [ ] **Framework Preset**: プロジェクトインポート時に `Nuxt.js` として自動検出されることを確認する。`nitro.preset: 'vercel'`(`nuxt.config.ts`)が既に設定済みのため、Build Command / Output Directory の手動上書きは不要(空欄のまま)。
- [ ] **Root Directory**: 空欄のままでよい。`kaigo-media` リポジトリはそれ自体がルート(`package.json`・`nuxt.config.ts` がリポジトリ直下)であり、`projects/<site>/` のようなサブディレクトリ指定は不要(`aff-v1-kaigo-shindan` 等の他サイトとは別リポジトリのため)。
- [ ] **Node.jsバージョン**: `package.json` に `engines.node: "22.x"` を追加済み(このコミットで対応)。Vercel Project Settings > General > Node.js Version が `22.x` を選択できることを確認する(選択肢にない場合は最新のLTSを選び、GitHub Actions側〈`node-version: 22`〉との差異を認識しておく)。
- [ ] **Ignored Build Step**: 設定不要(全ページが対象、条件付きスキップは使わない)。

## 2. Vercelで設定する環境変数一覧

| 変数名 | 値 | 環境 | タイミング |
| --- | --- | --- | --- |
| `NUXT_PUBLIC_GA_ID` | GA4測定ID(`G-XXXXXXX`) | **Production のみ**(Preview/Developmentには入れない — プレビュー閲覧やビルド時のテストアクセスが本番GA4プロパティに混入するのを防ぐ) | 初回デプロイ時は**未設定でよい**(空文字と同じ扱いでGAは読み込まれない・`plugins/ga.ts`)。#5(GSC・GA4設定)でGA4プロパティ作成後に設定する |

これ以外の環境変数は存在しない(`SITE_URL`・`SITE_NAME`・`LINE_ADD_URL`・`OPERATOR_NAME`・`CONTACT_FORM_URL` 等は全て `config/site.ts` のTS定数であり、Vercel側での設定は不要)。

## 3. デプロイ前チェック

- [ ] `npm run check:ci`(kb-lint/content-lint/verify:kyuryo/typecheck/build)がローカルで通過している
- [ ] GitHub Actions の `ci` ワークフローが `main` の最新コミットでグリーン
- [ ] `git status` がクリーン(コミット漏れ・未追跡ファイルなし)
- [ ] `.env` 等の秘密情報がコミットされていない(`.gitignore` で除外済みを再確認)
- [ ] `data/affiliate-links.ts` が空配列のまま(実契約が成立していない求人案件を登録していない)
- [ ] `/about/`・`/contact/` に実在の運営者名義・問い合わせ手段が反映されている(`実装#11` 済み)
- [ ] `public/robots.txt` の `Sitemap:` が `https://mamoribi.jp/sitemap.xml` を指している(既存のまま変更不要)

## 4. GitHub連携時の注意点

- [ ] Vercelの GitHub App インストール時、`prestail/kaigo-media`(private repo)へのアクセスを明示的に許可する
- [ ] Vercel Project Settings > Git > Production Branch が `main` になっていることを確認する
- [ ] **重要な運用上の注意**: GitHub Actions(`ci.yml`)とVercelのデプロイは独立したパイプライン。**GitHub Actionsが赤でもVercelは独立にビルド・デプロイを試行し得る**(Vercelは自分自身で `npm run build` 相当を再実行するだけで、GitHub Actionsの結果を参照しない)。CI失敗時に誤って本番へ反映されないようにするには、以下のいずれかを検討する(今回は実装しない・運用ルールとして記載のみ):
  - mainへの直push運用を続ける場合: pushの都度、Actionsのグリーンを目視確認してからVercelの反映を確認する
  - より厳密にする場合: GitHub側でbranch protection rule(`main`への「Require status checks to pass」= `ci`)を設定する。ただしdirect push運用ではadmin自身が対象から除外されがちなので、"Include administrators" も有効にする必要がある

## 5. mamoribi.jp接続時の注意点

- [ ] Vercel Project > Settings > Domains で `mamoribi.jp` を追加する
- [ ] `SITE_URL`(`config/site.ts`)が `https://mamoribi.jp`(apex・wwwなし)のため、**apexを本番ドメインとして設定**し、`www.mamoribi.jp` は追加のうえ apex へリダイレクトする向きにする(Vercelのドメイン設定画面で「Redirect to」を指定できる)
- [ ] DNS設定(下記「DNS設定」参照)を反映後、Vercelのドメインステータスが `Valid Configuration` になるまで待つ(伝播に数分〜48時間)
- [ ] SSL証明書はVercelが自動発行(Let's Encrypt)。DNS検証が通れば追加作業不要

## DNS設定

ドメインレジストラ/DNS管理画面で以下を設定する(現行の値はVercelダッシュボードの Domains 設定画面に表示される案内が最新・正確なので、デプロイ実施時に必ずそちらで確認すること):

| レコード種別 | ホスト | 値(目安・要Vercel画面で確認) | 用途 |
| --- | --- | --- | --- |
| A または ALIAS/ANAME | `@`(apex = mamoribi.jp) | Vercelのanycast IP(画面表示値に従う) | apexドメイン → Vercel |
| CNAME | `www` | `cname.vercel-dns.com` | www → Vercel(apexへリダイレクト) |

- レジストラがALIAS/ANAMEに対応していない場合はA レコードを使用する(Vercel画面の指示に従う)
- TTLは可能であれば事前に短く(300秒程度)しておくと切替がスムーズ

## Search Console登録手順

1. Google Search Console で「プロパティを追加」→ **ドメインプロパティ**(`mamoribi.jp`、サブドメイン・プロトコル問わず一括カバー)を推奨
2. ドメインプロパティは **DNS TXTレコードでの所有権確認**が必要 — 上記DNS設定作業と同じタイミングでTXTレコードも追加すると効率的
3. 確認完了後、サイトマップを送信: `https://mamoribi.jp/sitemap.xml`
4. 主要ページ(トップ・`/kyuryo/`)をURL検査ツールでインデックス登録をリクエスト
5. 備考: URL-prefixプロパティ+HTMLタグ確認方式にする場合のみ `nuxt.config.ts` の `app.head.meta` へ確認用metaタグを1行追加するコード変更が必要になる。ドメインプロパティ+DNS方式であればコード変更は不要。

## 初回デプロイ確認項目

- [ ] Vercel Dashboardでデプロイが `Ready`(成功)になっている
- [ ] `https://mamoribi.jp/` にアクセスして正しく表示される(`*.vercel.app` のプレビューURLではなく本番ドメインで確認)
- [ ] レスポンスヘッダでISRキャッシュが効いていることを確認(`x-vercel-cache` 等。41章§1で「preview環境でキャッシュヘッダ検証」として先送りしていた検証を、実デプロイ後にここで実施する)
- [ ] `/go/*` と `/api/*` がキャッシュされていない(毎回オリジンで処理されている)ことをヘッダで確認
- [ ] `https://mamoribi.jp/sitemap.xml` が期待どおりのURL集合(ハブ+固定7+47県のうちindexable分)を返す
- [ ] `https://mamoribi.jp/robots.txt` に `Disallow: /go/` が反映されている
- [ ] SNSシェアデバッガー等でOGP画像(`og-default.png`)が正しく表示される
- [ ] HTTPS/SSLが有効(ブラウザで警告が出ない)
- [ ] GitHub Actions の `ci` が最新コミットでグリーンのままであることを再確認

**この時点ではまだ #5(GSC・GA4)・#6(旧サイト301)が未完了。技術的なデプロイ自体は完了してよいが、外部への告知・被リンク獲得活動は#5・#6完了後、および10人格レビューで指摘された残Critical/High項目の状況を踏まえて判断する。**
