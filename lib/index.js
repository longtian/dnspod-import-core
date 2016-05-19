'use strict';

var request = require('request');
var fs = require('fs');
var login_token = process.env.LOGIN_TOKEN;
var domain_id = process.env.DOMAIN_ID;
var logStream = process.stdout;

/**
 * 新建 A 记录
 *
 * @type {function()}
 */
var addARecord = function addARecord(subDomain, value) {
    request.post({
        url: 'https://dnsapi.cn/Record.Create',
        form: {
            login_token: login_token,
            format: 'json',
            domain_id: domain_id,
            sub_domain: subDomain,
            record_type: 'A',
            record_line: '默认',
            value: value
        }
    }).pipe(logStream);
};

/**
 * 删除 A 记录
 *
 * @param recordId
 */
var removeRecord = function removeRecord(recordId) {
    request.post({
        url: 'https://dnsapi.cn/Record.Remove',
        form: {
            login_token: login_token,
            format: 'json',
            domain_id: domain_id,
            record_id: recordId
        }
    }).pipe(logStream);
};

/**
 * 更新 A 记录
 *
 * @param recordId
 * @param subDomain
 * @param value
 */
var updateARecord = function updateARecord(recordId, subDomain, value) {
    request.post({
        url: 'https://dnsapi.cn/Record.Modify',
        form: {
            login_token: login_token,
            format: 'json',
            domain_id: domain_id,
            record_id: recordId,
            sub_domain: subDomain,
            record_type: 'A',
            record_line: '默认',
            value: value
        }
    }).pipe(logStream);
};

var onRemoteReceived = function onRemoteReceived(local, remote) {
    var remoteKeys = {};

    // 遍历所有远程的 A 记录
    remote.filter(function (item) {
        return item.type === 'A';
    }).forEach(function (item) {
        // 缓存远程 A 记录的 subDomains
        remoteKeys[item.name] = true;

        if (local[item.name]) {
            if (local[item.name] !== item.value) {
                // 远程存在，本地不在，但是 value 不一致
                updateARecord(item.id, item.name, local[item.name]);
            }
        } else {
            // 远程存在但是本地不存在
            if (process.env.REMOVE) {
                removeRecord(item.id);
            }
        }
    });

    // 编辑本地的记录
    Object.keys(local).forEach(function (item) {
        if (!remoteKeys[item]) {
            addARecord(item, local[item]);
        }
    });
};

module.exports = function (local) {

    if (!login_token || !domain_id) {
        throw new Error('Must provide LOGIN_TOKEN and DOMAIN_ID environment variable');
    }

    request.post({
        url: 'https://dnsapi.cn/Record.List',
        form: {
            login_token: login_token,
            format: 'json',
            domain_id: domain_id
        }
    }, function (err, res, content) {
        if (!err) {
            var parsed = JSON.parse(content);

            var message = '\n        域名： ' + parsed.domain.name + '\n        ID: ' + parsed.domain.id + '\n        子域名个数: ' + parsed.info.sub_domains + '\n        ';
            console.log(message);

            onRemoteReceived(local, parsed.records);
        } else {
            throw err;
        }
    });
};