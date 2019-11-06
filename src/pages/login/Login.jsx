import React, { Component } from 'react';
import './login.css';

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      login: '',
      password: '',
      inputClass: 'validate'
    }

    this.login = this.login.bind(this);
  }

  async componentDidMount() {
    // Check if user logged in.
    const requestUrl = window.location.protocol+"//"+window.location.hostname+":5000";
    const response = await fetch(requestUrl+"/auth/checklogin", {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (data.loggedin === true) {
      this.props.history.push(`/user/${data.email}`);
    }
  }

  changeValue(where, value) {
    let curState = this.state;
    curState[where] = value;
    this.setState({curState});
  }

  async login(event) {
    event.preventDefault();
    const login = this.state.login;
    //sessionStorage
    const requestUrl = window.location.protocol+"//"+window.location.hostname+":5000";
    const response = await fetch(requestUrl+"/auth/login", {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        login: this.state.login,
        password: this.state.password,
      })
    });
    this.setState({
      login: '',
      password: ''
    })
    const data = await response.json();
    if (data.status === "fail") {
      this.setState({
        inputClass: "invalid"
      });
      setTimeout(() => {
        this.setState({
          inputClass: "validate"
        });
      }, 3000);
    }
    else {
      this.props.history.push(`/user/${login}`);
    }
  }

  render() {
    return (
      <div>
        <form className="loginbox" onSubmit={this.login}>
          <div className="row">
            <div className="input-field col s12">
              <input id="login" type="email" className={this.state.inputClass} value={this.state.login} onChange={e => this.changeValue('login', e.target.value)} required />
              <label htmlFor="login">Login (email)</label>
            </div>
            <div className="input-field col s12">
              <input id="password" type="password" className={this.state.inputClass} value={this.state.password} onChange={e => this.changeValue('password', e.target.value)} required />
              <label htmlFor="password">Password</label>
            </div>
            <div className="input-field col s12">
              <button className="waves-effect waves-light btn-large">Login</button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
