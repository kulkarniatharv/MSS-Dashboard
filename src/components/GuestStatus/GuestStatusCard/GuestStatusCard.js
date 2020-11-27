import React from 'react';
import PropTypes from 'prop-types';
import './GuestStatusCard.css';
import Button from 'react-bootstrap/Button';

const GuestStatusCard = props => {
  const {
    name,
    roomNo,
    checkOut,
    adult,
    child,
    roomRate,
    onClick,
    view,
    sortFunc,
  } = props;

  return (
    <div className="guest-status-card">
      <span
        onClick={e => sortFunc(e.target.innerText.replace(':', ''))}
        onKeyPress={onClick}
        tabIndex="-1"
        role="button"
      >
        Name:
      </span>
      <span style={{ gridColumn: '2/-1' }}>
        <strong>{name}</strong>
      </span>

      <span
        onClick={e => sortFunc(e.target.innerText.replace(/\s*:|\s/g, ''))}
        onKeyPress={onClick}
        tabIndex="-1"
        role="button"
      >
        Room No:
      </span>
      <span>
        <strong>{roomNo}</strong>
      </span>

      <span
        onClick={e => sortFunc(e.target.innerText.replace(/\s*:|\s/g, ''))}
        onKeyPress={onClick}
        tabIndex="-1"
        role="button"
      >
        Room Rate:
      </span>
      <span>
        <strong>{roomRate}</strong>
      </span>
      {view ? (
        <>
          <span
            onClick={e =>
              sortFunc(`${e.target.innerText.replace(/\s*:|\s/g, '')}Date`)
            }
            onKeyPress={onClick}
            tabIndex="-1"
            role="button"
          >
            Check Out:
          </span>
          <span style={{ gridColumn: '2/-1' }}>
            <strong>{checkOut}</strong>
          </span>

          <span
            onClick={e => sortFunc(e.target.innerText.replace(/\s*:|\s/g, ''))}
            onKeyPress={onClick}
            tabIndex="-1"
            role="button"
          >
            Adult:
          </span>
          <span>
            <strong>{adult}</strong>
          </span>
          <span>Child:</span>
          <span>
            <strong>{child}</strong>
          </span>
        </>
      ) : null}

      <Button
        as="input"
        variant="light"
        type="button"
        onClick={onClick}
        value="More details"
        style={{ gridColumn: '1/-1' }}
        block
      />
    </div>
  );
};

GuestStatusCard.propTypes = {
  name: PropTypes.string.isRequired,
  roomNo: PropTypes.string.isRequired,
  checkOut: PropTypes.string.isRequired,
  adult: PropTypes.number.isRequired,
  child: PropTypes.number.isRequired,
  roomRate: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  view: PropTypes.bool.isRequired,
  sortFunc: PropTypes.func.isRequired,
};

export default GuestStatusCard;
