const { FtpClient } =require('spine-ftp');
(async ()=>{
    console.time("b")
    try {
        /* let list=Array(200).fill('naive').map((v, i) =>{ return {number: i}}).map(key=>{
            return FtpClient.connect({
                host:"192.168.61.189",
                port: 21,
                user: "fuck",
                password: key,
                timeout: 10000
            })
        }) */
        let client=await FtpClient.connect({
            host:"192.168.61.189",
            port: 21,
            user: "fuck",
            password: 333,
            timeout: 1000
        })
        console.log(client)
        // await Promise.all(list)
        // await client.disconnect();
        console.timeEnd("b")
    } catch (error) {
        console.log(124124)
        console.timeEnd("b")
        console.log(error)
    }
   
})()
