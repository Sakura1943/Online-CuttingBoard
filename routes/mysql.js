const mysql = require('mysql')

// 连接数据库函数
function connectMySQL(data) {
    // 创建连接数据库的信息
    const connection = mysql.createConnection({
        host: data.HOST,
        user: data.USER,
        password: data.PASSWORD,
        port: data.PORT,
        database: data.DATABASE
    })
    // 连接
    connection.connect()
    // 返回connection对象
    return connection
}

// 创建数据表函数
function createDataTable(connection) {
    // 创建创建表格的语句
    let createTable = `CREATE TABLE IF NOT EXISTS userinfo(
                            uuid int unsigned primary key auto_increment,
                            originalname varchar(255) not null,
                            mimetype varchar(255) not null,
                            destination varchar(255) not null,
                            filename varchar(255) not null unique,
                            path varchar(255) not null unique
                        )`
    // 执行语句
    connection.query(createTable, (err, result) => {
        if (err) {
            // 创建失败
            console.log('[CREATE TABLE ERROR] - ', err.message)
            return
        }
        // 创建成功
        console.log('--------------------------CREATE TABLES----------------------------');
        console.log('-----------------------TABLE NAME userinfo-------------------------');
        console.log(result);
        console.log('-----------------------------------------------------------------\n\n');
    })
    connection.end((err) => {
        // 失败
        if (err) {
            console.log('[CREATE TABLE ERROR] - ', err.message)
            return
        }
    })
}


// 添加用户文件信息的接口
function addUserFileInfo(data, mysqlInfo, connection) {
    // 创建添加语句
    let addSql = `INSERT INTO userinfo(originalname, mimetype, destination, filename, path) VALUES(?, ?, ?, ?, ?)`
    // 创建添加的数据
    let addSqlParams = [data.originalname, data.mimetype, data.destination, data.filename, data.path]
    // 执行语句
    connection.query(addSql, addSqlParams, (err, result) => {
        if (err) {
            // 失败
            console.log('[INSERT ERROR] - ', err.message);
            return;
        }
        //成功
        console.log('--------------------------INSERT----------------------------');
        console.log('INSERT result:', result);
        console.log('-----------------------------------------------------------------\n\n');
    })
}


// 查询用户文件信息的接口
function queryUserFileInfo(mysqlInfo, connection, queryData) {
    // 创建查询语句
    let querySqlParams = `SELECT ${queryData.rowName} FROM userinfo where uuid=${queryData.userID}`
    // 执行语句
    connection.query(querySqlParams, (err, result) => {
        // 错误
        if (err) {
            console.log('[SELECT ERROR] - ', err.message)
            return
        }
        // 成功
        console.log('--------------------------SELECT----------------------------');
        console.log(result);
        console.log('------------------------------------------------------------\n\n');
    })
}

// 删除接口
function dropUserfile(connection, fileName) {
    // 创建删除语句
    let delSql = `DELETE FROM userinfo where filename=\"${fileName}\"`
    // 执行语句
    connection.query(delSql, (err, result) => {
        // 失败
        if (err) {
            console.log('[DELETE ERROR] - ', err.message);
            console.log('数据可能不存在');
            return
        }
        // 成功
        console.log('--------------------------DELETE----------------------------');
        console.log('DELETE affectedRows', result.affectedRows);
        console.log('-----------------------------------------------------------------\n\n');
    })
}

// 公开接口
module.exports = {
    connectMySQL,
    addUserFileInfo,
    queryUserFileInfo,
    createDataTable,
    dropUserfile
}