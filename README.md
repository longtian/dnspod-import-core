# dnspod-import-core
[![](https://img.shields.io/travis/wyvernnot/dnspod-import-core.svg)](https://travis-ci.org/wyvernnot/dnspod-import-core)
[![](https://img.shields.io/npm/v/dnspod-import-core.svg)](https://www.npmjs.com/package/dnspod-import-core)

> 同步 DNS 记录到 DNSPod 指定的域名下

## 示例代码

### 准备要映射的对象

```js
const map = {
  'dev':'10.0.0.1'
};
```

### 调用 apply 方法

```js
const apply = require('dnspod-import-core');
apply(map);
```

## 配置

|       环境变量       |             备注            |
|---------------------|-----------------------------|
| `LOGIN_TOKEN`       | DNSPod 用于鉴权的 API Token |
| `DOMAIN_ID`         | 域名 Id                     |
| `REMOVE`            | 是否删除本地不存在的记录      |

## 开源协议

MIT

## 关于

DNSPod 是 腾讯旗下的云解析平台。