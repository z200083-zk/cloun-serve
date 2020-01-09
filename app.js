const fs = require('fs');
const Koa = require('koa');
const path = require('path');
const cors = require('koa2-cors');
const koaBody = require('koa-body');
const router = require('koa-router')();
const staticFiles = require('koa-static')

const fileTypeFn = require('./views/rex'); // 判断类型
const rd = require('rd'); // 文件遍历

const app = new Koa()

app.use(async (ctx, next) => {
    // console.log(ctx.headers['user-agent'])
    console.log(ctx.query.fileName);
    let userAgent = (ctx.headers['user-agent'] || '').toLowerCase();
    if (/\/public\/(video|image|audio)\//.test(ctx.URL.pathname)) {
        if (ctx.query.fileName) {
            // ctx.set({
            //     'Content-Type': 'application/octet-stream',
            //     'Content-Disposition': 'attachment; filename=' + ctx.query.cat
            // })
            if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
                ctx.set({
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': 'attachment; filename=' + encodeURIComponent(ctx.query.fileName)
                })
                console.log(1)
            } else if (userAgent.indexOf('firefox') >= 0) {
                ctx.set({
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': 'attachment; filename*="utf8\'\'' + encodeURIComponent(ctx.query.fileName) + '"'
                })
                console.log(2)
            } else {
                /* safari等其他非主流浏览器只能自求多福了 */
                ctx.set({
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': 'attachment; filename=' + new Buffer(ctx.query.fileName).toString('binary')
                })
                console.log(3)
            }
        }
    }
    await next();
})

app.use(staticFiles(path.join(__dirname))); // 静态资源服务
app.use(cors()); // 跨域


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
    console.log('上传');

    const file = ctx.request.files.userfile;	// 获取上传文件
    const reader = fs.createReadStream(file.path);	// 创建可读流
    let fileType = fileTypeFn(file.name); // 判断类型
    console.log('类型' + fileType);

    let filePath = path.join(__dirname, `public/${fileType}`); // 根据类型生成对应目录
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath); // 判断文件夹不存在并创建
    }
    const upStream = fs.createWriteStream(filePath + `/${file.name}`); // 创建可写流
    reader.pipe(upStream);	// 可读流通过管道写入可写流
    console.log('上传成功');

    ctx.body = '上传成功';
})

router.get('/serve/public', async (ctx) => {
    let resList = [];
    rd.eachFileSync(`public/${ctx.query.cat}`, function (f, s) {
        let fileName = f.split(__dirname + `\\public\\${ctx.query.cat}\\`)[1];
        resList.push({ fileName, path: f, details: s });
    });
    ctx.body = resList;
})




// 获取命令行参数
// let parameter = process.argv.splice(2);
// 获取自定义端口 默认端口20083
// let port = parameter[0].split("=")[1] || 20083

app.listen(20083, () => {
    console.log('监听端口' + 20083);
})