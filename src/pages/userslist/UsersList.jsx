import React, { Component } from 'react';
import './userslist.css';
import AddingUser from './AddingUser';
import UserRow from "./UserRow";

export default class UsersList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      curAddingUser: false
    }

    this.addNewUser = this.addNewUser.bind(this);
  }

  async componentDidMount() {
    const requestUrl = window.location.protocol+"//"+window.location.hostname+":5000";
    const response = await fetch(requestUrl+"/getuserlist", {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    const data = await response.json();
    if (typeof data.status !== 'undefined' && data.status === 'nopermission') {
      this.props.history.push('/nopermission');
      return;
    }
    this.setState({users: data.userlist});
  }

  addNewUser() {
    this.setState({
      curAddingUser: true
    })
  }

  render() {
    let addingUserBox = '';
    if (this.state.curAddingUser === true) {
      addingUserBox = <AddingUser/>
    }

    return (
      <div className="usersholder">
        <div className="usersbox">
          <table className="striped centered">
            <thead>
              <tr>
                  <th>Imię</th>
                  <th>Nazwisko</th>
                  <th>Miasto</th>
                  <th>Kraj</th>
                  <th>Email</th>
                  <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.users.map((object, i) => {
                  return (
                    <UserRow key={i} userinfo={object}/>
                  )
                })
              }
            </tbody>
          </table>
        </div>
        <button className="adduserbutton btn-floating btn-large waves-effect waves-light green" onClick={this.addNewUser}>
          <i className="material-icons">add</i>
        </button>
        {addingUserBox}
      </div>
    )
  }
}
