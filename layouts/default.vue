<template>
  <div class="flex min-h-screen flex-col bg-white">
    <SiteHeader />
    <div class="flex-1">
      <slot />
    </div>
    <SiteFooter />
  </div>
</template>
