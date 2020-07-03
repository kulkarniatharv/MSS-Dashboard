/* eslint-disable no-use-before-define */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import RoomDetails from './RoomDetails';

// JSON Format
// submission = {
//   clsHotelID: {},
//   bookingDetailV8: { channelId: '' },
//   bookingRooms: [{}, {}],
// };

const bookingForm = props => {
  const [submissionObj, setSubmissionObj] = useState({
    clsHotelID: {
      HotelId: 'htlname',
    },
  });
  const [formRooms, setFormRooms] = useState([]);

  // useEffect(() => {
  //   console.log(submissionObj);
  // });

  const formik = useFormik({
    initialValues: {
      // BookingCode: '',
      // Checkin: '',
      // Checkout: '',
      // NumNights: '',
      NumRooms: '',
      // DateBooked: '',
      // CustomerName: '',
      // CustomerEmail: '',
      // CustomerMobile: '',
      // TotalAdults: '',
      // TotalChidren: '',
    },
    validationSchema: Yup.object().shape({
      // Checkin: Yup.date().required(),
      // Checkout: Yup.date()
      //   .required()
      //   .when('Checkin', (Checkin, schema) => Checkin && schema.min(Checkin)),
      // NumNights: Yup.string().matches(/^[0-9]*$/),
      NumRooms: Yup.string().matches(/^[0-9]*$/),
      // DateBooked: Yup.date()
      //   .required()
      //   .when('Checkin', (Checkin, schema) => Checkin && schema.min(Checkin)),
      // CustomerName: Yup.string()
      //   .max(30, 'Must be 30 characters or less')
      //   .required('Required'),
      // CustomerEmail: Yup.string()
      //   .email('Invalid email address')
      //   .required('Required'),
      // CustomerMobile: Yup.string().matches(
      //   /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/,
      //   'Phone number is not valid'
      // ),
      // TotalAdults: Yup.string().matches(/^[0-9]*$/),
      // TotalChidren: Yup.string().matches(/^[0-9]*$/),
    }),
    onSubmit: values => {
      bookingDetailHandler();
      setSubmissionObj({
        ...submissionObj,
        bookingDetailV8: values,
      });
      console.log(submissionObj);
    },
  });

  // =========== EVENT HANDLERS ======================

  // eslint-disable-next-line prefer-const
  let roomForms = [];

  const bookingDetailHandler = () => {
    roomForms.push(<p key={0}>Fill out room details here.</p>);

    for (let i = 0; i < formik.values.NumRooms; i += 1) {
      console.log(roomForms);
      roomForms
        .push
        // <RoomDetails key={i + 1} onSubmit={() => roomDetailsSubmitHandler()} />
        ();
    }

    setFormRooms(roomForms);
  };

  return (
    <div>
      <h2>from</h2>
      <form onSubmit={formik.handleSubmit}>
        {/* <label>
          CheckIn
          <input
            name="Checkin"
            {...formik.getFieldProps('Checkin')}
            type="date"
          />
        </label>
        {formik.touched.Checkin && formik.errors.Checkin ? (
          <div>{formik.errors.Checkin}</div>
        ) : null}

        <label>
          CheckOut
          <input
            name="Checkout"
            {...formik.getFieldProps('Checkout')}
            type="date"
          />
        </label>
        {formik.touched.Checkout && formik.errors.Checkout ? (
          <div>{formik.errors.Checkout}</div>
        ) : null} 
 
        <label>
          Number of Nights
          <input name="NumNights" {...formik.getFieldProps('NumNights')} />
        </label>
        {formik.touched.NumNights && formik.errors.NumNights ? (
          <div>{formik.errors.NumNights}</div>
        ) : null} */}

        <label>
          Number of Rooms
          <input name="NumRooms" {...formik.getFieldProps('NumRooms')} />
        </label>
        {formik.touched.NumRooms && formik.errors.NumRooms ? (
          <div>{formik.errors.NumRooms}</div>
        ) : null}
        {/*
        <label>
          Date Booked
          <input
            name="DateBooked"
            {...formik.getFieldProps('DateBooked')}
            type="date"
          />
        </label>
        {formik.touched.DateBooked && formik.errors.DateBooked ? (
          <div>{formik.errors.DateBooked}</div>
        ) : null}

        <label>
          Customer Name
          <input
            name="CustomerName"
            {...formik.getFieldProps('CustomerName')}
          />
        </label>
        {formik.touched.CustomerName && formik.errors.CustomerName ? (
          <div>{formik.errors.CustomerName}</div>
        ) : null}

        <label>
          Customer Email
          <input
            name="CustomerEmail"
            {...formik.getFieldProps('CustomerEmail')}
            type="email"
          />
        </label>
        {formik.touched.CustomerEmail && formik.errors.CustomerEmail ? (
          <div>{formik.errors.CustomerEmail}</div>
        ) : null}

        <label>
          Customer Mobile
          <input
            name="CustomerMobile"
            {...formik.getFieldProps('CustomerMobile')}
          />
        </label>
        {formik.touched.CustomerMobile && formik.errors.CustomerMobile ? (
          <div>{formik.errors.CustomerMobile}</div>
        ) : null}

        <label>
          Total Adults
          <input name="TotalAdults" {...formik.getFieldProps('TotalAdults')} />
        </label>
        {formik.touched.TotalAdults && formik.errors.TotalAdults ? (
          <div>{formik.errors.TotalAdults}</div>
        ) : null}

        <label>
          Total Chidren
          <input
            name="TotalChidren"
            {...formik.getFieldProps('TotalChidren')}
          />
        </label>
        {formik.touched.TotalChidren && formik.errors.TotalChidren ? (
          <div>{formik.errors.TotalChidren}</div>
        ) : null} */}
        <button type="submit">Submit</button>
      </form>
      <hr />
      <h2>Will Render the next part here!</h2>
      {formRooms}
    </div>
  );
};

export default bookingForm;
