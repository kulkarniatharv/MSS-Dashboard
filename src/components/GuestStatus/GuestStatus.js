/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Axios from 'axios';

// TODO:
// * Think of a way to display the data on the screen.
// * Sort the data according to the room number
// * Group by checkout date
// * Show a tab "checking out today" which shows what it says
// * Addon feature can be to let the user decide by what he wants to "group" the data by

const GuestStatus = props => {
  const { location, history, getJWT, hotelid } = props;

  const [guestStatusList, setGuestStatusList] = useState([]);

  const sendGuestStatusRequest = () => {
    Axios.post(
      'http://hms.multitechsoftsystem.co.in/api/GuestStatus',
      {
        HotelId: hotelid,
      },
      {
        headers: {
          Authorization: `Bearer ${getJWT()}`,
          'Content-Type': 'application/json',
        },
      }
    ).then(
      response => {
        setGuestStatusList(response.data);
        console.log('Guest List: ', response.data);
      },
      error => {
        if (error.response.status === 401) {
          history.push({
            pathname: '/login',
            state: {
              referrer: location.pathname,
            },
          });
        }
        console.log(error.response.status);
      }
    );
  };

  useEffect(sendGuestStatusRequest, []);

  return (
    <div>
      <h2>GUEST LIST</h2>
      <hr />
      {guestStatusList.length === 0
        ? 'Loading'
        : guestStatusList.map(guest => (
            <div>
              {JSON.stringify(guest)} <hr />{' '}
            </div>
          ))}
    </div>
  );
};

export default GuestStatus;
