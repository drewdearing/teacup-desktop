import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonToolbar } from 'reactstrap';
import { Field, reduxForm } from 'redux-form';

const propTypes = {
  handleSubmit: PropTypes.func,
  cancelForm: PropTypes.func,
};

const defaultProps = {
  handleSubmit: null,
  cancelForm: null,
};

class ChallongeImportForm extends PureComponent {
  render() {
    const { handleSubmit, cancelForm } = this.props;
    return (
      <form className="form" onSubmit={handleSubmit}>
        <div className="form__form-group">
          <label htmlFor="challongeURL" className="form__form-group-label">Challonge Username</label>
          <div className="form__form-group-field">
            <Field
              id="challongeUser"
              name="challongeUser"
              component="input"
              type="text"
              placeholder="Challonge API Key"
            />
          </div>
        </div>
        <div className="form__form-group">
          <label htmlFor="challongeURL" className="form__form-group-label">Challonge API Key</label>
          <div className="form__form-group-field">
            <Field
              id="challongeAPI"
              name="challongeAPI"
              component="input"
              type="text"
              placeholder="Challonge URL"
            />
          </div>
        </div>
        <div className="form__form-group">
          <label htmlFor="challongeURL" className="form__form-group-label">Challonge URL</label>
          <div className="form__form-group-field">
            <Field
              id="challongeURL"
              name="challongeURL"
              component="input"
              type="text"
              placeholder="Challonge URL"
            />
          </div>
        </div>
        <ButtonToolbar className="form__button-toolbar">
          <Button color="primary" type="submit">Submit</Button>
          <Button onClick={cancelForm}>Cancel</Button>
        </ButtonToolbar>
      </form>
    );
  }
}

ChallongeImportForm.propTypes = propTypes;
ChallongeImportForm.defaultProps = defaultProps;

export default reduxForm({
  form: 'challonge_import_form', // a unique identifier for this form
})(ChallongeImportForm);
