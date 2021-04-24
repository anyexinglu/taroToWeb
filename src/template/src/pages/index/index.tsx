import React from "react";
import { Button } from "antd";
// import "antd/es/Button/style";

import "./index.scss";

console.log("...index");

export default function Index(_props) {
  return (
    <div className="index">
      header
      <Button>这是一个按钮xx</Button>
      <span className="tagText">Hello world!</span>
    </div>
  );
}
