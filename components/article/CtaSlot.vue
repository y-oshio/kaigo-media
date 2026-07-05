<script setup lang="ts">
/**
 * CTA枠(T6)— クラスタ別CTA(07章)の差し込み位置だけを予約するプレースホルダ。
 * 配線は実装#5(P4: 計測+/go/リダイレクタ)で行う。それまでは何も表示しない。
 * 架空のサービス・広告リンクをここに置くことは禁止。
 */
defineProps<{ cluster: string }>()
</script>

<template>
  <!-- P4 で /go/ リダイレクタ+クラスタ別CTAを配線する(現在は非表示) -->
  <div :data-cta-cluster="cluster" class="hidden" aria-hidden="true" />
</template>
