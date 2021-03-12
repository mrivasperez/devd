import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { login } from "../../actions/auth";

export const Login = ({ login, isAuthenticated }) => {
  // set state for registration form
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  let { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    login(email, password);
  };

  // Redirect if loggedin
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="container">
      <h2>
        {" "}
        <i className="bi bi-door-open"></i> Log in to your Account
      </h2>

      <form className="form" onSubmit={(e) => onSubmit(e)}>
        <div className="form-group row">
          <div className="col-12">
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              type="email"
              placeholder="Email Address"
              name="email"
              className="form-control"
              value={email}
              onChange={(e) => onChange(e)}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            minLength="6"
            className="form-control"
            value={password}
            onChange={(e) => onChange(e)}
            required
          />
        </div>

        <input
          type="submit"
          className="btn btn-primary btn-block"
          value="Log In"
        />
      </form>
      <p className="mt-4 pl-1">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

Login.propTypes = {
  login: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { login })(Login);
