import axios from "axios";

import setAuthToken from "../utils/setAuthToken";
import { setAlert } from "./alert";

import {
  REGISTER_FAIL,
  REGISTER_SUCCESS,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
} from "./types";

// LOAD A USER
export const loadUser = () => async (dispatch) => {
  // send token in local storage
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  // load user
  try {
    const res = await axios.get("/api/auth");
    // dispath loaded event
    dispatch({ type: USER_LOADED, payload: res.data });
  } catch (error) {
    dispatch({ type: AUTH_ERROR });
  }
};

// REGISTER A USER
export const register = ({ name, email, password }) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify({ name, email, password });

  try {
    const res = await axios.post("/api/users", body, config);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    const errors = error.response.data.errors;
    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.message, "danger")));
    }

    dispatch({ type: REGISTER_FAIL });
    dispatch(loadUser);
  }
};

// LOGIN A USER
export const login = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const body = JSON.stringify({ email, password });

  try {
    const res = await axios.post("/api/auth", body, config);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });

    dispatch(loadUser);
  } catch (error) {
    const errors = error.response.data.errors;

    if (errors) {
      errors.forEach((error) => dispatch(setAlert(error.message, "danger")));
    }

    dispatch({ type: LOGIN_FAIL });
  }
};
