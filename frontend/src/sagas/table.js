/**
 * @module Sagas/Table
 * @desc Table
 */

import { all, put, takeLatest } from "redux-saga/effects";

import { ActionTypes } from "../constants/index";
import { request } from "../modules/client";

/**
 * Add new table
 */
export function* addTable({ payload }) {
  try {
    yield request(`${window.restAppConfig.api}table`, {
      method: "POST",
      payload,
    });
    yield all([
      yield put({
        type: ActionTypes.TABLE_ADD_SUCCESS,
      }),
      yield put({
        type: ActionTypes.SHOW_ALERT,
        payload: `Added ${payload.name} successfully!`,
      }),
    ]);
  } catch (err) {
    /* istanbul ignore next */
    yield all([
      put({
        type: ActionTypes.TABLE_ADD_FAILURE,
        payload: err,
      }),
      put({
        type: ActionTypes.SHOW_ALERT,
        payload: "Could not add table,please retry",
      }),
    ]);
  }
}

/**
 * Edit code
 */
export function* editTable({ payload }) {
  try {
    yield request(`${window.restAppConfig.api}table?id=${payload.id}`, {
      method: "PUT",
      payload,
    });
    yield all([
      yield put({
        type: ActionTypes.EDIT_TABLE_SUCCESS,
      }),
      yield put({
        type: ActionTypes.SHOW_ALERT,
        payload: `Edited ${payload.name} successfully!`,
      }),
    ]);
  } catch (err) {
    /* istanbul ignore next */
    yield all([
      put({
        type: ActionTypes.TABLE_EDIT_FAILURE,
        payload: err,
      }),
      put({
        type: ActionTypes.SHOW_ALERT,
        payload: "Could not edit table,please retry",
      }),
    ]);
  }
}

/**
 * Get table details by id
 */
export function* getTableById({ payload }) {
  try {
    const url = payload.code
      ? `${window.restAppConfig.api}table?loginCode=${payload.code}`
      : `${window.restAppConfig.api}table?id=${payload.id}`;
    const table = yield request(url, {
      method: "GET",
    });

    yield put({
      type: ActionTypes.TABLE_GET_SUCCESS,
      payload: table.data,
    });
  } catch (err) {
    /* istanbul ignore next */
    yield all([
      put({
        type: ActionTypes.TABLE_GET_FAILURE,
        payload: err,
      }),
      put({
        type: ActionTypes.SHOW_ALERT,
        payload: "Error while gettting table details, please retry",
      }),
    ]);
  }
}

/**
 * Get all the tables for given branch
 */
export function* getTablesForBranch({ payload }) {
  try {
    const tables = yield request(
      `${window.restAppConfig.api}table/branch?branch=${payload.id}`,
      {
        method: "GET",
      }
    );

    yield all([
      put({
        type: ActionTypes.TABLES_GET_SUCCESS,
        payload: tables && tables.data,
      }),
    ]);
  } catch (err) {
    /* istanbul ignore next */
    yield all([
      put({
        type: ActionTypes.TABLES_GET_FAILURE,
        payload: err,
      }),
      put({
        type: ActionTypes.SHOW_ALERT,
        payload: "Error while gettting tables, please retry",
      }),
    ]);
  }
}

/**
 * Get all the tables
 */
export function* getTables() {
  try {
    const tables = yield request(`${window.restAppConfig.api}tables`, {
      method: "GET",
    });

    yield all([
      put({
        type: ActionTypes.TABLES_GET_SUCCESS,
        payload: tables && tables.data,
      }),
    ]);
  } catch (err) {
    /* istanbul ignore next */
    yield all([
      put({
        type: ActionTypes.TABLES_GET_FAILURE,
        payload: err,
      }),
      put({
        type: ActionTypes.SHOW_ALERT,
        payload: "Error while gettting tables, please retry",
      }),
    ]);
  }
}

/**
 * delete table by id
 */
export function* deleteById({ payload }) {
  try {
    yield request(`${window.restAppConfig.api}table?id=${payload.id}`, {
      method: "DELETE",
    });
    yield all([
      put({
        type: ActionTypes.TABLE_DELETE_SUCCESS,
      }),
      put({
        type: ActionTypes.SHOW_ALERT,
        payload: "Deleted table successfully",
      }),
      put({
        type: ActionTypes.TABLES_GET,
      }),
    ]);
  } catch (err) {
    /* istanbul ignore next */
    yield all([
      put({
        type: ActionTypes.TABLE_DELETE_FAILURE,
        payload: err,
      }),
      put({
        type: ActionTypes.SHOW_ALERT,
        payload: "Error while gettting branch details, please retry",
      }),
    ]);
  }
}

/**
 * Table Sagas
 */
export default function* root() {
  yield all([
    takeLatest(ActionTypes.TABLE_ADD, addTable),
    takeLatest(ActionTypes.EDIT_TABLE, editTable),
    takeLatest(ActionTypes.TABLE_GET, getTableById),
    takeLatest(ActionTypes.TABLES_GET, getTables),
    takeLatest(ActionTypes.TABLE_DELETE, deleteById),
  ]);
}
