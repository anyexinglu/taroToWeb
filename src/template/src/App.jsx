import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css";
// import "antd/es/style/index.css";

import routes from "./routes";
console.log("...routes", routes);

function App() {
  const [count, setCount] = useState(0);
  console.log("...render App");

  return (
    <div className="App">
      <Router>
        <Switch>
          {routes.map((item) => {
            return <Route key={item.path} {...item} />;
          })}
        </Switch>
      </Router>
    </div>
  );
}

export default App;
