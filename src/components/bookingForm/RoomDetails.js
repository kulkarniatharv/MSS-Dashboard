/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { useFormik, Formik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';

const roomDetails = props => {
  const formik = useFormik({
    initialValues: {
      // BookingCode: '',
      // RoomTypeCode: '',
      // MasterRoom: '',
      // SchemeName: 'S1',
      // RatePlan: '',
      // RoomType: '',
      // MstRate: '',
      // RRate: '',
      // MealPlan: '',
      // Pax: '',
      // child: '',
      // Expax: '',
      // Amount: '',
      // ExpaxAmt: '',
      // ChildAmt: '',
      // AllAmtInClude: '',
      // GuestCheckInNo: '',
      // NumRooms: 1,
    },
    mapPropsToValues: () => ({ RoomTypeCode: '' }),
    validationSchema: Yup.object().shape({
      RoomTypeCode: Yup.string().required('Room Type is required!'),
    }),
    onSubmit: values => {
      console.log(values);
      // props.onSubmit(values);
    },
  });
  // const [room, setRoom] = useState({});

  return (
    <div>
      <h2>Room details</h2>
      <form onSubmit={formik.onSubmit}>
        <label htmlFor="RoomTypeCode" style={{ display: 'block' }}>
          Room Type Code
        </label>
        <select
          name="RoomTypeCode"
          style={{ display: 'block' }}
          value={formik.values.RoomTypeCode}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        >
          <option value="" label="Room Type" />
          <option value="DLX" label="Deluxe" />
          <option value="EXE" label="Executive" />
        </select>
        {formik.errors.color && formik.touched.color && (
          <div className="input-feedback">{formik.errors.color}</div>
        )}
        <button type="submit">Submit Room</button>
      </form>
    </div>
  );
};
// roomDetails.propTypes = {
//   onSubmit: PropTypes.func.isRequired,
// };

export default roomDetails;
