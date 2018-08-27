
'use strict';

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, autoRehydrate } from 'redux-persist-immutable';
import { AsyncStorage } from 'react-native';
// import { createNetworkMiddleware } from 'react-native-offline';
import Storage from 'react-native-storage';
import rootReducer from '../reducers/Index';
import apiStorage from '../common/ApiStorage';
import api from '../common/Api';

// const networkMiddleware = createNetworkMiddleware();
const createStoryStore = applyMiddleware(thunk, api, apiStorage)(createStore);

// 是否在chrome中调试
const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;

const configureStore = (onComplete: ?() => void) => {
    const store = autoRehydrate()(createStoryStore)(rootReducer);
    let ps = persistStore(store, {storage: AsyncStorage}, onComplete);

    // 在调试模式中
    if (isDebuggingInChrome) {
        window.store = store;
    }

    global.persistStore = ps;
    return store;
};

let storage = new Storage({
    // 总容量
    size: 666666,
    // 存储后端
    storageBackend: AsyncStorage,
    // 默认超时时间
    defaultExpires: 1000 * 3600 * 24 * 365,
    // 启用内存缓存
    enableCache: true,
    // 同步数据
    sync: {},
});

global.storage = storage;

export default configureStore;
















