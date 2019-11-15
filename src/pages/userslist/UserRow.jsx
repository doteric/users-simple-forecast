import React, { Component } from 'react'

export default class UserRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      editingUser: false,
      userinfo: Object.create(this.props.userinfo)
    }

    this.editUser = this.editUser.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.discardChanges = this.discardChanges.bind(this);
    this.removeUser = this.removeUser.bind(this);
  }

  viewProfile() {
    const email = this.props.userinfo.email;
    this.props.history.push(`/user/${email}`);
  }

  editUser() {
    this.setState({editingUser: true});
  }

  changeUserinfo(where, value) {
    let curState = this.state.userinfo;
    curState[where] = value;
    this.setState({userinfo: curState});
  }

  async saveChanges() {
    console.log("saving");
    const email = this.props.userinfo.email;
    const requestUrl = window.location.protocol+"//"+window.location.hostname+":5000";
    const response = await fetch(requestUrl+"/edituser", {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        curEmail: email,
        newUserinfo: this.state.userinfo
      })
    });
    const data = await response.json();
    if (typeof data.status !== 'undefined') {
      if (data.status === 'nopermission') {
        this.props.history.push('/nopermission');
        return;
      }
      else if (data.status === 'success') {
        document.location.reload();
      }
    }
  }
  discardChanges() {
    this.setState({userinfo: Object.create(this.props.userinfo), editingUser: false});
  }

  async removeUser() {
    const email = this.props.userinfo.email;
    const requestUrl = window.location.protocol+"//"+window.location.hostname+":5000";
    const response = await fetch(requestUrl+"/removeuser", {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email
      })
    });
    const data = await response.json();
    if (typeof data.status !== 'undefined') {
      if (data.status === 'nopermission') {
        this.props.history.push('/nopermission');
        return;
      }
      else if (data.status === 'success') {
        document.location.reload();
      }
    }
  }

  render() {
    if (this.state.editingUser === false) {
      return (
        <tr>
          <td>{this.props.userinfo.firstname}</td>
          <td>{this.props.userinfo.surname}</td>
          <td>{this.props.userinfo.city}</td>
          <td>{this.props.userinfo.country}</td>
          <td>{this.props.userinfo.email}</td>
          <td>
            <a href={"../user/"+this.props.userinfo.email}>
              <button className="waves-effect waves-light btn optionbutton" title="View user">
                <i className="material-icons">account_box</i>
              </button>
            </a>
            <button className="waves-effect waves-light btn orange accent-3 optionbutton" onClick={this.editUser} title="Edit user">
              <i className="material-icons">create</i>
            </button>
            <button className="waves-effect waves-light btn red darken-3 optionbutton" onClick={this.removeUser} title="Remove user">
              <i className="material-icons">remove</i>
            </button>
          </td>
        </tr>
      )
    }
    else if (this.state.editingUser === true) {
      return (
        <tr className="userrow">
          <td>
            <input type="text" value={this.state.userinfo.firstname} onChange={(e) => this.changeUserinfo('firstname', e.target.value)}/>
          </td>
          <td>
            <input type="text" value={this.state.userinfo.surname} onChange={(e) => this.changeUserinfo('surname', e.target.value)}/>
          </td>
          <td>
            <input type="text" value={this.state.userinfo.city} onChange={(e) => this.changeUserinfo('city', e.target.value)}/>
          </td>
          <td>
            <input type="text" value={this.state.userinfo.country} onChange={(e) => this.changeUserinfo('country', e.target.value)}/>
          </td>
          <td>
            <input type="text" value={this.state.userinfo.email} onChange={(e) => this.changeUserinfo('email', e.target.value)}/>
          </td>
          <td>
            <button className="waves-effect waves-light btn green optionbutton" onClick={this.saveChanges}>Save</button>
            <button className="waves-effect waves-light btn red  optionbutton" onClick={this.discardChanges}>Discard</button>
          </td>
        </tr>
      )
    }
  }
}
