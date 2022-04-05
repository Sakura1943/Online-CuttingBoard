var express = require('express');
var router = express.Router();

const multer = require('multer')
const fs = require('fs')
const path = require('path')
const dotenv = require("dotenv").config()
const uploadPath = path.join(__dirname, process.env.UPLOAD_PATH)
const crypto = require('crypto')
const mysql = require('mysql')
const mysqlConnect = require('./mysql')
const template = require('art-template')
const fsExtra = require("fs-extra");
const srcUrl = require('./shorturl')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send({
    success: true
  })
});

// 递归删除

/**
 * 删除文件夹下所有问价及将文件夹下所有文件清空
 * @param {*} path 
*/
function emptyDir(path) {
  const files = fs.readdirSync(path);
  files.forEach(file => {
    const filePath = `${path}/${file}`;
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      emptyDir(filePath);
    } else {
      fs.unlinkSync(filePath);
      console.log(`删除${file}文件成功`);
    }
  });
}

/**
 * 删除指定路径下的所有空文件夹
 * @param {*} path 
 */
function rmEmptyDir(path, level = 0) {
  const files = fs.readdirSync(path);
  if (files.length > 0) {
    let tempFile = 0;
    files.forEach(file => {
      tempFile++;
      rmEmptyDir(`${path}/${file}`, 1);
    });
    if (tempFile === files.length && level !== 0) {
      fs.rmdirSync(path);
    }
  }
  else {
    level !== 0 && fs.rmdirSync(path);
  }
}

/**
 * 清空指定路径下的所有文件及文件夹
 * @param {*} path 
 */
function clearDir(path) {
  emptyDir(path);
  rmEmptyDir(path);
}

// md5校验值生成函数
function md5(data) {
  // 以md5的格式创建一个哈希值
  let hash = crypto.createHash('md5');
  return hash.update(data).digest('base64');
}

// 上传接口
router.post('/api/upload', multer({
  dest: uploadPath,
  limits: {
    files: 5, // 最大上传5 个文件
    fieldSize: 5 * 1024 * 1024 // 最大上传 5 MB大小文本文件
  },
  fileFilter: (req, file, cb) => {
    // 判断为空后缀, 并允许通过
    if (file.mimetype == 'application/octet-stream') {
      return cb(console.log('The file suffix is empty, but it is allowed to receive as text.'), true)
    }
    // 判断文件不为文本则new 一个error对象
    else if (!file.mimetype.match(/^text/)) {
      return cb(new Error('Only text are allowed.'), false)
    }
    cb(null, true)
  }
}).array('file', 5), (req, res) => {
  // 接收全部文件对象
  const files = req.files
  // 创建存放所有文件信息得列表
  let fileList = []

  // mysql数据库连接信息
  const mysqlInfo = {
    PORT: process.env.DB_PORT,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE: process.env.DB_DATABASE,
    HOST: process.env.DB_HOST,
  }
  const connection = mysqlConnect.connectMySQL(mysqlInfo)
  // 循环所有文件并修改文件名和路径属性
  for (var i in files) {
    // 变量 F 接收文件对象
    var F = files[i]
    // 获取文件名
    const userData = F
    mysqlConnect.addUserFileInfo(userData, mysqlInfo, connection)
    fileList.push(F)
    // 生成页面
    var htmlDir = path.join(__dirname, '../pages')
    var htmlFileDirPath = path.join(htmlDir, F.filename)
    var htmlFilePath = path.join(htmlFileDirPath, './index.html')
    var highlightPath = path.join(htmlFileDirPath, './highlight')
    fs.mkdir(htmlFileDirPath, (err) => {
      if (err) console.error(err.message)
    })
    fs.readFile(path.join(__dirname, '../views/pages/layout.html'), (err, data) => {
      if (err) {
        console.log(`文件 ${path.join(__dirname, '../views/pages/layout.html')} 读取错误`);
      } else {
        try {
          var fileData = fs.readFileSync(F.path, 'utf-8')
        } catch (err) {
          console.error(err.message)
        }

        let myData = data.toString()
        var result = template.render(myData, {
          content: fileData,
          fileName: `file: ${F.filename}`,
        })
        try {
          fs.writeFileSync(htmlFilePath, result)
          console.log(`生成html文件成功， 访问地址为: ${req.protocol}://${req.headers.host}/p/${F.filename}` + '\n');
        } catch (err) {
          console.error(err.message)
        }
      }
    })
  }
  // 返回文件属性列表给用户
  // res.send(fileList + '\n' + `生成html文件成功， 访问地址为: http://${req.headers.host}/p/${F.filename}` + '\n')
  let theUrl = `${req.protocol}://${req.headers.host}/p/${F.filename}`
  console.log("theurl: ", theUrl);
  let sourceUrl = srcUrl.getShortUrl(theUrl)
  try {
  sourceUrl.then(result => {
    res.json({
      msg: 'success',
      url: `https://sakunia.tk${result}`
    })
  })} catch (err){
    res.json ({
      msg: 'false',
    })
  }

})

// 下载接口
router.get('/api/download', (req, res) => {
  req.query.file ? res.download(path.join(__dirname, process.env.UPLOAD_PATH, req.query.file)) : res.send({
    // 失败就返回 false
    success: false,
    message: '下载失败，建议检查输入的文件名是否正确'
  })
})

// 删除数据接口
router.get('/api/drop', (req, res) => {
  const mysqlInfo = {
    PORT: process.env.DB_PORT,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE: process.env.DB_DATABASE,
    HOST: process.env.DB_HOST,
  }
  const connection = mysqlConnect.connectMySQL(mysqlInfo)
  req.query.file ? mysqlConnect.dropUserfile(connection, req.query.file) : res.send({
    success: false,
    message: '删除失败，建议检查输入的文件名是否正确'
  })
  var filePath = path.join(__dirname, `../upload/${req.query.file}`)
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log("删除失败" + err.message)
      return false
    }
    console.log("删除成功")
  })
  var htmlPath = path.join(__dirname, `../pages/${req.query.file}`)
  clearDir(htmlPath)
  fs.rmdir(htmlPath, err => {
    if (err) {
      console.log("删除失败" + err.message)
      return false
    }
    console.log("删除成功")
  })
})


module.exports = router;
