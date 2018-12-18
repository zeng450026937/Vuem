/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

const mode = 'production';

module.exports = {
  context : __dirname,
  target  : 'web',
  entry   : {
    vuem : './src/index.js',
  },
  output : {
    path          : `${__dirname}/dist`,
    filename      : '[name].js',
    library       : `${pkg.title}`,
    libraryTarget : 'umd',
  },
  mode,
  module : {
    rules : [
      {
        test    : /\.js$/,
        exclude : /node_modules/,
        loader  : 'babel-loader',
      },
    ],
  },
  plugins : [
    new webpack.DefinePlugin({
      VERSION : JSON.stringify(pkg.version),
      TITLE   : JSON.stringify(pkg.title),
    }),
  ],
  externals : {
    vue : {
      commonjs  : 'vue',
      commonjs2 : 'vue',
      root      : 'Vue',
    },
  },
  resolve : {
    symlinks : false,
  },
  optimization : {
    minimizer : mode === 'production'
      ? [
        new TerserPlugin({
          terserOptions : {
            compress : {
              // turn off flags with small gains to speed up minification
              arrows         : false,
              collapse_vars  : false, // 0.3kb
              comparisons    : false,
              computed_props : false,
              hoist_funs     : false,
              hoist_props    : false,
              hoist_vars     : false,
              inline         : false,
              loops          : false,
              negate_iife    : false,
              properties     : false,
              reduce_funcs   : false,
              reduce_vars    : false,
              switches       : false,
              toplevel       : false,
              typeofs        : false,
        
              // a few flags with noticable gains/speed ratio
              // numbers based on out of the box vendor bundle
              booleans  : true, // 0.7kb
              if_return : true, // 0.4kb
              sequences : true, // 0.7kb
              unused    : true, // 2.3kb
        
              // required features to drop conditional branches
              conditionals : true,
              dead_code    : true,
              evaluate     : true,
            },
            mangle : {
              safari10 : true,
            },
          },
          sourceMap : false,
          cache     : true,
          parallel  : true,
        }),
      ]
      : [],
  },
};
