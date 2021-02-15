import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';

import landingPage from './pages/landingPage';

import axios from 'axios';

const getUserData, settings, signin, signup, promo;

axios.defaults.baseURL = 'https://europe-west1-semi-umfrage.cloudfunctions.net/api'; // LLERZEICHEN!

const token = localStorage.FBAuthToken;

const [ authenticated, setAuthenticated ] = useState(false);

if(token) {
  const decodedToken = tokenDecoder(token);
  if(decodedToken.exp * 100 < Date.now()){
    window.location.href = '/signin';
  } else {
    axios.defaults.headers.common['Authorization'] = token;
    setAuthenticated(true);
    //getUserData();
  }
}

export default () => {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/promo" component={promo}/>
          <Route exact path="/" component={landingPage}/>
          <Route exact path="/signup" component={signup}/>
          <AuthRoute exact path="/signin" component={signin}/>
          <AuthRoute exact path="/settings" component={settings}/>
        </Switch>
      </Router>
    </div>
  );
};
