// @flow
/**
 * Helper functions
 * @module Helpers
 */
import produce from 'immer';
import {
  useLocation
} from "react-router-dom";
import { request } from './client';

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const isFormValid = (errors) => {
  let bool = true;
  for (let key in errors) {
    if (Boolean(errors[key])) {
      bool = false;
      break;
    }
  }
  return bool;
};
export function handleActions(actionsMap , defaultState ) {
  return (state = defaultState, { type, ...rest }  = {})  =>
    produce(state, (draft)  => {
      const action = actionsMap[type];
      let newState;

      if (action) {
        newState = action(draft, rest);
      }

      if (newState) {
        return newState;
      }

      return draft;
    });
}

export function keyMirror(obj) {
  const output = {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(output, key)) {
      output[key] = key;
    }
  }

  return output;
}

export const spread = produce(Object.assign);

export const getRandomNumber = (limit) => {
  const numbers = Array(limit).fill().map((_, index) => index + 1);
  return numbers.sort(() => Math.random() - 0.5);
}
export const handleRefreshToken = (url) => {
  setTimeout( () => { request(url, {method: 'GET'})},1000*60*1)
}

export const remoteValidate = async (url) => {
  const result = await request(url)
    .then((response) => {
      if (response.data === true) {
        return true;
      } else {
        return false;
      }
    })
    .catch((error) => {
      return false;
    });
  return result;
};

export const withinGeoSquare = (options) => {
  return options.currentLatitude > (options.latitude - options.axis) && 
    options.currentLatitude < (options.latitude + options.axis) &&
    options.currentLongitude > (options.longitude - options.axis) &&
    options.currentLongitude < (options.longitude + options.axis)
  }

export const getCurrentPosition = async () => {
    if(navigator.geolocation){
      return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      });
    }
  }