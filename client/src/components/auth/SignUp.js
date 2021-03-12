import React, { useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { setAlert } from "../../actions/alert";
import { register } from "../../actions/auth";
import PropTypes from "prop-types";

const SignUp = ({ setAlert, register, isAuthenticated }) => {
  // set state for registration form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  });

  let { name, email, password, password2 } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setAlert("Your passwords do not match.", "danger");
    } else {
      register({ name, email, password });
    }
  };

  // Redirect if loggedin
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="container">
      <h2>
        {" "}
        <i className="bi bi-person-check"></i> Create your account
      </h2>
      <p className=" mb-2 mt-1">
        <small>
          This site uses Gravatar. If you want a profile image, use an email
          associated with a gravatar.
        </small>
      </p>

      <form className="form" onSubmit={(e) => onSubmit(e)}>
        <div className="form-group row">
          <div className="col-12">
            <label htmlFor="name" className="sr-only">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Name"
              className="form-control"
              value={name}
              onChange={(e) => onChange(e)}
            />
          </div>
        </div>
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
        <div className="form-group">
          <label htmlFor="confirm-password" className="sr-only">
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            minLength="6"
            className="form-control"
            value={password2}
            onChange={(e) => onChange(e)}
            required
          />
        </div>
        <input
          type="submit"
          className="btn btn-primary btn-block"
          value="Sign Up"
        />
      </form>
      <p className="mt-4 pl-1">
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
};

SignUp.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

// use connect to user redux and actions
export default connect(mapStateToProps, { setAlert, register })(SignUp);
