import React from "react";
import { Link } from "react-router-dom";

export const Landing = () => {
  return (
    <div>
      <h1 class="display-3">Hello, world!</h1>
      <p>
        Create a developer profile, share posts, and get help from other
        developers.
      </p>
      <p class="lead">
        <Link class="btn btn-primary btn-lg m-1" to="/signup" role="button">
          Sign up
        </Link>
        <Link class="btn btn-secondary btn-lg m-1" to="/login" role="button">
          Login
        </Link>
      </p>
    </div>
  );
};
