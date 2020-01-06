const Koa = require('koa')
const koaBody = require('koa-body')
const router = require('koa-router')();
const fs = require('fs');
const cors = require('koa2-cors');
// const bodyParser = require('koa-bodyparser');
const path = require('path')

const app = new Koa()
app.use(cors())
// app.use(bodyParser());

app.use(koaBody({
    multipart: true,  // 支持表单上传
    formidable: {
        maxFileSize: 10 * 1024 * 1024, // 修改文件大小限制，默认位2M
    }
}))
app.use(router.routes())
app.use(router.allowedMethods())

function fileTypeFn(ext) {
    if (/(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/.test(ext)) {
        console.log('image')
        return 'image'
    }else if(/(.*)\.(zip|rar|7z|ARJ|CAB|LZH|TAR|GZ|ACE|UUE|BZ2|JAR|ISO)$/i.test(ext)){
        return 'video'
    }
    return ''
}

router.post('/upload', async (ctx) => {
    console.log('上传');
    const file = ctx.request.files.userfile;	// 获取上传文件
    const reader = fs.createReadStream(file.path);	// 创建可读流
    let fileType = fileTypeFn(file.name);
    console.log(fileType);
    let filePath = path.join(__dirname, `public/${fileType}`) + `/${file.name}`;
    const upStream = fs.createWriteStream(filePath); // 创建可写流
    reader.pipe(upStream);	// 可读流通过管道写入可写流
    return ctx.body = '上传成功';
})

let port = process.env.PORT || 20083

app.listen(port, () => {
    console.log('监听端口'+port);
})