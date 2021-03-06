const _ = require('lodash');
const components = require('./components.json').components;

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const configTemplate = {
  devtool: false,
  output: {
    path: __dirname + '/bundles/react',
    libraryTarget: 'commonjs2'
  },
  optimization: {
    // minimize: false
  },
  externals: {
    'react': 'react',
    'react-dom': 'react-dom'
  },
};

module.exports = components.reduce((bundles, component) => {
  if(!component.private) {
    bundles.push(_.merge({}, configTemplate, {
      name: component.name + '-wrapper',
      entry: './devextreme-react/npm/' + component.wrapperName + '.js',
      output: {
        filename: component.name + '-wrapper.js',
      },
      plugins: [
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          openAnalyzer: false,
          reportFilename: component.name + "-wrapper.html"
        })
      ]
    }));

    bundles.push(_.merge({}, configTemplate, {
      name: component.name + '-renovated',
      entry: './devextreme-react-renovated/npm/' + component.wrapperName + '.js',
      output: {
        filename: component.name + '-renovated-wrapper.js',
      },
      plugins: [
        new BundleAnalyzerPlugin({
          analyzerMode: "static",
          openAnalyzer: false,
          reportFilename: component.name + "-renovated-wrapper.html"
        })
      ]
    }));
  }
  const nativePostfix = component.spike ? '' : '-native';
  bundles.push(_.merge({}, configTemplate,{
    name: component.name + '-native',
    entry: './devextreme-renovated/artifacts/react/renovation/' + component.path + '.tsx',
    output: {
      filename: component.name + nativePostfix + '.js',
    },
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: "static",
        openAnalyzer: false,
        reportFilename: component.name + nativePostfix + '.html'
      })
    ],
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [{
            loader: 'ts-loader',
            options: {
                configFile: __dirname + '/react.tsconfig.json'
            }
          }],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
  }));
  
  return bundles;
}, []);
