import React, { useEffect } from "react";
import makeStyles from "@material-ui/styles/makeStyles";
import  Box from "@material-ui/core/Box";
import  Button from "@material-ui/core/Button";
import  Container from "@material-ui/core/Container";
import  Grid from "@material-ui/core/Grid";
import  Typography from "@material-ui/core/Typography";

import { useDispatch, useSelector } from "react-redux";

import Page from "../../components/Page";
import BranchList from "./BranchList";
import { getBranches, hideAlert, initiateBranchAdd, setBranch } from "../../actions";
import AddBranch from "./AddBranch";
import Toast from "../../modules/toast";
import { branches } from "../../selectors/branch";
const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
  },
}));

const Branch = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const appState = useSelector((state) => state.app);
  const branchState = useSelector((state) => state.branch);
  const branchesInState = useSelector(branches);
  const userState = useSelector(state => state.user) || {}

  if (appState.alert.show) {
    Toast({ message: appState.alert.message });
    dispatch(hideAlert());
  }

  useEffect(() => {
    dispatch(getBranches());
    dispatch(setBranch(null))
  }, []);
  return (
    <Page className={classes.root} title="Branches">
      <Container maxWidth={false}>
        <Box display="flex" justifyContent="flex-end" style={{ margin: '1rem' }}>
          <Button onClick={() => dispatch(initiateBranchAdd(true))} color="primary" variant="contained">
            Add branch
        </Button>
        </Box>

        {branchState && branchState.add ? (
          <Box mt={3}>
            <AddBranch />
          </Box>
        ) : (
          <Grid container mt={3}>
            {branchesInState.length && userState.user.role === 'admin' ? (
              <Grid item md={12} xs={12}>
                <BranchList branches={branchesInState} />
              </Grid>
            ) : <div></div>}
            {!branchesInState.length && userState.user.role === 'admin' ? (<Typography style={{ margin: '1rem' }} variant="h4">No branches added yet please <Button onClick={() => dispatch(initiateBranchAdd(true))} color="primary" variant="contained">
              Add branch
          </Button></Typography>) : <div></div>}
          </Grid>
        )}
      </Container>
    </Page>
  );
};

export default Branch;
