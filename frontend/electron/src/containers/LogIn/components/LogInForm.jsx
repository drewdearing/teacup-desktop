import React, { PureComponent } from 'react';
import EyeIcon from 'mdi-react/EyeIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import PropTypes from 'prop-types';
import CheckBox from '../../../shared/components/form/CheckBox';

class LogInForm extends PureComponent {
  static propTypes = {
    onSuccess: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = {
      showPassword: false,
      formDisabled: false,
      email: '',
      password: '',
      remember_me: false,
    };
  }

  showPassword = (e) => {
    e.preventDefault();
    this.setState({
      showPassword: !this.state.showPassword,
    });
  }

  registerAccount = (e) => {
    e.preventDefault();
  }

  signIn = (e) => {
    e.preventDefault();
    this.setState({
      formDisabled: true,
    });
    console.log('signing in...');
    const apiKey = process.env.REACT_APP_API_KEY;
    const requestURL = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=';
    fetch(requestURL + apiKey, {
      method: 'post',
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password,
        returnSecureToken: true,
      }),
    })
      .then(
        (result) => {
          console.log('result returned.');
          result.json().then((data) => {
            console.log(data);
            if (!data.error) {
              this.props.onSuccess(data, this.state.remember_me);
            } else {
              this.setState({
                formDisabled: false,
              });
            }
          });
        },
        (error) => {
          console.log('error returned.');
          console.log(error);
          this.setState({
            formDisabled: false,
          });
        },
      );
  }

  updateEmail = (e) => {
    this.setState({
      email: e.target.value,
    });
  }

  updatePassword = (e) => {
    this.setState({
      password: e.target.value,
    });
  }

  updateRememberMe = (e) => {
    if (e) {
      this.setState({
        remember_me: !this.state.remember_me,
      });
    }
  }

  render() {
    const { showPassword } = this.state;

    return (
      <form className="form">
        <div className="form__form-group">
          <span className="form__form-group-label">Email</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <AccountOutlineIcon />
            </div>
            <input
              name="name"
              type="text"
              placeholder="Email"
              onChange={e => this.updateEmail(e)}
              disabled={this.state.formDisabled ? 'disabled' : ''}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">Password</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <KeyVariantIcon />
            </div>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              onChange={e => this.updatePassword(e)}
              disabled={this.state.formDisabled ? 'disabled' : ''}
            />
            <button
              className={`form__form-group-button${showPassword ? ' active' : ''}`}
              onClick={e => this.showPassword(e)}
              type="button"
              disabled={this.state.formDisabled ? 'disabled' : ''}
            ><EyeIcon />
            </button>
          </div>
          <div className="account__forgot-password">
            <a href="/">Forgot a password?</a>
          </div>
        </div>
        <div className="form__form-group">
          <div className="form__form-group-field">
            <CheckBox
              name="remember_me"
              label="Remember me"
              disabled={this.state.formDisabled ? 'disabled' : ''}
              onChange={e => this.updateRememberMe(e)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="btn btn-primary account__btn account__btn--small"
          onClick={e => this.signIn(e)}
          disabled={this.state.formDisabled ? 'disabled' : ''}
        >
          Sign In
        </button>
        <button
          type="button"
          className="btn btn-primary account__btn account__btn--small"
          onClick={e => this.registerAccount(e)}
          disabled={this.state.formDisabled ? 'disabled' : ''}
        >
          Register Account
        </button>
      </form>
    );
  }
}

export default LogInForm;
