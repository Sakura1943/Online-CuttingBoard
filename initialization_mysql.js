const mysqlApi = require('./routes/mysql')
const dotenv = require("dotenv").config()
const mysql = require('mysql')

function createMysqlTable() {
    // 初始化数据库表
    var mysqlInfo = {
        PORT: process.env.DB_PORT,
        USER: process.env.DB_USER,
        PASSWORD: process.env.DB_PASSWORD,
        DATABASE: process.env.DB_DATABASE,
        HOST: process.env.DB_HOST,
    }

    const connection = mysqlApi.connectMySQL(mysqlInfo)
    mysqlApi.createDataTable(connection)
}

createMysqlTable()
console.log('数据库数据表创建成功！');
console.log('初始化完成');