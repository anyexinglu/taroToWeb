import { transformFromAst } from "@babel/core";
import { parse } from "@babel/parser";

const build = async () => {
  const code = `
  import React from "react";
  import { View, Text } from "@tarojs/components";

  export default function List(_props: any) {
    return (
      <View className="list">
        <Text>列表页</Text>
      </View>
    );
  }
  `;

  // https://github.com/anyexinglu/taroToWeb/commit/7abdbfc77433e9d8d5dcf4e9e02d32b479110927
  const result = await parse(code, {
    // ast: true,
    sourceType: "unambiguous",
    // filename: "fileEntryPath",
    // presets: ["@babel/preset-typescript"],
    // presets: [["@babel/preset-typescript", {}]],
    plugins: [
      "typescript",
      "jsx",
      // "exportDefaultFrom",
      // "typescript",
      // "exportNamespaceFrom",
      // "importAssertions",
    ],
    // plugins: ["@babel/plugin-transform-runtime"],
  });

  console.log("...result", result);

  const newCode = await transformFromAst(result);

  console.log("...newCode", newCode);

  // transform(
  //   code,
  //   {
  //     // ast: true,
  //     filename: "fileEntryPath",
  //     presets: [["@babel/preset-typescript", {}]],
  //     plugins: ["@babel/plugin-transform-runtime"],
  //   },
  //   function (_err, result) {
  //     console.log("...err", _err);
  //     const { code: outputCode } = result || {};
  //     console.log("...outputCode", outputCode);
  //   }
  // );
};

build();
