import React, { Fragment } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import { Landing } from "./components/layout/Landing";
import { Navbar } from "./components/layout/nav/Navbar";
import { SignUp } from "./components/auth/SignUp";
import { Login } from "./components/auth/Login";

const App = () => (
  <Router>
    <Fragment>
      <Navbar />
      <section className="container mt-5">
        <Route exact path="/" component={Landing} />
        <Switch>
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/login" component={Login} />
        </Switch>
      </section>
    </Fragment>
  </Router>
);
export default App;
