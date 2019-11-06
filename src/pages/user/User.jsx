import React, { Component } from 'react';
import './user.css';

export default class Users extends Component {
  constructor(props) {
    super(props);

    this.state = {
      userinfo: {},
      today: {},
      days: []
    }
  }

  async componentDidMount() {
    const userEmail = this.props.match.params.email;
    const requestUrl = window.location.protocol+"//"+window.location.hostname+":5000";
    const responseUserinfo = await fetch(requestUrl+"/getuserinfo/"+userEmail, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    const dataUserinfo = await responseUserinfo.json();
    if (typeof dataUserinfo.status !== 'undefined' && dataUserinfo.status === 'nopermission') {
      this.props.history.push('/nopermission');
      return;
    }
    this.setState({ userinfo: dataUserinfo });

    const location = dataUserinfo.city+", "+dataUserinfo.country;
    const response = await fetch(requestUrl+"/getlocationdata/"+location, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    let data = await response.json();
    data = data.data;
    if (typeof data.forecasts === "undefined") {
      console.log("Error loading forecasts.");
    }
    else {
      const timeNow = new Date();
      this.setState({
        today: {
          templow: this.fahrenheitToCelsius(data.forecasts[0].low),
          temphigh: this.fahrenheitToCelsius(data.forecasts[0].high),
          humidity: data.current_observation.atmosphere.humidity,
          date: timeNow.getDate()+"."+timeNow.getMonth()+"."+timeNow.getFullYear()
        }
      });

      timeNow.setDate(timeNow.getDate()+1);
      let curDay = timeNow.getDay();
      const dayName = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
      const days = [];
      for (let i = 1; i < 7; i++) {
        const newTime = new Date()
        newTime.setDate(timeNow.getDate()+i);
        days.push({
          name: dayName[curDay],
          templow: this.fahrenheitToCelsius(data.forecasts[i].low),
          temphigh: this.fahrenheitToCelsius(data.forecasts[i].high),
          date: newTime.getDate()+"."+newTime.getMonth()+"."+newTime.getFullYear()
        });
        curDay++;
        if (curDay > 6) {
          curDay = 0;
        }
      }

      this.setState({ days });
    }
  }

  fahrenheitToCelsius(fahrenheit) {
    return Math.round((fahrenheit - 32) * 5/9);
  }

  render() {
    return (
      <div className="userholder">
        <div className="userbox">
          <div className="top">
            <div className="col">
              <a href="../users">
                <button className="waves-effect waves-light btn optionbutton">
                  <i className="material-icons">keyboard_arrow_left</i>
                </button>
              </a>
            </div>
            <div className="col fillspace">
              <div className="username">{this.state.userinfo.firstname} {this.state.userinfo.surname}</div>
              <div className="userlocation">{this.state.userinfo.city}, {this.state.userinfo.country}</div>
            </div>
          </div>
        </div>
        <div className="userbox">
          <div className="main">
            <div className="todayhead">Dziś ({this.state.today.date})</div>
            <div className="todayrow">
              <div className="col">
                <div className="colhead">Temperatura</div>
                <div className="colcontent">{this.state.today.templow}°C - {this.state.today.temphigh}°C</div>
              </div>
              <div className="col">
                <div className="colhead">Wilgotność</div>
                <div className="colcontent">{this.state.today.humidity}%</div>
              </div>
            </div>
          </div>
        </div>
        <div className="userbox">
          <table className="striped centered">
            <thead>
              <tr>
                <th></th>
                <th>Temperatura (min. - max.)</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.days.map((object, i) => {
                  return (
                    <tr key={i}>
                      <td>{object.name} ({object.date})</td>
                      <td>{object.templow}°C - {object.temphigh}°C</td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}