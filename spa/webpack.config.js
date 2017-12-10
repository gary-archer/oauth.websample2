const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  
  // Pull in all dependencies starting from the root file and polyfill to ES5
  entry: ['babel-polyfill', './logic/app.js'],
  output: {
    
    // Build our code into our SPA bundle file
    path: path.resolve(__dirname, 'dist'),
    filename: 'spa.bundle.min.js'
  },
  resolve: {

    // Resolve ES6 module imports from these folders
    modules: ['node_modules', 'logic', 'plumbing']
  },
  module: {
    rules: [
      {
        // Files with a .js extension are loaded by the babel loader
        test: /\.js$/, 
        loader: 'babel-loader', 
        options: {
          
          // We are polyfilling ES6 features, and do not want to transform modules
          presets: [
            ['es2015', { modules: false }]
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      
      // Build 3rd party code into a Vendor bundle file
      name: 'vendor',
      filename: '../dist/vendor.bundle.min.js',
      minChunks (module) {
          return module.context && module.context.indexOf('node_modules') !== -1;
      }
    })
  ]
}