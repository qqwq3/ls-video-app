'use strict';

import {
    Alert,
    Platform,
} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import RNFS from 'react-native-fs';

import {Video} from "../actions/types";
import { CACHE_DIR_PREFIX } from "../Constants";

const util = require('./Util');
const spider = require('../common/Spider');

// 最大允许同时运行的下载数
const MAX_RUNNING = 1;
// 缓存根目录
// const CACHE_ROOT_DIR = (Platform.OS === 'android' ? RNFetchBlob.fs.dirs.DownloadDir : RNFetchBlob.fs.dirs.DocumentDir) + '/' + CACHE_DIR_PREFIX + '/';
// const CACHE_ROOT_DIR = RNFS.CachesDirectoryPath + '/' + CACHE_DIR_PREFIX + '/';  //null  ///data/user/0/com.agoutv/cache/agoutv/
 // const CACHE_ROOT_DIR = RNFS.DocumentDirectoryPath + '/' + CACHE_DIR_PREFIX + '/'; //null  ///data/user/0/com.agoutv/files/agoutv/
const CACHE_ROOT_DIR = RNFS.ExternalDirectoryPath + '/' + CACHE_DIR_PREFIX + '/'; //null   ///storage/emulated/0/Android/data/com.agoutv/files/agoutv/
// const CACHE_ROOT_DIR = RNFS.ExternalStorageDirectoryPath + '/' + CACHE_DIR_PREFIX + '/';





// 缓存状态
const STATUS = {
    Caching: 'caching',
    Cached: 'cached',
    Error: 'error',
    Run: 'run',
};
// 下载状态
const DOWNLOAD_STATUS = {
    // 等待
    Waiting: 'waiting',
    // 准备中
    Preparing: 'preparing',
    // 下载中
    Downloading: 'downloading',
    // 下载完成
    Completed: 'completed',
    // 下载出错
    Error: 'error',
};
// 事件类型
const EVENTS = {
    Done: 'done',
    Progress: 'progress',
    Error: 'error',
    Start: 'start',
    Stop: 'stop',
    AllDone: 'allDone',
};
// 影片类型
const MOVIE_TYPE = {
    M3U8: 'm3u8',
    Mp4: 'mp4',
};

/**
 * 缓存管理器
 */
class Downloader {
    // 默认选项
    static defaultOptions = {
        // 下载错误重试的次数
        downloadMaxRetry: 1,
        // 重试间隔
        downloadRetryDelay: 1000,
    };

    constructor(movie: Video, options: Object = {}) {
        this.movie = movie;
        // 下载速度
        this._downloadSpeed = 0;
        this._options = Object.assign({}, Downloader.defaultOptions, options);
        // 是否开始下载
        this.isStartDownload = false;
        // 下载状态
        this._status = DOWNLOAD_STATUS.Waiting;
        // 所有事件类型
        this._listeners = {};
        // 当前下载任务
        this._downloadTask = null;
    }


    async _createDir(dir) {
        if (!(await RNFetchBlob.fs.isDir(dir))) {
            await RNFetchBlob.fs.mkdir(dir);
        }
    }

    async _downloadM3U8() {
        let m3u8 = null;
        let path = this.getMoviePath();
        // 设置状态
        this._status = DOWNLOAD_STATUS.Preparing;
        if (this.movie.staticUrls && this.movie.staticUrls.length > 0) {
            let url = this.movie.staticUrls;
            // url = "http://video.pearvideo.com/mp4/short/20180419/cont-1326102-11911270-hd.mp4";
            let savePathUrl =  this.movie.container === MOVIE_TYPE.Mp4?path.playFile:null;
            m3u8 = await this._safeDownloadFile(url,savePathUrl , this._options.downloadMaxRetry,true);

            if (m3u8.code === 0) {
                m3u8.url = url;
            }
            if(this.movie.container === MOVIE_TYPE.Mp4){
                if (!this.isStartDownload) {
                    // console.log('下载MP4 用户停止Downloader: force stop.');
                    return Object.assign(m3u8, {code: 1, message: '用户停止'});
                }
                // 清空下载任务
                this._downloadTask = null;
                return m3u8;
            }
        }
        if (m3u8.code !== 0) {
            // 获取防盗链地址
            const url = await spider.avnight.getHotlink(this.movie.mark, this.movie.stream);
            if (url && url['url']) {
                // 再次下载
                m3u8 = await this._safeDownloadFile(url['url'], null, this._options.downloadMaxRetry);
                if (m3u8.code === 0) {
                    m3u8.url = url['url'];
                }
            }
        }
        if (m3u8.code === 0) {
            // 创建ts目录
            await this._createDir(path.tsPath);
            // 修改下载状态
            this._status = DOWNLOAD_STATUS.Downloading;
            let lines = m3u8.result.data.split('\n');
            // 所有ts文件
            let allTs = [];
            // m3u8文件的内容
            let m3u8Content = [];
            // ts文件的索引
            let tsIndex = 0;
            // 找出所有可下载的ts文件
            for (let line of lines) {
                if (line.startsWith('#') || line.indexOf('.ts') < 0) {
                    m3u8Content.push(line);
                    continue;
                }

                let tsName = this.movie.mark + '-' + tsIndex + '.ts';
                let tsFullPath = path.tsPath + tsName;
                // 写入完整地址
                // m3u8Content.push(launchSettings.isAndroid ? 'file://' + tsFullPath : tsFullPath);
                m3u8Content.push('ts/' + tsName);

                let urls = m3u8.url.split('/').slice(0, -1);
                let url = line.trim();
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    urls.push(url);
                    url = urls.join('/');
                }

                allTs.push(url);

                tsIndex ++;
            }

            tsIndex = 0;
            // 下载ts文件
            for (let ts of allTs) {
                // console.log('DOWNLOAD_TS:', this.isStartDownload);
                if (!this.isStartDownload) {
                    // console.log('Downloader: force stop.');
                    return Object.assign(m3u8, {code: 1, message: '用户停止'});
                }
                let tsName = this.movie.mark + '-' + tsIndex + '.ts';
                let tsPath = path.tsPath + tsName;
                // 累加索引
                tsIndex ++;
                // console.log('Download TS:', ts, 'to', tsPath);
                if (await RNFetchBlob.fs.exists(tsPath)) {
                    // console.log('TS file already exists.');
                    // 通知进度
                    this._onProgress(tsIndex, allTs.length);
                    continue;
                }
                // 下载文件
                let result = await this._safeDownloadFile(ts, tsPath, this._options.downloadMaxRetry);
                if (result.code !== 0) {
                    return Object.assign(m3u8, {code: 503, message: tsIndex.toString() + ' 文件下载失败'});
                }
                // 通知进度
                this._onProgress(tsIndex, allTs.length);
                // 清空下载任务
                this._downloadTask = null;

            }
            //console.log('M3U8 Content:\n', m3u8Content.join('\n'));
            // 写入m3u8文件
            RNFetchBlob.fs.writeFile(path.savePath + this.movie.mark + '.m3u8', m3u8Content.join('\n'), 'utf8');
        } else {
            this._onError(m3u8.message);
        }
        return m3u8;
    }

    async _safeDownloadFile(url, path: string = null, maxRetry: number = 10, onProgress: boolean = false) {
        let _download = async (resolve, reject) => {
            try {
                let result = null;//await this._downloadFile(url, path, onProgress);
                if(this.movie.container === MOVIE_TYPE.Mp4){
                    result = await this._downloadMp4File(url,path ,onProgress);
                }else{
                    result = await this._downloadFile(url, path, onProgress);
                }
                if (result.code === 0) {
                    if (resolve)
                        return resolve({ code: 0, result });
                    return result;
                }
            } catch (error) {
                if (maxRetry <= 0) {
                    return resolve({ code: 500, message: error, });
                }
            }

            if (maxRetry <= 0) {
                return resolve({code: 503, message: '采集源不可用' });
            }

            // 重试
            setTimeout(() => _download(resolve, reject), this._options.downloadRetryDelay);
            maxRetry --;
        };

        return new Promise(_download);
    }

    async _downloadMp4File(url, path: string = null, onProgress: Boolean = null) {
        const {fs} = RNFetchBlob;
        return new Promise((resolve, reject) => {
            let initReceived = this.movie.progress.received;
            let initTotal = this.movie.progress.total;
            fs.exists(path).then((ext) => {
                if (ext) {
                    return fs.stat(path).then((stat) => stat)
                } else return Promise.resolve({size: 0})
            }).then((stat) => {
                this._downloadTask =  RNFetchBlob.config({
                    path: path,
                    overwrite: false
                }).fetch('GET', url, {Range : `bytes=${stat.size}-`});

                this._downloadTask.progress((received, total) => {
                    const ss = 1024 * 1024;
                    // console.log("下载"+this.movie.episode,'progress', (received / total).toFixed(2) + "&&&&" + (total / ss).toFixed(2));
                    if(onProgress){
                        let paramRecetved = parseInt(initReceived)  + parseInt(received);
                        if(initTotal <= 0){
                            initTotal = total;
                        }
                        this._onProgress(paramRecetved, initTotal);
                    }
                })
                .then(async (resp) => {
                    let info = resp.info();
                    let data = {
                        code: (info.status === 206 || info.status === 200) ? 0 : info.status,
                    };
                    if (info.status === 206 || info.status === 200) {
                        data['path'] = resp.path();
                        if (path === null) {
                            data['data'] = await resp.text();
                        }
                    } else {
                        data['message'] = 'HTTP 状态码非 200';
                    }
                    resolve(data);
                })
                .catch((errorMessage, statusCode) => {
                    resolve({
                        code: statusCode,
                        message: errorMessage,
                    });
                });
            });
        });

    }

    async _downloadFile(url, path: string = null, onProgress: Boolean = false) {
        return new Promise((resolve, reject) => {
            let config = {
                fileCache: true,
                overwrite : false,
            };
            if (path) {
                config['path'] = path;
            }

            this._downloadTask = RNFetchBlob.config(config).fetch('GET', url);
            this._downloadTask
                .progress((received, total) => {
                    // console.log('下载Progress:', received, total);
                    // 计算速度
                    // let lastReceived = 0;
                    // this._downloadSpeed = 0;
                    // if (this.movie.progress && this.movie.progress.received > 0) {
                    //     let seconds = (Date.now() - this.movie.progress.time) / 1000;
                    //     this._downloadSpeed = (received - lastReceived) / seconds;
                    // }
                    // onProgress && onProgress(received, total);
                    // if(onProgress){
                    //     let paramRecetved = parseInt(initReceived)  + parseInt(received);
                    //     // console.log("进度:",initReceived,paramRecetved)
                    //     this._onProgress(paramRecetved, total);
                    // }
                })
                .then(async (resp) => {
                    let info = resp.info();
                    let data = {
                        code: (info.status === 200 || info.status === 206) ? 0 : info.status,
                    };
                    if (info.status === 200 || info.status === 206) {
                        data['path'] = resp.path();
                        if (path === null) {
                            data['data'] = await resp.text();
                        }
                    } else {
                        data['message'] = 'HTTP 状态码非 200';
                    }
                    resolve(data);
                })
                .catch((errorMessage, statusCode) => {
                    resolve({
                        code: statusCode,
                        message: errorMessage,
                    });
                });
        });
    }


    /**
     * 开始下载
     * @returns {Promise.<void>}
     */
    async start() {
        if (this.isStartDownload) {
            return;
        }

        let path = this.getMoviePath();
        // 创建下载目录
        this._createDir(path.savePath);

        let _download = () => {
            // 回调开始
            this._onStart();
            return new Promise(async (resolve, reject) => {
                // 下载m3u8文件
                let result = await this._downloadM3U8();
                // console.log('下载m3u8文件返回信息Downloader.start:', result);
                if (result.code === 0) {
                    this._onDone();
                } else if (result.code === 1) {
                    this._onStop();
                } else {
                    this._onError(result);
                }
                resolve(result);
            })
        };

        return _download();
        // return Promise.race([
        //     _download(),
        // ]);
    }

    /**
     * 停止下载
     * @returns {Promise.<void>}
     */
    async stop() {
        // console.log('现在停止Downloader.stop:', this.isStartDownload);
        this.isStartDownload = false;
        this._status = DOWNLOAD_STATUS.Waiting;
        if (this._downloadTask) {
            this._downloadTask.cancel((err) => {
                return Promise.resolve(true);
            });
        } else {
            return Promise.resolve(true);
        }
    }

    /**
     * 视频文件是否已存在
     * @param movie
     * @returns {Promise.<boolean>}
     */
    async exists(): boolean {
        const path = this.getMoviePath();
        return await RNFetchBlob.fs.isDir(path.savePath);
    }

    /**
     * 清除数据
     * @returns {Promise.<boolwan>}
     */
    async clear(): boolean {
        const path = this.getMoviePath();
        if (await RNFetchBlob.fs.isDir(path.savePath)) {
            if (await RNFetchBlob.fs.isDir(path.tsPath)) {
                // 删除所有ts文件
                let files = RNFetchBlob.fs.ls(path.tsPath);
                if (files) {
                    for (let file in files) {
                        await RNFetchBlob.fs.unlink(file);
                    }
                }
                // 删除ts目录
                await RNFetchBlob.fs.unlink(path.tsPath);
            }
            // 删除播放文件
            if (await RNFetchBlob.fs.exists(path.playFile)) {
                await RNFetchBlob.fs.unlink(path.playFile);
            }

            // 删除影片缓存的根目录
            await RNFetchBlob.fs.unlink(path.savePath);
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }

    /**
     * 获取影片路径
     * @param movie
     * @returns {{dirName: string, savePath: string, coverPath: string}}
     */
    getMoviePath() {
        // 目录名
        const dirName = this.movie.mark;
        // 保存地址
        const savePath = CACHE_ROOT_DIR + dirName + '/';
        // 封面地址
        const coverPath = savePath + 'cover.jpg';
        // ts文件目录
        const tsPath = savePath + 'ts/';
        // 播放源文件地址
        const playFile = savePath + this.movie.mark + '.' + this.movie.container;// (this.movie.type || MOVIE_TYPE.M3U8);
        // 播放源url
        const playSource =  staticServerHost + this.movie.mark + '/' + this.movie.mark + '.' + this.movie.container;//(this.movie.type || MOVIE_TYPE.M3U8);

        return {
            dirName,
            savePath,
            coverPath,
            tsPath,
            playSource,
            playFile,
        };

    }

    get status() {
        let result = {
            status: this._status,
            progress: {
                received: this.movie.progress ? this.movie.progress.received : 0,
                total: this.movie.progress ? this.movie.progress.total : 0,
            },
        };
        // 计算进度百分比
        result.progress.percent = Math.min((result.progress.received || 0) / (result.progress.total || 1), 1);
        switch (this._status) {
            case DOWNLOAD_STATUS.Waiting:
                result.statusText = '等待下载';
                break;
            case DOWNLOAD_STATUS.Downloading:
                result.statusText = '正在下载' + (result.progress.percent > 0 ? ' ' + (result.progress.percent * 100).toFixed(1) + '%' : '');
                // result.statusText = '正在下载 ' + util.sizeHuman(this._downloadSpeed) + '/s';
                break;
            case DOWNLOAD_STATUS.Preparing:
                result.statusText = '准备下载';
                break;
            case DOWNLOAD_STATUS.Error:
                result.statusText = '下载出错';
                break;
            case DOWNLOAD_STATUS.Completed:
                result.statusText = '下载完成';
                break;
        }
        return result;
    }

    on(eventType: string, listener: Function) {
        this._listeners[eventType] = listener;
    }

    clearListeners() {
        this._listeners = {};
    }

    _onDone() {
        this.isStartDownload = false;
        this._status = DOWNLOAD_STATUS.Completed;
        this._listeners[EVENTS.Done] && this._listeners[EVENTS.Done](this);
    }

    _onError(err) {
        this.isStartDownload = false;
        this._status = DOWNLOAD_STATUS.Error;
        this._listeners[EVENTS.Error] && this._listeners[EVENTS.Error](this, err)
    }

    _onProgress(received, total) {
        this.movie.progress = {
            received,
            total,
            time: Date.now(),
        };
        this._status = DOWNLOAD_STATUS.Downloading;
        this._listeners[EVENTS.Progress] && this._listeners[EVENTS.Progress](this, received, total);
    }

    _onStart() {
        this.isStartDownload = true;
        this._status = DOWNLOAD_STATUS.Preparing;
        this._listeners[EVENTS.Start] && this._listeners[EVENTS.Start](this);
    }

    _onStop() {
        this.isStartDownload = false;
        this._status = DOWNLOAD_STATUS.Waiting;
        this._listeners[EVENTS.Stop] && this._listeners[EVENTS.Stop](this);
    }

}

class DownloadManager {

    constructor() {
        this._props = {
            // 缓存中影片id列表
            caching: [],
            // 已经运行过的
            run: [],
            // 已缓存影片id列表
            cached: [],
            // 缓存的影片列表
            movies: {},
            // 当前正在缓存影片
            current: null,
        };

        this._initialize();
        this._downloaders = {};

        this.isStartDownload = false;
    }

    async _initialize() {
        // 初始化根目录
        await this._initializeDir();

        let self = this;
        let fileName = CACHE_ROOT_DIR + 'agoutv.cache.json';
        // console.log("配置文件的位置:",fileName);
        if (await RNFetchBlob.fs.exists(fileName)) {
            RNFetchBlob.fs
                .readFile(fileName, 'utf8')
                .then((data) => {
                    if (data) {
                        // console.log("创建文件的数据:++++++++++===="+data);
                        self._props = Object.assign({}, this._props, JSON.parse(data));
                        // console.log('ReadFile2:', self._props);
                    }
                });
        }
    }

    async _initializeDir() {

        if (!(await RNFetchBlob.fs.isDir(CACHE_ROOT_DIR))) {
            await RNFetchBlob.fs.mkdir(CACHE_ROOT_DIR).catch((err)=>{
                console.log("错误:",err);
            });
        }

    }

    /**
     * 保存数据
     * @private
     */
    _save() {
        let data = JSON.stringify(this._props);
        RNFetchBlob.fs.writeFile(CACHE_ROOT_DIR + 'agoutv.cache.json', data, 'utf8');
    }

    /**
     * 追加数据
     * @param status 写入状态
     * @param movie 视频记录
     * @param stream 清晰度
     * @private
     */
    _addData(status, movie:Video, item: Object) {
        // console.log("添加的信息:",movie);
        let data = this._props[status];
        // 确保 新追加的数据在列表的顶部
        if (data.indexOf(movie.id) > -1) {
            data.splice(data.indexOf(movie.id), 1);
        }
        // data.splice(0, 0, movie.id);
        data.push(movie.id);
        let stream = movie.item.m3u8Url;
        let container = movie.item.container;
        let staticUrls = stream;//null;
        this._props.movies[movie.id] = Object.assign(this._props.movies[movie.id] || {}, {
            id: movie.id,
            mark: movie.id,
            container:container,
            // hexId:movie.hexId,
            // subTitle:movie.subTitle,
            // title: movie.title,
            // type:movie.type,
            // episode:movie.episode,
            // item:movie.item,
            // cover: movie.cover,
            playedTime:0,
            stream: stream,
            status: status,
            progress: {
                received: 0,
                total: 0,
            },
            staticUrls,
        },movie);
        // 保存数据
        this._save();

    }

    setPlayedTime(mid:number,playedTime){
        this._props.movies[mid] = Object.assign(this._props.movies[mid] || {},{playedTime:playedTime});
    }

    /**
     * 移除数据
     * @param status
     * @param movieId
     * @private
     */
    _removeData(status, movieId) {
        let data = this._props[status];
        if (data.indexOf(movieId) > -1) {
            data.splice(data.indexOf(movieId), 1);
        }
        if (typeof this._props.movies[movieId] !== 'undefined') {
            delete this._props.movies[movieId];
        }

        this._save();
    }

    /**
     * 从给定状态列表中移除
     * @param status
     * @param movieId
     * @private
     */
    _removeFrom(status, movieId) {
        if (this._props[status].indexOf(movieId) > -1) {
            this._props[status].splice(this._props[status].indexOf(movieId), 1);
        }
    }

    _moveTo(m, from, to) {
        this._removeFrom(from, m.id);
        this._addData(to, m, m.stream);
    }

    /**
     * 获取所有运行中的下载器实例
     * @returns {Array.<Downloader>}
     * @private
     */
    getRunning(): ?Array<Downloader> {
        let result: ?Array<Downloader> = [];
        for (let movieId of Object.keys(this._downloaders)) {
            if (this._downloaders[movieId].isStartDownload) {
                result.push(this._downloaders[movieId]);
            }
        }
        return result;
    }

    /**
     * 获取可运行的视频
     * @returns {*}
     * @private
     */
    _getRunnable(): Video {
        for (let movieId of this._props.caching) {
            // 未运行过
            if (this._props.run.indexOf(movieId) == -1) {
                let m = this._props.movies[movieId];
                if (m === undefined)
                    continue;

                return m;
            }

        }
        return false;
    }

    /**
     * 切换给定影片的播放和停止状态
     * @param movieId
     * @returns {Promise.<*>}
     */
    async toggleMovie(movieId: number) {
        let downloader = this.getDownloader(movieId);
        if (downloader) {
            return downloader.isStartDownload ? this.stopMovie(movieId) : this.startMovie(movieId);
        }
        return Promise.reject(false);
    }

    /**
     * 给定影片内码是否已存在
     * @param movieId
     * @returns {boolean}
     */
    existsMovie(movieId: number) {
        return typeof this._props.movies[movieId] !== 'undefined';
    }

    /**
     * 停止给定影片的下载
     * @param movieId
     * @returns {Promise.<*>}
     */
    async stopMovie(movieId: number) {
        let downloader = this.getDownloader(movieId, false);
        if (downloader) {
            return downloader.stop();
        }
        return Promise.resolve(false);
    }

    /**
     * 开始给定影片的下载
     * @param movieId
     * @returns {Promise.<*>}
     */
    async startMovie(movieId: number) {
        // 获取当前运行的下载器
        let running = this.getRunning();
        if (running.length >= MAX_RUNNING) {
            return Promise.resolve('一次只能启动一个任务');
        }

        let downloader = this.getDownloader(movieId);
        if (downloader) {
            downloader.start().then((result) => {
                // console.log('点击事件的开始startMovie', result);
                if (result.code === 0) {
                    this._moveTo(this.getMovie(movieId), STATUS.Caching, STATUS.Cached);
                }
            });
            return Promise.resolve(true);
        }
        return Promise.resolve(false);
    }

    async toggle() {
        if (this.isStartDownload) {
            return this.stop();
        } else {
            return this.start();
        }
    }

    /**
     * 停止所有的下载器
     * @returns {Promise.<boolean>}
     */
    async stop() {
        if (!this.isStartDownload) {
            return Promise.resolve(false);
        }

        if (this._downloaders.length > 0) {
            // 停止掉所有的下载器
            for (let movieId of Object.keys(this._downloaders)) {
                this._downloaders[movieId].stop();
            }
            this.isStartDownload = false;
        }
        return Promise.resolve(true);
    }

    /**
     * 开始下载
     * @returns {Promise.<void>}
     */
    async start() {
        if (this.isStartDownload) {
            return Promise.resolve(false);
        }

        if (util.isEmptyObject(this._props.caching)) {
            return Promise.resolve(false);
        }

        // 重新开始下载
        // 清除已运行列表
        this._props.run = [];
        // 开始标记
        this.isStartDownload = true;
        let _download = () => {
            return new Promise(async (resolve, reject) => {
                // 表示当前执行到的位置
                while (true) {
                    let m = this._getRunnable();
                    // console.log("从可运行列表中获取到的数据",m)
                    if (m === false) {
                        break;
                    }

                    this._downloaders[m.id] = new Downloader(m);

                    // 下载m3u8文件
                    let result = await this._downloaders[m.id].start();
                    // console.log('下载返回的结果CacheManager._download:', result);
                    if (result.code === 0) {
                        this._moveTo(m, STATUS.Caching, STATUS.Cached);
                    } else {
                        this._props.run.push(m.id);
                    }

                    this._save();
                }

                //this._onAllDone();
                resolve({eventType: EVENTS.AllDone, target: this});
            })
        };

        return Promise.race([
            _download(),
        ]);
    }

    /**
     * 清除给定影片内码的缓存视频
     * @param movieId
     * @returns {Promise.<*>}
     */
    async clearMovieId(movieId: number) {
        let m = this.getMovie(movieId);
        if (m) {
            return this.clearMovie(m);
        }
        return Promise.resolve(false);
    }

    /**
     *
     * @param movie
     * @returns {Promise.<boolwan>}
     */
    async clearMovie(movie:Video) {

        // await this.stopMovie(movie.id);

        let downloader = this._downloaders[movie.id];
        if (!downloader) {
            downloader = new Downloader(movie);
        }

        await downloader.stop();
        await downloader.clear();

        delete this._downloaders[movie.id];
        // 从缓存中队列移除
        this._removeFrom(STATUS.Caching, movie.id);
        this._removeFrom(STATUS.Run, movie.id);
        // 从一缓存列表中移除
        this._removeData(STATUS.Cached, movie.id);

        return Promise.resolve(true);
    }

    clear() {
        if (!util.isEmptyObject(this._props.movies)) {
            for (let key of Object.keys(this._props.movies)) {
                let m = this._props.movies[key];
                this.clearMovie(m);
            }
        }
    }

    /**
     * 下载影片
     * @param movie 影片记录
     * @param stream 清晰度
     */
    async add(movie:Video, item: Object, autoStart: boolean = true) {
        let download = async (resolve, reject) => {
            // 写入缓存中
            this._addData(STATUS.Caching, movie, item);
            // this.isStartDownload = false;
            // console.log("isStartDownload:",this.isStartDownload);
            autoStart && this.start();

            resolve(true);
        };

        let deleteRedownload = async (resolve, reject) => {
            // 删除
            await this.clearMovie(movie);
            download(resolve, reject);
        };


        return new Promise((resolve, reject) => {
            // 检查本地缓存总数是否超过每日限制
            // if (!launchSettings.spi.isInfiniteInvalid && this.totalMovies >= launchSettings.spi.playOfDay) {
            //     return reject('本地缓存数量不能超过每日播放次数');
            // }

            // 是否已经缓存
            if (typeof this._props.movies[movie.id] !== 'undefined') {
                return Alert.alert('提示', '视频已在缓存队列中，是否删除重新缓存？', [
                    { text: '取消', onPress: () => resolve(false) },
                    { text: '删除重下', onPress: () => deleteRedownload(resolve, reject) }
                ]);
            }

            download(resolve, reject);
        });
    }

    async getSpace() {
        return await RNFetchBlob.fs.df();
    }

    /**
     * 获取给定的影片数据
     * @param movieId
     * @returns {*}
     */
    getMovie(movieId) {
        return this._props.movies[movieId];
    }

    /**
     * 获取给定影片的 Downloader 实例
     * @param movieId 影片内码
     * @param autoCreated 如果下载器不存在，是否自动创建
     * @returns {*}
     */
    getDownloader(movieId: number, autoCreated: boolean = true) {
        if (typeof this._downloaders[movieId] === 'undefined' && autoCreated) {
            let m = this.getMovie(movieId);
            if (m) {
                this._downloaders[movieId] = new Downloader(m);
            }
        }
        return this._downloaders[movieId];
    }

    /**
     * 获取给定视频的路径
     * @param movieId
     * @returns {*}
     */
    getMoviePath(movieId: number) {
        let m = this.getMovie(movieId);
        if (m) {
            let downloader = new Downloader(m);
            return downloader.getMoviePath();
        }
        return null;

    }

    get props() {
        return this._props;
    }

    /**
     * 队列中总的影片数
     * @returns {number}
     */
    get totalMovies() {
        return this._props.caching.length + this.props.cached.length;
    }

    getCaching() {
        return this._props.caching;
    }

    getCached() {
        return this._props.cached;
    }

    static getInstance() {
        return new DownloadManager();
    }
}

global.cacheManager = DownloadManager.getInstance();