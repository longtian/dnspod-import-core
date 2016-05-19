const request = require('request');
const fs = require('fs');
const login_token = process.env.LOGIN_TOKEN;
const domain_id = process.env.DOMAIN_ID;
const logStream = process.stdout;

/**
 * 新建 A 记录
 *
 * @type {function()}
 */
const addARecord = (subDomain, value) => {
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
}

/**
 * 删除 A 记录
 *
 * @param recordId
 */
const removeRecord = recordId => {
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
const updateARecord = (recordId, subDomain, value) => {
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
}

const onRemoteReceived = (local, remote) => {
    const remoteKeys = {};

    // 遍历所有远程的 A 记录
    remote.filter(item => item.type === 'A').forEach(item => {
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
    Object.keys(local).forEach(item => {
        if (!remoteKeys[item]) {
            addARecord(item, local[item])
        }
    });
}


module.exports = (local)=> {

    if (!login_token || !domain_id) {
        throw new Error('Must provide LOGIN_TOKEN and DOMAIN_ID environment variable')
    }

    request.post({
        url: 'https://dnsapi.cn/Record.List',
        form: {
            login_token: login_token,
            format: 'json',
            domain_id: domain_id
        }
    }, (err, res, content) => {
        if (!err) {
            const parsed = JSON.parse(content);

            const message = `
        域名： ${parsed.domain.name}
        ID: ${parsed.domain.id}
        子域名个数: ${parsed.info.sub_domains}
        `;
            console.log(message);

            onRemoteReceived(local, parsed.records);
        } else {
            throw err;
        }
    });
}