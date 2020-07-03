import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import './style.css';
import NavigationBar from './components/NavigationBar/NavigationBar';
// import BookingForm from './components/bookingForm/bookingForm';
import RoomDetailsNew from './components/bookingForm/RoomDetailsNew';

function App() {
  return (
    <div>
      <NavigationBar brand="MSS" link="#home" />
      {/* <BookingForm /> */}
      <RoomDetailsNew />
    </div>
  );
}

export default App;
