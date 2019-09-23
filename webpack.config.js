const webpack = require('webpack');
const fs = require('fs');
class ReplaceContent {
    apply(compiler) {
        compiler.plugin('done', () => {
            try {
                const scripts = fs.readFileSync('./dist/axios-mocker-ext.min.js').toString();
                const content = fs.readFileSync('./content.js').toString();
                const newContent = content.replace(/\/\*\* SCRIPTS TO BE REPLACE, DONT MODIFY \*\/\n([\s\S]*)\n\/\*\* SCRIPTS TO BE REPLACE, DONT MODIFY \*\//, (m, p1) => {
                    return m.replace(p1, `const extJs = \`${scripts}\`;`)
                });
                fs.writeFileSync('./content.js', newContent);
            } catch (err) {
                console.error(err);
            }
        });
    }
}
module.exports = {
    watch: true,

    // 页面入口
    entry: {
        'axios-mocker': ['./src/axios-mocker.js'],
        'axios-mocker.min': ['./src/axios-mocker.js'],
        'axios-mocker-ext': ['./src/axios-mocker-ext.js'],
        'axios-mocker-ext.min': ['./src/axios-mocker-ext.js']
    },

    // 出口文件输出配置
    output: {
        filename: './dist/[name].js'
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true
        }),
        new ReplaceContent()
    ],

    // 加载器
    module: {
        preLoaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader?presets[]=es2015'
        }]
    },
    resolve: {
        extensions: ['', '.js']
    }
};
