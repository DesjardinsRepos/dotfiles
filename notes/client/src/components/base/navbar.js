import React, { Component, Fragment } from 'react';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { AppBar, Toolbar, Button } from '@material-ui/core';
import { Home as HomeIcon } from '@material-ui/icons';

import Notifications from '../notifications';
import PostButton from '../postButton';
import WrappedButton from './wrappedButton';
import MenuDialog from './menuDialog';

class Navbar extends Component {

    render() {

        const { authenticated } = this.props;
        return (
            <AppBar>
                <MenuDialog/> 

                <Toolbar className="nav-container">
                    { authenticated ? (
                        <Fragment>
                            <PostButton/>

                            <Link to="/">
                                <WrappedButton title="Home">
                                    <HomeIcon className="nav-icon"/>
                                </WrappedButton>
                            </Link>

                            <Notifications/>
                        </Fragment>
                    ) : (
                        <Fragment>
                            <Button color="inherit" component={Link} to="/signin"> signin </Button>
                            <Button color="inherit" component={Link} to="/"> home </Button>
                            <Button color="inherit" component={Link} to="signup"> signup </Button>
                        </Fragment>
                    )}
                </Toolbar>
            </AppBar>
        )
    }
}

Navbar.propTypes = {
    authenticated: PropTypes.bool.isRequired
}

const mapState = state => ({
    authenticated: state.user.authenticated
})

export default connect(mapState)(Navbar);
