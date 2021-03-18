import React, { useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import makeStyles from "@material-ui/styles/makeStyles";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import Link from "@material-ui/core/Link";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import CircularProgress from '@material-ui/core/CircularProgress';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import Page from "../../components/Page";
import { useDispatch, useSelector } from "react-redux";
import { register, hideAlert } from "../../actions";
import Toast from "../../modules/toast";
import { remoteValidate } from "../../modules/helpers";
const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
  },
  link: {
    fontSize: "1rem",
    fontWeight: "600",
    marginLeft: ".5rem"
  }
}));

const RegisterView = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appState = useSelector((state) => state.app);
  const user = useSelector((state) => state.user);
  const formErrors = useRef({});
  const formValues = useRef({});

  const passwordRegex = new RegExp(
    "^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{5,})"
  );
  const emailRegex = new RegExp(
    "^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$"
  );
  if (appState.alert.show) {
    Toast({ message: appState.alert.message });
    dispatch(hideAlert());

    if (user.registered) navigate("/login");
  }

  const errorRules = {
    newEmail: {
      required: true,
      remoteValidate: true,
      url: `${window.restAppConfig.api}user/validate?email`,
      regex: emailRegex,
      errorMessages: {
        required: "Email is Required",
        remoteValidate: "Email already Taken",
        regex: "Enter a valid email",
      },
    },
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
      errorMessages: { required: "Org name is Required" },
    },
    registerIcon: {
      width: '1.2rem !important',
      height: 'unset !important',
      color: 'white'
    }
  };
  const validate = async (values) => {
    const errors = {};
    for (let value in values) {
      if (errorRules[value].required && !values[value]) {
        errors[value] = errorRules[value]["errorMessages"]["required"];
      }
      if (errorRules[value].remoteValidate) {
        if (
          formValues.current[value] !== values[value] ||
          formErrors.current[value]
        ) {
          const result = await remoteValidate(
            `${errorRules[value].url}=${values[value]}`
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

    formErrors.current = errors;
    formValues.current = values;
    return errors;
  };

  return (
    <Page className={classes.root} title="Register">
      <Box display="flex" height="100%" justifyContent="center">
        <Container maxWidth="sm">
          <Formik
            initialValues={{
              newEmail: "",
              name: "",
              newUserName: "",
              newPassword: "",
              passwordConfirm: "",
            }}
            validate={validate}
            onSubmit={(values) => {
              values.org = true;
              dispatch(register(values));
            }}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit,
              touched,
              values,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box mb={3}>
                  <Typography color="textPrimary" variant="h2">
                    Create new account
                  </Typography>
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    variant="body2"
                  >
                    Fill in details to create new account
                  </Typography>
                </Box>
                <TextField
                  error={Boolean(touched.name && errors.name)}
                  fullWidth
                  helperText={touched.name && errors.name}
                  label="Org name"
                  margin="normal"
                  name="name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.name}
                  variant="outlined"
                />
                <TextField
                  error={Boolean(touched.newEmail && errors.newEmail)}
                  fullWidth
                  helperText={touched.newEmail && errors.newEmail}
                  label="Email Address"
                  margin="normal"
                  name="newEmail"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="email"
                  value={values.newEmail}
                  variant="outlined"
                />
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
                <TextField
                  error={Boolean(touched.newPassword && errors.newPassword)}
                  fullWidth
                  helperText={touched.newPassword && errors.newPassword}
                  label="Password"
                  margin="normal"
                  name="newPassword"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="password"
                  value={values.newPassword}
                  variant="outlined"
                />
                <TextField
                  error={Boolean(
                    touched.passwordConfirm && errors.passwordConfirm
                  )}
                  fullWidth
                  helperText={touched.passwordConfirm && errors.passwordConfirm}
                  label="Confirm Password"
                  margin="normal"
                  name="passwordConfirm"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  type="password"
                  value={values.passwordConfirm}
                  variant="outlined"
                />
                <Box my={2}>
                  <Button
                    color="primary"
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    endIcon={user.status === 'loading' ? <CircularProgress className={classes.registerIcon} /> : <ArrowForwardIosIcon className={classes.registerIcon} />}
                  >
                    Sign up now
                  </Button>
                </Box>
                <Typography color="textSecondary" variant="body1">
                  Have an account?
                  <Link component={RouterLink} to="/login" className={classes.link}>
                    Sign in
                  </Link>
                </Typography>
              </form>
            )}
          </Formik>
        </Container>
      </Box>
    </Page>
  );
};

export default RegisterView;
