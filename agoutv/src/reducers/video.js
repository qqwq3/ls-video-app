'use strict';

import type {Action, VideoType} from "../actions/types";
import { RefreshState } from "../Constants";
import Immutable from 'immutable';
import { loadCommon } from "../common/Storage";

const util = require('../common/Util');

const initialState = Immutable.fromJS({
    videos: {},
    video: {},
    searchVideos: {},
});


const video = (state = initialState, action: Action) => {
    if (action.type.indexOf('_VIDEO') > 0) {
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        // 总收藏数
        let totalFavs = null;
        if (action.type.indexOf('_FAV')) {
            totalFavs = state.getIn(action.params.stateKeys.concat('totalFav'));
            if (isNaN(totalFavs) || totalFavs == null) {
                totalFavs = 0;
            }
        }

        let playKeys, totalPlay;
        switch (action.type) {
            case 'LOAD_VIDEO_DETAIL_SUCCESS':
                return state.setIn(action.params.stateKeys, {...action.response.data.video, timeUpdated: Date.now()});

            case 'LOAD_SESSION_STATUS_VIDEO_SUCCESS':
                // 复写SPI
                global.launchSettings.spi.merge(action.response.data.spi);
                return state.updateIn(action.params.stateKeys, m => {
                    return {
                        ...util.toJS(m),
                        isFav: action.response.data.isFav,
                        updateTime: Date.now(),
                    };
                });

            case 'CLEAR_SEARCH_VIDEOS':
                return state.deleteIn(action.params.stateKeys);

            case 'SELECT_EPISODE_VIDEO':
                return state.updateIn(action.params.stateKeys, m => {
                    return {
                        ...m.toJS(),
                        updateTime: Date.now(),
                        ...action.params,
                    };
                });

            case 'DEL_SUBSCRIBE_VIDEO_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    subscribe: false,
                });

            case 'ADD_SUBSCRIBE_VIDEO_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    subscribe: true,
                });

            case 'CHK_FAV_VIDEO_SUCCESS':
                return state.setIn(action.params.stateKeys.concat('isFav'), action.response.data[action.params.id]);

            case 'DEL_FAV_VIDEO_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    isFav: false,
                    totalFav: Math.max(0, totalFavs - 1),
                });

            case 'ADD_FAV_VIDEO_SUCCESS':
                let favKeys = action.params.stateKeys.concat('totalFav');
                let totalFav = state.getIn(favKeys);
                if (isNaN(totalFav)) {
                    totalFav = 0;
                }
                return state.mergeDeepIn(action.params.stateKeys, {
                    isFav: true,
                    totalFav: totalFav + 1,
                });

            case 'DEL_SERIA_FAV_VIDEO_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    isFav: false,
                });

            case 'ADD_SERIA_FAV_VIDEO_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    isFav: true,
                });

            case 'DEL_HISTORY_VIDEO_SUCCESS':
                return state.mergeDeepIn(action.params.stateKeys, {
                    hasHistory: false,

                });

            // 播放视频成功
            case 'PLAY_VIDEO':
                let playKeys = action.params.stateKeys.concat('totalPlay');
                let totalPlay = state.getIn(playKeys);
                if (isNaN(totalPlay)) {
                    totalPlay = 0;
                }
                // 复写SPI
                // global.launchSettings.spi.merge(action.response.data);
                return state.mergeDeepIn(action.params.stateKeys, {
                    episode: action.params.episode,
                    handleType: action.params.handleType,
                    hasHistory: true,
                    totalPlay: totalPlay + 1,
                    spi: {
                        // 设置可播放日期
                        allowPlay: true,
                        // 数据更新时间
                        timeUpdated: Date.now(),
                    },
                });

            // 播放视频失败
            // case 'PLAY_VIDEO_SESSION_FAILURE':
            //     return state.mergeDeepIn(action.params.stateKeys, {
            //         spi: {
            //             allowPlay: false,
            //             timeUpdated: Date.now(),
            //         },
            //         error: action.error,
            //     });

            case 'DOWN_VIDEO_SUCCESS':
                // 复写SPI
                global.launchSettings.spi.merge(action.response.data);
                return state.mergeDeepIn(action.params.stateKeys, {
                    episode: action.params.episode,
                    handleType: action.params.handleType,
                    hasHistory: true,
                    spi: {
                        // 设置可播放日期
                        allowPlay: true,
                        // 数据更新时间
                        timeUpdated: Date.now(),
                    },
                });

            case 'DOWN_VIDEO_FAILURE':
                // 播放视频失败
                return state.mergeDeepIn(action.params.stateKeys, {
                    spi: {
                        allowPlay: false,
                        timeUpdated: Date.now(),
                    },
                    error: action.error,
                });
        }

        // 列表类单独的处理
        if (action.type.endsWith('_REQUEST') || action.type.endsWith('_FAILURE')) {
            let command = action.type.split('_').splice(-1)[0];
            switch (command) {
                case 'FAILURE':
                    let rs = RefreshState.Failure;
                    let error = util.safeError(action.error);
                    if (error.code === 404) {
                        rs = action.type.startsWith('RELOAD_') ? RefreshState.NoMoreDataHeader : RefreshState.NoMoreDataFooter;
                    }
                    return state.mergeDeepIn(action.params.stateKeys, {
                        refreshState: rs,
                        error,
                    });
                case 'REQUEST':
                    return state.setIn(action.params.stateKeys.concat(['refreshState'])
                        , action.type.startsWith('RELOAD_') ? RefreshState.HeaderRefreshing : RefreshState.FooterRefreshing);
            }
        }
    }
    return state;
};

module.exports = video;