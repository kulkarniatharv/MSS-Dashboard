import React from 'react';
import Proptypes from 'prop-types';
import './FreeTable.css';

const FreeTable = props => {
  const { tableNo } = props;

  return (
    <>
      <span className="free-table-no">{tableNo}</span>
    </>
  );
};

FreeTable.propTypes = {
  tableNo: Proptypes.string.isRequired,
};

export default FreeTable;
