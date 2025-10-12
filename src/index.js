require('dotenv').config()
const main = require('./db/database')
const {app} = require('./app')

main()
.then(()=>{
    console.log('database connected');
    app.listen(process.env.PORT,()=>{
        console.log('server started at '+process.env.PORT);
    })
})
.catch((err)=>{
    console.log('mongoDB Connection failed')
})