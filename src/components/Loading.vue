<template>
  <div class="common-loading-wrapper" >
    <span v-for="i in 5" :key="i"></span>
  </div>
</template>
<script>
export default {
  name: 'Loading'
}
</script>
<style lang="scss" scoped>
  .common-loading-wrapper{
    width: 150px;
    height: 15px;
    margin: 0 auto;
    margin-top:100px;
    span{
      display: inline-block;
      width: 15px;
      height: 100%;
      margin-right: 5px;
      border-radius: 50%;
      background: #333999;
      -webkit-animation: load 1.04s ease infinite;
    }
    span:last-child{
      margin-right: 0px; 
    }
    span:nth-child(1){
      -webkit-animation-delay:0.13s;
    }
    span:nth-child(2){
      -webkit-animation-delay:0.26s;
    }
    span:nth-child(3){
      -webkit-animation-delay:0.39s;
    }
    span:nth-child(4){
      -webkit-animation-delay:0.52s;
    }
    span:nth-child(5){
      -webkit-animation-delay:0.65s;
    }
  }
  @-webkit-keyframes load{
    0%{
      opacity: 1;
      -webkit-transform: scale(1.3);
    }
    100%{
      opacity: 0.2;
      -webkit-transform: scale(.3);
    }
  }
</style>