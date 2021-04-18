import { createActions } from 'redux-actions';

import { ActionTypes } from '../constants/index';

export const {
  tableAddInitiate: initiateTableAdd,
  tableAdd: addTable,
  tableGet: getTableById,
  setSelectedTable: selectedTable,
  tablesGet: getTables,
  tablesGetBranch: getTablesOfBranch,
  editTable,
  tableDelete: deleteTable,
  tableGetByCode: getTableByCode,
} = createActions({
  [ActionTypes.TABLE_ADD_INITIATE]: payload => payload,
  [ActionTypes.TABLE_ADD]: payload => payload,
  [ActionTypes.TABLE_GET]: payload => payload,
  [ActionTypes.SET_SELECTED_TABLE]: payload => payload,
  [ActionTypes.TABLES_GET]: () => ({}),
  [ActionTypes.TABLES_GET_BRANCH]: () => ({}),
  [ActionTypes.EDIT_TABLE]: payload => payload,
  [ActionTypes.TABLE_DELETE]: payload => payload,
  [ActionTypes.TABLE_GET_BY_CODE]: payload => payload,
});
