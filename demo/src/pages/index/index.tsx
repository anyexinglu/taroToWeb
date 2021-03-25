import React from "react";
import { View, Text } from "@tarojs/components";
import Header from "../../components/Header";
import "./index.scss";

export default function Index() {
  return (
    <View className="index">
      <Header />
      <Text>Hello world!</Text>
    </View>
  );
}
