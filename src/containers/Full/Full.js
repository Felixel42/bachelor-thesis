import React, {Component} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import {Container} from 'reactstrap';
import Header from '../../components/Header/';
import Admin_Sidebar from '../../components/Sidebar/Admin';
import User_Sidebar from '../../components/Sidebar/User';
import Breadcrumb from '../../components/Breadcrumb/';
import Footer from '../../components/Footer/';

// Admin views
import Admin_Dashboard from '../../views/Admin/Dashboard/';
import Administration from '../../views/Admin/Administration';
import Billing from '../../views/Admin/Billing';

// User views
import User_Dashboard from '../../views/User/Dashboard/';
import Payment from '../../views/User/Payment/';

// get name from user to decide a layout
import store from '../../store';

// Icons
import FontAwesome from '../../views/Icons/FontAwesome/';
import SimpleLineIcons from '../../views/Icons/SimpleLineIcons/';

class Full extends Component {
  decideSidebar() {
    if(store.getState().user.data.name === "admin") {
      return (
        <Admin_Sidebar {...this.props}/>
      );
    } else {
      return (
        <User_Sidebar {...this.props}/>
      );
    }
  }

  decideContent() {
    if(store.getState().user.data.name === "admin") {
      return (
        <Switch>
          <Route path="/dashboard" name="Dashboard" component={Admin_Dashboard}/>
          <Route path="/billing" name="Abrechnung" component={Billing}/>          
          <Route path="/administration" name="Kundenverwaltung" component={Administration}/>
          <Redirect from="/" to="/dashboard"/>
        </Switch>
      );
    } else {
      return (
        <Switch>
          <Route path="/dashboard" name="Dashboard" component={User_Dashboard}/>
          <Route path="/payment" name="Bezahlung" component={Payment}/>
          <Redirect from="/" to="/dashboard"/>
        </Switch>
      );
    }
  }

  render() {
    var sidebar = this.decideSidebar();
    var content = this.decideContent();

    return (
      <div className="app">
        <Header />
        <div className="app-body">
          {sidebar}
          <main className="main">
            <Breadcrumb />
            <Container fluid>
              {content}
            </Container>
          </main>
        </div>
        <Footer />
      </div>
    );
  }
}

export default Full;
