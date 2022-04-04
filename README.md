# node.js 剪切板
> 准备
> node.js 环境
> mysql环境 (目前仅支持mysql)
> mysql创建用于访问的数据库和用户名
> node.js 包管理: 如: npm、 cnpm、 yarn等

## 安装依赖
```shell
npm install
```

## 部署
### > 初始化 (请勿重复执行)<br>若重复执行，请删除项目中上传文件的文件夹<br>并将数据库中的`userinfo`表格数据清除并删除表格， 再进行初始化
Linux: 
```shell
npm run init
```
Mac:
```shell
npm run init
```

Windows:
```shell
npm run init
```


## 运行
```shell
npm run dev
```
`默认端口3000`

## 于Linux运行
```
cp -arvf systemd/cuttingboard.service /usr/lib/system/system
systemctl daemon-reload
systemctl enable --now cuttingboard
```



## 接口参数
| 接口类型             | 接口地址                      | 接口类型 | 接口参数 | 参数说明                                       |
| -------------------- | ----------------------------- | -------- | -------- | ---------------------------------------------- |
| 上传文件             | `locahost:3000/api/upload`    | `POST`   | `file`   | 上传的文件地址， 也可接收管道数据              |
| 下载文件             | `localhost:3000/api/download` | `GET`    | `file`   | 上传的文件的文件名(`upload`文件夹下的文件名)   |
| 删除文件及数据库数据 | `localhost:3000/api/drop`     | `GET`    | `file`   | 上传至文件夹的文件名(`upload`文件夹下的文件名) |
## 开源协议 `Apache2.0`

## 联系方式
```shell
QQ: 1436700265@qq.com
Email: sakunia@foxmail.com
Github: https://github.com/Sakura1943
```
项目仍在完善中

# 结束