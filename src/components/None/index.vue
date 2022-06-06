<template>
  <div class="none">
    <i></i>
    <span v-if="title">{{title}}</span>
     <span v-else>none data</span>
  </div>
</template>
<script>
export default {
  name: 'None',
  props: ['title'],
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