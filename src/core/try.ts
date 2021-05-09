import * as recast from "recast";
const { parse: rparse, print } = recast;

// https://sourcegraph.com/github.com/benjamn/recast/-/blob/test/visit.ts

const code = `
import React from "react";
import { navigateTo } from "@tarojs/taro";
import { View, Text, Button } from "@tarojs/components";
import "test";
import Header from "../../components/Header";
import { noop } from "../../utils";
import "./index.scss";

export default function Index(_props: any) {
  const a: number = 1;
  console.log("noop", noop, a);
  return (
    <View className="index">
      <Header />
      <Text>Hello world!xxx</Text>
      <Button
        onClick={() => {
          navigateTo({
            url: "/list/index",
          });
        }}
      >
        去列表页
      </Button>
    </View>
  );
}
`;

const build = async () => {
  const ast = rparse(code, {
    // babel 才认识 ts，内置的 esprima 不支持
    parser: require("recast/parsers/babel"),
  });
  console.log("...ast", ast);

  recast.visit(ast, {
    // visitProgram: (_ctx: any, path: any) => {
    //   treeShake(path.scope);
    // },
    visitImportDeclaration(nodePath) {
      const path = nodePath.value;
      const from = path.source.value;
      const specifiers = path.specifiers || [];

      console.log("...visitImportDeclaration path", from, specifiers);

      if (!specifiers?.length) {
        nodePath.replace(); // replace() 即删除
      }
      return false;
    },
  });

  const { code: outputCode } = print(ast);

  console.log("...newCode", outputCode);
};

build();
