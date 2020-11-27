/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import './GuestStatus.css';
import Button from 'react-bootstrap/Button';
import GuestStatusCard from './GuestStatusCard/GuestStatusCard';
import GuestStatusModal from './GuestStatusModal/GuestStatusModal';

// TODO:
// * Sort the data according to the room number
// * Group by checkout date
// * Show a tab "checking out today" which shows what it says
// * Addon feature can be to let the user decide by what he wants to "group" the data by

const GuestStatus = props => {
  const { location, history, getJWT, hotelid } = props;

  const [guestStatusList, setGuestStatusList] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState(true); // true is normal, false is minimal

  const sendGuestStatusReq = () => {
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
        console.log('Guest List: ', {
          data: {
            orderByCol: null,
            desc: false,
            guests: response.data,
          },
        });

        setGuestStatusList({
          data: {
            orderByCol: null,
            desc: false,
            guests: response.data,
          },
        });
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

  const sortGuestsByCol = col => {
    const order = guestStatusList.data.desc;
    console.log(col);
    setGuestStatusList({
      data: {
        orderByCol: col,
        desc: !guestStatusList.data.desc,
        guests: guestStatusList.data.guests.sort((a, b) => {
          if (a[col] > b[col]) {
            if (!order) {
              return -1;
            }
            return 1;
          }
          if (a[col] < b[col]) {
            if (!order) {
              return 1;
            }
            return -1;
          }
          return 0;
        }),
      },
    });
  };

  useEffect(sendGuestStatusReq, []);

  return (
    <div>
      <h2 style={{ textAlign: 'center', padding: '1em 0' }}>GUEST LIST</h2>

      <div className="guest-status-list">
        {guestStatusList.data === undefined ? (
          'Loading'
        ) : (
          <>
            <Button
              id="changeViewBtn"
              as="input"
              variant="dark"
              type="button"
              onClick={() => setView(!view)}
              value={`Change to ${view ? 'minimal' : 'normal'} view`}
              block
            />
            {guestStatusList.data.guests.map(guest => (
              <div key={guest.RoomNo}>
                <GuestStatusCard
                  name={guest.Name}
                  roomNo={guest.RoomNo}
                  checkOut={guest.CheckOutDate}
                  adult={guest.Adult}
                  child={guest.child}
                  roomRate={guest.RoomRate}
                  onClick={() => setShowModal(true)}
                  sortFunc={sortGuestsByCol}
                  view={view}
                />
                <GuestStatusModal
                  show={showModal}
                  guestDetailsObj={guest}
                  onHide={() => setShowModal(false)}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default GuestStatus;
