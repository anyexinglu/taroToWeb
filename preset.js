const path = require("path");

module.exports = (_, options = {}) => {
  const presets = [];
  const plugins = [];
  const isReact = options.framework === "react";
  const moduleName =
    options.framework.charAt(0).toUpperCase() + options.framework.slice(1);

  if (options.ts) {
    const config = {
      // onlyRemoveTypeImports: true,
    };
    // if (isReact) {
    //   config.jsxPragma = moduleName;
    // }
    // https://babeljs.io/docs/en/babel-preset-typescript
    presets.push([require("@babel/preset-typescript"), config]);
  }

  const runtimePath =
    process.env.NODE_ENV === "jest" || process.env.NODE_ENV === "test"
      ? false
      : path.dirname(require.resolve("@babel/runtime/package.json"));
  const runtimeVersion = require("@babel/runtime/package.json").version;
  const { absoluteRuntime = runtimePath, version = runtimeVersion } = options;

  // https://babeljs.io/docs/en/babel-plugin-transform-runtime
  plugins.push([
    require("@babel/plugin-transform-runtime"),
    {
      // regenerator: true,
      // corejs: envOptions.corejs,
      // helpers: false, // true,
      // useESModules: process.env.NODE_ENV !== "test",
      // absoluteRuntime,
      // version,
    },
  ]);

  return {
    sourceType: "unambiguous",
    overrides: [
      {
        exclude: [/@babel[/|\\\\]runtime/, /core-js/],
        presets,
        plugins,
      },
    ],
  };
};
