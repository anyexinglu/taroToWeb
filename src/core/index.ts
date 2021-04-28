import { transform } from "@babel/core";

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
  transform(
    code,
    {
      // ast: true,
      filename: "fileEntryPath",
      presets: ["@babel/preset-typescript"],
      plugins: ["@babel/plugin-transform-runtime"],
    },
    function (_err, result) {
      console.log("...err", _err);
      const { code: outputCode } = result || {};
      console.log("...outputCode", outputCode);
    }
  );
};

build();
