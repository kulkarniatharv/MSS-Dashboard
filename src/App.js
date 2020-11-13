import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import BookingForm from './components/BookingForm/BookingForm';
import LoginForm from './components/Login/LoginForm';
import ProtectedRoute from './components/Login/ProtectedRoute';
import GuestStatus from './components/GuestStatus/GuestStatus';
import Welcome from './components/Welcome/Welcome';

// TODO:
// * Every route will render dashboard which will take the respective component as the input and display the appropriate component in the content area
// * Create a welcome page and add links in dashboard
// * Create a loading screen

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  // ======= EVENT HANDLERS ========
  const HandleAuthorization = () => {
    setIsAuthorized(true);
  };

  const getAuthorizationStatus = () => isAuthorized;

  const getJWT = authorized => {
    if (authorized) {
      return localStorage.getItem('MSSToken');
    }
    console.log('getJWT failed');
  };

  return (
    <Router>
      <div className="App">
        {/* <NavigationBar brand="MSS" link="#home" /> */}
        <Switch>
          <ProtectedRoute
            exact
            path="/booking"
            component={BookingForm}
            isAuthorized={getAuthorizationStatus}
            getJWT={getJWT}
            hotelid="rutu"
            bookingCode={`MSS${new Date()
              .toLocaleString('en-IE')
              .replace(/\//g, '')
              .replace(/,\s*/g, '')
              .replace(/:/g, '')}`}
          />

          <ProtectedRoute
            exact
            path="/gueststatus"
            component={GuestStatus}
            isAuthorized={getAuthorizationStatus}
            getJWT={getJWT}
            hotelid="rutu"
          />

          <Route
            exact
            path="/login"
            render={props => (
              <LoginForm {...props} HandleAuthorization={HandleAuthorization} />
            )}
          />

          <ProtectedRoute
            exact
            path="/"
            component={Welcome}
            isAuthorized={getAuthorizationStatus}
            getJWT={getJWT}
          />

          <Route path="*" component={() => '404 NOT FOUND'} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
