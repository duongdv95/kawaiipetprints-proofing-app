const express = require('express')
const path    = require('path')
const dev     = process.env.NODE_ENV !== 'production'
const next    = require('next')
const app     = next({ dev })
const handle  = app.getRequestHandler()
const server  = express()
const axios   = require('axios')
const { SHOPIFYAPIKEY, SHOPIFYPASSWORD } = require("./secrets.json")
const dynamodbREST = "https://7xd39cjm7g.execute-api.us-east-1.amazonaws.com/production/todos"

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
        server.get('/admin', (req, res) => {
            app.render(req, res, '/admin')
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

        server.get('/admin/api/getorders', async (req, res) => {
            const ordersResponse = await axios.get(dynamodbREST)
            const orders = ordersResponse.data
            res.status(200).json({orders})
        })

        server.get('/admin/api/pushlatest', async (req, res) => {
            var successCount = 0
            var alreadyInDBCount = 0
            var errCount = 0;
            var updateResponse = {error:[], alreadyInDB:[], added:[]}
            const shopifyOrdersResponse = await axios.get(
                `https://${SHOPIFYAPIKEY}:${SHOPIFYPASSWORD}@kawaiipetprints.myshopify.com//admin/api/2019-10/orders.json?updated_at_min=2005-07-31T15:57:11-04:00`
            )
            const shopifyOrdersArray = shopifyOrdersResponse.data
            const orderProofsResponse = await axios.get(dynamodbREST)
            const ordersProofsArray = orderProofsResponse.data

            const relevantShopifyOrdersArray = shopifyOrdersArray.orders.map(function(element) {
                const filteredLineItemsArray = element.line_items.map(function(element) {
                    const product_name = element.name.replace(/ *\([^)]*\) */g, "")
                    return {variant_id: element.variant_id, product_name, quantity: element.quantity, sku: element.sku, artworkURL: ""}
                })
                return {proof_created: false, email: element.email, order_number: element.order_number, order_id: element.id, order_status_url: element.order_status_url, line_items: filteredLineItemsArray, created_at: element.created_at, updated_at: element.updated_at}
            })
            const ordersProofsArrayIDs = new Set(ordersProofsArray.map(({order_id}) => order_id))
            for(let i=0; i<relevantShopifyOrdersArray.length; i++) {
                let element = relevantShopifyOrdersArray[i]
                try{
                    const order_id = function() {
                        if(typeof element.order_id === "number") {
                            return JSON.stringify(element.order_id)
                        }
                        else if(typeof element.order_id === "string") {
                            return element.order_id
                        }
                    }()
                    if(!ordersProofsArrayIDs.has(order_id)) {
                        const response = await axios.post(dynamodbREST, {order_id, text: "123", proof_created: element.proof_created, email: element.email, order_number: element.order_number, order_status_url: element.order_status_url, line_items: JSON.stringify(element.line_items), created_at: element.created_at, updated_at: element.updated_at})
                        if(response.status === 200) {
                            successCount++
                            updateResponse.added.push(`${order_id} has been added to the database.`)
                        }
                    } else {
                        alreadyInDBCount++
                        updateResponse.alreadyInDB.push(`Order ID - ${order_id} is already in the database.`)
                    }
                } catch (error) {
                    errCount++
                    const { order_id } = JSON.parse(error.response.config.data)
                    updateResponse.error.push(`Order ID - ${order_id} could not be added to database. => ${error.response.data}`)
                }
            }

            res.status(200).json({successCount, alreadyInDBCount, errCount, updateResponse})
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

