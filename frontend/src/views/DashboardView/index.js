import React, { useMemo } from "react";
import makeStyles from "@material-ui/styles/makeStyles";
import  Container from "@material-ui/core/Container";
import  Grid from "@material-ui/core/Grid";

import Page from "../../components/Page";
import LatestOrders from "./LatestOrders";
import Orders from "./Orders";
import Cost from "./Cost";
import Products from "./Products";
import { getDashboardStats } from "../../actions";
import { useDispatch } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100%",
    paddingBottom: theme.spacing(3),
    paddingTop: theme.spacing(3),
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  useMemo(()=>{dispatch(getDashboardStats())}, [dispatch])
  
  return (
    <Page className={classes.root} title="Dashboard">
      <Container maxWidth={false}>
        <Grid container spacing={3}>
          <Grid item lg={4} sm={4} xl={4} xs={12}>
            <Orders />
          </Grid>
          <Grid item lg={4} sm={4} xl={4} xs={12}>
            <Products />
          </Grid>
          <Grid item lg={4} sm={4} xl={4} xs={12}>
            <Cost />
          </Grid>
          <Grid item md={12}>
            <LatestOrders />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
};

export default Dashboard;
