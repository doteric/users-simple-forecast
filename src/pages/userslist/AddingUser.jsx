import React, { Component } from 'react';

export default class AddingUser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userinfo: {
        firstname: '',
        surname: '',
        city: '',
        country: '',
        email: ''
      }
    }

    this.confirmAddUser = this.confirmAddUser.bind(this);
  }

  changeValue(where, value) {
    let curState = this.state.userinfo;
    curState[where] = value;
    this.setState({userinfo:curState});
  }

  async confirmAddUser(event) {
    event.preventDefault();
    const userinfo = this.state.userinfo;
    let allFilled = true;
    for (const key in userinfo) {
      if (userinfo.hasOwnProperty(key)) {
        const element = userinfo[key];
        if (element === '') {
          allFilled = false;
          break;
        }
      }
    }
    if (allFilled === true) {
      const requestUrl = window.location.protocol+"//"+window.location.hostname+":5000";
      const response = await fetch(requestUrl+"/addnewuser", {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userinfo: userinfo
        })
      });
      const data = await response.json();
      if (typeof data.status !== 'undefined') {
        if (data.status === 'nopermission') {
          this.props.history.push('/nopermission');
          return;
        }
        else if (data.status === 'success') {
          window.location.reload();
        }
      }
    }
    this.setState({userinfo: {
      firstname: '',
      surname: '',
      city: '',
      country: '',
      email: ''
    }});
  }

  render() {
    return (
      <div className="adduserholder">
        <div className="boxtopcorner"></div>
        <form className="adduserbox" onSubmit={this.confirmAddUser}>
          <div className="input-field col s12">
            <input id="firstname" type="text" className='validate' value={this.state.userinfo.firstname} onChange={e => this.changeValue('firstname', e.target.value)} required />
            <label htmlFor="firstname">Imię</label>
          </div>
          <div className="input-field col s12">
            <input id="surname" type="text" className='validate' value={this.state.userinfo.surname} onChange={e => this.changeValue('surname', e.target.value)} required />
            <label htmlFor="surname">Nazwisko</label>
          </div>
          <div className="input-field col s12">
            <input id="city" type="text" className='validate' value={this.state.userinfo.city} onChange={e => this.changeValue('city', e.target.value)} required />
            <label htmlFor="city">Miasto</label>
          </div>
          <div className="input-field col s12">
            <input id="country" type="text" className='validate' value={this.state.userinfo.country} onChange={e => this.changeValue('country', e.target.value)} required />
            <label htmlFor="country">Kraj</label>
          </div>
          <div className="input-field col s12">
            <input id="email" type="email" className='validate' value={this.state.userinfo.email} onChange={e => this.changeValue('email', e.target.value)} required />
            <label htmlFor="email">Login (email)</label>
          </div>
          <div className="input-field col s12">
            <button className="waves-effect waves-light btn">Dodaj</button>
          </div>
        </form>
      </div>
    )
  }
}
