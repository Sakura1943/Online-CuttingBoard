const axios = require('axios')

async function getShortUrl(souceUrl) {
    let data
    await axios.post("https://sakunia.tk", {
        url: souceUrl
    })
    .then((req) => {
        // console.log({
        //     status: req.status,
        //     msg: req.data.key
        // });
        data = req.data.key
    })
    .catch((err) => {
        console.log({status: 0,
                    msg: err
        });
    })
    return data
}


// let srcUrl = getShortUrl("https://www.baidu.com")
// srcUrl.then(res => {
//     console.log(res);
// })



module.exports = {
    getShortUrl,
}