/**
 * ドリル論点マスタ(KB D3。V2 26章 §4 を正とする)。
 *
 * 運用規則:
 * - 論点名・summary は出題基準の項目名を丸写ししない(自分の言葉で再構成 — R-11)。
 * - 問題データは data/drill/<subjectSlug>/<topicSlug>.json(KakomonQuestion[] origin:'original')。
 * - 作問はクリーンルーム生成のみ(過去問本文・市販問題集をAI入力に使うことを禁止 — V2 26章 §5 工程2)。
 * - TODO: データ投入は P8(ドリルエンジン)着手時。監修契約+T-0c SERP意図検証の通過が前提(V2 23章)。
 *   捏造禁止 — 出典・監修のない論点/問題を仮置きしない。
 */

import type { DrillTopic } from '~/types/kakomon'

export const DRILL_TOPICS: DrillTopic[] = []
