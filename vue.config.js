
var path = require('path')
var rootPath = path.join(__dirname)
var srcPath = path.join(rootPath, 'src')
var distPath = path.join(rootPath, 'dist')
var publicPath = path.join(rootPath, 'public')
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = ['js', 'css'];
const isProduction = process.env.NODE_ENV === 'production';


module.exports = {
  devServer: {
    disableHostCheck: true,
    open: process.platform === "darwin",
    host: "dev-deliver-secret.eigen.com", // localhost
    port: "8090",
    https: false,
    hotOnly: false,
    /* proxy: {
      "/api": {
        target: "http://dev-deliver-secret.eigen.com:8090",
        // target: "http://rpc.ieigen.com",
        changeOrigin: true,
        secure: false,
        ws: true,
        pathRewirte: {
          "^/api": "/api"
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
    if (isProduction) {
      // 开启gzip压缩
      config.plugins.push(new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: /\.js$|\.html$|\.json$|\.css/,  // test: /\.js$|\.html$|\.css/,
        threshold: 10240,                     // 对超过10k的数据进行压缩
        deleteOriginalAssets: false,
        minRatio: 0.8                         // 只有压缩率小于这个值的资源才会被处理
      }))
      // 开启分离js
      config.optimization = {
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: Infinity,
          minSize: 20000,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name (module) {
                // get the name. E.g. node_modules/packageName/not/this/part.js
                // or node_modules/packageName
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
                // npm package names are URL-safe, but some servers don't like @ symbols
                return `npm.${packageName.replace('@', '')}`
              }
            }
          }
        }
      }
      /* config.optimization = {
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            maxSize: 0,
            minChunks: 1,
            maxAsyncRequests: 6,
            maxInitialRequests: 4,
            automaticNameDelimiter: '~',
            cacheGroups: {
                vendors: {
                    name: `chunk-vendors`,
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    chunks: 'initial'
                },
                common: {
                    name: `chunk-common`,
                    minChunks: 2,
                    priority: -20,
                    chunks: 'initial',
                    reuseExistingChunk: true
                }
            }
        }
      } */
      config.externals = {
        // 'vue': 'Vue',
        // 'vue-router': 'VueRouter',
        // 'moment': 'moment',
        // 'lodash': 'lodash',
       }
    } else {
      config.mode = "development";
      config.devtool = 'inline-source-map'
    }
    
  },
  publicPath: '/',
  outputDir: 'dist',
  // assetsDir: 'static'
}