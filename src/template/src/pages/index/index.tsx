import React from "react";
import Header from "../../components/Header";
import { noop } from "../../utils";
import "./index.scss";
export default function Index(_props) {
  const a = 1;
  console.log("noop", noop, a);
  return (
    <div className="index">
      <Header />
      <span className="tagText">Hello world!</span>
    </div>
  );
}
