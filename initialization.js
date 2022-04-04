/*
*  用于程序初始化，
*
*/

const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const mysqlApi = require('./routes/mysql')
const dotenv = require("dotenv").config()

const question = [
    {
        type: 'input',
        name: 'port',
        message: '请输入服务器要运行的端口(1~65535, 回车默认3000): '
    },
    {
        type: 'input',
        name: 'uploadPath',
        message: '请输入文件要上传的目录 (相对路径， 如upload, 回车默认upload): '
    },
    {
        type: 'input',
        name: 'DB_HOST',
        message: '请输入mysql数据库地址 (如 http://127.0.0.1, 回车默认localhost): '
    },
    {
        type: 'input',
        name: 'DB_PORT',
        message: '请输入mysql数据库端口 (如 3306, 回车默认3306): '
    },
    {
        type: 'input',
        name: 'DB_USER',
        message: '请输入mysql数据库用户名 (如 root， 回车默认root): '
    },
    {
        type: 'input',
        name: 'DB_PASSWORD',
        message: '请输入mysql数据库用户名密码 (如 123456): '
    },
    {
        type: 'input',
        name: 'DB_DATABASE',
        message: '请输入mysql数据库名 (如 cutting_board): '
    },
]

// 判断默认值的函数
function defalutValue(answers, inputName, trueValue) {
    // 判断用户输入为空
    if (answers[`${inputName}`] == "") {
        // 是则返回传入的默认值
        var varName = trueValue
    } else {
        // 否则返回输入的值
        var varName = answers[`${inputName}`]
    }
    return varName
}

inquirer.prompt(question).then(answers => {
    // 提示用户服务器地址和文件上传目录
    console.log(`您的服务端地址为: http://127.0.0.1:${answers['port']}`)
    const truePath = path.join(__dirname, `./${answers['uploadPath']}`)
    console.log(`您的文件存储目录为: ${truePath}\n`);
    // 判断回车事件
    var PORT = defalutValue(answers, 'port', 3000)
    var UPLOAD_PATH = defalutValue(answers, 'uploadPath', 'upload')
    var DB_HOST = defalutValue(answers, 'DB_HOST', 'localhost')
    var DB_PORT = defalutValue(answers, 'DB_PORT', 3306)
    var DB_USER = defalutValue(answers, 'DB_USER', 'root')

    // 创建上传文件夹， 已存在则放回错误信息
    fs.mkdir(path.join(__dirname, `${UPLOAD_PATH}`), (err) => {
        if (err) console.log(`文件夹 ${UPLOAD_PATH} 已存在, 改操作将覆盖同名文件夹。\n ${err}`)
    })
    try {
        // 将数据写入.env配置文件
        const content = `PORT=${PORT}\nUPLOAD_PATH=\"../${UPLOAD_PATH}\"\nDB_HOST=\"${DB_HOST}\"\nDB_PORT=${DB_PORT}\nDB_USER=\"${DB_USER}\"\nDB_PASSWORD=\"${answers['DB_PASSWORD']}\"\nDB_DATABASE=\"${answers['DB_DATABASE']}\"\n`
        fs.writeFileSync(path.join(__dirname, './.env'), content)
        console.log('写入成功, 配置文件路径为: ' + path.join(__dirname, './.env'));
    } catch (err) {
        console.error(err)
        console.log('写入失败');
    }
})


