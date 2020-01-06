const express = require('express')
const path    = require('path')
const dev     = process.env.NODE_ENV !== 'production'
const next    = require('next')
const app     = next({ dev })
const handle  = app.getRequestHandler()
const server  = express()
const axios   = require('axios')
const { SHOPIFYAPIKEY, SHOPIFYPASSWORD } = require("./secrets.json")

if(!dev) {
    server.use('/_next', express.static(path.join(__dirname, '.next')))
}

if(dev) {
    app.prepare().then(() => {
        server.get('/', (req, res) => app.render(req, res, '/'))
        server.get('/breed/:id', (req, res) => app.render(req, res, '/breed', {id: req.params.id}))
        server.get('/customer', (req, res) => app.render(req, res, '/customer'))
        server.get('/api/logincustomer', async (req, res) => {
            const { email, order_number } = req.query
            const { data } = await axios.get(
                `https://${SHOPIFYAPIKEY}:${SHOPIFYPASSWORD}@kawaiipetprints.myshopify.com//admin/api/2019-10/orders.json?updated_at_min=2005-07-31T15:57:11-04:00`
            )
            const loginPairsArray = data.orders.map(function(element) {
                return {email: element.email, orderNumber: element.order_number}
            })
            const foundLoginPairs = loginPairsArray.filter(function(loginPair) {
                if(loginPair.email == email && loginPair.orderNumber == order_number) {
                    return loginPair
                }
            })
            if(foundLoginPairs.length > 0) {
                res.status(200).json({ success: true, message: "Redirecting...", email, order_number}) 
            } else {
                res.status(400).json({ success: false, message: "Order doesn't exist!"}) 
            }
        })

        server.get('*', (req, res) => {
            return handle(req, res)
        })
        server.listen(3000, (err) => {
            if (err) throw err
            console.log('> Ready on http://localhost:3000')
        })
    })
    .catch((ex) => {
        console.error(ex.stack)
        process.exit(1)
    })
}

if(!dev) {
    // server.use(async (req, res, next) => {
    //     next();
    //     res.setHeader('Access-Control-Allow-Origin', '*');
    //   });
    server.get('/', (req, res) => app.render(req, res, '/'))
    server.get('/breed/:id', (req, res) => app.render(req, res, '/breed', {id: req.params.id}))
    server.get('/customer', (req, res) => app.render(req, res, '/customer'))
    server.get('/api/logincustomer', async (req, res) => {
        const { email, order_number } = req.query
        const { data } = await axios.get(
            `https://${SHOPIFYAPIKEY}:${SHOPIFYPASSWORD}@kawaiipetprints.myshopify.com//admin/api/2019-10/orders.json?updated_at_min=2005-07-31T15:57:11-04:00`
        )
        const loginPairsArray = data.orders.map(function(element) {
            return {email: element.email, orderNumber: element.order_number}
        })
        const foundLoginPairs = loginPairsArray.filter(function(loginPair) {
            if(loginPair.email == email && loginPair.orderNumber == order_number) {
                return loginPair
            }
        })
        if(foundLoginPairs.length > 0) {
            res.status(200).json({ success: true, message: "Redirecting...", email, order_number}) 
        } else {
            res.status(400).json({ success: false, message: "Order doesn't exist!"}) 
        }
    })
    server.get('*', (req, res) => handle(req, res))

    module.exports = server
}