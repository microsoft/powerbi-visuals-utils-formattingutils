const path = require('path');

var webpack = require( "webpack" );
module.exports = {
    entry: './src/index.ts',
    devtool: 'source-map',
    mode: 'development',
    optimization: {
        minimize: false,
        concatenateModules: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/i,
                enforce: 'post',
                include: /(src)/,
                exclude: /(node_modules|resources\/js\/vendor)/,
                loader: 'istanbul-instrumenter-loader',
                options: { esModules: true }
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
              }
        ]
    },
    externals: {
        "powerbi-visuals-tools": '{}',
        "powerbi-visuals-api": '{}'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js','.css']
    },
    output: {
        path: path.resolve(__dirname, ".tmp/test")
    },
    plugins: [
    ]
};
