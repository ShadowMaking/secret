<template>
  <div class="create-result">

    <div class="icon-success">
      <van-icon name="success" size="80" color="#07c160"/>
    </div>
    <div class="success-tip">
      <span>Finished!</span>
      <span>You can backup your key by email or skip</span>
    </div>
    <div class="opt-wrapper">
      <van-button color="#909399" @click="backStep">Back</van-button>
      <van-button color="#495ABE" @click="nextStep">Backup by email</van-button>
    </div>

  </div>
</template>
<script>
export default {
  name: 'None',
  methods: {
    nextStep() {
      this.$emit('childEvent');
    },
    backStep() {
      this.$router.push({
        path: `/overview`,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
  .create-result {
    text-align: center;
  }
  .icon-success{
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
  }
  .success-tip {
    font-size: 15px;
    color: #333;
    text-align: center;
    margin: 10px;
    span{ display: block; margin-bottom: 10px;}
  }
  .opt-wrapper {
    margin: 60px 0 30px;
  }
  

  .result-btn-box {
    text-align: center
  }
  ::v-deep .van-button {
    padding: 0rem 1.2rem;
    margin-left: 20px;
  }
</style>