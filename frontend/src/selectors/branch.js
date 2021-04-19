import { createSelector } from 'reselect';

const branchesInState = state => state.branch.branches || [];

export const branches = createSelector(
    branchesInState,branches => (branches))

