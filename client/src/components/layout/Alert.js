import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

// descructure props and vars in args
const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map((alert) => (
    <div
      className={`alert alert-dismissible alert-${alert.alertType} mb-5`}
      key={alert.id}
    >
      {/* <button type="button" className="close" data-dismiss="alert">
        &times;
      </button> */}
      <strong>Alert</strong> <br />
      {alert.message}
    </div>
  ));

// map the state in the props
const mapStateToProps = (state) => ({
  alerts: state.alert,
});

Alert.propTypes = {
  alerts: PropTypes.array,
};

// connect Alert and ensure state is in props
export default connect(mapStateToProps)(Alert);
