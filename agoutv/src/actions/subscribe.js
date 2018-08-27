'use strict';

import type {ThunkAction, Dispatch, GetState} from "./types";
import {CALL_API,NUM_PER_PAGE,CALL_STORAGE} from "../Constants";

const util = require('../common/Util');
const loadSubscribesAction = (refreshState: number, retOffset: number = 20) : ThunkAction => ({
    params: {
        offset:retOffset,
        stateKeys: ['root'],
    },
    [CALL_API]: {
        type: 'LOAD_SUBSCRIBES',
        endpoint: `video/get/subscribe?offset=${retOffset}&limit=20`,
        refreshState: refreshState,
    },
});

export const loadSubscribes = (refreshState: number, retOffset: number = 20) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(loadSubscribesAction(refreshState, retOffset));
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const reloadSubscribesAction = (refreshState: number) : ThunkAction => ({
    params: {
        offset:20,
        stateKeys: ['root'],
    },
    [CALL_API]: {
        type: 'RELOAD_SUBSCRIBES',
        endpoint: `video/get/subscribe`,
        refreshState: refreshState,
    },
});

export const reloadSubscribes = (refreshState: number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(reloadSubscribesAction(refreshState));
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const deleteSubscribeAction = (movieId:number) : ThunkAction => ({
    params: {
        movieId:movieId,
        stateKeys: ['root'],
    },
    [CALL_API]: {
        type: 'DELETE_SUBSCRIBES',
        endpoint: `video/delete/subscribe`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                movie_id: movieId,
            }),
        },
    },
});

export const deleteSubscribe = (movieId: number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(deleteSubscribeAction(movieId));
};


//-------------------------------本地库---------------------------

const _loadSubscribe = (): ThunkAction => ({
    params:{
        stateKeys: ['subScribeSession']
    },
    [CALL_STORAGE]:{
        type: 'LOAD_SUBSCRIBE_SESSION',
        method: 'loadSubscribeSession'
    }
});

const _reloadSubscribe = (records: Array): ThunkAction => ({
    params:{
        obj: records,
        stateKeys: ['subScribeSession']
    },
    [CALL_STORAGE]:{
        type: 'RELOAD_SUBSCRIBE_SESSION',
        method: 'reloadSubscribeSession'
    }
});

// 加载本地订阅列表数据
export const loadSubscribeSession = () => (dispatch: Dispatch, getState: GetState) => {
    let action = _loadSubscribe();
    return dispatch(action);
};

// 刷新本地数据列表
export const reloadSubscribeSession = (records: Array) => (dispatch: Dispatch, getState: GetState) => {
    let action = _reloadSubscribe(records);
    return dispatch(action);
};


