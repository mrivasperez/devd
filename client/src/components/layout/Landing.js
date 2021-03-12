import React from "react";
import { Link } from "react-router-dom";

export const Landing = () => {
  return (
    <div>
      <h1 className="display-1">Hello, world!</h1>
      <p>
        Create a developer profile, share posts, and get help from other
        developers.
      </p>
      <p className="lead">
        <Link className="btn btn-primary btn-lg m-1" to="/signup" role="button">
          Sign up
        </Link>
        <Link
          className="btn btn-secondary btn-lg m-1"
          to="/login"
          role="button"
        >
          Login
        </Link>
      </p>
    </div>
  );
};
