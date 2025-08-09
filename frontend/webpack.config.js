const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.[contenthash].js",
    publicPath: "/",
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: "asset/resource",
        generator: {
          filename: "img/[name][ext]",
        },
      },
    ],
  },
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, Content-Type, Authorization",
    },
    host: "0.0.0.0",
    static: {
      directory: path.join(__dirname, "public"),
    },
    port: 3000,
    historyApiFallback: true,
    allowedHosts: "all",
    client: {
      overlay: true,
      webSocketURL: "ws://0.0.0.0:80/ws",
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
    }),
    new Dotenv({
      path: "./.env",
      safe: false,
      defaults: true,
    }),
    //new webpack.DefinePlugin({
    //  'process.env': JSON.stringify(process.env)
    //}),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public/admin"),
          //to: path.resolve(__dirname, 'dist'),
          to: path.resolve(__dirname, "dist", "admin"), // ← admin 폴더 형태로 복사
          globOptions: {
            ignore: ["index.html"],
          },
        },
        {
          from: path.resolve(__dirname, "public/robots.txt"),
          to: path.resolve(__dirname, "dist/robots.txt"),
        },
        {
          from: path.resolve(__dirname, "public/favicon.ico"),
          to: path.resolve(__dirname, "dist/favicon.ico"),
        },
        {
          from: path.resolve(__dirname, "public/llms.txt"),
          to: path.resolve(__dirname, "dist/llms.txt"),
        },
        {
          from: path.resolve(__dirname, "public/img"),
          to: path.resolve(__dirname, "dist/img"),
        },
        {
          from: path.resolve(__dirname, "public/manifest.json"),
          to: path.resolve(__dirname, "dist/manifest.json"),
        },
      ],
    }),
  ],
};
