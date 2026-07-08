# ADR-0004: ロールトリップ後にsupervisor-request.mdを更新する

- ステータス: Proposed
- 起票日: 2026-07-08
- 関連: [ISSUE-008](../ops/issues-log.md)

## Context

記事2でeeat-reviewerが1回目審査で `verdict: fix-required` と判定した際、`supervisor-request.md` に「本記事は現時点でverdict=fix-requiredであり、修正・再審査(pass)を経てから送付すること」という注記を残した。writerの修正後、再審査で `verdict: pass` に変わったが、`supervisor-request.md` 自体は更新されず、古い注記が残ったままだった。publish-managerが検収時にこれに気づき「送付前にこの古い注記は無視してよい」と補足したため実害は防げたが、**もしpublish-managerがこの点を見落としたまま人間に送付されていれば、監修者が古い情報を読んで混乱する可能性があった**。

## Decision(提案)

eeat-reviewer.mdに、再審査でverdictがfix-requiredからpassに変わった場合は `supervisor-request.md` が既に生成されていれば該当の暫定注記を削除・更新することを明記する(ファイルが存在しない場合は通常どおり新規生成)。

## Consequences

- eeat-reviewerの再審査ステップに「supervisor-request.mdの存在確認+更新」が1手順増える
- publish-manager側の検収でも「supervisor-request.mdの内容が最新のverdictと矛盾していないか」をpublish-gate.mdのチェック項目に加えることで、二重の安全網になる(eeat-reviewerが更新し忘れても検収で拾える)

## Alternatives considered

- publish-manager側のチェックだけに頼る(eeat-reviewer.mdは変更しない): 今回はpublish-managerが気づいたが、発生源(eeat-reviewerが古い情報を残す)を放置したままであり、根本対応にならない
