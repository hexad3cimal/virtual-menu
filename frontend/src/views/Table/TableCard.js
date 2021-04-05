import React  from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  makeStyles,
  Button,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { selectedTable, editTable, deleteTable } from "../../actions/";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Bounce } from "react-awesome-reveal";
import QRCode  from "qrcode.react";

import AddTable from "./AddTable";
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  statsItem: {
    alignItems: "center",
    display: "flex",
  },
  statsIcon: {
    marginRight: theme.spacing(1),
  },
  occupied: {
    backgroundColor: theme.colors.red.main,
  },
}));

const TableCard = ({ table }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const tableState = useSelector((state) => state.table);
  const selectedTableFromState = (tableState && tableState.selectedTable) || {};
  const onClick = (table) => {
    dispatch(selectedTable(table));
    navigate("/app/main/table-details", { replace: true });
  };
  const onEdit = (table) => {
    dispatch(selectedTable(table));
  };
  const onDelete = (table) => {
    dispatch(deleteTable(table));
  };
  const generateNewCode = (table) => {
    const tableClone = Object.assign({}, table);
    tableClone.loginCode = uuidv4();
    dispatch(editTable(tableClone));
  };

  return (
    <Bounce>
      {!selectedTableFromState.id && !tableState.add ? (
        <Card
          className={clsx(
            classes.root,
            table.occupied ? classes.occupied : null
          )}
        >
          <CardContent>
            <Typography
              align="center"
              color="textPrimary"
              gutterBottom
              variant="h4"
            >
              {table.name}
            </Typography>
            <Typography align="center" color="textPrimary" variant="body1">
              {table.branchName}
            </Typography>
          </CardContent>
          <Box flexGrow={1} />
          <Divider />
          <Box p={2}>
            <Grid container justify="space-between" spacing={2}>
              <Typography align="center" color="textPrimary" variant="body1">
                Login code
              </Typography>
              <Typography align="center" color="textPrimary" variant="body1">
                {table.loginCode}
              </Typography>
              <QRCode value={`${window.location.hostname}/table/${table.loginCode}`} />,
            </Grid>
          </Box>
          <Divider />
          <Box p={2}>
            <Grid container justify="space-between">
              <Button
                onClick={() => {
                  onClick(table);
                }}
                color="primary"
                variant="contained"
              >
                View
              </Button>
              <Button
                onClick={() => {
                  onEdit(table);
                }}
                color="primary"
                variant="contained"
              >
                Edit
              </Button>
              <Button
                onClick={() => {
                  generateNewCode(table);
                }}
                color="primary"
                variant="contained"
              >
                Generate new code
              </Button>
              <Button
                onClick={() => {
                  onDelete(table);
                }}
                color="secondary"
                variant="contained"
              >
                Delete
              </Button>
            </Grid>
          </Box>
        </Card>
      ) : (
        <AddTable />
      )}
    </Bounce>
  );
};

TableCard.propTypes = {
  table: PropTypes.object.isRequired,
};

export default TableCard;
