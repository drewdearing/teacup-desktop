import React, { PureComponent } from 'react';
import { Field, reduxForm } from 'redux-form';
import EyeIcon from 'mdi-react/EyeIcon';
import KeyVariantIcon from 'mdi-react/KeyVariantIcon';
import AccountOutlineIcon from 'mdi-react/AccountOutlineIcon';
import PropTypes from 'prop-types';
import renderCheckBoxField from '../../../shared/components/form/CheckBox';

class LogInForm extends PureComponent {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.state = {
      showPassword: false,
      formDisabled: false,
      email: '',
      password: '',
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
    this.setState({
      formDisabled: true,
    });
    console.log('hi');
    const apiKey = process.env.REACT_APP_API_KEY;
    const requestURL = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=';
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
          console.log(result.json());
          this.setState({
            formDisabled: false,
          });
        },
        (error) => {
          console.log(error);
          this.setState({
            formDisabled: false,
          });
        },
      );
  }

  signIn = (e) => {
    e.preventDefault();
    this.setState({
      formDisabled: true,
    });
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

  render() {
    const { handleSubmit } = this.props;

    return (
      <form className="form" onSubmit={handleSubmit}>
        <div className="form__form-group">
          <span className="form__form-group-label">Username</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <AccountOutlineIcon />
            </div>
            <Field
              name="name"
              component="input"
              type="text"
              placeholder="Name"
              disabled={this.state.formDisabled ? 'disabled' : ''}
              onChange={e => this.updateEmail(e)}
            />
          </div>
        </div>
        <div className="form__form-group">
          <span className="form__form-group-label">Password</span>
          <div className="form__form-group-field">
            <div className="form__form-group-icon">
              <KeyVariantIcon />
            </div>
            <Field
              name="password"
              component="input"
              type={this.state.showPassword ? 'text' : 'password'}
              placeholder="Password"
              disabled={this.state.formDisabled ? 'disabled' : ''}
              onChange={e => this.updatePassword(e)}
            />
            <button
              className={`form__form-group-button${this.state.showPassword ? ' active' : ''}`}
              onClick={e => this.showPassword(e)}
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
            <Field
              name="remember_me"
              component={renderCheckBoxField}
              label="Remember me"
              disabled={this.state.formDisabled ? 'disabled' : ''}
            />
          </div>
        </div>
        <button
          className="btn btn-primary account__btn account__btn--small"
          onClick={e => this.signIn(e)}
          disabled={this.state.formDisabled ? 'disabled' : ''}
        >
          Sign In
        </button>
        <button
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

export default reduxForm({
  form: 'log_in_form',
})(LogInForm);
