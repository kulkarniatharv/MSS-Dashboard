import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import PropTypes from 'prop-types';
// import './nav_styles.css';

const NavigationBar = props => {
  const { link, brand } = props;
  return (
    <Navbar bg="light" sticky="top">
      <Navbar.Brand href={link}>{brand}</Navbar.Brand>
      {/* <Navbar.Text className="loginText">
        {' '}
        Signed in as: <a href="#login">Mark Otto</a>{' '}
      </Navbar.Text> */}
    </Navbar>
  );
};

NavigationBar.propTypes = {
  brand: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

export default NavigationBar;
