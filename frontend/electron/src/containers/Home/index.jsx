import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Col, Container, Row } from 'reactstrap';
import BracketLoader from './components/BracketLoader';

const propTypes = {
  bracketID: PropTypes.string,
};

const defaultProps = {
  bracketID: null,
};

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bracketID: props.bracketID,
    };
    this.render = this.render.bind(this);
    this.getContent = this.getContent.bind(this);
  }

  setBracketID(id) {
    this.setState({ bracketID: id });
  }

  getContent() {
    const { bracketID } = this.state;
    if (bracketID == null) {
      return (<Row><BracketLoader callback={this.setBracketID} /></Row>);
    }
    return (<Row><p>Hi.</p></Row>);
  }

  render() {
    return (
      <Container className="dashboard">
        <Row>
          <Col md={12}>
            <h3 className="page-title">Dashboard</h3>
          </Col>
        </Row>
        {this.getContent()}
      </Container>
    );
  }
}

Home.propTypes = propTypes;
Home.defaultProps = defaultProps;

export default Home;
