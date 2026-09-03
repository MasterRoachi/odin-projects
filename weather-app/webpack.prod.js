const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

// Production: minified, no source maps, nothing but what ships.
module.exports = merge(common, {
  mode: "production",
  devtool: false,
});
