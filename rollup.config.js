const pkg = require("./package.json");

export default {
  input   : "lib/index.js",
  external: Object.keys(pkg.dependencies || {}),
  output  : [
    {
      format   : "cjs",
      file     : pkg.main,
      sourcemap: true
    },
    {
      format   : "es",
      file     : pkg.module,
      sourcemap: true
    }
  ]
};
