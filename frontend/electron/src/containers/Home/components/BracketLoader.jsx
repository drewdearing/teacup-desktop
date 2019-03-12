import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Col, Button, ButtonToolbar } from 'reactstrap';
import ChallongeImportForm from './ImportForm';

const propTypes = {
  callback: PropTypes.func,
};

const defaultProps = {
  callback: null,
};

class BracketLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formOpen: false,
      handler: null,
      option: '',
    };

    this.showForm = this.showForm.bind(this);
    this.newBracketForm = this.newBracketForm.bind(this);
    this.loadFromFileForm = this.loadFromFileForm.bind(this);
    this.ImportFromChallongeForm = this.ImportFromChallongeForm.bind(this);
    this.newBracketState = this.newBracketState.bind(this);
    this.loadFromFileState = this.loadFromFileState.bind(this);
    this.ImportFromChallongeState = this.ImportFromChallongeState.bind(this);
    this.cancelForm = this.cancelForm.bind(this);
  }

  cancelForm() {
    this.setState({ formOpen: false, handler: null, option: '' });
  }

  newBracketForm() {
    this.props.callback(null);
  }

  loadFromFileForm() {
    this.props.callback(null);
  }

  ImportFromChallongeForm(values) {
    console.log(values);
    let { option } = this.state;
    if (option === '') {
      option = 'h';
    }
  }

  newBracketState() {
    this.setState({ formOpen: true, handler: this.newBracketForm, option: 'new' });
  }

  loadFromFileState() {
    this.setState({ formOpen: true, handler: this.loadFromFileForm, option: 'load' });
  }

  ImportFromChallongeState() {
    this.setState({ formOpen: true, handler: this.ImportFromChallongeForm, option: 'challonge' });
  }

  showForm() {
    const { formOpen, option, handler } = this.state;
    if (formOpen) {
      if (option === 'challonge') {
        return (<ChallongeImportForm handleSubmit={handler} cancelForm={this.cancelForm} />);
      }
      return null;
    }
    return null;
  }

  render() {
    return (
      <Col md={12}>
        <Card>
          <CardBody>
            <div className="card__title">
              <h5 className="bold-text">New Bracket</h5>
              <h5 className="subhead">Start a new bracket or load an existing one!</h5>
            </div>
            <ButtonToolbar>
              <Button onClick={this.newBracketState} size="sm" outline>New Bracket</Button>
              <Button onClick={this.loadFromFileState} size="sm" outline>Load Previous</Button>
              <Button onClick={this.ImportFromChallongeState} size="sm" outline>Import From Challonge</Button>
            </ButtonToolbar>
            {this.showForm()}
          </CardBody>
        </Card>
      </Col>
    );
  }
}

BracketLoader.propTypes = propTypes;
BracketLoader.defaultProps = defaultProps;

export default BracketLoader;
