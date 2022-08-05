
var path = require('path')
var rootPath = path.join(__dirname)
var srcPath = path.join(rootPath, 'src')
var distPath = path.join(rootPath, 'dist')
var publicPath = path.join(rootPath, 'public')
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = ['js', 'css'];
const isProduction = process.env.NODE_ENV === 'production';
const isPreview = process.env.NODE_ENV === 'preview';
const isTest = process.env.NODE_ENV === 'test';


module.exports = {
  filenameHashing: true,
  devServer: {
    disableHostCheck: true,
    open: process.platform === "darwin",
    host: "dev-deliver-secret.eigen.com", // localhost
    port: "8090",
    https: false,
    hotOnly: false,
    /* proxy: {
      "/api": {
        target: "http://rpc.ieigen.com",
        changeOrigin: true,
        secure: false,
        ws: true,
        pathRewirte: {
          "^/api": "/"
        }
      }
    }, */
    before: app => { }
  },
  // resolve import scss error in lobal
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/assets/style/reset.scss";`
      }
    }
  },
  productionSourceMap: false,
  chainWebpack: config => {
    if (isProduction) {
      // delete prefetch plugins
      config.plugins.delete('prefetch')
      if (process.env.npm_config_report) {
        config.plugin('webpack-bundle-analyzer').use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin).end();
      }
    }
    config.output.filename('js/[name].[hash].js').chunkFilename('js/[name].[hash].js').end()
  },
  configureWebpack: config => {
    // if (isProduction) {
    if (isProduction||isPreview||isTest) {
      config.plugins.push(new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: /\.js$|\.html$|\.json$|\.css/,  // test: /\.js$|\.html$|\.css/,
        threshold: 10240,                     // deal > 10k file
        deleteOriginalAssets: false,
        minRatio: 0.8
      }))
      // separate js
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

      // config.optimization = {
      //   splitChunks: {
      //     chunks: 'all',
      //     minSize: 30000,
      //     maxSize: 0,
      //     minChunks: 1,
      //     maxAsyncRequests: 6,
      //     maxInitialRequests: 4,
      //     automaticNameDelimiter: '~',
      //     cacheGroups: {
      //       vendors: {
      //         name: `chunk-vendors`,
      //         test: /[\\/]node_modules[\\/]/,
      //         priority: -10,
      //         chunks: 'initial',
      //         // minChunks: 2,
      //         chunks: 'all',
      //       },
      //       common: {
      //         name: `chunk-common`,
      //         minChunks: 2,
      //         priority: -20,
      //         minSize: 60000, // deal modules about size >60kb, avoid generate a lots of litter chunck
      //         chunks: 'initial',
      //         reuseExistingChunk: true
      //       }
      //     }
      //   }
      // }
      config.externals = {
        // 'vue': 'Vue',
        // 'vue-router': 'VueRouter',
        // 'moment': 'moment',
        // 'lodash': 'lodash',
      }
      // cancel webpack warning
      config.performance = {
        hints:'warning',
        maxEntrypointSize: 50000000,//entry maxsize
        maxAssetSize: 30000000, //build maxfilesize
        assetFilter: function(assetFilename) {
          return assetFilename.endsWith('.js');
        }
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