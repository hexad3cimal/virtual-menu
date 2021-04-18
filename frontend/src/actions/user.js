// @flow
/**
 * @module Actions/User
 * @desc User Actions
 */
import { createActions } from 'redux-actions';

import { ActionTypes } from '../constants/index';

export const { userLogin: login, userLogout: logOut, userRegister: register, userEdit: updateUser,settingsEdit: editSettings} = createActions({
  [ActionTypes.USER_LOGIN]: ({ userName, password }) => ({ userName, password }),
  [ActionTypes.USER_REGISTER]: payload => payload,
  [ActionTypes.USER_EDIT]: payload => payload,
  [ActionTypes.USER_LOGOUT]: () => ({}),
  [ActionTypes.SETTINGS_EDIT]: payload => payload,
});
