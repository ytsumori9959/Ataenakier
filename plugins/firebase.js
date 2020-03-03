import firebase from 'firebase'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyAa4WRCIXR9mYk0bMtsO84KBGrrXjhA-cs',
    authDomain: 'ataenakier.firebaseapp.com',
    databaseURL: 'https://ataenakier.firebaseio.com',
    projectId: 'ataenakier',
    storageBucket: 'gs://ataenakier.appspot.com/',
    messagingSenderId: ''
  })
}

export default firebase
