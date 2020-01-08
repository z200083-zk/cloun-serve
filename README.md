# 个人云存储后端

## 运行

```
node app.js
```

### 问题记录

#### koa2-cors 与 koa-statict 同时使用时的顺序

```
const Koa = require('koa');

const cors = require('koa2-cors');
const staticFiles = require('koa-static')

const app = new Koa();

// 正确
app.use(staticFiles(path.join(__dirname + '/public/'))); // 静态资源服务
app.use(cors()); // 跨域

// 错误
app.use(cors()); // 跨域
app.use(staticFiles(path.join(__dirname + '/public/'))); // 静态资源服务
```
