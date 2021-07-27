
var path = require('path')
var rootPath = path.join(__dirname)
var srcPath = path.join(rootPath, 'src')
var distPath = path.join(rootPath, 'dist')
var publicPath = path.join(rootPath, 'public')


module.exports = {
  devServer: {
    open: process.platform === "darwin",
    host: "dev-deliver-secret.eigen.com", // localhost
    port: "8090",
    https: false,
    hotOnly: false,
    /* proxy: {
      "/api": {
        target: dev ? "http://eigen.com:80/" : "http://eigen.com",
        changeOrigin: true,
        secure: false,
        pathRewirte: {
          "^/api": ""
        }
      }
    }, */
    before: app => {}
  },
  // 全局引入scss报错处理
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/assets/style/reset.scss";`
      }
    }
  },
  productionSourceMap: false, //生产环境sourceMap
  
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      // 为生产环境修改配置...
      console.log('procuction')
      config.mode = "production";
    } else {
      // 为开发环境修改配置...
      console.log('dev')
      config.mode = "development";
      config.devtool = 'inline-source-map'
    }
    
  },
  publicPath: './',
  outputDir: 'dist',
  // assetsDir: 'static'
}