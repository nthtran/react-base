/* eslint camelcase: 0 */

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');
const fs = require('fs');
const merge = require('lodash.merge');

const NODE_ENV = process.env.NODE_ENV;
const DEBUG = NODE_ENV !== 'production';
const DEV_PORT = 3001;
const GLOBALS = {
  __CLIENT__: false,
  __SERVER__: false,
  __DEV__: DEBUG,
  'process.env': {
    NODE_ENV: JSON.stringify(NODE_ENV),
  },
};

const ROOT_PATH = __dirname;
const BUILD_DIR = 'build';
const SRC_PATH = path.resolve(ROOT_PATH, 'src');
const GLOBAL_CSS_PATH = path.resolve(SRC_PATH, 'client', 'css');
const SHARED_PATH = path.resolve(SRC_PATH, 'shared');
const OUTPUT_PATH = path.resolve(SRC_PATH, 'assets', BUILD_DIR);
const SHARED_OUTPUT_PATH = path.resolve(SHARED_PATH, BUILD_DIR);

/**
 * Loaders.
 */

// don't want to use bluebirdCoroutines on the client (too big)
const babel = 'babel?blacklist=bluebirdCoroutines';
const js = DEBUG ? ['react-hot', babel] : [babel];
const cssModule = `modules&importLoaders=1&localIdentName=[local]__[hash:base64:5]&`;
const cssLoaders = `${DEBUG ? 'sourceMap' : 'minimize'}!postcss`;
function makeCssLoaders(css) {
  return DEBUG ? `style!${css}` : ExtractTextPlugin.extract('style', css);
}
const localCss = makeCssLoaders(`css?${cssModule}${cssLoaders}`);
const globalCss = makeCssLoaders(`css?${cssLoaders}`);
const serverCss = `css/locals?${cssModule}${cssLoaders}`;

/**
 * Config.
 */

const common = {
  cache: DEBUG,
  debug: DEBUG,

  resolve: {
    extensions: ['', '.js'],
  },

  module: {
    loaders: [
      { test: /\.js$/, loaders: js, exclude: path.resolve(ROOT_PATH, 'node_modules') },
      // disable `amd` even in /node_modules - uncomment depending on the project's deps
      { test: /\.js$/, loader: 'imports?define=>false' },
      { test: /\.json$/, loader: 'json' },
      { test: /\.(eot|woff|woff2|ttf|png|jpg|jpeg|gif|svg)$/, loader: 'url?limit=30000&name=[name]-[hash].[ext]' },
    ],
  },

  plugins: DEBUG ? [] : [
    new webpack.optimize.OccurenceOrderPlugin(),
  ],

  postcss: function postcss() {
    return [
      require('cssnext')({
        import: {
          path: [
            SRC_PATH,
          ],
          onImport: function onImport(files) {
            files.forEach(this.addDependency);
          }.bind(this),
        },
      }),
    ];
  },

  // cssnext: {
  //   import: {
  //     path: [
  //       SRC_PATH,
  //     ],
  //   },
  // },
};

const clientConfig = merge({}, common, {
  // client config
  name: 'client',
  devtool: DEBUG ? 'cheap-module-eval-source-map' : false,

  entry: [path.resolve(SRC_PATH, 'client')]
    .concat(DEBUG ? [
      `webpack-dev-server/client?http://0.0.0.0:${DEV_PORT}`,
      'webpack/hot/only-dev-server',
    ] : []),

  output: {
    filename: DEBUG ? 'index.js' : '[name]-[hash].js',
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: `/${BUILD_DIR}/`,
    path: OUTPUT_PATH,
  },

  module: {
    loaders: common.module.loaders.concat([
      {
        test: /\.css$/,
        loader: globalCss,
        include: [GLOBAL_CSS_PATH],
      },
      {
        test: /\.css$/,
        loader: localCss,
        exclude: [GLOBAL_CSS_PATH],
      },
    ]),
  },

  plugins: common.plugins.concat([
    new webpack.DefinePlugin(merge({}, GLOBALS, { __CLIENT__: true })),
  ]).concat(DEBUG ? [
    new webpack.HotModuleReplacementPlugin(),
  ] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      screw_ie8: true,
      compress: {
        keep_fnames: true,
        drop_console: true,
      },
      mangle: {
        keep_fnames: true,
      },
      sourceMap: false,
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new ExtractTextPlugin('[name]-[chunkhash].css', { allChunks: true }),
    new ManifestPlugin(),
  ]),

  // some modules need this
  node: {
    console: true,
  },
});

const SHARED_ENTRY = 'run';
const nodeModulesExternals = {};
fs.readdirSync('node_modules')
  .filter(function filter(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function forEach(mod) {
    nodeModulesExternals[mod] = 'commonjs ' + mod;
  });

const serverConfig = merge({}, common, {
  // server config
  name: 'server',
  devtool: 'cheap-source-map',
  entry: path.resolve(SRC_PATH, 'shared', SHARED_ENTRY),
  target: 'node',
  externals: nodeModulesExternals,
  recordsPath: path.resolve(SHARED_OUTPUT_PATH, '_records'),

  output: {
    // The filename of the entry chunk as relative path inside the output.path directory
    filename: `${SHARED_ENTRY}.js`,
    chunkFilename: `${SHARED_ENTRY}-[chunkhash].js`,
    libraryTarget: 'commonjs2',
    path: SHARED_OUTPUT_PATH,
  },

  module: {
    loaders: common.module.loaders.concat({
      test: /\.css$/,
      loader: serverCss,
    }),
  },

  plugins: common.plugins.concat([
    new webpack.DefinePlugin(merge({}, GLOBALS, { __SERVER__: true })),
    new webpack.BannerPlugin('require("source-map-support").install();',
      { raw: true, entryOnly: false }),
  ]),
});

module.exports = [clientConfig, serverConfig];
