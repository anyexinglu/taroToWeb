import React from "react";
import { View, Text } from "@tarojs/components";
import Header from "../../components/Header";
import { noop } from "../../utils";
import "./index.scss";

export default function Index(_props: any) {
  const a = 1;
  console.log("noop", noop, a);
  return (
    <View className="index">
      <Header />
      <Text>Hello world!</Text>
    </View>
  );
}
