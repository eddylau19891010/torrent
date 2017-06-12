var path = require('path')
var webpack = require('webpack')

var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin
var autoprefixer = require('autoprefixer')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var WebpackOnBuildPlugin = require('on-build-webpack')
var electron = require('electron-connect').server.create({
  stopOnClose: true
})

var ENV = process.env.npm_lifecycle_event
var isTest = ENV === 'test' || ENV === 'test-watch' || ENV === 'e2e'
var isProd = ENV === 'package'
var isWatching = ENV === 'webpack'

module.exports = (function makeWebpackConfig() {
  var config = {}
  config.devtool = 'source-map'

  config.debug = !isProd || !isTest
  config.entry = isTest ? {} : {
    'polyfills': './app/web/polyfills.ts',
    'vendor': './app/web/vendor.ts',
    'app': './app/web/main.ts'
  }

  config.output = isTest ? {} : {
    path: root('./src'),
    filename: isProd ? 'js/[name].[hash].js' : 'js/[name].js',
    chunkFilename: isProd ? '[id].[hash].chunk.js' : '[id].chunk.js'
  }

  config.resolve = {
    cache: !isTest,
    root: root(),
    extensions: ['', '.ts', '.js', '.json', '.css', '.scss', '.html'],
    alias: {
      'app': './app/web/app'
    }
  }

  config.stats = {
    warnings: false
  }

  config.module = {
    preLoaders: isTest ? [] : [{
      test: /\.ts$/,
      loader: 'tslint'
    }],
    loaders: [{
        test: /\.node$/,
        loader: 'node-loader'
      },
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
        include: root('app/web/'),
        exclude: [isTest ? /\.(e2e)\.ts$/ : /\.(spec|e2e)\.ts$/, /node_modules\/(?!(ng2-.+))/]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.css$/,
        exclude: root('app', 'web', 'app'),
        loader: isTest ? 'null' : ExtractTextPlugin.extract('style', 'css!postcss')
      },
      {
        test: /\.css$/,
        include: root('app', 'web', 'style'),
        loader: 'raw!postcss'
      },
      {
        test: /\.scss$/,
        exclude: root('app', 'web', 'app'),
        loader: isTest ? 'null' : ExtractTextPlugin.extract('style', 'css!postcss!sass')
      },
      {
        test: /\.scss$/,
        exclude: root('app', 'web', 'style'),
        loader: 'raw!postcss!sass'
      },
      {
        test: /\.html$/,
        loader: 'raw-loader'
      },
      {
        test: /\.(pug|jade)$/,
        loader: 'pug-html-loader'
      }
    ],
    postLoaders: [],
    noParse: [
      /.+zone\.js\/src\/.+/,
      /.+angular2\/bundles\/.+/,
      /angular2-polyfills\.js/
    ]
  }

  if (isTest) {
    config.module.postLoaders.push({
      test: /\.ts$/,
      include: path.resolve('src'),
      loader: 'istanbul-instrumenter-loader',
      exclude: [/\.spec\.ts$/, /\.e2e\.ts$/, /node_modules/]
    })


    config.ts = {
      compilerOptions: {
        sourceMap: false,
        sourceRoot: './app/web/',
        inlineSourceMap: true
      }
    }
  }

  config.plugins = [
    new webpack.ProvidePlugin({ "Tether": 'tether' }),
    new CopyWebpackPlugin([ { from: 'resources/i18n', to: 'i18n' } ]),
    new webpack.DefinePlugin({
      'process.env': {
        ENV: JSON.stringify(ENV)
      }
    })
  ]

  if (!isTest) {
    config.plugins.push(
      new CommonsChunkPlugin({
        name: ['vendor', 'polyfills']
      }),
      new HtmlWebpackPlugin({
        template: './app/web/public/index.html',
        chunksSortMode: 'dependency',
        cache: !(ENV === 'webpack')
      }),
      new ExtractTextPlugin('css/[name].[hash].css', {
        disable: !isProd
      }),
      new CopyWebpackPlugin([{
        from: root('./app/web/public')
      }])
    )
  }

  if (isWatching) {
    config.plugins.push(
      new WebpackOnBuildPlugin(function(stats) {
        if (!config.reload) {
          config.reload = true
          electron.start()
        } else {
          electron.reload()
        }
      })
    )
  }

  if (isProd) {
    config.plugins.push(
      new webpack.NoErrorsPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin()
    )
  }

  config.postcss = [
    autoprefixer({
      browsers: ['last 2 version']
    })
  ]

  config.externals = {
    'wcjs-player': 'commonjs wcjs-player',
    'wcjs-prebuilt': 'commonjs wcjs-prebuilt'
  }

  config.tslint = {
    emitErrors: false,
    failOnHint: false
  }

  config.target = 'electron-renderer'
  return config
}())

function root(args) {
  args = Array.prototype.slice.call(arguments, 0)
  return path.join.apply(path, [__dirname].concat(args))
}
