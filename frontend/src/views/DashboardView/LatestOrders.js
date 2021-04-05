import React, { useEffect } from "react";
import moment from "moment";
import PerfectScrollbar from "react-perfect-scrollbar";
import makeStyles from "@material-ui/styles/makeStyles";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Button from "@material-ui/core/Button";
import CardHeader from "@material-ui/core/CardHeader";
import Divider from "@material-ui/core/Divider";
import Tooltip from "@material-ui/core/Tooltip";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import IconButton from "@material-ui/core/IconButton";
import Collapse from "@material-ui/core/Collapse";
import Typography from "@material-ui/core/Typography";


import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";

import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../../actions/order";

const useStyles = makeStyles(() => ({
  root: { display: "flex", flexDirection: "column" },
  noOrder: { alignSelf: "center", margin: "5rem" },
}));

const LatestOrders = () => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const orderState = useSelector((state) => state.order) || {};
  const userState = useSelector((state) => state.user) || {};
  const user = userState && userState.user || {};

  const orders = (orderState && orderState.orders) || [];
  const [openRowOrderId, setOpenRowOrderId] = React.useState({ id: null });
  const toggleOrderRow = (item) => {
    if (openRowOrderId === item.id) setOpenRowOrderId(null);
    else setOpenRowOrderId(item.id);
  };

  const [openRowProductId, setOpenRowProductId] = React.useState({ id: null });
  const toggleProductRow = (item) => {
    if (openRowProductId === item.id) setOpenRowProductId(null);
    else setOpenRowProductId(item.id);
  };
  useEffect(() => {
    dispatch(getOrders());
  }, []);
  return (
    <Card className={classes.root}>
      <CardHeader title="Latest Orders" />
      <Divider />
      {orders.length > 0 ? (
        <PerfectScrollbar>
          <Box minWidth={800}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order Ref</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell sortDirection="desc">
                    <Tooltip enterDelay={300} title="Sort">
                      <TableSortLabel active direction="desc">
                        Date
                      </TableSortLabel>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow hover key={order.id}>
                    <TableCell>{order.refCode}</TableCell>
                    <TableCell>{order.branchName}</TableCell>
                    <TableCell>
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => toggleOrderRow(order)}
                      >
                        {openRowOrderId === order.id ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </IconButton>{" "}
                      Order Items
                      <Collapse
                        in={openRowOrderId === order.id}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Box margin={1}>
                          <Typography variant="h6" gutterBottom component="div">
                            Items in Order
                          </Typography>
                          <Table size="small" aria-label="purchases">
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Customisations</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {order.orderItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell component="th" scope="row">
                                    {item.productName}
                                  </TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>                                                     {user.config.currency} {item.price}
                                  </TableCell>
                                  <TableCell>{item.status}</TableCell>
                                  <TableCell>
                                    <IconButton
                                      aria-label="expand row"
                                      size="small"
                                      onClick={() => toggleProductRow(item)}
                                    >
                                      {openRowProductId === item.id ? (
                                        <KeyboardArrowUpIcon />
                                      ) : (
                                        <KeyboardArrowDownIcon />
                                      )}
                                    </IconButton>{" "}
                                    Addons
                                    <Collapse
                                      in={openRowProductId === item.id}
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
                                        <Table
                                          size="small"
                                          aria-label="purchases"
                                        >
                                          <TableHead>
                                            <TableRow>
                                              <TableCell>Name</TableCell>
                                              <TableCell align="right">
                                                Amount
                                              </TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            {item.customisations.length ? (
                                              item.customisations.map(
                                                (item) => (
                                                  <TableRow key={item.id}>
                                                    <TableCell
                                                      component="th"
                                                      scope="row"
                                                    >
                                                      {item.name}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                      {user.config.currency} {item.price}
                                                    </TableCell>
                                                  </TableRow>
                                                )
                                              )
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
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                    <TableCell>
                    {user.config.currency} {order.price}
                    </TableCell>
                    <TableCell>
                      {moment(order.CreatedAt).format("DD/MM/YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Box display="flex" justifyContent="flex-end" p={2}>
              <Button
                color="primary"
                endIcon={<ArrowRightIcon />}
                size="small"
                variant="text"
              >
                View all
              </Button>
            </Box>
          </Box>
        </PerfectScrollbar>
      ) : (
        <Typography variant="h3" className={classes.noOrder}>
          No orders yet
        </Typography>
      )}
    </Card>
  );
};

export default LatestOrders;
