import React, { useState, memo } from "react";
import PerfectScrollbar from "react-perfect-scrollbar";
import makeStyles from "@material-ui/styles/makeStyles";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SvgIcon from "@material-ui/core/SvgIcon";
import Button from "@material-ui/core/Button";

import { Search as SearchIcon } from "react-feather";
import { useDispatch } from "react-redux";
import { deleteBranch, getBranches, hideAlert, initiateBranchAdd, setBranch } from "../../actions";

const useStyles = makeStyles(() => ({
  root: {overflowX:'scroll'},
}));

const BranchList = memo(({ branches }) => {
  const classes = useStyles();
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const dispatch = useDispatch();

  console.log("rendereee",branches)
  const handleLimitChange = (event) => {
    setLimit(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };
  const onEdit = (branch) => {
    dispatch(setBranch(branch))
    dispatch(initiateBranchAdd(true))
  };
  const onDelete = (branch) => {
    dispatch(deleteBranch(branch))
    setTimeout(()=>{dispatch(hideAlert())},100)
    dispatch(getBranches())
  };


  return (
    <Card className={classes.root}>
      <Box mt={3}>
        <Card>
          <CardContent>
            <Box maxWidth={500}>
              <TextField
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SvgIcon fontSize="small" color="action">
                        <SearchIcon />
                      </SvgIcon>
                    </InputAdornment>
                  ),
                }}
                placeholder="Search with branch name"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
      <PerfectScrollbar>
        <Box>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {branches &&
                branches.slice(0, limit).map((branch) => (
                  <TableRow hover key={branch.id}>
                    <TableCell>
                          {branch.name}
                    </TableCell>
                    <TableCell>{branch.userName}</TableCell>

                    <TableCell>{branch.address}</TableCell>
                    <TableCell>{branch.contact}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => onEdit(branch)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => onDelete(branch)}
                        style={{margin:'1rem'}}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Box>
      </PerfectScrollbar>
      <TablePagination
        component="div"
        count={branches.length}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handleLimitChange}
        page={page}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Card>
  );
});

export default BranchList;
