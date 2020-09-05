import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import './style.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar/NavigationBar';
// import BookingForm from './components/bookingForm/bookingForm';
import RoomDetails from './components/bookingForm/RoomDetails';
import LoginForm from './components/Login/LoginForm';
import ProtectedRoute from './components/Login/ProtectedRoute';

function App() {
  return (
    <Router>
      <NavigationBar brand="MSS" link="#home" />
      {/* <BookingForm /> */}
      <Switch>
        <ProtectedRoute
          exact
          path="/booking"
          component={RoomDetails}
          componentProps={{
            hotelid: 'rutu',
            bookingCode: `MSS${new Date()
              .toLocaleString('en-IE')
              .replace(/\//g, '')
              .replace(/,\s*/g, '')
              .replace(/:/g, '')}`,
          }}
        />

        <Route exact path="/login" component={LoginForm} />

        <Route path="*" component={() => '404 NOT FOUND'} />
      </Switch>
    </Router>
  );
}

export default App;
