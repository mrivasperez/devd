import axios from "axios";

const setAuthToken = (token) => {
  // if there is a token, set it as header
  if (token) {
    axios.defaults.headers.common["x-auth-token"] = token;
  } else {
    // if there is no token, ensure there is no token used
    delete axios.defaults.headers.common["x-auth-token"];
  }
};

export default setAuthToken;
