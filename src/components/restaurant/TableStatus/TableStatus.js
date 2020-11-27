import React, { useRef, useState, useEffect } from 'react';
import './TableStatus.css';
import Button from 'react-bootstrap/Button';
import OccupiedTable from './OccupiedTable/OccupiedTable';
import FreeTable from './FreeTable/FreeTable';

// TODO:
// * Create a switch view button to toggle between the separate and combined view
// * Create a reload button which will fetch everything again
// * Create a sorter function which will toggle sort according to the clicked col

const timeSince = date => {
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / 31536000;

  if (interval > 1) {
    return `${Math.floor(interval)}y`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return `${Math.floor(interval)}mo`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return `${Math.floor(interval)}d`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return `${Math.floor(interval)}h`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return `${Math.floor(interval)}m`;
  }
  return `Just Now`;
};

const TableStatus = () => {
  const [VoucGrps, setVoucGrps] = useState([]);
  const [currentGrp, setCurrentGrp] = useState(''); // VoucType = group in this variable
  const [tables, setTables] = useState({});
  const [isLoading, setLoading] = useState(false);

  const tableView = useRef(null);

  const changeView = () => {
    console.log(tableView.current.style.backgroundColor);
  };

  const getVoucGrps = () => {
    const url = 'http://pos.multitechsoftsystem.co.in/api/getPOS';
    const param = { DateValue: '', OName: 'Eiffel`s Majestic Lounge | Bar' };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/json; charset=UTF-8',
      },
      body: JSON.stringify(param),
      mode: 'cors',
    })
      .then(response => response.json())
      .then(json => {
        setVoucGrps(json);
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  const sendAJAX = clickedGroup => {
    const url = 'http://pos.multitechsoftsystem.co.in/api/GetTablesTimeAmt';
    const param = {
      VoucType: clickedGroup,
      MakeDirectBill: '0',
      Reserved: '0',
      StatusRequest: '100',
    };
    console.log('Param: ', param);

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/json; charset=UTF-8',
      },
      body: JSON.stringify(param),
      mode: 'cors',
    })
      .then(response => response.json())
      .then(data => {
        if (tables[data[0].VoucType] !== undefined) {
          setTables({
            ...tables,
            [data[0].VoucType]: {
              orderByCol:
                tables[data[0].VoucType].orderByCol !== null
                  ? tables[data[0].VoucType].orderByCol
                  : null,
              desc: !!tables[data[0].VoucType].desc,
              data,
            },
          });
        } else {
          setTables({
            ...tables,
            [data[0].VoucType]: {
              orderByCol: null,
              desc: false,
              data,
            },
          });
        }

        setLoading(false);
      })
      .catch(function(error) {
        console.log(error);
        setLoading(false);
      });
  };

  const handleClick = VoucType => {
    sendAJAX(VoucType);
    setCurrentGrp(VoucType);
    setLoading(true);
  };

  const sortTablesByCol = col => {
    const order = tables[currentGrp].desc;

    setTables({
      ...tables,
      [currentGrp]: {
        orderByCol: col,
        desc: !tables[currentGrp].desc,
        data: tables[currentGrp].data.sort((a, b) => {
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

  useEffect(getVoucGrps, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('In setTimeout ');
      if (currentGrp !== '' || null) {
        console.log('in if condition');
        sendAJAX(currentGrp);
      }
    }, 300000);
    return () => clearTimeout(timer);
  });

  return (
    <>
      {VoucGrps.length !== 0 ? (
        <div className="tableStatus-container">
          {/* Voucher Groups section */}
          <div className="vouc-grp">
            {VoucGrps.map(group => (
              <div key={`${group.VoucOrder}`}>
                <Button
                  as="input"
                  variant={
                    currentGrp === group.VoucType ? 'dark' : 'outline-dark'
                  }
                  type="button"
                  onClick={() => handleClick(group.VoucType)}
                  value={`${group.VoucDesc}`}
                  disabled={isLoading}
                  style={{ fontWeight: 'bolder', borderRadius: '20px' }}
                  block
                />
              </div>
            ))}
          </div>

          {/* Occupied tables section */}
          <div className="occupied-tables">
            {tables[currentGrp] && !isLoading ? (
              <div>
                <h2>Occupied Tables</h2>
                <span
                  onClick={() => sortTablesByCol('Tables')}
                  role="button"
                  tabIndex="-1"
                  onKeyPress={() => sortTablesByCol('Tables')}
                  style={
                    tables[currentGrp].orderByCol === 'Tables'
                      ? { color: '#637EE9' }
                      : {}
                  }
                >
                  <strong>Table</strong>
                </span>
                <span
                  style={
                    tables[currentGrp].orderByCol === 'PosGroup'
                      ? { color: '#637EE9' }
                      : {}
                  }
                  onClick={() => sortTablesByCol('PosGroup')}
                  role="button"
                  tabIndex="-1"
                  onKeyPress={() => sortTablesByCol('PosGroup')}
                >
                  <strong>Voucher Group</strong>
                </span>
                <span
                  style={
                    tables[currentGrp].orderByCol === 'Amt'
                      ? { color: '#637EE9' }
                      : {}
                  }
                  onClick={() => sortTablesByCol('Amt')}
                  role="button"
                  tabIndex="-1"
                  onKeyPress={() => sortTablesByCol('Amt')}
                >
                  <strong>Amount</strong>
                </span>
                <span
                  style={
                    tables[currentGrp].orderByCol === 'StartDateTime'
                      ? { color: '#637EE9' }
                      : {}
                  }
                  onClick={() => sortTablesByCol('StartDateTime')}
                  role="button"
                  tabIndex="-1"
                  onKeyPress={() => sortTablesByCol('StartDateTime')}
                >
                  <strong>Time</strong>
                </span>
                {tables[currentGrp].data.map(table => {
                  if (table.RunningTable === 1 || table.RunningTable === 3) {
                    return (
                      <div key={`${table.Tables}`}>
                        <OccupiedTable
                          tableNo={table.Tables}
                          tableGroup={table.PosGroup}
                          tableAmount={table.Amt}
                          tableTime={timeSince(new Date(table.StartDateTime))}
                          sortCol={tables[currentGrp].orderByCol}
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ) : (
              <div>
                <span
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                  }}
                >
                  Click on the group to see the table details.
                </span>
              </div>
            )}
          </div>

          {/* Free table section */}
          <div className="free-tables">
            {tables[currentGrp] && !isLoading ? (
              <div>
                <h2>Free Tables</h2>
                {tables[currentGrp].data.map(table => {
                  if (table.RunningTable === 0) {
                    return (
                      <FreeTable
                        key={`${table.Tables}`}
                        tableNo={table.Tables}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            ) : (
              <div>
                <span
                  style={{
                    gridColumn: '1 / -1',
                    textAlign: 'center',
                  }}
                >
                  Click on the group to see the table details.
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>Loading…</div>
      )}
    </>
  );
};

export default TableStatus;
