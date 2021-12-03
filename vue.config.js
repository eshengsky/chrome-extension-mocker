const MonacoEditorPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');
module.exports = {
  configureWebpack: {
    plugins: [
      new MonacoEditorPlugin({
        // https://github.com/Microsoft/monaco-editor-webpack-plugin#options
        // Include a subset of languages support
        // Some language extensions like typescript are so huge that may impact build performance
        // e.g. Build full languages support with webpack 4.0 takes over 80 seconds
        // Languages are loaded on demand at runtime
        languages: ['javascript', 'css', 'html', 'typescript', 'json'],
      }),
    ],
  },
  chainWebpack: (config) => {
    config.optimization.delete('splitChunks');
    config.module.rule('js')
      .exclude.add(path.resolve(__dirname, 'src/content-scripts/content-script.js'));
  },
  pages: {
    devtools: {
      template: 'public/browser-extension.html',
      entry: './src/devtools/main.js',
      title: 'Devtools',
    },
  },

  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.js',
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/content-scripts/content-script.js',
            ],
          },
        },
      },
    },
  },

  transpileDependencies: [
    'vuetify',
  ],
};
