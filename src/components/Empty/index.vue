<template>
  <div class="common-empty-content">
    <img src="~@/assets/none_data2.png" />
    <span>None Data</span>
  </div>
</template>
<script>
export default {
  name: 'Empty',
}
</script>
<style lang="scss" scoped>
  .common-empty-content {
    padding: 50px 20px;
    font-weight: 400;
    color: #202C37;
    font-size: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    span{ display: block; margin-top: 20px;}
    img {
      width: 300px;
      height: 300px;
    }
  }
</style>
