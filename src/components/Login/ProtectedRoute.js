/* eslint-disable react/prop-types */
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import auth from './auth';

const ProtectedRoute = ({ component: Component, componentProps, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (auth.isAuthenticated()) {
        return <Component {...props} {...componentProps} />;
      }
      return (
        <Redirect
          to={{
            pathname: '/login',
          }}
        />
      );
    }}
  />
);

export default ProtectedRoute;
