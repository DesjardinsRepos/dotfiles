import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const authRoute = ({ component: Component, authenticated, ...rest }) => (
    <Route {...rest} render={ props => authenticated 
        ? <Redirect to='/'/>
        : <Component {...props}/>
    }/>
);

const mapState = state => ({
    authenticated: state.user.authenticated
});

authRoute.propTypes = {
    user: PropTypes.object
};

export default connect(mapState)(authRoute);