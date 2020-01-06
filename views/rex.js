const image = /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/i;
const compress = /(.*)\.(zip|rar|7z|ARJ|CAB|LZH|TAR|GZ|ACE|UUE|BZ2|JAR|ISO)$/i;
const text = /(.*)\.(TXT|DOC|XLS|PPT|DOCX|XLSX|PPTX|WPS)$/i;
const audio = /(.*)\.(mp3|m4a|WAV|WMA)$/i;
const video = /(.*)\.(mp4|rmvb|flv|mpeg|avi|wmv|dat|asf|mpg|rm|ram|mp4,3gp|mov|divx|dv|vob|mkv|qt|cpk|fli|flc|f4v|m4v|mod|m2t|swf|webm|mts|m2ts|3g2|mpe|ts|div|lavf|dirac)$/i;

function fileTypeFn(ext) {
    if (image.test(ext)) {
        return 'image'
    } else if (compress.test(ext)) {
        return 'compress'
    } else if (video.test(ext)) {
        return 'video'
    } else if (text.test(ext)) {
        return 'text'
    } else if (audio.test(ext)) {
        return 'audio'
    } else {
        return 'other'
    }
}


module.exports = fileTypeFn