import React, { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
  makeStyles,
  Container,
  TableRow,
  TableCell,
  TableBody,
  Table,
  IconButton,
  Collapse,
  Grid,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Order from "./Order";
import {
  getOrderByTableId,
  getProducts,
  getTableByCode,
  initiateOrderAdd,
} from "../../actions";
import { useParams } from "react-router";

const useStyles = makeStyles((theme) => ({
  root: {width:'100%', display:'flex',flexDirection:'column'},
  productName: {
    color: theme.palette.text.primary,
    fontSize: "1.6rem",
    fontWeight: "750",
    lineHeight: "1.8rem",
  },
  card: {
    marginBottom: ".7rem",
    "&:hover": {
      boxShadow:
        "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
    },
  },
  content: {
    display: "flex",
    flexDirection: "column",
    margin:'1rem'
  },
  price: {
    color: theme.palette.text.primary,
    fontSize: "1rem",
    margin:'.5rem'
  },
  quantity: {
    color: theme.palette.text.primary,
    fontSize: "1rem",
    margin:'.5rem'
  },
  status: {
    color: theme.palette.text.primary,
    fontSize: "1rem",
    margin:'.5rem',
    background:'yellow',
    fontWeight:'600'
  },
  detailsBox: {
    display: "flex",
    flexDirection: "row",
  },
  topButton : {
    alignSelf:'center',
    width:'15rem'
  }
}));

const TableView = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const orderState = useSelector((state) => state.order) || {};
  const tableState = useSelector((state) => state.table);
  const table = (tableState && tableState.selectedTable) || {};
  const orders = orderState.orders || [];
  let { code } = useParams();
  

  const activeOrders = orders
    .map((order) => {
      return order.orderItems;
    })
    .reduce((item1, item2) => {
      return item1.concat(item2);
    }, []);

  const [openRowProductId, setOpenRowProductId] = React.useState({ id: null });
  const toggleProductRow = (item) => {
    if (openRowProductId === item.id) setOpenRowProductId(null);
    else setOpenRowProductId(item.id);
  };

  useEffect(() => {
    if (code) {
      dispatch(getTableByCode(code));
    }
  }, [dispatch, code]);

  useEffect(() => {
    if (table.id) {
      dispatch(getOrderByTableId(table.id));
    }
  }, [dispatch, table]);
  const onClick = () => {
    dispatch(getProducts());
    dispatch(initiateOrderAdd(true));
  };
  return (
    <Container maxWidth={true}>
      {orderState && orderState.add ? (
        <Order table={table} />
      ) : (
        <Grid item xs={12} className={classes.content}>
              <Button
              color="primary"
              onClick={() => {
                onClick();
              }}
              variant="contained"
              className={classes.topButton}
            >
              Place another order
            </Button>
          <CardContent className={classes.root}>
              <Typography color="textPrimary" gutterBottom variant="h3">
                {table.name}
              </Typography>
              <Typography color="textSecondary" variant="body1">
                {`${table.branchName}`}
              </Typography>
              {activeOrders.map((order) => (
                <Card className={classes.card} key={order.id}>
                  <CardContent>
                      <Typography gutterBottom className={classes.productName}>
                        {order.productName}
                      </Typography>
                      <Box className={classes.detailsBox}>
                      <Typography className={classes.price}>
                        {order.currency} {order.price}
                      </Typography>
                      <Typography className={classes.quantity}>
                        {order.quantity} Nos
                      </Typography>
                      <Typography className={classes.status}>
                        {order.status}
                      </Typography>
                      </Box>
                      <Box>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() => toggleProductRow(order)}
                        >
                          {openRowProductId === order.id ? (
                            <KeyboardArrowUpIcon />
                          ) : (
                            <KeyboardArrowDownIcon />
                          )}
                        </IconButton>{" "}
                        Addons
                        <Collapse
                          in={openRowProductId === order.id}
                          timeout="auto"
                          unmountOnExit
                        >
                          <Box margin={1}>
                            <Typography
                              variant="h6"
                              gutterBottom
                              component="div"
                            >
                              Customisations
                            </Typography>
                            <Table size="small" aria-label="customisations">
                              <TableBody>
                                {order.customisations.length ? (
                                  order.customisations.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell component="th" scope="row">
                                        {item.name}
                                      </TableCell>
                                      <TableCell align="right">
                                      {item.currency} {item.price}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <Typography
                                    variant="h6"
                                    gutterBottom
                                    component="div"
                                  >
                                    No Customisations added
                                  </Typography>
                                )}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </Box>
                  </CardContent>
                  <Divider />
                </Card>
              ))}
          </CardContent>
          <Divider />
          <CardActions>
            <Button
              color="primary"
              onClick={() => {
                onClick();
              }}
              fullWidth
              variant="text"
            >
              Place another order
            </Button>
          </CardActions>
        </Grid>
      )}
    </Container>
  );
};

export default TableView;
