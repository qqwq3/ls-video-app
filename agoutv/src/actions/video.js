'use strict';

import type {ThunkAction, Dispatch, GetState, VideoType} from "./types";
import { CALL_API, CALL_STORAGE } from "../Constants";
import { callApi, safeCallApi, getStreamLocation } from "../middlewares/api";
import * as cryptor from '../common/Cryptor';

const util = require('../common/Util');

const loadVideoDetailAction = (code:string): ThunkAction => ({
    params: {
        code,
        stateKeys: ['video', code],
    },
    [CALL_API]: {
        type: 'LOAD_VIDEO_DETAIL',
        endpoint: `video/detail/${code}`,
    },
});

export const loadVideoDetail = (code:string) => (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const video = util.toJS(state.getIn(['video', 'video', code]));

    if(video !== undefined){
        return null;
    }

    return dispatch(loadVideoDetailAction(code));
};



const _addSubscribeAction = (id: number, code: string): ThunkAction => ({
    params: {
        id,
        code,
        stateKeys: ['video', code],
    },
    [CALL_API]: {
        type: 'ADD_SUBSCRIBE_VIDEO',
        endpoint: `video/add/subscribe`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                movie_id: id,
            }),
        },
    },
});

export const addSubscribe = (id: number, code: string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_addSubscribeAction(id, code));
};

const _deleteSubscribeAction = (id: number, code: string): ThunkAction => ({
    params: {
        id,
        code,
        stateKeys: ['video', code],
    },
    [CALL_API]: {
        type: 'DEL_SUBSCRIBE_VIDEO',
        endpoint: `video/delete/subscribe`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                movie_id: id,
            }),
        },
    },
});
export const deleteSubscribe = (id: number, code: string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_deleteSubscribeAction(id, code));
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const _addSeriaFavAction = (movieId: number, code: string, episode : number, seriaId:number): ThunkAction => ({
    params: {
        stateKeys: ['video', code, 'playLink', episode.toString()],
    },
    [CALL_API]: {
        type: 'ADD_SERIA_FAV_VIDEO',
        endpoint: `video/add/case`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                movie_id: movieId,
                serials_src_id: seriaId
            }),
        },
    },
});
export const addSeriaFav = (movieId: number, code: string, episode : number, seriaId:number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_addSeriaFavAction(movieId, code, episode, seriaId));
};

const _deleteSeriaFavAction = (movieId: number, code: string, episode : number, seriaId:number): ThunkAction => ({
    params: {
        stateKeys: ['video', code, 'playLink', episode.toString()],
    },
    [CALL_API]: {
        type: 'DEL_SERIA_FAV_VIDEO',
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

export const deleteSeriaFav = (movieId: number, code: string, episode : number, seriaId:number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_deleteSeriaFavAction(movieId, code, episode, seriaId));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
const _addFav = (movieId: number, code: string): ThunkAction => ({
    params: {
        stateKeys: ['video', code],
    },
    [CALL_API]: {
        type: 'ADD_FAV_VIDEO',
        endpoint: `video/add/case`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                movie_id: movieId,
            }),
        },
    },
});
export const addFav = (movieId: number, code: string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_addFav(movieId, code));
};

const _deleteFav = (movieId: number, code: string): ThunkAction => ({
    params: {
        stateKeys: ['video', code],
    },
    [CALL_API]: {
        type: 'DEL_FAV_VIDEO',
        endpoint: `video/delete/case`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                movie_id: movieId,
            }),
        },
    },
});

export const deleteFav = (movieId: number, code: string, episode: number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_deleteFav(movieId, code, episode));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
const _playVideoAction = (movieId: number, code: string, episode : number, seriaId:number,type:string): ThunkAction => ({
    params: {
        episode: episode,
        handleType: type,
        stateKeys: ['video', code]//, 'playLink', episode.toString()],
    },
    type: 'PLAY_VIDEO',
    // [CALL_API]:{
    //     type: 'PLAY_VIDEO',
    //     endpoint: `video/play_v2`,
    //     options: {
    //         method: 'post',
    //         body: util.dictToFormData({
    //             movie_id: movieId,
    //             serials_src_id: seriaId
    //         }),
    //     },
    // },
});

export const playVideo = (movieId: number, code: string, episode : number, seriaId:number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_playVideoAction(movieId, code, episode, seriaId,'play'));
};

const _downVideoAction = (movieId: number, code: string, episode : number, seriaId:number,type:string): ThunkAction => ({
    params: {
        episode:episode,
        handleType:type,
        stateKeys: ['video', code]//, 'playLink', episode.toString()],
    },
    [CALL_API]: {
        type: 'DOWN_VIDEO',
        endpoint: `video/play_v2`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                movie_id: movieId,
                serials_src_id: seriaId
            }),
        },
    },
});


export const downVideo = (movieId: number, code: string, episode : number, seriaId:number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_downVideoAction(movieId, code, episode, seriaId,'down'));
};


const _deleteHistoryAction = (movieId: number, code: string, episode : number, seriaId:number): ThunkAction => ({
    params: {
        stateKeys: ['video', code, 'playLink', episode.toString()],
    },
    [CALL_API]: {
        type: 'DEL_HISTORY_VIDEO',
        endpoint: `video/delete/history`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                movie_id: movieId,
                serials_src_id: seriaId
            }),
        },
    },
});

export const deleteHistory = (movieId: number, code: string, episode : number, seriaId:number) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_deleteHistoryAction(movieId, code, episode, seriaId));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 播放缓存视频时调用
 * @param id
 * @param code
 */
export const playCache = (id: number, code: string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_playCache(id, code));
};

const _loadSessionStatus = (id: number, code: string) : ThunkAction => ({
    params: {
        id,
        code,
        stateKeys: ['video', code],
    },
    [CALL_API]: {
        type: 'LOAD_SESSION_STATUS_VIDEO',
        endpoint: `series/session?video_id=${id}`,
    },
});

export const loadSessionStatus = (id: number, code: string) => (dispatch: Dispatch, getState: GetState) => {
    return dispatch(_loadSessionStatus(id, code));
};

const _download = (id: number, code: string) : ThunkAction => ({
    params: {
        id,
        code,
        stateKeys: ['video', code],
    },
    [CALL_API]: {
        type: 'DOWNLOAD_VIDEO',
        endpoint: `series/download`,
        options: {
            method: 'post',
            body: util.dictToFormData({
                video_id: id,
            }),
        },
    },
});

// const serialSelectEpisodeAction = (serialEpisode : number = 1, code : string): ThunkAction => ({
//     params: {
//         episode: serialEpisode,
//         stateKeys: ['video', code],
//     },
//     type: 'SELECT_EPISODE_VIDEO',
// });
//
// export const serialSelectEpisode = (serialEpisode : number = 1, code : string) => (dispatch: Dispatch, getState: GetState) => {
//     return dispatch(serialSelectEpisodeAction(serialEpisode, code));
// };

/**
 * 下载视频
 * @param id 内码
 */
export const download = (id: number) => {
    return callApi(`series/download`, {
        method: 'post',
        body: util.dictToFormData({
            video_id: id,
        }),
    });
};

/**
 * 加载给定视频的stream信息
 * @param id
 * @param season
 * @param episode
 * @param platform_id
 * @returns {Promise}
 */
export const loadStreams = async (id: number, season: number = 0, episode: number = 0, platform_id: number = 0) => {
    // 时钟加密计算
    let keys = await cryptor.clockSyncEncrypt(id+':'+platform_id+':'+season+':'+episode, await storage.load({ key: 'IMEI' }));
    return safeCallApi(`video/streams?video_id=${id}&season=${season}&episode=${episode}&platform_id=${platform_id}&key=${keys.key}&skey=${keys.skey}`);
};

/**
 * 根据接口url获取播放地址
 * @param apiUrl
 * @returns {Promise.<*>}
 */
export const loadStreamsWithUrl = async (apiUrl: string) => {
    return getStreamLocation(apiUrl);
};