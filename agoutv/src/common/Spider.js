'use strict';

import {
    AsyncStorage
} from 'react-native';
import Toast from 'react-native-root-toast';
import { sha256 } from 'react-native-sha256';

const util = require('./Util');
const DeviceInfo = require('react-native-device-info');

const API_V = 125

// 接口域名设定文件
const API_PREFIXS = [
    "https://avnight-1251065560.file.myqcloud.com/host.json",
    "https://d198gvskpe14p0.cloudfront.net/api/host.json",
    "https://twgamedl.trustlinks.cn/host.json",
];

// 默认的接口使用的域名
const DEFAULT_API_HOSTS = {
    "system": "https://api2.i999.pw/v2/",
    "cpi": "https://api.uw101.com/API/",
    "share": "https://api2.i9999.pw/video/share/",
    "systemCN": "https://api.9451buy.com/v2/"
};


/**
 * 蜘蛛基类
 */
class Spider {
    constructor() {
    }
}

/**
 * Avnight 蜘蛛
 */
class Avnight extends Spider {
    constructor() {
        super();

        this.headers = {};
        this._apiPrefixes = {};
    }

    getSystemAPIName() {
        return launchSettings.isChina ? 'systemCN' : 'system';
    }

    /**
     * 获取api的前缀
     * @param apiType API的类型
     */
    async getApiPrefixes(apiType) {
        if (typeof this._apiPrefixes[apiType] === 'undefined') {
            for (let prefix of API_PREFIXS) {
                try {
                    console.log('fetch:', prefix);
                    const response = await fetch(prefix);
                    this._apiPrefixes = await response.json();
                    break;
                } catch(e) {
                    console.error(e);
                    continue;
                }
            }
        }

        if (typeof this._apiPrefixes[apiType] === 'undefined') {
            if (typeof DEFAULT_API_HOSTS[apiType] === 'undefined') {
                Toast.show('接口类型无效');
            } else {
                this._apiPrefixes = DEFAULT_API_HOSTS;
            }

        }
        return this._apiPrefixes[apiType];
    }

    /**
     * 请求接口的原始接口
     * @param url_prefix
     * @param url_path
     * @param query
     * @param headers
     * @returns {Promise.<*>}
     */
    async request(url_prefix, url_path, query, headers = {}) {
        if (typeof query === 'object') {
            query = this.dictToQueryString(query);
        }

        // 拼接完整的url
        const url = url_prefix + url_path + '?' + query;
        console.log('[REQUEST]', url);
        return await fetch(url, {
            headers: headers,
        });
    }

    /**
     * 对request的封装
     * @param command
     * @param query
     * @param headers
     * @returns {Promise.<void>}
     */
    async fetch_api(command, query, headers = {}) {
        if (typeof headers['Authorization'] === 'undefined') {
            const token = await this.getToken();
            if (!token) {
                throw new Error('Token not found.');
            }
            this.headers['Authorization'] = 'Bearer ' + token;
        }

        if (!util.isEmptyObject(headers)) {
            headers = Object.assign(headers, this.headers);
        } else {
            headers = this.headers;
        }

        query['v'] = API_V;

        try {
            // 获取接口前缀
            const apiPrefix = await this.getApiPrefixes(this.getSystemAPIName());
            // 请求接口
            const response = await this.request(apiPrefix, command, query, headers);
            const result = await response.text();
            if (result) {
                return JSON.parse(result);
            } else {
                return false;
            }
        } catch (err) {
            Toast.show(err.toString());
            console.error(err);
            return {
                error: err,
            }
        }
    }


    async getToken() {
        let token = null;
        try {
            token = await storage.load({key: 'avnightToken'}) || null;
        } catch (err) {
            token = null;
        }

        if (!token || Date.now() - token.time >= 7200000) {
            const tokenValue = await this._getToken();
            if (typeof tokenValue === 'string') {
                token = {
                    token: tokenValue,
                    time: Date.now(),
                };
                await storage.save({key: 'avnightToken', data: token, expires: 1000 * 7200});
            }
        }
        return token.token;
    }

    /**
     * 获取请求token
     * @returns {Promise.<void>}
     */
    async _getToken() {
        // 先检查缓存中是否有
        const uniqueID = DeviceInfo.getUniqueID();
        const params = {
            'model': DeviceInfo.getModel(),
            'platform': DeviceInfo.getSystemName(),
            'version': '2.1.5',
            'key': await sha256('avnight' + uniqueID + 'avnight'),
        };

        // 最大重试次数
        let maxRetry = 5;

        while (maxRetry > 0) {
            console.log('getToken:', maxRetry);
            try {
                // 获取接口前缀
                const apiPrefix = await this.getApiPrefixes(this.getSystemAPIName());
                // 请求接口
                const response = await this.request(apiPrefix, 'token/' + uniqueID, params);
                const json = await response.json();
                if (typeof json['token'] !== 'undefined') {
                    return json['token'];
                }

                maxRetry--;
            } catch (err) {
                Toast.show(err.toString());
                console.error(err);
                return {
                    error: err,
                }
            }
        }

        Toast.show('API token was invalid.');
        return null;

    }

    /**
     * 获取给定影片的详情
     * @param id
     * @param picMode
     * @param lang
     * @returns {Promise.<void>}
     */
    async getDetail(id, picMode = 'full', lang = 'CN') {
        const params = {
            'lang': lang,
            'pic': picMode,
        };
        return await this.fetch_api('videos/' + id, params);
    }

    /**
     * 获取给定影片的盗链地址
     * @param id
     * @param stream
     * @returns {Promise.<void>}
     */
    async getHotlink(id, stream = '480') {
        const vd = await this.getDetail(id);
        console.log('getHotlink', id, vd);
        if (vd && vd['sources']) {
            if (!vd['sources'].hasOwnProperty(stream)) {
                stream = util.getObjectKeys(vd['sources']).splice(0)[0];
            }
            return {
                stream: stream,
                url: vd['sources'][stream]
            };
        }
        return null;
    }

    /**
     * 将对象转换为参数字符串
     * @param data
     */
    dictToQueryString(data) {
        return util.dictToQueryString(data);
    }
}

module.exports = {
    avnight: new Avnight(),
}