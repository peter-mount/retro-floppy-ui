const path = require('path');
/*
const webpack = require('webpack');

var plugins = []
// If we are a production build then this will uglify it and remove the
// react development tools from the build
if( process.env.environment == 'production' ) {
  plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify( 'production' )
    }),
    new UglifyJSPlugin()
  ]
}
*/
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BabelMinifyPlugin = require('babel-minify-webpack-plugin');
//const TerserPlugin = require('terser-webpack-plugin');
//const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

console.log("Webpack", process.env.environment, 'dist', __dirname + "/dist");

const nameFunc = (module, chunks, cacheGroupKey) => {
    //const moduleFileName = module.identifier().split('/').reduceRight(item => item);
    //const allChunksNames = chunks.map((item) => item.name).join('~');
    //console.log( moduleFileName, allChunksNames, cacheGroupKey );
    return `${cacheGroupKey}`;
    //return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
};

module.exports = {
    mode: 'production', //process.env.environment,

    entry: "./build/index.js",

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Output Management',
            filename: "index.html",
            template: "src/index.html",
            inject: "body",
            //chunksSortMode: "dependency",
            chunks: ['main'],
            //excludeChunks: ['departureboards']
        }),

        new MiniCssExtractPlugin({
            filename: '[hash:5]/[name].css',
            chunkFilename: '[hash:5]/[id].css',
            //filename: '[hash:5]/[hash:5].css',
            //chunkFilename: '[hash:5]/[hash:5]-[id].css',
        })
    ],

    output: {
        path: __dirname + "/dist",
        //filename: "[name].js",
        //chunkFilename: '[name]-bundle.js',
        //filename: '[name].[hash:5].js',
        filename: '[hash:5]/[hash:5].js',
        chunkFilename: '[hash:5]/[hash:5]-[id].js',
        publicPath: "/"
    },

    optimization: {
        minimize: true,
        minimizer: [
            new BabelMinifyPlugin(),
            //new UglifyJSPlugin(),
            //new TerserPlugin({}),
            new OptimizeCSSAssetsPlugin({})
        ],

        // Normal js chunks
        moduleIds: 'hashed',
        // Have a single webpack runtime used by all chunks
        runtimeChunk: "single",
        // Name chunks
        //namedChunks: true,
        chunkIds: "named",
        splitChunks: {
            chunks: 'async',
            minSize: 30000,
            maxSize: 90000,
            minChunks: 2,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '-',
            // FIXME this works locally but breaks the docker build, Check but might not be necessary now
            //automaticNameMaxLength: 30,
            name: true,
            cacheGroups: {
                a51: {
                    test: /[\\/]node_modules[\\/](area51|uktrain).*[\\/]/,
                    name: nameFunc,
                    priority: -5
                },
                react: {
                    test: /[\\/]node_modules[\\/]react.*[\\/]/,
                    name: nameFunc,
                    priority: -9
                },
                ext: {
                    test: /[\\/]node_modules[\\/]/,
                    name: nameFunc,
                    priority: -10
                },
                default: {
                    priority: -20
                }
            }
        }
    },

    module: {
        // This used to be called loaders but recent webpack requires rules instead
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                include: [
                    path.resolve(__dirname, './lib')
                ],
                loader: 'babel-loader',
                query: {
                    presets: [
                        'env',
                        'react'
                    ]
                }
            },
            {
                test: /\.svg$/,
                exclude: /(node_modules|bower_components)/,
                include: [
                    path.resolve(__dirname, './src')
                ],
                loader: 'svg-inline-loader'
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ]
    },

    stats: {
        colors: true
    },

    // remove dev-tools mapping. Use source-map for local dev
    devtool: '',
    //devtool: 'source-map',

    devServer: {
        /*open: 'http://localhost:9000',*/
        port: 9000,
        contentBase: 'dist',
        // Disable compilation by requesting it only on a non-existent file.
        // This is needed so that we use what's deployed under dist & not a virtual copy
        lazy: true,
        filename: "donotrecompile.js",
        // Compression
        compress: false
    }
};
