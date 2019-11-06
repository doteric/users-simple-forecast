import React, { Component } from 'react';
import './nopermission.css';

export default class NoPermission extends Component {
  render() {
    return (
      <div className="centerholder">
        <div className="card-panel">
          <h2>Access Denied</h2>
          <p>You do not have access to this page. Please make sure you are logged in.</p>
          <a href="/" className="waves-effect waves-light btn-large grey darken-4">Login Page</a>
        </div>
      </div>
    )
  }
}
