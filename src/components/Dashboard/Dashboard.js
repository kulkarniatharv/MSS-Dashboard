import React, { useState } from 'react';
import './Dashboard.css';
import { Link } from 'react-router-dom';
import BookingForm from '../BookingForm/BookingForm';
import NavigationBar from './NavigationBar/NavigationBar';

// TODO:
// * Use .active class respective to the route
// *

// FIXME:
// * Added booking form temporarily. Fix all the problems faced in styling due to that.

const Dashboard = props => {
  // eslint-disable-next-line react/prop-types
  const { compo: Component, getJWT, ...rest } = props;
  return (
    <div className="layout-container">
      <div className="top-navbar">{/* <NavigationBar /> */}</div>

      <div className="side-navbar">
        <div className="hotel-details">
          <span>Hotel Demo</span>
        </div>

        <div className="menu">
          <div
            className={`${
              rest.location.pathname.match(/booking/i) ? 'active' : ''
            }`}
          >
            <Link
              style={{
                textDecoration: 'none',
                color: 'black',
              }}
              to="/booking"
            >
              <span
                style={{
                  display: 'block',
                }}
              >
                Booking
              </span>
            </Link>
          </div>
          <div
            className={`${
              rest.location.pathname.match(/gueststatus/i) ? 'active' : ''
            }`}
          >
            <Link
              style={{
                textDecoration: 'none',
                color: 'black',
              }}
              to="/gueststatus"
            >
              <span
                style={{
                  display: 'block',
                }}
              >
                Guest Status
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Rendering the component which protectedRoute component forwards */}
      <div className="content">
        <Component getJWT={getJWT} {...rest} />
      </div>
    </div>
  );
};

export default Dashboard;
