import { SET_USER, SET_ERRORS, CLEAR_ERRORS, LOADING_UI, SET_UNAUTHENTICATED, LOADING_USER, MARK_NOTIFICATIONS_READ } from '../types';
import axios from 'axios';

export const loginUser = (userData, history) => dispatch => {

    dispatch({ type: LOADING_UI });

    axios.post('/signin', userData)
        .then(response => {

            localStorage.setItem('FBAuthToken', `Bearer ${response.data.token}`);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`; // add token for every axios req in future
            dispatch(getOwnUserData());//     ^ not goddamn 'Autorization'
            dispatch({ type: CLEAR_ERRORS });

            history.push('/'); //redirect to '/'
        })
        .catch(e => {
            dispatch({
                type: SET_ERRORS,
                payload: e.response.data
            })
        });
}

export const signupUser = (userData, history) => dispatch => {

    dispatch({ type: LOADING_UI });

    axios.post('/signup', userData)
        .then(response => {
                //setAuthHeader
            localStorage.setItem('FBAuthToken', `Bearer ${response.data.token}`);
            axios.defaults.headers.common['Autorization'] = `Bearer ${response.data.token}`; // add token for every axios req in future
            dispatch(getOwnUserData());

            dispatch({ type: CLEAR_ERRORS });
            history.push('/'); //redirect to '/'
        })
        .catch(e => {
            dispatch({
                type: SET_ERRORS,
                payload: e.response.data
            })
        });
}

export const logoutUser = () => dispatch => {
    
    localStorage.removeItem('FBAuthToken');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: SET_UNAUTHENTICATED });
}

export const getOwnUserData = () => dispatch => {
    
    dispatch({ type: LOADING_USER });

    axios.get('/user')
        .then(response => {
            dispatch({
                type: SET_USER,
                payload: response.data
            });
        })
        .catch(e => console.log(e));
}

export const uploadImage = data => dispatch => {
    
    dispatch({ type: LOADING_USER});

    axios.post('/user/image', data)
        .then(() => {
            dispatch(getOwnUserData());
        })
        .catch(e => console.log(e));
}

export const editUserDetails = data => dispatch => {

    dispatch({ type: LOADING_USER });

    axios.post('/user', data)
        .then(() => {
            dispatch(getOwnUserData());
        })
        .catch(e => console.log(e));
}

export const markNotificationsRead = notificationIds => dispatch => {
    axios.post('/notifications', notificationIds)
        .then(() => {
            dispatch({ type: MARK_NOTIFICATIONS_READ });
        })
        .catch(e => console.log(e));
}