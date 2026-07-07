<script setup lang="ts">
useCanonical()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-white">
    <SiteHeader />
    <div class="flex-1">
      <slot />
    </div>
    <SiteFooter />
  </div>
</template>
