const path = require('path');
module.exports = {
    // モード値を production に設定すると最適化された状態で、
    // development に設定するとソースマップ有効でJSファイルが出力される
    mode: "development",
    devServer: {
        contentBase: "dist",
        open: true,
        port: 8666,
        https: true
    },
    // メインとなるJavaScriptファイル（エントリーポイント）
    entry: "./src/js/main.js",
    output: {
        path: path.join(__dirname, 'dist/js'),
        filename: "bundle.js"
    },

    module: {
        rules: [
            {
                test: /\.(png|jpe?g|gif|mp4|glb|css|html)$/i,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath : 'assets/',
                    publicPath : function(path){
                        return '../' + path;
                    }

                }
            },
            {
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                    'raw-loader',
                ]
            }
        ]
    },
    // import 文で .ts ファイルを解決するため
    resolve: {
        extensions: [".wasm", ".mjs", ".js", ".jsx", ".json",".css",".html"]
    }
};