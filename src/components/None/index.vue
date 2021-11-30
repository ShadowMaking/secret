<template>
  <div class="none">
    <i></i>
    <span>none data</span>
  </div>
</template>
<script>
export default {
  name: 'None',
}
</script>
<style lang="scss" scoped>
  .none {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ccc;
    font-size: 1rem;
    padding: 20px;
    i{
      width: 30px;
      height: 24px;
      display: block;
      background: url('~@/assets/none.png') center center no-repeat;
      background-size: 100% 100%;
    }
  }
</style>