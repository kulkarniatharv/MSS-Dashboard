import axios from 'axios';

// TODO:
// change the data that is sent with login

class Auth {
  constructor() {
    this.authenticated = false;
  }

  login(data) {
    const reqBody = `username=${data.username}&password=${
      data.password
    }&grant_type=password`;

    console.log(reqBody);

    return axios
      .post('http://192.168.0.95:8020/token', reqBody)
      .then(res => {
        localStorage.setItem('MSSToken', res.data.token);

        this.authenticated = true;
        return localStorage.getItem('MSSToken');
      })
      .catch(err => console.log(err));
  }

  // signup(data) {
  //   return axios
  //     .post('/user/signup', data)
  //     .then(res => {
  //       localStorage.setItem('MSSToken', res.data.token);
  //       this.authenticated = true;
  //       return localStorage.getItem('MSSToken');
  //     })
  //     .catch(err => console.log(err));
  // }

  getJWT() {
    if (this.authenticated) {
      return localStorage.getItem('MSSToken');
    }
    console.log('getJWT() failed');
  }

  isAuthenticated() {
    return this.authenticated;
  }
}

export default new Auth();
