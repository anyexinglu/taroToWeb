import React from "react";
import { navigateTo } from "@tarojs/taro";
import { View, Text, Button } from "@tarojs/components";
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
            url: "/list/index/index",
          });
        }}
      >
        去列表页
      </Button>
    </View>
  );
}
