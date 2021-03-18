import React from 'react';
import { useDispatch } from 'react-redux';

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";

import {initiateBranchAdd} from '../../actions';

const Toolbar = () => {
  const dispatch = useDispatch();

  return (
      <Box display="flex" justifyContent="flex-end" style={{margin:'1rem'}}>
        <Button onClick={()=> dispatch(initiateBranchAdd(true))} color="primary" variant="contained">
          Add branch
        </Button>
      </Box>

  );
};

export default Toolbar;
