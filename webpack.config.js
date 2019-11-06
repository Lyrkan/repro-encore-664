const Encore = require('@symfony/webpack-encore');

Encore
  .disableSingleRuntimeChunk()
  .setOutputPath('build/')
  .setPublicPath('/')
  .cleanupOutputBeforeBuild()
  .addEntry('main', './src/index.js')
  .enableVueLoader()
  .addLoader({
    test: /\.pug$/,
    oneOf: [
      {
        resourceQuery: /^\?vue/,
        use: ['pug-plain-loader']
      },
      {
        use: ['raw-loader', 'pug-plain-loader']
      }
    ]
  })
;

module.exports = Encore.getWebpackConfig();

