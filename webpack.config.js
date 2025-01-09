const path = require('path');
const autoprefixer = require('autoprefixer');
const terserWebpackPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        'scripts': './src/assets/scripts/scripts.js',
    },
    output: {
        clean: false,
        path: path.resolve(__dirname, './dist/assets/scripts'),
        filename: '[name].min.js',
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].css',
                        },
                    },
                    {
                        loader: 'extract-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    autoprefixer()
                                ]
                            }
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            // Prefer Dart Sass
                            implementation: require('sass'),
                            webpackImporter: false,
                            sassOptions: {
                                includePaths: [
                                    './node_modules'
                                ]
                            },
                        },
                    },
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            configFile: './.babelrc',
                            // add the terserOptions here
                            compact: true,
                            comments: false,
                        },
                    },
                ]
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [
            new terserWebpackPlugin({
                extractComments: false,
                terserOptions: {
                    mangle: true,
                    compress: {
                        drop_console: true, // remove console.* statements
                        sequences: true, // Join consecutive simple statements using the comma operator
                        passes: 2, // Passes for more thorough minification
                        drop_console: true, // Drop console.* statements
                        drop_debugger: true,// Drop debugger statements
                        join_vars: true,
                    },
                    format: {
                        comments: false, // remove comments
                        beautify: false, // do not beautify output
                    },
                    keep_fnames: false, // do not preserve function names
                    ecma: 2015, // specify ECMAScript version to target
                },
            }),
        ],
        // splitChunks: {
        //     chunks: 'all',

        // },
    },
    watch: false,
}