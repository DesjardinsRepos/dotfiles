const { db, storage, firebase, firebaseConfig } = require('./init.js');
const { validateInput, getUserDetails } = require('./exports.js');


exports.signUp = (request, response) => {

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
    .then( doc => { 

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
                        createdAt: new Date().toISOString(),
                        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
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
                        return response.status(500).json({ general: 'Something went wrong. Please try again.'});
                    }
                });
        }
    });
}

exports.signIn = (request, response) => {

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

exports.uploadImage = (request, response) => { // using busboy from npm 

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
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/ProfilePictures%2F${imageFileName}?alt=media`;
            console.error(imageUrl);
            return db.doc(`/users/${request.user.handle}`).update({ imageUrl });
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

exports.getAuthenticatedUser = (request, response) => {

    let userData = {};

    db.doc(`/users/${request.user.handle}`).get()
        .then(doc => {
            if (doc.exists) {
                userData.credentials = doc.data();
                return db.collection('likes').where('userHandle', '==', request.user.handle).get();
            } // exception handling ???
        })
        .then(data => {
            userData.likes =[];
            data.forEach(doc => {
                userData.likes.push(doc.data());
            });
            return db.collection('notifications').where('recipient', '==', request.user.handle).orderBy('createdAt', 'desc').limit(25).get();
        })
        .then(data => {
            userData.notifications = [];
            data.forEach(doc => {
                userData.notifications.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    createdAt: doc.data().createdAt,
                    postId: doc.data().postId,
                    read: doc.data().read,
                    notificationId: doc.id
                });
            });
            return response.json(userData);
        })
        .catch(e => {
            console.error(e);
            return response.status(500).json({ error: e.code });
        });

}

exports.getPost = (request, response) => {

    let postData = {};
    db.doc(`/posts/${request.params.postId}`).get()
        .then(doc => {

            if(!doc.exists) {
                return response.status(404).json({ error: 'post not found'});
            } else {

                postData = doc.data();
                postData.postId = doc.id;
                db.collection('comments').orderBy('createdAt', 'desc').where('postId', '==', request.params.postId).get()
                    .then(data => {
                        postData.comments = [];
                        data.forEach(doc => {
                            postData.comments.push(doc.data());
                        });
                        return response.json(postData);
                    });
            }
        })
        .catch(e => {
            console.error(e);
            response.status(500).json({ error: e.code });
        });
}

exports.deletePost = (request, response) => {

    const document = db.doc(`posts/${request.params.postId}`);
    document.get()
    .then(doc => {

        if(!doc.exists) {
            return response.status(404).json({ error: 'Post not found'});
        }
        else if(doc.data().userHandle !== request.user.handle) {
            return response.status(403).json({ error: 'Unauthorized'});

        } else {
            document.delete()
            .then(() => {
                return response.json({ message: 'Post deleted succesfully'});
            });
        }
    })
    .catch(e => {
        console.error(e);
        return response.status(500).json({ error: e.code});
    });
}

exports.getUserDetails = (request, response) => {

    let userData = {};

    db.doc(`/users/${request.params.handle}`).get()
    	.then(doc => {

            if(doc.exists) {
                userData.user = doc.data();

                db.collection('posts').where('userHandle', '==', request.params.handle).orderBy('createdAt', 'desc').get()
                    .then(data => {

                        userData.posts = [];
                        data.forEach(doc => {

                            userData.posts.push({
                                body: doc.data().body,
                                createdAt: doc.data().createdAt,
                                userHandle: doc.data().userHandle,
                                userImage: doc.data().userImage,
                                likeCount: doc.data().likeCount,
                                commentCount: doc.data().commentCount,
                                postId: doc.id
                            });
                        });
                        
                    return response.json(userData);
                });

            } else {
                return response.status(404).json({ error: 'User not found'});
            }
        })
        .catch(e => {
            console.error(e);
            return response.status(500).json({ error: e.code});
        });
}