
module.exports = {
    entry: [
        './index.js'
    ],
    output: {
        path: __dirname,
        publicPath: '/',
        filename: 'main.js'
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                    
                query: {
                   presets:  ['es2015', 'react']
                }
            }, {
                test: /\.(css|scss)$/,
                use: [
                    { loader: "style-loader" },
                    { loader: "css-loader" }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        historyApiFallback: true,
        contentBase: './',
        port: 6006,
        headers: { "Access-Control-Allow-Origin": "*" }
    },
    node: {
        fs: "empty"
    }
};
