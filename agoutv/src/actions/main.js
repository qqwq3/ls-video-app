'use strict';

import type {ThunkAction, Dispatch, GetState} from "./types";
import {CALL_API} from "../Constants";

const loadBannersAction = (refreshState: number) : ThunkAction => ({
    params: {
        stateKeys: ['home'],
    },
    [CALL_API]: {
        type: 'LOAD_BANNERS',
        endpoint: `video/promotion/banner`,
        refreshState: refreshState,
    },
});

export const loadBanners = (refreshState: number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(loadBannersAction(refreshState));
};

const loadHotsAction = (refreshState: number) : ThunkAction => ({
    params: {
        stateKeys: ['home'],
    },
    [CALL_API]: {
        type: 'LOAD_HOTS',
        endpoint: `video/promotion/hot`,
        refreshState: refreshState,
    },
});

export const loadHots = (refreshState: number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(loadHotsAction(refreshState));
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////
const loadNavsAction = (refreshState: number) : ThunkAction => ({
    params: {
        stateKeys: ['home'],
    },
    [CALL_API]: {
        type: 'LOAD_NAVS',
        endpoint: `video/promotion/nav`,
        refreshState: refreshState,
    },
});

export const loadNavs = (refreshState: number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(loadNavsAction(refreshState));
};



// 判定是否显示活动弹出层
const _showActivity = (status) => ({
    params: {
        status: status,
        stateKeys: ['home','isActivity'],
    },
    type: 'LOAD_ACTIVITY_STATUS'
});

export const showActivity = (status: boolean) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_showActivity(status));
};