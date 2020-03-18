const fs = require('fs');
const Koa = require('koa');
const path = require('path');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const router = require('koa-router')();
const staticFiles = require('koa-static')

// 数据库
const Sequelize = require('sequelize');
const config = require('./routes/serve');
const jwt = require('jsonwebtoken');
const { createToken, decodeToken } = require('./routes/token');

const fileTypeFn = require('./views/rex'); // 判断类型
const rd = require('rd'); // 文件遍历


const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});

sequelize
    .authenticate()
    .then(() => {
        console.log('数据库连接成功')
    })
    .catch(err => {
        console.log('数据库连接失败', err)
    })

const UserModel = sequelize.define('user', {
    Id: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,            // 主键
        autoIncrement: true,         // 自动递增
    },
    Username: Sequelize.STRING(100),
    Password: Sequelize.STRING(100),
    Email: Sequelize.STRING(100),
    Time: Sequelize.BIGINT,
}, {
    timestamps: false
})

UserModel.sync({ force: false })

const Op = Sequelize.Op;

const app = new Koa()

// app.use(async (ctx,next)=>{
//     if()
// })

// 下载
app.use(async (ctx, next) => {
    let userAgent = (ctx.headers['user-agent'] || '').toLowerCase();

    if (/\/media\/(video|image|audio|other|text|compress)\//.test(ctx.URL.pathname)) {
        if (ctx.query.fileName) {
            if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
                ctx.set({
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': 'attachment; filename=' + encodeURIComponent(ctx.query.fileName)
                })
            } else if (userAgent.indexOf('firefox') >= 0) {
                ctx.set({
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': 'attachment; filename*="utf8\'\'' + encodeURIComponent(ctx.query.fileName) + '"'
                })
            } else {
                ctx.set({
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': 'attachment; filename=' + new Buffer(ctx.query.fileName).toString('binary')
                })
            }
        }
    }
    await next();
})

// 静态资源服务
app.use(staticFiles(path.join(__dirname, '/public')));
app.use(cors()); // 跨域

// 文件上传
app.use(koaBody({
    multipart: true,  // 支持表单上传
    formidable: {
        maxFileSize: 500 * 1024 * 1024, // 修改文件大小限制，默认位2M 当前为500M
    }
}))

app.use(router.routes());
app.use(router.allowedMethods());

// 上传
router.post('/serve/upload', async (ctx) => {
    const file = ctx.request.files.userfile;	// 获取上传文件
    const reader = fs.createReadStream(file.path);	// 创建可读流
    let fileType = fileTypeFn(file.name); // 判断类型
    let filePath = path.join(__dirname, `public/media/${fileType}`); // 根据类型生成对应目录
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath); // 判断文件夹不存在并创建
    }
    const upStream = fs.createWriteStream(filePath + `/${file.name}`); // 创建可写流
    reader.pipe(upStream);	// 可读流通过管道写入可写流

    ctx.body = '上传成功';
})


// 文件遍历查询
router.get('/serve/public', async (ctx) => {
    let resList = [];
    rd.eachFileSync(`public/media/${ctx.query.cat}`, function (f, s) {
        let fileName = f.split(__dirname + `/public/media/${ctx.query.cat}/`)[1];
        resList.push({ fileName, path: f, details: s });
    });
    if (resList.length === 0) {
        ctx.body = [];
    } else {
        ctx.body = resList;
    }
})

// 登录
router.post("/login", async (ctx) => {
    let { username, password } = ctx.request.body;
    await UserModel.findAll({
        raw: true, where: {
            [Op.or]: [
                {
                    username: {
                        [Op.like]: username
                    }
                },
                {
                    email: {
                        [Op.like]: username
                    }
                }
            ],
            password: password
        }
    }).then(notes => {
        if (notes.length == 0) {
            ctx.body = {
                code: 400,
                msg: '用户不存在或密码错误'
            }
            return
        }
        let token = createToken(notes[0]);
        ctx.body = { code: 200,token, msg: '登录成功' }

    })
})


// 获取命令行参数
// let parameter = process.argv.splice(2);
// 获取自定义端口 默认端口20083
// let port = parameter[0].split("=")[1] || 20083

app.listen(20083, () => {
    console.log('监听端口' + 20083);
})