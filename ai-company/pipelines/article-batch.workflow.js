// article-batch.workflow.js — 「記事をN件追加して」を publish-manifest × N に変換する
// 実行: Workflow({ scriptPath: "ai-company/pipelines/article-batch.workflow.js",
//                  args: { orderId, requestedCount, clusters?, today } })
// 前提: ai-company/agents/*.md が .claude/agents/ に配置済みであること。
// 注意: スクリプト内で日付関数は使えない。today は必ず args で受け取る。

export const meta = {
  name: 'article-batch',
  description: '介護求人メディアの記事量産パイプライン(SEO設計→KW選定→設計→執筆→ファクトチェック→EEAT→内部リンク→JSON-LD→公開準備)',
  phases: [
    { title: 'バッチ設計', detail: 'seo-director がクラスタ配分を確定' },
    { title: 'キーワード選定', detail: 'keyword-strategist がカニバリ検知込みで brief を展開' },
    { title: '制作', detail: '記事ごとの並行パイプライン(設計→執筆→検証→リンク→JSON-LD)' },
    { title: '公開準備', detail: 'publish-manager が最終ゲートと summary を出力' },
  ],
}

const orderId = args.orderId
const today = args.today
if (!orderId || !today) throw new Error('args に orderId と today(YYYY-MM-DD)が必須です')
const requestedCount = args.requestedCount || 10
const clusters = args.clusters || null
const WORK = `ai-company/work/${orderId}`
const COMMON = `前提: ai-company/prompts/shared-editorial-context.md を必ず読むこと。今日の日付は ${today}。作業ディレクトリは ${WORK}/。`

// ---- 共有スキーマ(agent() の構造化リターン用。ファイル成果物とは別) ----
const ALLOC_SUMMARY = {
  type: 'object', required: ['allocationPath', 'batches'],
  properties: {
    allocationPath: { type: 'string' },
    batches: { type: 'array', items: { type: 'object', required: ['cluster', 'count'], properties: { cluster: { type: 'string' }, count: { type: 'number' }, supervisorRequired: { type: 'boolean' } } } },
  },
}
const BRIEF_LIST = {
  type: 'object', required: ['briefs'],
  properties: { briefs: { type: 'array', items: { type: 'object', required: ['kwId', 'briefPath', 'primaryQuery'], properties: { kwId: { type: 'string' }, briefPath: { type: 'string' }, primaryQuery: { type: 'string' } } } }, replaced: { type: 'array', items: { type: 'string' } } },
}
const STAGE_RESULT = {
  type: 'object', required: ['ok', 'outputPath'],
  properties: { ok: { type: 'boolean' }, outputPath: { type: 'string' }, note: { type: 'string' } },
}
const EEAT_RESULT = {
  type: 'object', required: ['verdict', 'reportPath'],
  properties: { verdict: { type: 'string', enum: ['pass', 'fix-required', 'reject'] }, reportPath: { type: 'string' }, supervisorRequired: { type: 'boolean' }, issueCount: { type: 'number' } },
}
const MANIFEST_RESULT = {
  type: 'object', required: ['status', 'slug', 'manifestPath'],
  properties: { status: { type: 'string', enum: ['ready', 'awaiting-supervisor', 'blocked'] }, slug: { type: 'string' }, manifestPath: { type: 'string' }, blockedReasons: { type: 'array', items: { type: 'string' } } },
}

// ---- Phase 1: バッチ設計(1回) ----
phase('バッチ設計')
const alloc = await agent(
  `${COMMON}\n発注: requestedCount=${requestedCount}, clusters=${JSON.stringify(clusters)}。` +
  `agents/seo-director.md の手順どおり allocation を作成し ${WORK}/allocation.json に書き出せ。`,
  { agentType: 'seo-director', label: 'seo-director', phase: 'バッチ設計', schema: ALLOC_SUMMARY }
)
if (!alloc) throw new Error('seo-director が失敗しました')
log(`配分確定: ${alloc.batches.map(b => `${b.cluster}×${b.count}`).join(', ')}`)

// ---- Phase 2: キーワード選定(1回・カニバリ相互チェックのため全件一括) ----
phase('キーワード選定')
const kw = await agent(
  `${COMMON}\n${alloc.allocationPath} を読み、agents/keyword-strategist.md の手順どおり ` +
  `keyword-brief を ${WORK}/briefs/ に全件書き出せ。`,
  { agentType: 'keyword-strategist', label: 'keyword-strategist', phase: 'キーワード選定', schema: BRIEF_LIST }
)
if (!kw || !kw.briefs.length) throw new Error('keyword-strategist が brief を生成できませんでした')
log(`brief ${kw.briefs.length}件(差し替え ${kw.replaced ? kw.replaced.length : 0}件)`)

// ---- Phase 3: 記事ごとの並行パイプライン(バリアなし) ----
phase('制作')
const results = await pipeline(
  kw.briefs,

  // Stage A: 記事設計
  (brief) => agent(
    `${COMMON}\n${brief.briefPath} を読み、agents/content-architect.md の手順どおり ` +
    `article-plan を ${WORK}/plans/${brief.kwId}.plan.json に書き出せ。`,
    { agentType: 'content-architect', label: `plan:${brief.kwId}`, phase: '制作', schema: STAGE_RESULT }
  ),

  // Stage B: 本文作成
  (plan, brief) => plan && plan.ok ? agent(
    `${COMMON}\n${plan.outputPath} を読み、agents/writer.md の手順どおり draft を ` +
    `${WORK}/drafts/${brief.kwId}.draft.md に、meta を同 .draft.meta.json に書き出せ。`,
    { agentType: 'writer', label: `write:${brief.kwId}`, phase: '制作', schema: STAGE_RESULT }
  ) : null,

  // Stage C: ファクトチェック
  (draft, brief) => draft && draft.ok ? agent(
    `${COMMON}\n${draft.outputPath} を検証せよ。agents/fact-checker.md の手順どおり ` +
    `report を ${WORK}/factcheck/${brief.kwId}.report.json に、checked.md を ${WORK}/drafts/${brief.kwId}.draft.checked.md に書き出せ。`,
    { agentType: 'fact-checker', label: `fact:${brief.kwId}`, phase: '制作', schema: STAGE_RESULT, effort: 'high' }
  ) : null,

  // Stage D: E-E-A-T 審査(fix-required は writer と最大2往復)
  async (checked, brief) => {
    if (!checked || !checked.ok) return null
    let round = 0
    while (round < 3) {
      const eeat = await agent(
        `${COMMON}\n${WORK}/drafts/${brief.kwId}.draft.checked.md と ${WORK}/factcheck/${brief.kwId}.report.json を審査せよ。` +
        `agents/eeat-reviewer.md の手順どおり report を ${WORK}/eeat/${brief.kwId}.report.json に書き出せ。往復回数=${round}。`,
        { agentType: 'eeat-reviewer', label: `eeat:${brief.kwId}#${round}`, phase: '制作', schema: EEAT_RESULT, effort: 'high' }
      )
      if (!eeat) return null
      if (eeat.verdict === 'pass') return eeat
      if (eeat.verdict === 'reject' || round === 2) return eeat // reject / 3回目 → そのまま publish-manager が blocked にする
      await agent(
        `${COMMON}\n${eeat.reportPath} の issues を読み、agents/writer.md の差し戻し規則どおり ` +
        `${WORK}/drafts/${brief.kwId}.draft.checked.md を指示範囲のみ修正せよ(勝手な加筆禁止)。`,
        { agentType: 'writer', label: `fix:${brief.kwId}#${round}`, phase: '制作', schema: STAGE_RESULT }
      )
      round++
    }
  },

  // Stage E: 内部リンク
  (eeat, brief) => eeat && eeat.verdict === 'pass' ? agent(
    `${COMMON}\n${WORK}/drafts/${brief.kwId}.draft.checked.md に対し、agents/internal-linker.md の手順どおり ` +
    `link-plan を ${WORK}/links/${brief.kwId}.links.json に、linked.md を ${WORK}/drafts/${brief.kwId}.draft.linked.md に書き出せ。` +
    `同バッチの他記事一覧は ${WORK}/plans/ を参照。`,
    { agentType: 'internal-linker', label: `link:${brief.kwId}`, phase: '制作', schema: STAGE_RESULT }
  ) : { ok: false, outputPath: '', note: 'eeat未通過のためスキップ' },

  // Stage F: JSON-LD
  (linked, brief) => linked && linked.ok ? agent(
    `${COMMON}\n${WORK}/drafts/${brief.kwId}.draft.linked.md から、agents/schema-generator.md の手順どおり ` +
    `jsonld-output を ${WORK}/jsonld/${brief.kwId}.jsonld.json に書き出せ。`,
    { agentType: 'schema-generator', label: `jsonld:${brief.kwId}`, phase: '制作', schema: STAGE_RESULT }
  ) : linked,

  // Stage G: 最終ゲート(成果物が欠けていても必ず実行し、blocked として記録させる)
  (_prev, brief) => agent(
    `${COMMON}\n${WORK}/ 配下の ${brief.kwId} の全成果物を検収せよ。agents/publish-manager.md の手順どおり ` +
    `checklists/publish-gate.md を全件検収し、manifest を ${WORK}/manifests/${brief.kwId}.manifest.json に、` +
    `公開可能な場合は最終ファイルを ${WORK}/final/ に書き出せ。工程の欠落はそのまま blocked として記録せよ。`,
    { agentType: 'publish-manager', label: `gate:${brief.kwId}`, phase: '公開準備', schema: MANIFEST_RESULT, effort: 'high' }
  )
)

// ---- Phase 4: バッチサマリー(バリア: 全 manifest が必要) ----
phase('公開準備')
const manifests = results.filter(Boolean)
const counts = {
  ready: manifests.filter(m => m.status === 'ready').length,
  awaiting: manifests.filter(m => m.status === 'awaiting-supervisor').length,
  blocked: manifests.filter(m => m.status === 'blocked').length,
  lost: kw.briefs.length - manifests.length, // agentエラー等でmanifest自体が無い件数
}
await agent(
  `${COMMON}\n${WORK}/manifests/ の全 manifest を集計し、agents/publish-manager.md の手順どおり ` +
  `${WORK}/manifest-summary.md を作成せよ(ステータス別件数・humanActions一覧・公開順)。` +
  `スクリプト側の集計: ${JSON.stringify(counts)}。manifest欠落 ${counts.lost} 件は「工程異常」として明記せよ。` +
  `blocked率が30%を超えている場合は「系統的問題の疑い」セクションを追加し、${WORK}/retrospective.md に原因分析を書け。`,
  { agentType: 'publish-manager', label: 'summary', phase: '公開準備' }
)
log(`完了: ready=${counts.ready} / 監修待ち=${counts.awaiting} / blocked=${counts.blocked} / 欠落=${counts.lost}`)

return { orderId, briefCount: kw.briefs.length, ...counts, summaryPath: `${WORK}/manifest-summary.md` }
