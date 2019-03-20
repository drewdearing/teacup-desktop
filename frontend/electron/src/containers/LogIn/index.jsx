import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withCookies, Cookies } from 'react-cookie';
import PropTypes from 'prop-types';
import FacebookIcon from 'mdi-react/FacebookIcon';
import GooglePlusIcon from 'mdi-react/GooglePlusIcon';
import LogInForm from './components/LogInForm';


const propTypes = {
  history: PropTypes.objectOf(PropTypes.any),
  cookies: PropTypes.instanceOf(Cookies).isRequired,
};

const defaultProps = {
  history: null,
};

class LogIn extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(userData, rememberMe) {
    console.log(userData.localId);
    console.log(rememberMe);
    this.props.cookies.set('user', userData);
    this.props.history.push({ pathname: '/' });
  }

  render() {
    return (
      <div className="account">
        <div className="account__wrapper">
          <div className="account__card">
            <div className="account__head">
              <h3 className="account__title">Welcome to
                <span className="account__logo"> tea
                  <span className="account__logo-accent">Cup</span>
                </span>
              </h3>
              <h4 className="account__subhead subhead">Start your business easily</h4>
            </div>
            <LogInForm onSuccess={this.handleSubmit} />
            <div className="account__or">
              <p>Or Easily Using</p>
            </div>
            <div className="account__social">
              <Link
                className="account__social-btn account__social-btn--facebook"
                to="/pages/one"
              >
                <FacebookIcon />
              </Link>
              <Link
                className="account__social-btn account__social-btn--google"
                to="/pages/one"
              >
                <GooglePlusIcon />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

LogIn.propTypes = propTypes;
LogIn.defaultProps = defaultProps;

export default withRouter(withCookies(LogIn));

// if you want to add select, date-picker and time-picker in your app you need to uncomment the first
// four lines in /scss/components/form.scss to add styles
