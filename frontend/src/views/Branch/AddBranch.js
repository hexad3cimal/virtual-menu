import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import { addBranch, getTimezones, hideAlert, getCurrencies, initiateBranchAdd, setBranch as setBranchInState } from '../../actions';
import { Formik } from 'formik';
import { getCurrentPosition, remoteValidate } from '../../modules/helpers';
import Toast from '../../modules/toast';

const AddBranch = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user) || {}
  const appState = useSelector((state) => state.app) || {};
  const branchState = useSelector((state) => state.branch) || {};
  const formErrors = useRef({});
  const formValues = useRef({ newPassword: '' });
  const [branch, setBranch] = useState({
    id: '',
    name: '',
    address: '',
    newUserName: '',
    newPassword: '',
    passwordConfirm: '',
    tz: '',
    currency: '',
    email: '',
    contact: '',
    edit: false,
    latitude: '',
    longitude: ''
  })

  const passwordRegex = new RegExp(
    "^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{5,})"
  );

  const selectedBranch = branchState.selectedBranch;
  if (selectedBranch && !branch.newUserName) {
    setBranch({ ...branch, ...selectedBranch, newUserName: selectedBranch.userName,tz: selectedBranch.config.timeZone, currency: selectedBranch.config.currency })
  } else {
    !branch.newUserName && setBranch({ ...branch, newUserName: user.user.name.split(" ").join("") + "-" })
  }
  if (appState.tzs) {
    !branch.tz && setBranch({ ...branch, tz: Intl.DateTimeFormat().resolvedOptions().timeZone })
  }

  if (appState.alert.show) {
    Toast({ message: appState.alert.message });
    dispatch(hideAlert());
  }


  useEffect(() => {
    dispatch(getTimezones())
    dispatch(getCurrencies())
  }, [])
  const errorRules = {
    newUserName: {
      required: true,
      remoteValidate: true,
      url: `${window.restAppConfig.api}user/validate?username`,
      errorMessages: {
        required: "Username is Required",
        remoteValidate: "Username already Taken",
      },
    },
    newPassword: {
      required: true,
      regex: passwordRegex,
      errorMessages: {
        required: "Password is Required",
        regex:
          "Password should contain at least 1 numeric,special character and be of atleast 5 characters",
      },
    },
    passwordConfirm: {
      required: true,
      compareWith: "newPassword",
      errorMessages: {
        required: "Please confirm the password",
        compareWith: "Password doesn't match",
      },
    },
    name: {
      required: true,
      errorMessages: { required: "Full name is Required" },
    },
    tz: {
      required: true,
      errorMessages: { required: "Timezone is Required" },
    },
    currency: {
      required: true,
      errorMessages: { required: "Currency is Required" },
    },
  };

  const back = () => {
    dispatch(initiateBranchAdd(false))
    dispatch(setBranchInState(null))
  }

  const getLocation = () => {
    getCurrentPosition().then(coords => {
      setBranch({ ...branch, latitude: coords.coords.latitude.toString(), longitude: coords.coords.longitude.toString() })
    }).catch(error => {
      Toast({ message: error.message });
      dispatch(hideAlert());
    })
  }

  const validate = async (values) => {
    const errors = {};
    if (branch.id && !formValues.current.newPassword.length) {
      errorRules['newPassword'].required = false;
      errorRules['passwordConfirm'].required = false;
    } else if (formValues.current.newPassword.length) {
      errorRules['newPassword'].required = true;
      errorRules['passwordConfirm'].required = true;
    }
    for (let value in errorRules) {
      if (errorRules[value] && errorRules[value].required) {
        if (!values[value]) {
          errors[value] = errorRules[value]["errorMessages"]["required"];
        }
        if (errorRules[value].remoteValidate) {
          if (
            formValues.current[value] !== values[value] ||
            formErrors.current[value]
          ) {

            let url = `${errorRules[value].url}=${values[value]}`
            if (branch.id) {
              url = `${url}&id=${branch.id}`
            }
            const result = await remoteValidate(
              url
            );
            if (!result)
              errors[value] =
                errorRules[value]["errorMessages"]["remoteValidate"];
          }
        }
        if (errorRules[value].regex) {
          if (!errorRules[value].regex.test(values[value]))
            errors[value] = errorRules[value]["errorMessages"]["regex"];
        }
        if (errorRules[value].compareWith) {
          if (values[value] !== values[errorRules[value]["compareWith"]])
            errors[value] = errorRules[value]["errorMessages"]["compareWith"];
        }
      }

    }
    formErrors.current = errors;
    formValues.current = { ...formValues.current, ...values };
    return errors;
  };

  return (
    <Formik
      enableReinitialize
      initialValues={
        branch
      }
      validate={validate}
      onSubmit={(values, formik) => {
        if (branch.id) {
          values.edit = true
        }
        dispatch(addBranch(values));
        formik.setSubmitting(false);
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form
          onSubmit={handleSubmit}
        >
          <Card>
            <CardHeader title={branch.id ? "Edit branch" : "Add new branch"} />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.name && errors.name)}
                    fullWidth
                    helperText={touched.name && errors.name}
                    label="Branch Name"
                    margin="normal"
                    name="name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.name}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.email && errors.email)}
                    fullWidth
                    helperText={touched.email && errors.email}
                    label="Email"
                    margin="normal"
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
                    variant="outlined"
                    type="email"
                  />
                </Grid>
                <Grid item md={6} xs={12}>

                  <TextField
                    error={Boolean(touched.newUserName && errors.newUserName)}
                    fullWidth
                    helperText={touched.newUserName && errors.newUserName}
                    label="Username"
                    margin="normal"
                    name="newUserName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.newUserName}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.contact && errors.contact)}
                    fullWidth
                    helperText={touched.contact && errors.contact}
                    label="Contact No"
                    margin="normal"
                    name="contact"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.contact}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(touched.newPassword && errors.newPassword)}
                    fullWidth
                    helperText={touched.newPassword && errors.newPassword}
                    label="Password"
                    margin="normal"
                    name="newPassword"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.newPassword}
                    variant="outlined"
                    type="password"
                    autoComplete="off"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(values.newPassword && errors.passwordConfirm)}
                    fullWidth
                    helperText={values.newPassword && errors.passwordConfirm}
                    label="Confirm Password"
                    margin="normal"
                    name="passwordConfirm"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.passwordConfirm}
                    variant="outlined"
                    type="password"
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Select TimeZone"
                    name="tz"
                    error={Boolean(touched.tz && errors.tz)}
                    helperText={touched.tz && errors.tz}
                    onChange={handleChange}
                    required
                    select
                    SelectProps={{ native: true }}
                    value={values.tz}
                    variant="outlined"
                    InputLabelProps={{ shrink: Boolean(values.tz) }}
                  >
                    <option key="" value=""></option>
                    {appState.tzs.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    fullWidth
                    label="Select Currency"
                    name="currency"
                    error={Boolean(touched.currency && errors.currency)}
                    helperText={touched.currency && errors.currency}
                    onChange={handleChange}
                    required
                    select
                    SelectProps={{ native: true }}
                    value={values.currency}
                    variant="outlined"
                    InputLabelProps={{ shrink: Boolean(values.tz) }}
                  >
                    <option key="" value=""></option>
                    {appState.currencies.map((currency, index) => (
                      <option key={currency.name + index} value={currency.symbol && currency.symbol.grapheme}>
                        {currency.name}
                      </option>
                    ))}
                  </TextField>
                </Grid>
                <Grid item md={12} xs={12}>
                  <TextField
                    error={Boolean(touched.address && errors.address)}
                    fullWidth
                    helperText={touched.address && errors.address}
                    label="Branch Address"
                    margin="normal"
                    name="address"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.address}
                    variant="outlined"
                    multiline={true}
                    rows={5}
                  />
                </Grid>
                <Grid item md={3} xs={12}>
                  <TextField
                    error={Boolean(touched.latitude && errors.latitude)}
                    fullWidth
                    helperText={touched.latitude && errors.latitude}
                    label="Latitude"
                    margin="normal"
                    name="latitude"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.latitude}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={3} xs={12}>
                  <TextField
                    error={Boolean(touched.longitude && errors.longitude)}
                    fullWidth
                    helperText={touched.longitude && errors.longitude}
                    label="Longitude"
                    margin="normal"
                    name="longitude"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.longitude}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={3} xs={12}>

                  <TextField
                    error={Boolean(touched.width && errors.width)}
                    fullWidth
                    helperText={touched.width && errors.width}
                    label="Approximate width"
                    margin="normal"
                    name="width"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.width}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={3} xs={12}>
                  <Button color="secondary" onClick={() => { getLocation() }} type="button" variant="contained">
                    Get current location
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <Box display="flex" justifyContent="space-between" p={2}>
              <Button color="secondary" onClick={() => { back() }} type="button" variant="contained">
                Go back
              </Button>
              <Button color="primary" type="submit" disabled={isSubmitting} variant="contained">
                {branch.id ? 'Update Branch' : 'Add Branch'}
              </Button>
            </Box>
          </Card>
        </form>
      )}
    </Formik>
  );
};


export default AddBranch;
