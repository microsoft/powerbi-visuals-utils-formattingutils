const path = require('path');

var webpack = require( "webpack" );
module.exports = {
    entry: './src/index.ts',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
              }
        ]
    },
    externals: {
        "powerbi-visuals-tools": '{}'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js','.css']
    },
    output: {
        path: path.resolve(__dirname, ".tmp/test")
    },
    plugins: [
        new webpack.ProvidePlugin({
            'powerbi-visuals-tools': null,
            'Globalize': "globalize/lib/globalize"
          })
    ]
};
