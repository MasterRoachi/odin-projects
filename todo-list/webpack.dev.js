const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

// Development: readable output, source maps that point at the real files,
// and a dev server that reloads on save.
module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: "./dist",
    port: 8080,
    hot: true,
  },
});
