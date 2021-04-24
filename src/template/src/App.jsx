import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "./App.css";
import routes from "./routes";
console.log("...routes", routes);

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <Router>
        <Switch>
          {routes.map((item) => {
            return <Route {...item} />;
          })}
        </Switch>
      </Router>
    </div>
  );
}

export default App;
