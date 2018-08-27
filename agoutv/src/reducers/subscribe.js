'use strict';

import type {Action} from "../actions/types";
import { RefreshState } from "../Constants";
import Immutable from 'immutable';
import {saveSubscribeSession} from "../common/Storage";

const initialState = Immutable.fromJS({});


const explorePage = (state = initialState, action: Action) => {
    if (action.type.indexOf('_SUBSCRIBE') > 0) {
        state = Immutable.fromJS(state.toJS());
        // 移除上一次请求的错误提示
        let errorKey = action.params.stateKeys.concat(['error']);
        // 删除错误
        if (state.hasIn(errorKey)) {
            state = state.deleteIn(errorKey);
        }

        switch (action.type) {
            case 'RELOAD_SUBSCRIBES_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    // 把成功返回来的数据储存在本地
                    let data = action.response.data;
                    // 订阅列表数据储存在本地
                    saveSubscribeSession(data.records);

                    return {
                        //...m.toJS(),
                        ...action.response.data,
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        ...action.params,

                    };
                });

            case 'LOAD_SUBSCRIBES_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    if (typeof m === 'undefined' || !m.has('records')) {
                        return {
                            //...m.toJS(),
                            ...action.response.data,
                            updateTime: Date.now(),
                            refreshState: RefreshState.Idle,
                            ...action.params,

                        };
                    }
                    let records = m.get('records').concat(action.response.data.records);

                    // 订阅列表数据储存在本地
                    saveSubscribeSession(records);

                    return {
                        //...m.toJS(),
                        ...action.response.data,
                        updateTime: Date.now(),
                        refreshState: RefreshState.Idle,
                        records: records.toJS(),
                        ...action.params,
                    };
                });

            case 'DELETE_SUBSCRIBES_SUCCESS':
                return state.updateIn(action.params.stateKeys, m => {
                    let records = m.get('records').toJS();
                    let paramMovieId = action.params.movieId;
                    let newRecords = records.filter(
                        item => item.movieId !== paramMovieId
                    );

                    // 订阅列表数据储存在本地
                    saveSubscribeSession(newRecords);

                    return{
                        ...m.toJS(),
                        updateTime: Date.now(),
                        records : newRecords,
                        refreshState: RefreshState.Idle,
                    }
                });

            case 'LOAD_SUBSCRIBE_SESSION_SUCCESS': // 读取数据
                return state.setIn(action.params.stateKeys, action.data);

            case 'RELOAD_SUBSCRIBE_SESSION_SUCCESS' : // 刷新数据
                let records = action.params.records;
                return state.setIn(action.params.stateKeys, action.data);
        }

        if (action.type.endsWith('_REQUEST') || action.type.endsWith('_FAILURE')) {
            let stateKeys = action.params.stateKeys.concat(['refreshState']);
            let command = action.type.split('_').splice(-1)[0];
            switch (command) {
                case 'FAILURE':
                    let rs = RefreshState.Failure;
                    if (action.error.code === 404) {
                        rs = action.type.startsWith('RELOAD_') ? RefreshState.NoMoreDataHeader : RefreshState.NoMoreDataFooter;
                    }
                    return state.setIn(stateKeys, rs);
                case 'REQUEST':
                    return state.setIn(stateKeys, action.type.startsWith('RELOAD_') ? RefreshState.HeaderRefreshing : RefreshState.FooterRefreshing);
            }
        }
    }
    return state;
};

module.exports = explorePage;