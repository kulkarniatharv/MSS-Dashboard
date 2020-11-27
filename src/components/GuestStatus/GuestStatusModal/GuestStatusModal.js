import React from 'react';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const GuestStatusModal = props => {
  const { show, onHide, guestDetailsObj } = props;
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Guest Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          {Object.keys(guestDetailsObj)
            .sort()
            .map(guestKey => (
              <Row
                key={guestKey}
                style={{
                  padding: '0.5em 0',
                  borderBottom: '1px solid #8f8f8f',
                }}
              >
                <Col md={3}>{guestKey.replace(/([A-Z])/g, ' $1')}: </Col>
                <Col md={9}>{guestDetailsObj[guestKey]}</Col>
              </Row>
            ))}
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

GuestStatusModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  guestDetailsObj: PropTypes.object.isRequired,
};
export default GuestStatusModal;
