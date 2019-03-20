import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withCookies, Cookies } from 'react-cookie';
import { Col, Container, Row } from 'reactstrap';

const propTypes = {
  history: PropTypes.objectOf(PropTypes.any),
  cookies: PropTypes.instanceOf(Cookies).isRequired,
};

const defaultProps = {
  history: null,
};

class Home extends Component {
  constructor(props) {
    super(props);

    const { cookies } = this.props;

    this.state = {
      user: null,
    };

    if (cookies.get('user')) {
      this.state = {
        user: cookies.get('user'),
      };
      console.log(this.state.user);
    } else {
      this.props.history.push({ pathname: '/login' });
    }
  }

  render() {
    const { user } = this.state;
    if (user != null) {
      return (
        <Container className="dashboard">
          <Row>
            <Col md={12}>
              <h3 className="page-title">{user.displayName} Home</h3>
            </Col>
          </Row>
        </Container>
      );
    }
    return (<Container>user null</Container>);
  }
}

Home.propTypes = propTypes;
Home.defaultProps = defaultProps;

export default withRouter(withCookies(Home));
