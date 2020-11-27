import React from 'react';
import './OccupiedTable.css';
import PropTypes from 'prop-types';

const OccupiedTable = props => {
  const { tableNo, tableGroup, tableAmount, tableTime, sortCol } = props;

  return (
    <>
      <span
        className="table-no"
        style={sortCol === 'Tables' ? { fontWeight: 'bold' } : {}}
      >
        {tableNo}
      </span>
      <span
        className="table-group"
        style={sortCol === 'PosGroup' ? { fontWeight: 'bold' } : {}}
      >
        {tableGroup}
      </span>
      <span
        className="table-amount"
        style={sortCol === 'Amt' ? { fontWeight: 'bold' } : {}}
      >
        {tableAmount}
      </span>
      <span
        className="table-time"
        style={sortCol === 'StartDateTime' ? { fontWeight: 'bold' } : {}}
      >
        {tableTime}
      </span>
    </>
  );
};

OccupiedTable.propTypes = {
  tableNo: PropTypes.string.isRequired,
  tableGroup: PropTypes.string.isRequired,
  tableAmount: PropTypes.string.isRequired,
  tableTime: PropTypes.string.isRequired,
  sortCol: PropTypes.string,
};

export default OccupiedTable;
