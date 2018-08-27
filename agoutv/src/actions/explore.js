'use strict';

import type {ThunkAction, Dispatch, GetState} from "./types";
import {CALL_API, NUM_PER_PAGE} from "../Constants";

const util = require('../common/Util');

////////////////////////////////////////////////////////////////////////////////////////////////////////////
const reLoadWithFiltersAction = (refreshState: number, filterObj: Object, requestParam: string): ThunkAction => ({
    params: {
        selectedObj: filterObj,
        offset: NUM_PER_PAGE,
        stateKeys: ['root', 'dataRet'],
    },
    [CALL_API]: {
        type: 'RELOAD_EXPLORE_WITH_FILTER',
        endpoint: `video/search?limit=${NUM_PER_PAGE}&offset=0&${requestParam}`,
        refreshState: refreshState,
    },
});

export const reLoadWithFilters = (refreshState: number, filterObj: Object) => (dispatch: Dispatch, getState: GetState) => {
    let requestParam = util.parseParam(filterObj);
    return dispatch(reLoadWithFiltersAction(refreshState, filterObj, requestParam));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
const loadWithFiltersAction = (refreshState: number, filterObj: Object, requestParam: string, currentOffset: number): ThunkAction => ({
    params: {
        selectedObj: filterObj,
        offset: currentOffset + NUM_PER_PAGE,
        stateKeys: ['root', 'dataRet'],
    },
    [CALL_API]: {
        type: 'LOAD_EXPLORE_WITH_FILTER',
        endpoint: `video/search?limit=${NUM_PER_PAGE}&offset=${currentOffset}&${requestParam}`,
        refreshState: refreshState,
    },
});

export const loadWithFilters = (refreshState: number, filterObj: Object, currentOffset: number) => (dispatch: Dispatch, getState: GetState) => {
    let requestParam = util.parseParam(filterObj);
    return dispatch(loadWithFiltersAction(refreshState, filterObj, requestParam, currentOffset));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
const showOrNotFilterPanelAction = (showStatus: boolean): ThunkAction => ({
    params: {
        filterShow: showStatus,
        stateKeys: ['root', 'filterStatus']
    },
    type: 'SHOW_EXPLORE_FILTERS_PANEL',
});

export const showOrNotFilterPanel = (showStatus: boolean) => (dispatch: Dispatch, getState: GetState) => {
    showStatus ? showStatus : false;
    return dispatch(showOrNotFilterPanelAction(showStatus));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
const loadCategoryListAction = (): ThunkAction => ({
    params: {
        stateKeys: ['root', 'categoryObj'],
    },
    [CALL_API]: {
        type: 'LOAD_EXPLORE_CATEGORY_LIST',
        endpoint: `video/category-list`,
    },
});

export const loadCategoryList = (refreshState: number, retOffset: number = NUM_PER_PAGE) => (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const categoryList = util.toJS(state.getIn(['explore', 'root', 'categoryList']));
    if (categoryList && (Date.now() - categoryList.timeUpdated) < 1800000) {
        //console.log('loadCategoryList from cache:');
        return null;
    }
    return dispatch(loadCategoryListAction());
};


const searchVideosAction = (refreshState: number,word: string,currentOffset: number, changeFlag :boolean,limit: number): ThunkAction => ({
    params: {
        offset: currentOffset + (limit || NUM_PER_PAGE),
        word:word,
        changeFlag: changeFlag,
        stateKeys: ['root', 'searchRes'],
    },
    [CALL_API]: {
        type: 'LOAD_EXPLORE_SEARCH',
        endpoint: `video/search?limit=${(limit || NUM_PER_PAGE)}&offset=${currentOffset}&word=${word}`,
        refreshState: refreshState,
    },
});

export const searchVideos = (refreshState: number, word: string, currentOffset: number, changeFlag : boolean,limit: number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(searchVideosAction(refreshState, word, currentOffset, changeFlag,limit));
};

const reLoadSearchVideosAction = (refreshState: number,word: string,currentOffset: number): ThunkAction => ({
    params: {
        offset: currentOffset + NUM_PER_PAGE,
        word:word,
        stateKeys: ['root', 'searchRes'],
    },
    [CALL_API]: {
        type: 'RELOAD_EXPLORE_SEARCH',
        endpoint: `video/search?limit=${NUM_PER_PAGE}&offset=${currentOffset}&word=${word}`,
        refreshState: refreshState,
    },
});

export const reloadSearchVideos = (refreshState: number, word: string, currentOffset: number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(reLoadSearchVideosAction(refreshState, word, currentOffset));
};


