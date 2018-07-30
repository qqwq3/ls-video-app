'use strict';

import { camelizeKeys } from 'humps';
import { CALL_API } from "./Keys";
import * as storageApi from '../common/Storage';
import { makeUserAgent } from "./UserTool";
import { dictToFormData } from "./Tool";

// 拿到设备的一系列信息
const DeviceInfo = require('react-native-device-info');

// 公共接口地址前缀
export const HOSTS = {
    API: 'http://api.myfoodexpress.cn',
    UPGRADE: 'http://api.myfoodexpress.cn',
    IMG: 'http://img.bailu8.com/',
    //API: 'http://192.168.188.140:8080',
    //UPGRADE: 'http://192.168.188.140:8080',
    //API: 'http://192.168.188.198:8081',
    //UPGRADE: 'http://192.168.188.198:8081',
};

const API_ROOT = HOSTS.API + '/api/app/';

export const callApi = async (endpoint, options: Object = {}) => {
    const fullUrl = (endpoint.indexOf(API_ROOT) === -1) ? API_ROOT + endpoint : endpoint;

    console.log('callApi:', fullUrl);

    if (typeof options.headers === 'undefined') {
        options.headers = {};
    }

    // 设置User-Agent
    options.headers['User-Agent'] = await makeUserAgent();

    // 读取用户会话
    let us = await storageApi.loadUserSession();
    if (us && us.authorizedKey) {
        options.headers['Authorized-Key'] = us.authorizedKey;
    }

    // 会话id
    options.headers['SESSION-ID'] = (global.launchSettings && global.launchSettings.sessionId) || DeviceInfo.getUniqueID();

    return Promise.race([
        fetch(fullUrl, options),
    ]).then(response =>
        response.json().then(json => {
            if (!response.ok) {
                return Promise.reject(json);
            }

            const camelizedJson = camelizeKeys(json);

            if (parseInt(camelizedJson.code) !== 0) {
                return Promise.reject({message: camelizedJson});
            }

            return camelizedJson;
        })
    );
};

export default store => next => action => {
    const callAPI = action[CALL_API];

    if (typeof callAPI === 'undefined') {
        return next(action);
    }

    let { endpoint } = callAPI;
    const { options, type } = callAPI;

    if (typeof endpoint === 'function') {
        endpoint = endpoint(store.getState());
    }

    if (typeof endpoint !== 'string') {
        throw new Error('Endpoint was invalid.')
    }
    if (options && typeof(options) !== 'object') {
        throw new Error('Expected options type to be object.');
    }
    if (typeof type !== 'string') {
        throw new Error('Expected action type to be string.');
    }

    const actionWith = data => {
        const  finalAction = Object.assign({}, action, data);
        delete finalAction[CALL_API];
        return finalAction;
    };

    next(actionWith({ type: type + '_REQUEST'}));

    return callApi(endpoint, options)
        .then(response => next(actionWith({
                response,
                type: type + '_SUCCESS'
            })),
            error => next(actionWith({
                type: type + '_FAILURE',
                error: error.message || 'Some other mistakes.'
            }))
        ).catch(err => {
            console.log('error：',err.message);
        });
};


/**
 * 调用launch接口
 * @returns {Promise.<*>}
 */
export const launch = async () => {
    try {
        // 获取渠道ID
        let channelID = (global.launchSettings && global.launchSettings.channelID) || '';
        let devicesInfo = await getDevicesInfo();
        let agentTag = (global.launchSettings && global.launchSettings.agentTag) || '10';

        let launchRet = await callApi(`launch_v2?channel_id=${channelID}&device_info=${JSON.stringify(devicesInfo)}&agent_tag=${agentTag}`);
        return launchRet;
    } catch (err) {
        console.log("err:", err);
        return err;
    }
};


// 选择性别
export const selectSex = async (frequency: number | string) => {
     try {
         let _makeUserAgent = await makeUserAgent();
         let _dictToFormData = dictToFormData({frequency: frequency});
         let _sessionId = (global.launchSettings && global.launchSettings.sessionId) || DeviceInfo.getUniqueID();

         let _selectRes = await callApi(`spread/choose_frequency`,{
             method: 'POST',
             headers: {
                 'User-Agent': _makeUserAgent,
                 'SESSION-ID': _sessionId,
             },
             body: _dictToFormData,
         });

         return _selectRes;
     }
     catch (e) {
         return e;
     }
};


// 获取设备信息
export async function getDevicesInfo(){
    try {
        return {
            uniqueID: DeviceInfo.getUniqueID(),
            manufacturer: DeviceInfo.getManufacturer(),
            brand: DeviceInfo.getBrand(),
            model: DeviceInfo.getModel(),
            deviceId: DeviceInfo.getDeviceId(),
            systemName: DeviceInfo.getSystemName(),
            systemVersion: DeviceInfo.getSystemVersion(),
        };
    }
    catch (err) {
        return null;
    }
}

/**
 * 调用升级检查接口
 * @param os
 * @returns {Promise.<*>}
 */
export const checkUpgrade = async (os) => {
    try {
        return await callApi(API_ROOT + 'checkUpgrade/' + os + '?channel_id=' + launchSettings.channelID);
    } catch (err) {
        return takeError(err);
    }
};

/**
 * 提取错误
 * @param err
 * @returns {{code: number, message: string}}
 */
export const takeError = (err) => {
    // 默认错误码
    let code = 500, message = 'Something bad happended';

    if (typeof err.message === 'object') {
        // 服务端返回的错误（不是异常）, err.message 是一个对象 {code, message}
        code = err.message.code;
        message = err.message.message;
    } else if (typeof err.message === 'string') {
        // 系统抛出的异常
        // err.message 是一个字符串
        message = err.message;

    } else if (typeof err === 'string') {
        // 其他情况
        message = err;
    }
    return {
        code, message,
    };

};
