const webpack = require('webpack');
module.exports = {
    watch: true,

    // 页面入口
    entry: {
        'axios-mocker.min': ['./src/axios-mocker.js'],
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
        })
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
