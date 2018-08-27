'use strict';

import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {persistStore, autoRehydrate} from 'redux-persist-immutable';
import {AsyncStorage} from 'react-native';
import Storage from 'react-native-storage';
import logger from 'redux-logger';
import api, {explainIPAddress} from '../middlewares/api';
import apiStorage from '../middlewares/apiStorage';
import rootReducer from '../reducers';

const DeviceInfo = require('react-native-device-info');
const uuid = require('react-native-uuid');

// 是否在chrome中调试
let isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;

const createXingrenStore = applyMiddleware(thunk, api, apiStorage)(createStore);

const configureStore = (onComplete: ?() => void) => {
    const store = autoRehydrate()(createXingrenStore)(rootReducer);
    let ps = persistStore(store, {storage: AsyncStorage, blacklist: ['ad', 'spread']}, onComplete);
    if (isDebuggingInChrome) {
        window.store = store;
        // ps.purge();
    }
    global.persistStore = ps;
    return store;
};

export default configureStore;

let storage = new Storage({
    // 总容量
    size: 2000,
    // 存储后端
    storageBackend: AsyncStorage,
    // 默认超时时间
    defaultExpires: 1000 * 3600 * 24 * 365,
    // 启用内存缓存
    enableCache: true,
    // 同步数据
    sync: {
        async ipAddress(params) {
            let {id, resolve, reject} = params;
            // 获取ip地址
            let result = await explainIPAddress(id);
            if (result.code === 0) {
                storage.save({
                    key: 'ipAddress',
                    id,
                    data: result.data,
                    expires: 1000 * 3600 * 24,
                });
                return resolve(result.data);
            } else {
                return reject(result.message);
            }
        },

        async isChina(params) {
            let {id, resolve, reject} = params;
            storage.load({key: 'ipAddress', id,}).then((data) => {
                return resolve(data.country === '中国');
            }).catch((message) => {
                return resolve(true);
            });
        },

        IMEI(params) {
            let {resolve, reject} = params;
            // 获取设备的imei
            let imei = DeviceInfo.getUniqueID();
            if (!imei || typeof imei !== 'string') {
                // 如果获取失败随机生成一个
                imei = uuid.v1();
            }
            storage.save({key: 'IMEI', data: imei, expires: null,});
            resolve(imei);
        },

        loadedInitialMessages(params) {
            let {resolve} = params;
            return resolve([]);
        },
    },
});

global.storage = storage;