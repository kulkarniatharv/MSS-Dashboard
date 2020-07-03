/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import { Formik, Field, getIn, ErrorMessage, FieldArray } from 'formik';
import './RoomDetailsNew.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import * as Yup from 'yup';
import Axios from 'axios';
// import PropTypes from 'prop-types';

// JSON Format
// submission = {
//   clsHotelID: {},
//   bookingDetailV8: { channelId: '' },
//   bookingRooms: [{}, {}],
// };

// TODO:
//  1.

// FIXME:
//  1. Error message not in red color.

// =================== EVENT HANDLERS ====================
const addRoomHandler = (array, NumOfRooms, filteredRateCal) => {
  const newLength = NumOfRooms - array.length;
  if (newLength < 0) {
    for (let i = newLength; i < 0; i += 1) {
      array.pop();
    }
  } else if (newLength > 0) {
    for (let i = 0; i < newLength; i += 1) {
      array.push({
        BookingCode: '',
        RoomTypeCode: '',
        MasterRoom: '',
        SchemeName: 'S1',
        RatePlan: '',
        RoomType: Object.keys(filteredRateCal)[0],
        MstRate: '',
        RRate: '',
        MealPlan: Object.keys(filteredRateCal)[0][0],
        Pax: '',
        child: '',
        Expax: '',
        Amount: '',
        ExpaxAmt: '',
        ChildAmt: '',
        AllAmtInClude: '',
        GuestCheckInNo: '',
        NumRooms: 1,
      });
    }
  }
};

// ======================VALIDATION SCHEMA===================================
const validationSchema = Yup.object({
  clsHotelID: Yup.object({
    HotelId: Yup.string().required('No hotel id provided.'),
  }),
  bookingDetailV8: Yup.object({
    Checkin: Yup.date()
      .required('Required')
      .min(new Date().toJSON().slice(0, 10), 'Invalid Checkin Date'),
    Checkout: Yup.date()
      .required('Required')
      .when(
        'Checkin',
        (Checkin, schema) =>
          Checkin &&
          schema.min(Checkin, 'Checkout date must be same as or after Checkin')
      ),
    NumNights: Yup.string()
      .matches(/^[0-9]*$/, 'Invalid number')
      .required('Required'),
    NumRooms: Yup.string().matches(/^[0-9]*$/),
    DateBooked: Yup.date()
      .required()
      .when('Checkin', (Checkin, schema) => Checkin && schema.min(Checkin)),
    CustomerName: Yup.string()
      .max(30, 'Must be 30 characters or less')
      .required('Required'),
    CustomerEmail: Yup.string()
      .email('Invalid email address')
      .required('Required'),
    CustomerMobile: Yup.string()
      .matches(
        /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
        'Phone number is not valid'
      )
      .max(12, 'Must be 12 characters or less'),
    TotalAdults: Yup.string().matches(/^[0-9]*$/),
    TotalChildren: Yup.string().matches(/^[0-9]*$/),
  }),
  bookingRooms: Yup.array().of(
    Yup.object({
      RatePlan: Yup.string().required('Rate Plan is required!'),
      MealPlan: Yup.string().required('Meal Plan is required!'),
      Pax: Yup.number().required('Num of persons is required!'),
      Expax: Yup.number()
        .when(
          'Pax',
          (Pax, schema) =>
            Pax && schema.max(Pax, 'Should be less than total persons')
        )
        .required('Extra Person is required!'),
      ExpaxAmt: Yup.string()
        .matches(/^[0-9]*$/, 'Invalid number')
        .required('Extra person amt is required!'),
    })
  ),
});

// ===================RENDER COMPONENT===================================
const RoomDetailsNew = props => {
  const [rateCal, setRateCal] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);

  const temp = [
    {
      CalenderDate: '2020/Apr/10',
      RoomTypeCode: 'A2001',
      RoomType: 'DLX',
      RatePlan: 'DLXCP',
      RRate: 4500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 1000.0,
      ChildRate: 500.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/10',
      RoomTypeCode: 'A2001',
      RoomType: 'DLX',
      RatePlan: 'DLXCP1',
      RRate: 4500.0,
      MealPlan: 'AP',
      Pax: 2,
      ExpaxRate: 1000.0,
      ChildRate: 500.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/10',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP',
      RRate: 3500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/10',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP1',
      RRate: 3500.0,
      MealPlan: 'AP',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/10',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP2',
      RRate: 3500.0,
      MealPlan: 'AP2',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/11',
      RoomTypeCode: 'A2001',
      RoomType: 'DLX',
      RatePlan: 'DLXCP',
      RRate: 4500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 1000.0,
      ChildRate: 500.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/11',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP',
      RRate: 3500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/12',
      RoomTypeCode: 'A2001',
      RoomType: 'DLX',
      RatePlan: 'DLXCP',
      RRate: 4500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 1000.0,
      ChildRate: 500.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/12',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP',
      RRate: 3500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/13',
      RoomTypeCode: 'A2001',
      RoomType: 'DLX',
      RatePlan: 'DLXCP',
      RRate: 4500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 1000.0,
      ChildRate: 500.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/13',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP',
      RRate: 3500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/14',
      RoomTypeCode: 'A2001',
      RoomType: 'DLX',
      RatePlan: 'DLXCP',
      RRate: 4500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 1000.0,
      ChildRate: 500.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/14',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP',
      RRate: 3500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/15',
      RoomTypeCode: 'A2001',
      RoomType: 'DLX',
      RatePlan: 'DLXCP',
      RRate: 4500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 1000.0,
      ChildRate: 500.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/15',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP',
      RRate: 3500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/16',
      RoomTypeCode: 'A2001',
      RoomType: 'DLX',
      RatePlan: 'DLXCP',
      RRate: 4500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 1000.0,
      ChildRate: 500.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/16',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP',
      RRate: 3500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/17',
      RoomTypeCode: 'A2001',
      RoomType: 'DLX',
      RatePlan: 'DLXCP',
      RRate: 4500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 1000.0,
      ChildRate: 500.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/17',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP',
      RRate: 3500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/18',
      RoomTypeCode: 'A2001',
      RoomType: 'DLX',
      RatePlan: 'DLXCP',
      RRate: 4500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 1000.0,
      ChildRate: 500.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/18',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP',
      RRate: 3500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/19',
      RoomTypeCode: 'A2001',
      RoomType: 'DLX',
      RatePlan: 'DLXCP',
      RRate: 4500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 1000.0,
      ChildRate: 500.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/19',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP',
      RRate: 3500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/20',
      RoomTypeCode: 'A2001',
      RoomType: 'DLX',
      RatePlan: 'DLXCP',
      RRate: 4500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 1000.0,
      ChildRate: 500.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
    {
      CalenderDate: '2020/Apr/20',
      RoomTypeCode: 'A2001',
      RoomType: 'EXE',
      RatePlan: 'EXECP',
      RRate: 3500.0,
      MealPlan: 'CP',
      Pax: 2,
      ExpaxRate: 900.0,
      ChildRate: 400.0,
      MaxPax: 2,
      ChildAgeFrom: 5,
      AdultAgeFrom: 11,
    },
  ];

  const filteredRateCal = {};

  const GetRateCalender = () => {
    Axios.post('http://hms.multitechsoftsystem.co.in/api/GetRateCalender', {
      HotelID: { HotelId: 'rutu' },
      FromDate: '2020/Apr/15',
      ToDate: '2020/Apr/20',
    }).then(
      response => {
        setRateCal(response.data);
        console.log('Rate calender: ', response.data);
      },
      error => {
        console.log(error);
      }
    );
  };

  // useEffect(GetRateCalender, []);

  // filtering the receiced Rate Calender JSON Object
  if (temp) {
    for (const item of temp) {
      // Push the item following the data structure
      // {
      //   RoomType : {
      //     MealPlan : {
      //       RatePlan : [Objects that have these three props]
      //     }
      //   }
      // }

      if (!filteredRateCal[item.RoomType]) {
        filteredRateCal[item.RoomType] = {};
      }

      if (!(item.MealPlan in filteredRateCal[item.RoomType])) {
        // Checking if the meal plan exists in the obj. If not, then push the mealplan to obj
        filteredRateCal[item.RoomType][item.MealPlan] = {};

        // If meal plan doesn't exist in the obj then corresponding RatePlan also doesn't. Thus, initialise it too
        filteredRateCal[item.RoomType][item.MealPlan][item.RatePlan] = [];
        filteredRateCal[item.RoomType][item.MealPlan][item.RatePlan].push(item);
      }
      // If RatePlan is not initialised then initialise it.
      else if (
        !(item.RatePlan in filteredRateCal[item.RoomType][item.MealPlan])
      ) {
        filteredRateCal[item.RoomType][item.MealPlan][item.RatePlan] = [];
        filteredRateCal[item.RoomType][item.MealPlan][item.RatePlan].push(item);
      }
    }

    console.log('Filtered Data: ', filteredRateCal);
  }

  return (
    <div>
      {rateCal && Object.keys(filteredRateCal).length !== 0 ? (
        <div>
          <Formik
            initialValues={{
              clsHotelID: {
                HotelId: 'htlname',
              },
              bookingDetailV8: {
                // ChannelId: 100,
                // ChannelName: 'CHANNELONE',
                // BookingCode: '',
                Checkin: new Date().toJSON().slice(0, 10),
                Checkout: new Date(new Date().setDate(new Date().getDate() + 1))
                  .toJSON()
                  .slice(0, 10),
                NumNights: '',
                NumRooms: '1',
                BookingStatus: 'CONF',
                DateBooked: new Date().toJSON().slice(0, 10),
                CustomerName: '',
                CustomerEmail: '',
                CustomerMobile: '',
                TotalAdults: '1',
                TotalChildren: '0',
                BilledAmount: 0.0,
                // PaymentType: 'ONLINE',
                // BookingDetailUrl: '', // null
              },
              bookingRooms: [
                {
                  // BookingCode: '',
                  RoomTypeCode: '',
                  MasterRoom: '', // SAME AS RoomType
                  SchemeName: 'S1', // fixed
                  RatePlan: Object.keys(
                    filteredRateCal[Object.keys(filteredRateCal)[0]][
                      Object.keys(
                        filteredRateCal[Object.keys(filteredRateCal)[0]]
                      )[0]
                    ]
                  )[0], // included in GET request. Dropdown
                  RoomType: Object.keys(filteredRateCal)[0], // included in GET request. Dropdown
                  MstRate: '', // RRate of RateCalender
                  RRate: '', // If MstRate is changed then change this field and not MstRate
                  MealPlan: Object.keys(
                    filteredRateCal[Object.keys(filteredRateCal)[0]]
                  )[0], // included in GET request. Dropdown
                  Pax: '', // Number of people. Check if they are less than or equal to maxPax, and update Expax field for any extra person
                  child: '0', // No of children (>8yr)
                  Expax: '0', // extra person
                  Amount: '', // Same as RRate
                  ExpaxAmt: '0', // included in GET request. Expax * Rate received for single expax from req
                  ChildAmt: '0', // included in GET request. child * Rate received for single child from req
                  AllAmtInClude: '', // "Y" or "N" Dropdown
                  GuestCheckInNo: '', // blank
                  NumRooms: 1, // Number of rooms of that type
                },
              ],
            }}
            validationSchema={validationSchema}
            onSubmit={(data, { setSubmitting }) => {
              setSubmitting(true);
              // make async call to http://hms.multitechsoftsystem.co.in/api/Book
              console.log('submit:', data);
              setSubmitting(false);
            }}
          >
            {({
              values,
              handleSubmit,
              isSubmitting,
              touched,
              errors,
              handleChange,
              handleBlur,
              handleReset,
              setFieldValue,
            }) => (
              <div className="form-container">
                <Container className="animate__animated animate__fadeIn">
                  <Form noValidate onSubmit={handleSubmit}>
                    <Container>
                      <div className="rounded-border">
                        <Form.Row>
                          {/* Checkin */}
                          <Form.Group as={Col} controlId="checkin" md="6">
                            <Form.Label column>CheckIn</Form.Label>
                            <Col>
                              <Field
                                name="bookingDetailV8.Checkin"
                                type="date"
                                as={Form.Control}
                                onChange={e => {
                                  handleChange(e);
                                  setFieldValue(
                                    'bookingDetailV8.NumNights',
                                    `${
                                      values.bookingDetailV8.Checkin
                                        ? (new Date(
                                            values.bookingDetailV8.Checkout
                                          ) -
                                            new Date(e.target.value)) /
                                          (1000 * 3600 * 24)
                                        : 0
                                    }`
                                  );
                                  console.log('Checkin Changed');
                                }}
                                className={
                                  getIn(errors, 'bookingDetailsV8.Checkin') &&
                                  getIn(touched, 'bookingDetailsV8.Checkin')
                                    ? 'error'
                                    : null
                                }
                              />
                              <ErrorMessage
                                component="div"
                                name="bookingDetailV8.Checkin"
                                className="input-feedback"
                              />
                            </Col>
                          </Form.Group>

                          {/* Checkout */}
                          <Form.Group as={Col} controlId="checkout" md="6">
                            <Form.Label column>CheckOut</Form.Label>
                            <Col>
                              <Field
                                name="bookingDetailV8.Checkout"
                                type="date"
                                as={Form.Control}
                                onChange={e => {
                                  handleChange(e);
                                  setFieldValue(
                                    'bookingDetailV8.NumNights',
                                    `${
                                      values.bookingDetailV8.Checkin
                                        ? (new Date(e.target.value) -
                                            new Date(
                                              values.bookingDetailV8.Checkin
                                            )) /
                                          (1000 * 3600 * 24)
                                        : 0
                                    }`
                                  );
                                  console.log('Checkout Changed');
                                }}
                                className={
                                  getIn(errors, 'bookingDetailsV8.Checkout')
                                    ? // && getIn(touched, 'bookingDetailsV8.Checkout')
                                      'error'
                                    : null
                                }
                              />
                              <ErrorMessage
                                component="div"
                                name="bookingDetailV8.Checkout"
                                className="input-feedback"
                              />
                            </Col>
                          </Form.Group>
                        </Form.Row>
                        <hr />
                        <Form.Row>
                          {/* Customer Name */}
                          <Form.Group
                            as={Col}
                            controlId="customer_name"
                            md="auto"
                          >
                            <Form.Label column>Customer Name</Form.Label>
                            <Col>
                              <Field
                                name="bookingDetailV8.CustomerName"
                                as={Form.Control}
                                value={values.bookingDetailV8.CustomerName}
                                onChange={e => {
                                  handleChange(e);
                                  console.log('CustomerName Changed');
                                }}
                                className={
                                  getIn(
                                    errors,
                                    'bookingDetailsV8.CustomerName'
                                  ) &&
                                  getIn(
                                    touched,
                                    'bookingDetailsV8.CustomerName'
                                  )
                                    ? 'error'
                                    : null
                                }
                              />
                              <ErrorMessage
                                component="div"
                                name="bookingDetailV8.CustomerName"
                                className="input-feedback"
                              />
                            </Col>
                          </Form.Group>

                          {/* Customer Email */}
                          <Form.Group
                            as={Col}
                            controlId="customer_email"
                            md="auto"
                          >
                            <Form.Label column>Customer Email</Form.Label>
                            <Col>
                              <Field
                                name="bookingDetailV8.CustomerEmail"
                                as={Form.Control}
                                value={values.bookingDetailV8.CustomerEmail}
                                type="email"
                                onChange={e => {
                                  handleChange(e);
                                  console.log('CustomerEmail Changed');
                                }}
                                className={
                                  getIn(
                                    errors,
                                    'bookingDetailsV8.CustomerEmail'
                                  ) &&
                                  getIn(
                                    touched,
                                    'bookingDetailsV8.CustomerEmail'
                                  )
                                    ? 'error'
                                    : null
                                }
                              />
                              <ErrorMessage
                                component="div"
                                name="bookingDetailV8.CustomerEmail"
                                className="input-feedback"
                              />
                            </Col>
                          </Form.Group>

                          {/* Customer Mobile */}
                          <Form.Group
                            as={Col}
                            controlId="customer_mobile"
                            md="auto"
                          >
                            <Form.Label column>Customer Mobile</Form.Label>
                            <Col>
                              <Field
                                name="bookingDetailV8.CustomerMobile"
                                as={Form.Control}
                                value={values.bookingDetailV8.CustomerMobile}
                                type="email"
                                onChange={e => {
                                  handleChange(e);
                                  console.log('CustomerMobile Changed');
                                }}
                                className={
                                  getIn(
                                    errors,
                                    'bookingDetailsV8.CustomerMobile'
                                  ) &&
                                  getIn(
                                    touched,
                                    'bookingDetailsV8.CustomerMobile'
                                  )
                                    ? 'error'
                                    : null
                                }
                              />
                              <ErrorMessage
                                component="div"
                                name="bookingDetailV8.CustomerMobile"
                                className="input-feedback"
                              />
                            </Col>
                          </Form.Group>

                          {/* Total Adults */}
                          <Form.Group
                            as={Col}
                            controlId="total_adults"
                            md="auto"
                          >
                            <Form.Label column>Total Adults</Form.Label>
                            <Col>
                              <Field
                                name="bookingDetailV8.TotalAdults"
                                as={Form.Control}
                                value={values.bookingDetailV8.TotalAdults}
                                type="email"
                                onChange={e => {
                                  handleChange(e);
                                  console.log('TotalAdults Changed');
                                }}
                                className={
                                  getIn(
                                    errors,
                                    'bookingDetailsV8.TotalAdults'
                                  ) &&
                                  getIn(touched, 'bookingDetailsV8.TotalAdults')
                                    ? 'error'
                                    : null
                                }
                              />
                              <ErrorMessage
                                component="div"
                                name="bookingDetailV8.TotalAdults"
                                className="input-feedback"
                              />
                            </Col>
                          </Form.Group>

                          {/* Total Children */}
                          <Form.Group
                            as={Col}
                            controlId="total_children"
                            md="auto"
                          >
                            <Form.Label column>Total Children</Form.Label>
                            <Col>
                              <Field
                                name="bookingDetailV8.TotalChildren"
                                as={Form.Control}
                                value={values.bookingDetailV8.TotalChildren}
                                onChange={e => {
                                  handleChange(e);
                                  console.log('TotalChildren Changed');
                                }}
                                className={
                                  getIn(
                                    errors,
                                    'bookingDetailsV8.TotalChildren'
                                  ) &&
                                  getIn(
                                    touched,
                                    'bookingDetailsV8.TotalChildren'
                                  )
                                    ? 'error'
                                    : null
                                }
                              />
                              <ErrorMessage
                                component="div"
                                name="bookingDetailV8.TotalChildren"
                                className="input-feedback"
                              />
                            </Col>
                          </Form.Group>

                          {/* Number of nights */}
                          <Form.Group as={Col} controlId="numnights" md="auto">
                            <Form.Label column>Number of nights</Form.Label>
                            <Col>
                              <Field
                                name="bookingDetailV8.NumNights"
                                as={Form.Control}
                                value={values.bookingDetailV8.NumNights}
                                onChange={e => {
                                  handleChange(e);
                                  const today = new Date(
                                    values.bookingDetailV8.Checkin
                                  );
                                  const { value } = e.target;
                                  if (/^[0-9]*$/.test(value)) {
                                    setFieldValue(
                                      'bookingDetailV8.Checkout',
                                      `${
                                        values.bookingDetailV8.Checkin
                                          ? new Date(
                                              today.setDate(
                                                today.getDate() + Number(value)
                                              )
                                            )
                                              .toJSON()
                                              .slice(0, 10)
                                          : 0
                                      }`
                                    );
                                  }
                                  console.log('NumNights Changed');
                                }}
                                className={
                                  getIn(errors, 'bookingDetailsV8.NumNights')
                                    ? // && getIn(touched, 'bookingDetailsV8.NumNights')
                                      'error'
                                    : null
                                }
                              />
                              <ErrorMessage
                                component="div"
                                name="bookingDetailV8.NumNights"
                                className="input-feedback"
                              />
                            </Col>
                          </Form.Group>

                          {/* Number of rooms */}
                          <Form.Group as={Col} controlId="numrooms" md="auto">
                            <Form.Label column>Number of Rooms</Form.Label>
                            <Col>
                              <Field
                                name="bookingDetailV8.NumRooms"
                                as={Form.Control}
                                value={values.bookingDetailV8.NumRooms}
                                onChange={e => {
                                  handleChange(e);
                                }}
                                onBlur={e => {
                                  handleBlur(e);
                                  addRoomHandler(
                                    values.bookingRooms,
                                    Number(e.target.value),
                                    filteredRateCal
                                  );
                                }}
                                className={
                                  getIn(errors, 'bookingDetailsV8.NumRooms') &&
                                  getIn(touched, 'bookingDetailsV8.NumRooms')
                                    ? 'error'
                                    : null
                                }
                              />
                              <ErrorMessage
                                component="div"
                                name="bookingDetailV8.NumRooms"
                                className="input-feedback"
                              />
                            </Col>
                          </Form.Group>
                        </Form.Row>

                        <hr />
                        {/* BookingDetails or Room details */}
                        <FieldArray
                          name="bookingRooms"
                          render={arrayHelpers => (
                            <Container>
                              {values.bookingRooms.map((room, index) => (
                                <div key={Math.floor(Math.random() * 10000)}>
                                  <h3 style={{ textAlign: 'center' }}>
                                    Room {index + 1}
                                  </h3>

                                  <Form.Row>
                                    {/* ROOM TYPE */}
                                    <Form.Group
                                      as={Col}
                                      controlId="Room_Type"
                                      md="auto"
                                    >
                                      <Form.Label column>Room Type</Form.Label>
                                      <Field
                                        as="select"
                                        name={`bookingRooms.${index}.RoomType`}
                                        onChange={e => {
                                          handleChange(e);

                                          // checking if RoomType[MealPlan] exists.
                                          // If it doesn't, React will throw error so need to handle it.
                                          if (
                                            filteredRateCal[e.target.value][
                                              getIn(
                                                values,
                                                `bookingRooms.${index}.MealPlan`
                                              )
                                            ]
                                          ) {
                                            // checking if RoomType[MealPlan][RatePlan] exists.
                                            // If it doesn't, React will throw error so need to handle it.
                                            if (
                                              filteredRateCal[e.target.value][
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.MealPlan`
                                                )
                                              ][
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.RatePlan`
                                                )
                                              ]
                                            ) {
                                              setIsDisabled(false);
                                            } else {
                                              setIsDisabled(true);
                                            }
                                          } else {
                                            setIsDisabled(true);
                                          }
                                        }}
                                        className={
                                          getIn(
                                            errors,
                                            `bookingRooms.${index}.RoomType`
                                          ) &&
                                          getIn(
                                            touched,
                                            `bookingRooms.${index}.RoomType`
                                          )
                                            ? 'error'
                                            : null
                                        }
                                      >
                                        {Object.keys(filteredRateCal).map(
                                          roomType => (
                                            <option
                                              value={roomType}
                                              key={Math.random() * 10000}
                                            >
                                              {roomType}
                                            </option>
                                          )
                                        )}
                                      </Field>

                                      <ErrorMessage
                                        component="div"
                                        name={`bookingRooms.${index}.RoomType`}
                                        className="input-feedback"
                                      />
                                    </Form.Group>

                                    {/* MEAL PLAN */}
                                    <Form.Group
                                      as={Col}
                                      controlId="Meal_Plan"
                                      md="auto"
                                    >
                                      <Form.Label column>Meal Plan</Form.Label>

                                      <Field
                                        as="select"
                                        name={`bookingRooms.${index}.MealPlan`}
                                        onChange={e => {
                                          handleChange(e);

                                          // checking if RoomType[MealPlan] exists.
                                          // If it doesn't, React will throw error so need to handle it.
                                          if (
                                            filteredRateCal[
                                              getIn(
                                                values,
                                                `bookingRooms.${index}.RoomType`
                                              )
                                            ][e.target.value]
                                          ) {
                                            // checking if RoomType[MealPlan][RatePlan] exists.
                                            // If it doesn't, React will throw error so need to handle it.
                                            if (
                                              filteredRateCal[
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.RoomType`
                                                )
                                              ][e.target.value][
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.RatePlan`
                                                )
                                              ]
                                            ) {
                                              setIsDisabled(false);
                                            } else {
                                              setIsDisabled(true);
                                            }
                                          } else {
                                            setIsDisabled(true);
                                          }
                                        }}
                                        className={
                                          getIn(
                                            errors,
                                            `bookingRooms.${index}.MealPlan`
                                          ) &&
                                          getIn(
                                            touched,
                                            `bookingRooms.${index}.MealPlan`
                                          )
                                            ? 'error'
                                            : null
                                        }
                                      >
                                        <option value="">Choose</option>
                                        {Object.keys(
                                          filteredRateCal[
                                            getIn(
                                              values,
                                              `bookingRooms.${index}.RoomType`
                                            )
                                          ]
                                        ).map(mealPlan => (
                                          <option
                                            value={mealPlan}
                                            key={Math.random() * 10000}
                                          >
                                            {mealPlan}
                                          </option>
                                        ))}
                                      </Field>

                                      <ErrorMessage
                                        component="div"
                                        name={`bookingRooms.${index}.MealPlan`}
                                        className="input-feedback"
                                      />
                                    </Form.Group>

                                    {/* RATE PLAN */}
                                    <Form.Group
                                      as={Col}
                                      controlId="Rate_Plan"
                                      md="auto"
                                    >
                                      <Form.Label column>Rate Plan</Form.Label>

                                      <Field
                                        as="select"
                                        name={`bookingRooms.${index}.RatePlan`}
                                        onChange={e => {
                                          handleChange(e);

                                          // checking if RoomType[MealPlan] exists.
                                          // If it doesn't, React will throw error so need to handle it.
                                          if (
                                            filteredRateCal[
                                              getIn(
                                                values,
                                                `bookingRooms.${index}.RoomType`
                                              )
                                            ][
                                              getIn(
                                                values,
                                                `bookingRooms.${index}.MealPlan`
                                              )
                                            ]
                                          ) {
                                            // checking if RoomType[MealPlan][RatePlan] exists.
                                            // If it doesn't, React will throw error so need to handle it.
                                            if (
                                              filteredRateCal[
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.RoomType`
                                                )
                                              ][
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.MealPlan`
                                                )
                                              ][e.target.value]
                                            ) {
                                              setIsDisabled(false);
                                            } else {
                                              setIsDisabled(true);
                                            }
                                          } else {
                                            setIsDisabled(true);
                                          }
                                        }}
                                        className={
                                          getIn(
                                            errors,
                                            `bookingRooms.${index}.RatePlan`
                                          ) &&
                                          getIn(
                                            touched,
                                            `bookingRooms.${index}.RatePlan`
                                          )
                                            ? 'error'
                                            : null
                                        }
                                      >
                                        <option value="">Choose</option>
                                        {filteredRateCal[
                                          getIn(
                                            values,
                                            `bookingRooms.${index}.RoomType`
                                          )
                                        ][
                                          getIn(
                                            values,
                                            `bookingRooms.${index}.MealPlan`
                                          )
                                        ]
                                          ? Object.keys(
                                              filteredRateCal[
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.RoomType`
                                                )
                                              ][
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.MealPlan`
                                                )
                                              ]
                                            ).map(ratePlan => (
                                              <option
                                                value={ratePlan}
                                                key={Math.random() * 10000}
                                              >
                                                {ratePlan}
                                              </option>
                                            ))
                                          : null}
                                      </Field>

                                      <ErrorMessage
                                        component="div"
                                        name={`bookingRooms.${index}.RatePlan`}
                                        className="input-feedback"
                                      />
                                    </Form.Group>

                                    {/* NUMBER OF PERSONS or TOTAL ADULTS */}
                                    <Form.Group
                                      as={Col}
                                      controlId="num_pax"
                                      md="auto"
                                    >
                                      <Form.Label column>
                                        Total Adults
                                      </Form.Label>
                                      <Col>
                                        <Field
                                          disabled={isDisabled}
                                          name={`bookingRooms.${index}.Pax`}
                                          as={Form.Control}
                                          onChange={e => {
                                            handleChange(e);

                                            const maxPax =
                                              filteredRateCal[
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.RoomType`
                                                )
                                              ][
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.MealPlan`
                                                )
                                              ][
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.RatePlan`
                                                )
                                              ][0].MaxPax;

                                            const extraPerson =
                                              Number(e.target.value) - maxPax;

                                            // Setting Extra person field based on the MaxPax received from Rate Calender
                                            if (e.target.value > maxPax) {
                                              setFieldValue(
                                                `bookingRooms.${index}.Expax`,
                                                `${extraPerson}`
                                              );

                                              // Setting up Extra person amount
                                              const ExPaxAmt =
                                                filteredRateCal[
                                                  getIn(
                                                    values,
                                                    `bookingRooms.${index}.RoomType`
                                                  )
                                                ][
                                                  getIn(
                                                    values,
                                                    `bookingRooms.${index}.MealPlan`
                                                  )
                                                ][
                                                  getIn(
                                                    values,
                                                    `bookingRooms.${index}.RatePlan`
                                                  )
                                                ][0].ExpaxRate;

                                              setFieldValue(
                                                `bookingRooms.${index}.ExpaxAmt`,
                                                `${extraPerson * ExPaxAmt}`
                                              );
                                            }
                                          }}
                                          className={
                                            getIn(
                                              errors,
                                              `bookingRooms.${index}.Pax`
                                            ) &&
                                            getIn(
                                              touched,
                                              `bookingRooms.${index}.Pax`
                                            )
                                              ? 'error'
                                              : null
                                          }
                                        />

                                        <ErrorMessage
                                          component="div"
                                          name={`bookingRooms.${index}.Pax`}
                                          className="input-feedback"
                                        />
                                      </Col>
                                    </Form.Group>

                                    {/* Expax */}
                                    <Form.Group
                                      as={Col}
                                      controlId="ex_pax"
                                      md="auto"
                                    >
                                      <Form.Label column>
                                        Extra Persons
                                      </Form.Label>
                                      <Col>
                                        <Field
                                          disabled={isDisabled}
                                          name={`bookingRooms.${index}.Expax`}
                                          as={Form.Control}
                                          onChange={e => {
                                            handleChange(e);

                                            const ExPaxAmt =
                                              filteredRateCal[
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.RoomType`
                                                )
                                              ][
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.MealPlan`
                                                )
                                              ][
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.RatePlan`
                                                )
                                              ][0].ExpaxRate;

                                            setFieldValue(
                                              `bookingRooms.${index}.ExpaxAmt`,
                                              `${e.target.value * ExPaxAmt}`
                                            );
                                          }}
                                          className={
                                            getIn(
                                              errors,
                                              `bookingRooms.${index}.Expax`
                                            ) &&
                                            getIn(
                                              touched,
                                              `bookingRooms.${index}.Expax`
                                            )
                                              ? 'error'
                                              : null
                                          }
                                        />

                                        <ErrorMessage
                                          component="div"
                                          name={`bookingRooms.${index}.Expax`}
                                          className="input-feedback"
                                        />
                                      </Col>
                                    </Form.Group>

                                    {/* Expax amount */}
                                    <Form.Group
                                      as={Col}
                                      controlId="ex_pax_amt"
                                      md="auto"
                                    >
                                      <Form.Label column>
                                        Extra Persons Amount
                                      </Form.Label>
                                      <Col>
                                        <Field
                                          name={`bookingRooms.${index}.ExpaxAmt`}
                                          as={Form.Control}
                                          onChange={e => {
                                            handleChange(e);
                                          }}
                                          className={
                                            getIn(
                                              errors,
                                              `bookingRooms.${index}.ExpaxAmt`
                                            ) &&
                                            getIn(
                                              touched,
                                              `bookingRooms.${index}.ExpaxAmt`
                                            )
                                              ? 'error'
                                              : null
                                          }
                                        />

                                        <ErrorMessage
                                          component="div"
                                          name={`bookingRooms.${index}.ExpaxAmt`}
                                          className="input-feedback"
                                        />
                                      </Col>
                                    </Form.Group>

                                    {/* Total Children */}
                                    <Form.Group
                                      as={Col}
                                      controlId="num_pax"
                                      md="auto"
                                    >
                                      <Form.Label column>
                                        Total Children
                                      </Form.Label>
                                      <Col>
                                        <Field
                                          disabled={isDisabled}
                                          name={`bookingRooms.${index}.child`}
                                          as={Form.Control}
                                          onChange={e => {
                                            handleChange(e);

                                            // Setting up Child amount
                                            const ChildAmt =
                                              filteredRateCal[
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.RoomType`
                                                )
                                              ][
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.MealPlan`
                                                )
                                              ][
                                                getIn(
                                                  values,
                                                  `bookingRooms.${index}.RatePlan`
                                                )
                                              ][0].ChildRate;

                                            setFieldValue(
                                              `bookingRooms.${index}.ChildAmt`,
                                              `${e.target.value * ChildAmt}`
                                            );
                                          }}
                                          className={
                                            getIn(
                                              errors,
                                              `bookingRooms.${index}.child`
                                            ) &&
                                            getIn(
                                              touched,
                                              `bookingRooms.${index}.child`
                                            )
                                              ? 'error'
                                              : null
                                          }
                                        />

                                        <ErrorMessage
                                          component="div"
                                          name={`bookingRooms.${index}.child`}
                                          className="input-feedback"
                                        />
                                      </Col>
                                    </Form.Group>
                                  </Form.Row>
                                </div>
                              ))}
                            </Container>
                          )}
                        />
                      </div>
                    </Container>

                    <Container>
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

                        <Form.Group as={Col} controlId="submitBtn" md="auto">
                          <Button
                            variant="outline-success"
                            type="reset"
                            disabled={isSubmitting}
                            onClick={handleReset}
                          >
                            Reset
                          </Button>
                        </Form.Group>
                      </Form.Row>
                    </Container>
                    <pre>Values: {JSON.stringify(values)}</pre>
                    <pre>Errors: {JSON.stringify(errors)}</pre>
                    <pre>Touched: {JSON.stringify(touched)}</pre>
                  </Form>
                </Container>
              </div>
            )}
          </Formik>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

// RoomDetailsNew.propTypes = {
//   rateCalender: PropTypes.object.isRequired,
// };

export default RoomDetailsNew;
