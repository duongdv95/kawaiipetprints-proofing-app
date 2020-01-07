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
        server.get('/customer', (req, res) => {
            const { order_id } = req.query
            app.render(req, res, '/customer', {order_id})
        })
        server.get('/api/logincustomer', async (req, res) => {
            const { email, order_number } = req.query
            const { data } = await axios.get(
                `https://${SHOPIFYAPIKEY}:${SHOPIFYPASSWORD}@kawaiipetprints.myshopify.com//admin/api/2019-10/orders.json?updated_at_min=2005-07-31T15:57:11-04:00`
            )
            const loginInfoArray = data.orders.map(function(element) {
                return {email: element.email, orderNumber: element.order_number, id: element.id}
            })
            const foundLoginData = loginInfoArray.filter(function(loginPair) {
                if(loginPair.email == email && loginPair.orderNumber == order_number) {
                    return loginPair
                }
            })
            if(foundLoginData.length > 0) {
                res.status(200).json({ success: true, message: "Redirecting...", order_id: foundLoginData[0].id}) 
            } else {
                res.status(400).json({ success: false, message: "Order doesn't exist!", order_id: ""}) 
            }
        })
        
        server.get('/api/getorder', async (req, res) => {
            const { order_id } = req.query
            const response = await axios.get(
                `https://${SHOPIFYAPIKEY}:${SHOPIFYPASSWORD}@kawaiipetprints.myshopify.com//admin/api/2019-10/orders/${order_id}.json`
            )
            const { data } = response
            const { order_status_url, line_items } = data.order
            const orderDataArray = line_items.map(function(element) {
                return {productName: element.name.replace(/ *\([^)]*\) */g, ""), quantity: element.quantity, sku: element.sku}
            })
            if(response.status === 200) {
                res.status(200).json({ success: true, message: "Found orders!", orderData: {orderStatusUrl: order_status_url, orderDataArray} })
            } else {
                res.status(400).json({ success: false, message: "Order doesn't exist!", order: {} })
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

    server.get('*', (req, res) => handle(req, res))

    module.exports = server
}