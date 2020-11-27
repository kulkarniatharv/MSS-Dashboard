import React, { useState, Suspense } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

const BookingForm = React.lazy(() =>
  import('./components/BookingForm/BookingForm')
);
const LoginForm = React.lazy(() => import('./components/Login/LoginForm'));
const ProtectedRoute = React.lazy(() =>
  import('./components/Login/ProtectedRoute')
);
const GuestStatus = React.lazy(() =>
  import('./components/GuestStatus/GuestStatus')
);
const Welcome = React.lazy(() => import('./components/Welcome/Welcome'));
const TableStatus = React.lazy(() =>
  import('./components/restaurant/TableStatus/TableStatus')
);

// TODO:
// * Protected Route is disabled and redirect statement is removed, add it from zweeter's files
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
        <Suspense fallback={<div>Loading...</div>}>
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

            <ProtectedRoute
              exact
              path="/tablestatus"
              component={TableStatus}
              isAuthorized={getAuthorizationStatus}
              getJWT={getJWT}
            />

            <Route
              exact
              path="/login"
              render={props => (
                <LoginForm
                  {...props}
                  HandleAuthorization={HandleAuthorization}
                />
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
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
