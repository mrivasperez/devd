import { v4 as uuid } from "uuid";
import { REMOVE_ALERT, SET_ALERT } from "./types";

export const setAlert = (message, alertType, timeout = 5000) => (dispatch) => {
  // create id for alert
  const id = uuid();

  // dispatch event
  dispatch({
    type: SET_ALERT,
    payload: { message, alertType, id },
  });

  // remove alert after timeout
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
