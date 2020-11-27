/* eslint-disable react/prop-types */
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Dashboard from '../Dashboard/Dashboard';

const ProtectedRoute = ({ component, isAuthorized, getJWT, ...rest }) => {
  console.log('isAuthorized protected route', isAuthorized());
  return (
    <Route
      {...rest}
      render={props => {
        if (isAuthorized() || true) {
          return (
            <Dashboard
              compo={component}
              getJWT={() => getJWT(isAuthorized() || true)}
              {...props}
              {...rest}
            />
          );
        }
      }}
    />
  );
};

export default ProtectedRoute;
