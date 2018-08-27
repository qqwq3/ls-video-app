'use strict';

import type {ThunkAction, Dispatch, GetState} from "./types";
import {CALL_API} from "../Constants";
const util = require('../common/Util');
const loadCollectionsAction = (refreshState: number, retOffset: number = 20) : ThunkAction => ({
    params: {
        offset:retOffset,
        stateKeys: ['root'],
    },
    [CALL_API]: {
        type: 'LOAD_COLLECTIONS',
        endpoint: `video/get/case?offset=${retOffset}&limit=20`,
        refreshState: refreshState,
    },
});

export const loadCollections = (refreshState: number, retOffset: number = 20) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(loadCollectionsAction(refreshState, retOffset));
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const reloadCollectionsAction = (refreshState: number) : ThunkAction => ({
    params: {
        offset:20,
        stateKeys: ['root'],
    },
    [CALL_API]: {
        type: 'RELOAD_COLLECTIONS',
        endpoint: `video/get/cases`,
        refreshState: refreshState,
    },
});

export const reloadCollections = (refreshState: number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(reloadCollectionsAction(refreshState));
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const deleteCollectionAction = (movieId:number, seriaId:number) : ThunkAction => ({
    params: {
        seriaId:movieId,
        stateKeys: ['root'],
    },
    [CALL_API]: {
        type: 'DELETE_COLLECTIONS',
        endpoint: `video/delete/case`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                movie_id: movieId,
                serials_src_id: seriaId
            }),
        },
    },
});

export const deleteCollection = (movieId: number, seriaId:number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(deleteCollectionAction(movieId, seriaId));
};
