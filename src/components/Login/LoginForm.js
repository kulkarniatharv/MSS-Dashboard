/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import './LoginForm.css';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import axios from 'axios';

// TODO:
// * http://hms.multitechsoftsystem.co.in/token POST-Data: username=kulkarniprashantk@gmail.com&password=Atharv-5779&grant_type=password
// Use Auth class to send the post request

// FIXME:
// Every protected route renders login screen. Which shouldn't be the case once authenticated.

const validationSchema = Yup.object({
  username: Yup.string()
    .matches(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Invalid Email'
    )
    .required('Required'),
  password: Yup.string().required('Required'),
});

// =============== RENDER COMPONENT =============
const LoginForm = props => {
  const { HandleAuthorization, location, history } = props;

  const [authErr, setAuthErr] = useState(0);

  if (location.state !== undefined) {
    console.log('Referrer: ', props.location.state.referrer);
  }

  return (
    <div className="login">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={validationSchema}
          onSubmit={(data, { setSubmitting }) => {
            setSubmitting(true);

            const reqBody = `username=${data.username}&password=${
              data.password
            }&grant_type=password`;
            // 'username=kulkarniprashantk@gmail.com&password=Atharv-5779&grant_type=password';

            axios
              .post('http://hms.multitechsoftsystem.com/token', reqBody)
              .then(res => {
                // Set the token in local storage
                localStorage.setItem('MSSToken', res.data.access_token);

                // Set user authorized in the app component
                HandleAuthorization();

                setSubmitting(false);

                // Redirect to location it came from. ProtectedRoute will redirect to login
                if (location.state !== undefined) {
                  // console.log('Referrer in req: ', location.state.referrer);

                  history.push({
                    pathname: location.state.referrer,
                  });
                } else {
                  history.push({
                    pathname: '/',
                  });
                }
              })
              .catch(err => {
                console.log(err);
                setAuthErr(1);
                setSubmitting(false);
              });
          }}
        >
          {({ handleSubmit, isSubmitting, errors }) => (
            <div className="form-container">
              <Container>
                {authErr === 1 ? (
                  <h3 style={{ color: 'red' }}>
                    Authentication Failed. Try again
                  </h3>
                ) : null}

                <Form noValidate onSubmit={handleSubmit}>
                  <Container>
                    <Form.Row>
                      <Form.Group as={Col} controlId="user_name" md="auto">
                        <Form.Label style={{ color: 'white' }}>
                          Email
                        </Form.Label>
                        <Field name="username" as={Form.Control} />
                        <ErrorMessage
                          component="div"
                          name="username"
                          className="input-feedback"
                          style={{ color: 'white' }}
                        />
                      </Form.Group>
                    </Form.Row>

                    <Form.Row>
                      <Form.Group as={Col} controlId="pwd" md="auto">
                        <Form.Label style={{ color: 'white' }}>
                          Password
                        </Form.Label>
                        <Field
                          name="password"
                          as={Form.Control}
                          type="password"
                        />
                        <ErrorMessage
                          component="div"
                          name="password"
                          className="input-feedback"
                          style={{ color: 'white' }}
                        />
                      </Form.Group>
                    </Form.Row>

                    <Form.Row>
                      <Form.Group as={Col} controlId="submitBtn" md="auto">
                        <Button
                          variant="outline-success"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          Submit
                        </Button>
                      </Form.Group>
                    </Form.Row>
                  </Container>
                </Form>
              </Container>
            </div>
          )}
        </Formik>
        {/* `{true ? (
          <div style={{ color: 'white' }}>
            Don't have an account?{' '}
            <Link to="/signup">Click here to create one.</Link>
          </div>
        ) : null}` */}
      </div>
    </div>
  );
};

export default LoginForm;
