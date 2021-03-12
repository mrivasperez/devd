import React, { Fragment, useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";

// Redux
import store from "./store"; // store
import { loadUser } from "./actions/auth"; // action: AUTH

// Components
import { Landing } from "./components/layout/Landing";
import { Navbar } from "./components/layout/Navbar";
import SignUp from "./components/auth/SignUp";
import Login from "./components/auth/Login";
import Alert from "./components/layout/Alert";

// Utils
import setAuthToken from "./utils/setAuthToken";

// Styles
import "./App.css";

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  // dispath load user to login token in localstorage
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <section className="container mt-5">
            <Route exact path="/" component={Landing} />
            <Alert />
            <Switch>
              <Route exact path="/signup" component={SignUp} />
              <Route exact path="/login" component={Login} />
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  );
};
export default App;
