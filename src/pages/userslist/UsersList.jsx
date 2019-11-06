import React, { Component } from 'react';
import './userslist.css';
import AddingUser from './AddingUser';

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

  viewProfile(email) {
    this.props.history.push(`/user/${email}`);
  }

  addNewUser() {
    this.setState({
      curAddingUser: true
    })
  }

  async removeUser(email) {
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
    console.log(data);
    if (typeof data.status !== 'undefined') {
      if (data.status === 'nopermission') {
        this.props.history.push('/nopermission');
        return;
      }
      else if (data.status === 'success') {
        const users = this.state.users;
        const wantedIndex = users.findIndex((value) => {
          return value.email === email;
        });
        users.splice(wantedIndex, 1);
        this.setState({users: users});
      }
    }
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
                    <tr key={i}>
                      <td>{object.firstname}</td>
                      <td>{object.surname}</td>
                      <td>{object.city}</td>
                      <td>{object.country}</td>
                      <td>{object.email}</td>
                      <td>
                        <a href={"../user/"+object.email}>
                          <button className="waves-effect waves-light btn optionbutton" title="View user">
                            <i className="material-icons">account_box</i>
                          </button>
                        </a>
                        <button className="waves-effect waves-light btn orange accent-3 optionbutton" title="Edit user">
                          <i className="material-icons">create</i>
                        </button>
                        <button className="waves-effect waves-light btn red darken-3 optionbutton" onClick={() => this.removeUser(object.email)} title="Remove user">
                          <i className="material-icons">remove</i>
                        </button>
                      </td>
                    </tr>
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
