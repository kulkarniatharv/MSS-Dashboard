/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import { Formik, Field, getIn, ErrorMessage, FieldArray } from 'formik';
import './BookingForm.css';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import * as Yup from 'yup';
import Axios from 'axios';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';

// JSON Format
// submission = {
//   clsHotelID: {},
//   bookingDetailV8: { channelId: '' },
//   bookingRooms: [{}, {}],
// };

// TODO:
// * Calculate taxes on the amount
// * Clear out what is MstRate and RRate
// * PropTypes validation is disabled. Enable it.
// * Change the styles of the form.

// FIXME:
// * MstRate and RRate not updating when values in the dropdown are updated for that particular room. Fix this by adding event handler in that dropdown to change MstRate and RRate
// * If you click on Number of Room input field and don't change anything, all the fields in room details get disabled.

// =================== EVENT HANDLERS ====================
const addRoomHandler = (
  array,
  NumOfRooms,
  filteredRateCal,
  RoomTypeData,
  MealPlanData,
  RatePlanData,
  bookingCode
) => {
  const newLength = NumOfRooms - array.length;
  if (newLength < 0) {
    for (let i = newLength; i < 0; i += 1) {
      array.pop();
    }
  } else if (newLength > 0) {
    for (let i = 0; i < newLength; i += 1) {
      array.push({
        BookingCode: bookingCode,
        RoomTypeCode: RoomTypeData[0],
        MasterRoom: RoomTypeData[0],
        SchemeName: 'S1',
        RatePlan: '',
        RoomType: RoomTypeData[0],
        MstRate:
          filteredRateCal[RoomTypeData[0]][MealPlanData[0]][
            Object.keys(filteredRateCal[RoomTypeData[0]][MealPlanData[0]])[0]
          ][0].RRate,
        RRate:
          filteredRateCal[RoomTypeData[0]][MealPlanData[0]][
            Object.keys(filteredRateCal[RoomTypeData[0]][MealPlanData[0]])[0]
          ][0].RRate,
        MealPlan: MealPlanData[0],
        Pax: '',
        child: '',
        Expax: '',
        Amount: '',
        ExpaxAmt: 0,
        ChildAmt: 0,
        AllAmtInClude: '',
        GuestCheckInNo: '',
        NumRooms: 1,
      });
    }
  }
};

const updateTotalAdultsChildren = (
  adult,
  setFieldValue,
  fieldName,
  FormValues,
  eventValue,
  currIndex
) => {
  setFieldValue(
    fieldName,
    FormValues.bookingRooms
      .map((obj, objIndex) => {
        if (objIndex === currIndex) {
          return Number(eventValue);
        }
        if (!adult) {
          return Number(obj.child);
        }
        return Number(obj.Pax);
      })
      .reduce((total, peoplePerRoom) => total + peoplePerRoom)
  );
};

const updateTotalAmt = (
  setFieldValue,
  FormValues,
  NumNights,
  roomAmt,
  currIndex
) => {
  setFieldValue(
    'bookingDetailV8.BilledAmount',
    Number(
      Number(NumNights) *
        FormValues.bookingRooms
          .map((room, index) => {
            if (index === currIndex) {
              return roomAmt;
            }
            return Number(room.Amount);
          })
          .reduce((total, AmountPerRoom) => total + AmountPerRoom)
    )
  );
};

const calcRoomAmt = (
  filteredRateCal,
  setFieldValue,
  fieldName,
  FormValues,
  eventValue,
  currIndex,
  isChildren
) => {
  const roomDetail =
    filteredRateCal[FormValues.bookingRooms[currIndex].RoomType][
      FormValues.bookingRooms[currIndex].MealPlan
    ][FormValues.bookingRooms[currIndex].RatePlan][0];

  let roomAmt = null;

  // Calculating the Room specific amount
  if (!isChildren) {
    roomAmt =
      Number(roomDetail.RRate) +
      Number(eventValue) * roomDetail.ExpaxRate +
      Number(FormValues.bookingRooms[currIndex].ChildAmt);
  } else {
    roomAmt =
      Number(roomDetail.RRate) +
      Number(FormValues.bookingRooms[currIndex].ExpaxAmt) +
      Number(eventValue) * roomDetail.ChildRate;
  }

  setFieldValue(fieldName, roomAmt);

  // Calculating the total amount
  updateTotalAmt(
    setFieldValue,
    FormValues,
    FormValues.bookingDetailV8.NumNights,
    roomAmt,
    currIndex
  );
};

// ======================VALIDATION SCHEMA===================================
const validationSchema = Yup.object({
  clsHotelID: Yup.object({
    HotelId: Yup.string().required('No hotel id provided.'),
  }),
  bookingDetailV8: Yup.object({
    BookingCode: Yup.string().required(),
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
      ExpaxAmt: Yup.number().required('Extra person amt is required!'),
      ChildAmt: Yup.number().required('Children amt is required!'),
      Amount: Yup.number().required('Amount is required!'),
    })
  ),
});

// ===================RENDER COMPONENT===================================
const RoomDetailsNew = props => {
  const { hotelid, bookingCode, getJWT, location } = props;

  // STATE VARIABLES
  const [rateCal, setRateCal] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [checkinDate, setCheckinDate] = useState(
    new Date()
      .toLocaleDateString('en-IE')
      .replace(
        /\/.*\//,
        `/${new Date().toLocaleDateString('default', { month: 'short' })}/`
      )
  );
  const [checkoutDate, setCheckoutDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 7))
      .toLocaleDateString('en-IE')
      .replace(
        /\/.*\//,
        `/${new Date().toLocaleDateString('default', { month: 'short' })}/`
      )
  );

  const filteredRateCal = {};
  let RoomTypeData;
  let MealPlanData;
  let RatePlanData;

  // Method to send POST request to /GetRateCalender
  const GetRateCalender = () => {
    console.log('Sending GetRateCalender req from BookingForm');
    console.log('CI: ', checkinDate, 'CO: ', checkoutDate);

    // console.log('Token', getJWT());

    Axios.post(
      'http://hms.multitechsoftsystem.com/api/GetRateCalender',
      {
        HotelID: { HotelId: hotelid },
        FromDate: '01/JAN/2021', // checkinDate,
        ToDate: '31/JAN/2021', // checkoutDate,
      },
      {
        headers: {
          Authorization: `Bearer ${getJWT()}`,
        },
      }
    ).then(
      response => {
        setRateCal(response.data);
        console.log('Rate calender: ', response.data);
      },
      error => {
        if (error.response.status === 401) {
          props.history.push({
            pathname: '/login',
            state: {
              referrer: location.pathname,
            },
          });
        }
        console.log(error.response.status);
      }
    );
  };

  useEffect(GetRateCalender, [checkinDate, checkoutDate]);

  // filtering the receiced Rate Calender JSON Object
  if (rateCal) {
    for (const item of rateCal) {
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
      } else {
        filteredRateCal[item.RoomType][item.MealPlan][item.RatePlan].push(item);
      }
    }

    console.log('Filtered Data: ', filteredRateCal);

    if (Object.keys(filteredRateCal).length !== 0) {
      RoomTypeData = Object.keys(filteredRateCal);
      MealPlanData = Object.keys(filteredRateCal[RoomTypeData[0]]);
      RatePlanData = Object.keys(
        filteredRateCal[RoomTypeData[0]][MealPlanData[0]]
      );

      // console.log('RoomTypeData', RoomTypeData);
      // console.log('MealPlanData', MealPlanData);
      // console.log('RatePlanData', RatePlanData);
    }
  }

  return (
    <div>
      {rateCal && Object.keys(filteredRateCal).length !== 0 ? (
        <div>
          <Link to="/">Home</Link>
          <Formik
            initialValues={{
              clsHotelID: {
                HotelId: 'htlname',
              },
              bookingDetailV8: {
                ChannelId: 100,
                ChannelName: 'CHANNELONE',
                BookingCode: bookingCode,
                Checkin: new Date().toJSON().slice(0, 10),
                Checkout: new Date(new Date().setDate(new Date().getDate() + 1))
                  .toJSON()
                  .slice(0, 10),
                NumNights: 1,
                NumRooms: 1,
                BookingStatus: 'CONF',
                DateBooked: new Date().toJSON().slice(0, 10),
                CustomerName: '',
                CustomerEmail: '',
                CustomerMobile: '',
                TotalAdults: 0,
                TotalChildren: 0,
                CustomerSpecialRequest: 'NONE',
                BilledAmount:
                  filteredRateCal[RoomTypeData[0]][MealPlanData[0]][
                    RatePlanData[0]
                  ][0].RRate,
                PaymentType: 'ONLINE',
                BookingDetailUrl: '', // null
              },
              bookingRooms: [
                {
                  BookingCode: bookingCode,
                  RoomTypeCode: RoomTypeData[0],
                  MasterRoom: RoomTypeData[0], // SAME AS RoomType
                  SchemeName: 'S1', // fixed
                  RatePlan: Object.keys(
                    filteredRateCal[RoomTypeData[0]][MealPlanData[0]]
                  )[0], // included in GET request. Dropdown
                  RoomType: RoomTypeData[0], // included in GET request. Dropdown
                  MstRate:
                    filteredRateCal[RoomTypeData[0]][MealPlanData[0]][
                      RatePlanData[0]
                    ][0].RRate, // RRate of RateCalender
                  RRate:
                    filteredRateCal[RoomTypeData[0]][MealPlanData[0]][
                      RatePlanData[0]
                    ][0].RRate, // If MstRate is changed then change this field and not MstRate
                  MealPlan: MealPlanData[0], // included in GET request. Dropdown
                  Pax: '', // Number of people. Check if they are less than or equal to maxPax, and update Expax field for any extra person
                  child: 0, // No of children (>8yr)
                  Expax: 0, // extra person
                  Amount:
                    filteredRateCal[RoomTypeData[0]][MealPlanData[0]][
                      RatePlanData[0]
                    ][0].RRate, // Same as RRate
                  ExpaxAmt: 0, // included in GET request. Expax * Rate received for single expax from req
                  ChildAmt: 0, // included in GET request. child * Rate received for single child from req
                  AllAmtInClude: '', // "Y" or "N" Dropdown
                  GuestCheckInNo: '', // blank
                  NumRooms: 1, // Number of rooms of that type
                },
              ],
            }}
            validationSchema={validationSchema}
            onSubmit={(data, { setSubmitting }) => {
              console.log('Booking data: ', data);

              data.bookingRooms.forEach(eachRoom => {
                eachRoom.Pax = Number(eachRoom.Pax);
                eachRoom.child = Number(eachRoom.child);
                eachRoom.Expax = Number(eachRoom.Expax);
              });

              setSubmitting(true);
              // make async call to http://hms.multitechsoftsystem.co.in/api/Book
              Axios.post('http://hms.multitechsoftsystem.com/api/Book', data, {
                headers: {
                  Authorization: `Bearer ${getJWT()}`,
                },
              })
                .then(res => {
                  console.log('booked');
                  setSubmitting(false);
                })
                .catch(err => {
                  if (err.response.status === 401) {
                    props.history.push({
                      pathname: '/login',
                      state: {
                        referrer: location.pathname,
                      },
                    });
                  }
                  console.log(err);
                  setSubmitting(false);
                });
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
              <div className="form-container booking-form">
                <Container className="animate__animated animate__fadeIn">
                  <Form noValidate onSubmit={handleSubmit}>
                    {/* THE MAIN FORM */}

                    <Container>
                      <Form.Row>
                        {/* Checkin */}
                        <Form.Group as={Col} controlId="checkin" md="4">
                          <Form.Label column>CheckIn</Form.Label>
                          <Col>
                            <Field
                              name="bookingDetailV8.Checkin"
                              type="date"
                              as={Form.Control}
                              onChange={e => {
                                handleChange(e);

                                const date = new Date(e.target.value);

                                setFieldValue(
                                  'bookingDetailV8.NumNights',
                                  `${
                                    values.bookingDetailV8.Checkin
                                      ? (new Date(
                                          values.bookingDetailV8.Checkout
                                        ) -
                                          date) /
                                        (1000 * 3600 * 24)
                                      : 0
                                  }`
                                );

                                if (
                                  new Date(checkinDate) !==
                                  new Date(e.target.value)
                                ) {
                                  let updatedDate = new Date(e.target.value);

                                  updatedDate = `${updatedDate.getDate()}/${updatedDate.toLocaleString(
                                    'default',
                                    {
                                      month: 'short',
                                    }
                                  )}/${updatedDate.getFullYear()}`;

                                  console.log('Updated Date: ', updatedDate);

                                  setCheckinDate(updatedDate);
                                }
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
                        <Form.Group as={Col} controlId="checkout" md="4">
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

                                if (
                                  new Date(checkoutDate) !==
                                  new Date(e.target.value)
                                ) {
                                  let updatedDate = new Date(e.target.value);

                                  updatedDate = `${updatedDate.getDate()}/${updatedDate.toLocaleString(
                                    'default',
                                    {
                                      month: 'short',
                                    }
                                  )}/${updatedDate.getFullYear()}`;

                                  console.log('Updated Date: ', updatedDate);

                                  setCheckoutDate(updatedDate);
                                }
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

                        {/* Booking Code */}
                        <Form.Group as={Col} controlId="booking_code" md="4">
                          <Form.Label column>Booking Code</Form.Label>
                          <Col>
                            <Field
                              name="bookingDetailV8.BookingCode"
                              as={Form.Control}
                              value={values.bookingDetailV8.BookingCode}
                              onChange={e => {
                                handleChange(e);
                              }}
                              className={
                                getIn(errors, 'bookingDetailsV8.BookingCode') &&
                                getIn(touched, 'bookingDetailsV8.BookingCode')
                                  ? 'error'
                                  : null
                              }
                            />
                            <ErrorMessage
                              component="div"
                              name="bookingDetailV8.BookingCode"
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
                                getIn(touched, 'bookingDetailsV8.CustomerName')
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
                                getIn(touched, 'bookingDetailsV8.CustomerEmail')
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

                                // Updating the total amount
                                updateTotalAmt(
                                  setFieldValue,
                                  values,
                                  e.target.value
                                );
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
                                  filteredRateCal,
                                  RoomTypeData,
                                  MealPlanData,
                                  RatePlanData,
                                  bookingCode
                                );
                                setIsDisabled(true);
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
                          <>
                            {/* THE ERROR MESSAGE */}
                            {isDisabled ? (
                              <div style={{ color: 'red' }}>
                                Room Type, Meal Plan and Rate Plan of all the
                                rooms should be selected to edit the disabled
                                fields
                              </div>
                            ) : null}

                            {values.bookingRooms.map((room, index) => (
                              <div key={index}>
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
                                            setFieldValue(
                                              `bookingRooms.${index}.Amount`,
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
                                              ][0].RRate
                                            );

                                            setFieldValue(
                                              'MasterRoom',
                                              e.target.value
                                            );
                                            setFieldValue(
                                              'RoomTypeCode',
                                              e.target.value
                                            );
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
                                            setFieldValue(
                                              `bookingRooms.${index}.Amount`,
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
                                              ][0].RRate
                                            );
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

                                            // Setting the amount of room to given RRate in the RateCalender
                                            setFieldValue(
                                              `bookingRooms.${index}.Amount`,
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
                                              ][e.target.value][0].RRate
                                            );
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
                                </Form.Row>

                                <Form.Row>
                                  {/* NUMBER OF PERSONS or TOTAL ADULTS */}
                                  <Form.Group
                                    as={Col}
                                    controlId="num_pax"
                                    md="auto"
                                  >
                                    <Form.Label column>
                                      Adults
                                      {!isDisabled
                                        ? ` (more than ${
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
                                            ][0].MaxPax
                                          } will be considered in extra persons)`
                                        : null}
                                    </Form.Label>
                                    <Col>
                                      <Field
                                        disabled={isDisabled}
                                        name={`bookingRooms.${index}.Pax`}
                                        placeholder="Including extra persons"
                                        as={Form.Control}
                                        onChange={e => {
                                          handleChange(e);

                                          updateTotalAdultsChildren(
                                            true,
                                            setFieldValue,
                                            'bookingDetailV8.TotalAdults',
                                            values,
                                            e.target.value,
                                            index
                                          );

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
                                            const ExPaxAmt = Number(
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
                                              ][0].ExpaxRate
                                            );

                                            setFieldValue(
                                              `bookingRooms.${index}.ExpaxAmt`,
                                              Number(extraPerson * ExPaxAmt)
                                            );
                                          } else {
                                            setFieldValue(
                                              `bookingRooms.${index}.Expax`,
                                              ``
                                            );
                                            setFieldValue(
                                              `bookingRooms.${index}.ExpaxAmt`,
                                              0
                                            );
                                          }

                                          // Setting Amount field
                                          calcRoomAmt(
                                            filteredRateCal,
                                            setFieldValue,
                                            `bookingRooms.${index}.Amount`,
                                            values,
                                            extraPerson,
                                            index
                                          );
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
                                </Form.Row>

                                <Form.Row>
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

                                          const roomDetail =
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
                                            ][0];

                                          const ExPaxAmt = roomDetail.ExpaxRate;

                                          // Setting the Extra persons amount field
                                          setFieldValue(
                                            `bookingRooms.${index}.ExpaxAmt`,
                                            Number(e.target.value * ExPaxAmt)
                                          );

                                          // Updating the amount of the rooms
                                          calcRoomAmt(
                                            filteredRateCal,
                                            setFieldValue,
                                            `bookingRooms.${index}.Amount`,
                                            values,
                                            e.target.value,
                                            index
                                          );

                                          // Updating the Pax field
                                          const newTotalAdults =
                                            Number(e.target.value) +
                                            Number(roomDetail.MaxPax);

                                          setFieldValue(
                                            `bookingRooms.${index}.Pax`,
                                            newTotalAdults
                                          );

                                          // Updating the total adults in bookingDetailV8
                                          updateTotalAdultsChildren(
                                            true,
                                            setFieldValue,
                                            'bookingDetailV8.TotalAdults',
                                            values,
                                            newTotalAdults,
                                            index
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
                                        disabled
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
                                    <Form.Label column>Children</Form.Label>
                                    <Col>
                                      <Field
                                        disabled={isDisabled}
                                        name={`bookingRooms.${index}.child`}
                                        as={Form.Control}
                                        onChange={e => {
                                          handleChange(e);

                                          updateTotalAdultsChildren(
                                            false,
                                            setFieldValue,
                                            'bookingDetailV8.TotalChildren',
                                            values,
                                            e.target.value,
                                            index
                                          );

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
                                            Number(e.target.value * ChildAmt)
                                          );

                                          calcRoomAmt(
                                            filteredRateCal,
                                            setFieldValue,
                                            `bookingRooms.${index}.Amount`,
                                            values,
                                            e.target.value,
                                            index,
                                            true
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

                                  {/* Children amount */}
                                  <Form.Group
                                    as={Col}
                                    controlId="child_amt"
                                    md="auto"
                                  >
                                    <Form.Label column>
                                      Children Amount
                                    </Form.Label>
                                    <Col>
                                      <Field
                                        disabled
                                        name={`bookingRooms.${index}.ChildAmt`}
                                        as={Form.Control}
                                        onChange={e => {
                                          handleChange(e);
                                        }}
                                        className={
                                          getIn(
                                            errors,
                                            `bookingRooms.${index}.ChildAmt`
                                          ) &&
                                          getIn(
                                            touched,
                                            `bookingRooms.${index}.ChildAmt`
                                          )
                                            ? 'error'
                                            : null
                                        }
                                      />

                                      <ErrorMessage
                                        component="div"
                                        name={`bookingRooms.${index}.ChildAmt`}
                                        className="input-feedback"
                                      />
                                    </Col>
                                  </Form.Group>
                                </Form.Row>

                                <Form.Row>
                                  {/* Amount/Night */}
                                  <Form.Group
                                    as={Col}
                                    controlId="child_amt"
                                    md="auto"
                                  >
                                    <Form.Label column>Amount/Night</Form.Label>
                                    <Col>
                                      <Field
                                        disabled
                                        name={`bookingRooms.${index}.Amount`}
                                        as={Form.Control}
                                        onChange={e => {
                                          handleChange(e);
                                        }}
                                        className={
                                          getIn(
                                            errors,
                                            `bookingRooms.${index}.Amount`
                                          ) &&
                                          getIn(
                                            touched,
                                            `bookingRooms.${index}.Amount`
                                          )
                                            ? 'error'
                                            : null
                                        }
                                      />

                                      <ErrorMessage
                                        component="div"
                                        name={`bookingRooms.${index}.Amount`}
                                        className="input-feedback"
                                      />
                                    </Col>
                                  </Form.Group>
                                </Form.Row>
                              </div>
                            ))}
                          </>
                        )}
                      />

                      <hr />

                      <Container>
                        <Form.Row>
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
                                onChange={e => {
                                  handleChange(e);
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
                                value={values.bookingRooms
                                  .map(room => Number(room.child))
                                  .reduce(
                                    (total, childrenPerRoom) =>
                                      total + childrenPerRoom
                                  )}
                                onChange={e => {
                                  handleChange(e);
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

                          {/* Total Amount */}
                          <Form.Group
                            as={Col}
                            controlId="total_children"
                            md="auto"
                          >
                            <Form.Label column>Total Amount</Form.Label>
                            <Col>
                              <Field
                                disabled
                                name="bookingDetailV8.BilledAmount"
                                as={Form.Control}
                                onChange={e => {
                                  handleChange(e);
                                }}
                                className={
                                  getIn(
                                    errors,
                                    'bookingDetailsV8.BilledAmount'
                                  ) &&
                                  getIn(
                                    touched,
                                    'bookingDetailsV8.BilledAmount'
                                  )
                                    ? 'error'
                                    : null
                                }
                              />
                              <ErrorMessage
                                component="div"
                                name="bookingDetailV8.BilledAmount"
                                className="input-feedback"
                              />
                            </Col>
                          </Form.Group>
                        </Form.Row>
                      </Container>
                    </Container>

                    {/* THE BUTTONS */}
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
        <>LOADING...</>
      )}
    </div>
  );
};

export default withRouter(RoomDetailsNew);
