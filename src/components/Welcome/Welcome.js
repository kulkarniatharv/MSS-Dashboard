import React from 'react';
import './Welcome.css';
import { ReactComponent as WelcomeLogo } from '../../assets/illustrations/welcome/undraw_creative_team_r90h.svg';
import { ReactComponent as WelcomeLogoSmaller } from '../../assets/illustrations/welcome/undraw_welcome_cats_thqn.svg';

const Welcome = () => (
  <div className="welcome-container">
    <div className="welcome-text">
      <h2>Welcome to</h2>
      <h1>MSS Dashboard</h1>
    </div>

    {/* <div className="welcome-logo">
    </div> */}
    <WelcomeLogo id="biggerScreen" />

    <WelcomeLogoSmaller id="smallerScreen" />

    <div className="contact-text">
      Contact <br />
      <span>Prashant Kulkarni</span>
      <br />
      for details on more products.
    </div>
  </div>
);

export default Welcome;
