const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const firebase = require('firebase');
const app = require('express')();

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://notes-synced.firebaseio.com",
    storageBucket: 'notes-synced.appspot.com'
});

const db = admin.firestore();
const storage = admin.storage();
const firebaseConfig = { 
    apiKey: "AIzaSyADmS0dA7kLROFR0in1K-9m4KB9hOozYuQ", 
    authDomain: "notes-synced.firebaseapp.com", 
    databaseURL: "https://notes-synced.firebaseio.com", 
    projectId: "notes-synced", 
    storageBucket: "notes-syncedo.appspot.com", 
    messagingSenderId: "886652971045", 
    appId: "1:886652971045:web:30a9a78a77d3c6ca4737cc", 
    measurementId: "G-MX1GED61B5" 
};


//firebase.initializeApp(firebaseConfig);

const isEmpty = (string) => {

    if (string.trim() === '') return true;
    else return false;
} 

const isEmail = (email) => {

    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(emailRegEx)) return true; else return false;
}

const FBAuth = (request, response, next) => { //needs to be edited

    let idToken;

    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer ')) {
        idToken = request.headers.authorization.split('Bearer ')[1];

    } else {
        console.error('No token found');
        return response.status(403).json({error: 'Unauthorized'});
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => { 
            request.user = decodedToken;
            return db.collection('users').where('userId', '==', request.user.uid).limit(1).get();
        })
        .then(data => {
            request.user.handle = data.docs[0].data().handle; // data() extracts data from doc[]
            request.user.image = data.docs[0].data().image;
            request.user.notes = data.docs[0].data().notes;
            request.user.email = data.docs[0].data().email;
            return next();
        })
        .catch(e => {
            console.error('Error while verifying token ', e);
            response.status(403).json(e);
        });
}

const cors = require('cors');
const { request } = require('express');
app.use(cors());

// const pushData, checkForUpdate;


const validateInput = (user, type) => {

    let exceptions = {};

    if (type === 'signUp') {

        if (isEmpty(user.email)) exceptions.email = 'Email must not be empty.';
        else if (!isEmail(user.email)) exceptions.email = 'Must be a valid email adress.';

        if (isEmpty(user.password)) exceptions.password = 'Password must not be empty.';
        if (isEmpty(user.confirmPassword)) exceptions.confirmPassword = 'This field must not be empty.';
        else if (user.password !== user.confirmPassword) exceptions.confirmPassword = 'Passwords are not the same.';


        if (isEmpty(user.handle)) exceptions.handle = 'Username must not be empty.';

        return {
            exceptions,
            valid: Object.keys(exceptions).length === 0 ? true : false
        }
    }
    else if (type === 'signIn') {

        if(isEmpty(user.email)) exceptions.email = 'Email must not be empty.';
        if(isEmpty(user.password)) exceptions.password = 'Password must not be empty.';

        return {
            exceptions,
            valid: Object.keys(exceptions).length === 0 ? true : false
        }
    }
}

const signUp = (request, response) => { // working

    const newUser = {
        email: request.body.email,
        password: request.body.password,
        confirmPassword: request.body.confirmPassword,
        handle: request.body.handle
    }
    
    let { valid, exceptions } = validateInput(newUser, 'signUp');
    if(!valid) return response.status(400).json(exceptions);

    const noImg = 'defaultProfilePicture.png'
    let userId;

    db.doc(`/users/${newUser.handle}`).get()
    .then(doc => { 

        if (doc.exists) {
            return response.status(400).json({handle: 'this handle is already taken'});

        } else {
            firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password)
                .then(data => { // WHEN RETURNING HANDLE IN USE THIS IS PERFORMED ANYWAY
                    userId = data.user.uid;
                    return data.user.getIdToken();
                })
                .then (token => { 
                    const userCredentials = {
                        handle: newUser.handle,
                        email: newUser.email,
                        notes: "",
                        image: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
                        userId
                    };
                    db.doc(`/users/${newUser.handle}`).set(userCredentials);

                    return response.status(201).json({ token });
                })
                .catch(e => {

                    console.error(e);

                    if (e.code === 'auth/email-already-in-use') {
                        return response.status(400).json({email: 'Email is already in use' });

                    } else {
                        return response.status(500).json({ general: `Something went wrong. ${e} was thrown.` });
                    }
                });
        }
    });
}

const signIn = (request, response) => { // working

    const user = {
        email: request.body.email,
        password: request.body.password
    }

    let { valid, exceptions } = validateInput(user, 'signIn');
    if(!valid) return response.status(400).json(exceptions);
	
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return response.json({ token });
        })
        .catch(e => {
            console.error(e);
            if(e.code == 'auth/invalid-email') return response.status(403).json({ email: 'This seems to be an invalid email, please try again.'});
            if(e.code == 'auth/user-not-found') return response.status(403).json({ email: 'An Account with this email does not exist.'});
            return response.status(403).json({ password: 'Wrong password, please try again.'});
        });
}

const uploadImage = (request, response) => {

    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busBoy = new BusBoy({ headers: request.headers });
    
    let imageFileName;
    let imageHolder = {};

    busBoy.on('file', (fieldname, file, filename, encoding, mimetype) => {

        if(!mimetype.includes('image')) return response.status(400).json({error: 'wrong file type submitted'});
        
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(Math.random()*100000000000)}.${imageExtension}`; 
        //+ check if name is valid
        const filepath = path.join(os.tmpdir(), imageFileName);

        imageHolder = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath)); // create file
    });

    busBoy.on('finish', () => {        
        storage.bucket().upload(imageHolder.filepath, {
            resumable: false, 
            destination: `ProfilePictures/${imageFileName}`,
            metadata: {
                metadata: {
                    firebaseStorageDownloadTokens: Math.round(Math.random()*100000000000),
                    contentType: imageHolder.mimetype
                }
            }
        })
        .then(() => {
            console.log(imageFileName);
            const image = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/ProfilePictures%2F${imageFileName}?alt=media`;
            console.error(image);
            return db.doc(`/users/${request.user.handle}`).update({ image });
        })
        .then(() => {
            return response.json({ message: 'Image uploaded succesfully' });
        })
        .catch(e => {
            console.error(e);
            return response.status(500).json({ error: e.code });
        });
    });

    busBoy.end(request.rawBody);
}

const deleteAccount = (request, response) => {

    var user = request.user;

    user.delete().then(function() {
    // User deleted.
    }).catch(function(error) {
    console.error(error)
    });

/*
    document = db.doc(`/users/${request.user.handle}`);
    document.get()
        .then(doc => {
            if(!doc.exists) {
                return response.status(404).json({ error: 'User not found'});
            }
            else if(doc.data().handle !== request.user.handle) {
                return response.status(403).json({ error: 'Unauthorized'});
    
            } else {

                document.delete().then(() => {
                    return response.json({ message: 'Account deleted succesfully'});
                });
            }
        })
        .catch(e => {
            console.error(e);
            return response.status(500).json({ error: e.code});
        });*/
}

const pullData = (request, response) => { // working

    db.doc(`/users/${request.user.handle}`).get()
        .then(doc => {
            return response.status(201).json(JSON.stringify(doc.data().notes));
        })
        .catch(e => {
            console.error(e);
            return response.status(500).json({ error: e.code });
        });
}

const update = (request, response) => {
    db.doc(`/users/${request.user.handle}`).update({ notes: "new notes" })
        .then(() => {
            return response.status(200)
        }).catch(e => {
            console.error(e);
        })
}

app.post('/signup', signUp);
app.post('/signin', signIn);
app.delete('/deleteAccount/:accId', FBAuth, deleteAccount);

//app.post('/checkForUpdate', FBAuth, checkForUpdate);
app.post('/pullData', FBAuth, pullData);
app.post('/update', FBAuth, update);
app.post('/uploadImage', FBAuth, uploadImage);


exports.api = functions.region('europe-west1').https.onRequest(app);
