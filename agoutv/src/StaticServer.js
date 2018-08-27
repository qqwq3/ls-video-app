'use strict';

import { Platform } from 'react-native';
import StaticServer from 'react-native-static-server';
import RNFetchBlob from 'react-native-fetch-blob';

import { CACHE_DIR_PREFIX } from "./Constants";
import RNFS from 'react-native-fs';
// const STATIC_PATH = (Platform.OS === 'android' ? RNFetchBlob.fs.dirs.DownloadDir : RNFetchBlob.fs.dirs.DocumentDir) + '/' + CACHE_DIR_PREFIX + '/';
const STATIC_PATH = RNFS.ExternalDirectoryPath + '/' + CACHE_DIR_PREFIX + '/';

function run() {
    global.staticServer = new StaticServer(63333, STATIC_PATH, {localOnly : true, keepAlive : true });
    global.staticServer.start().then((url) => {
        if (!url.endsWith('/')) {
            url += '/';
        }
        global.staticServerHost = url;
        // console.log("Serving at URL", url);
    }).catch(err => {
        console.log('本地服务器端口被占用',err);
    });
}

function stop() {
    if (global.staticServer) {
        global.staticServer.stop();
    }
}

module.exports = {
    run,
    stop,
};