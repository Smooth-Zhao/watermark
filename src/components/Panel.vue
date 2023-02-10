<template>
  <div class="panel">
    <div class="title">{{ props.title }}</div>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    title: string;
  }>(),
  {
    title: ''
  }
)
</script>

<style lang="scss" scoped>
.panel {
  margin: 24px 0;
  .title {
    color: #333;
    font-size: 24px;
    margin-bottom: 24px;
  }
  .content {
    padding-left: 14px;
    .item {
      color: #333;
      display: flex;
      align-items: center;
      margin: 8px 0;
    }
  }
}
</style>
