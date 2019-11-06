import React from 'react';
import './App.css';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import UsersList from "./pages/userslist/UsersList";
import User from "./pages/user/User";
import NoPermission from "./pages/nopermission/NoPermission";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route exact path="/users" component={UsersList} />
          <Route exact path="/user/:email" component={User} />
          <Route exact path="/nopermission" component={NoPermission} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
