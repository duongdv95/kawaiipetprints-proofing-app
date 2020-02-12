const express = require('express')
const path    = require('path')
const dev     = process.env.NODE_ENV !== 'production'
const next    = require('next')
const app     = next({ dev })
const handle  = app.getRequestHandler()
const server  = express()
const axios   = require('axios')
const bodyParser = require('body-parser')
const { SHOPIFYAPIKEY, SHOPIFYPASSWORD } = require("./secrets.json")
const { upload, deleteImages }          = require("./services/file-upload")
const proofUpload      = upload.single("image")
const { cloudFront }   = require('./awsconfig.js')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const dynamodb = require("./services/dynamodb.js")
const { sendEmail } = require("./services/email")
const queryString = require("query-string");
const nodemailer = require('nodemailer')
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
            const response = await dynamodb.getOrder({ order_id })
            if(response.success) {
                res.status(200).json(response)
            } else {
                res.status(400).json(response)
            }
        })

        server.post("/api/approveorder", jsonParser, async (req, res) => {
            const { order_id } = req.query
            const { selectedBackgroundArray, order_number } = req.body 
            const response = await dynamodb.approveOrder({ order_id, data: { selectedBackgroundArray } })
            console.log(response)
            if(response.success) {
                sendEmail({ order_id, order_number })
                res.status(200).json(response)
            } else {
                res.status(400).json(response)
            }
        })

        server.get('/admin/api/getorders', async (req, res) => {
            const ordersResponse = await dynamodb.getOrders()
            res.status(200).json(ordersResponse)
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
            const orderProofsResponse = await dynamodb.getOrders()
            const ordersProofsArray = orderProofsResponse.items
            const relevantShopifyOrdersArray = shopifyOrdersArray.orders.map(function(element) {
                const filteredLineItemsArray = element.line_items.map(function(element) {
                    const product_name = element.name.replace(/ *\([^)]*\) */g, "")
                    const customerImages = element.properties.map(function(e) {
                        const shopifyCDN = e.value
                        const parsedURL = queryString.parseUrl(shopifyCDN)
                        const imageKey = parsedURL.query.uu
                        return `https://cdn.getuploadkit.com/${imageKey}/`
                    })
                    return {
                        variant_id: element.variant_id, product_name, 
                        quantity: element.quantity, sku: element.sku, 
                        artworkURL: "temp", customerImages}
                })
                return {
                    proof_created: false, email: element.email, order_number: element.order_number, 
                    order_id: element.id, order_status_url: element.order_status_url, 
                    line_items: filteredLineItemsArray, created_at: element.created_at, 
                    updated_at: element.updated_at
                }
            })
            const dynamodbIDArrays = new Set(ordersProofsArray.map(({order_id}) => order_id))
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
                    // iterate through shopify orders (4 items) check if each other items exist in dynamodb already (5 items)
                    if(!dynamodbIDArrays.has(order_id)) {
                        const orderData = {
                            order_id, fulfilled: false, proof_created: element.proof_created, 
                            email: element.email, order_number: element.order_number, 
                            order_status_url: element.order_status_url, line_items: element.line_items, 
                            created_at: element.created_at, updated_at: element.updated_at}
                        const response = await dynamodb.createOrder({ orderData })
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

            res.status(200).json({success: true, successCount, alreadyInDBCount, errCount, updateResponse})
        })

        server.post("/admin/api/image-upload", function (req, res) {
            proofUpload(req, res, async function (err) {
                if (err) {
                    return res.status(422).send({ success: false, errors: [{ title: 'File Upload Error', detail: err.message }] });
                }
                const imageKey = req.file.key
                const imageURL = `${cloudFront}${imageKey}`
                const order_id = req.body.order_id
                const imageIndex = parseInt(req.body.index)
                const response = await dynamodb.getOrder({ order_id })
                if(response.success) {
                    const line_items = response.items.line_items
                    line_items[imageIndex].artworkURL = imageURL
                    const updateResponse = await dynamodb.addImagesToFixture({ order_id, line_items })
                    if(updateResponse.success) {
                        res.status(200).json(updateResponse)
                    } else {
                        deleteImages({ key: imageKey })
                        res.status(400).json(updateResponse)
                    }
                } else {
                    res.status(400).json(response)
                }
            })
        })

        server.delete('/admin/api/deleteorder/:id', async (req, res) => {
            console.log("triggered")
            const order_id = req.params.id
            if(!(order_id && order_id.length > 0)) {
                res.status(400).json({success: false, message: `Order ID ${order_id} failed to delete`})
            }
            const response = await dynamodb.deleteOrder({ order_id, deleted: true })
            if(response.success) {
                res.status(200).json({success: true, message: `Order ID ${order_id} successfully deleted.`, data: response.data})
            } else {
                res.status(200).json({success: false, message: `Order ID ${order_id} failed to delete`})
            }
        })

        server.put('/admin/api/archiveorder/:id', async (req, res) => {
            const order_id = req.params.id
            const shopifyResponse = await axios.get(
                `https://${SHOPIFYAPIKEY}:${SHOPIFYPASSWORD}@kawaiipetprints.myshopify.com/admin/api/2019-10/orders/${order_id}.json`
                )
            const fulfilled = (shopifyResponse.data.order.fulfillment_status === "fulfilled") ? true : false
            const response = await dynamodb.archiveOrder({ order_id, data: { fulfilled }})
            if(response.success) {
                res.status(200).json(response)
            } else {
                res.status(400).json(response)
            }
        })

        server.put('/admin/api/deleteproof/:id', jsonParser, async (req, res) => {
            const order_id = req.params.id
            const line_items = JSON.parse(JSON.stringify(req.body.line_items))
            const original_line_items = JSON.parse(JSON.stringify(req.body.line_items))
            const index = req.body.index
            line_items[index].artworkURL = "temp"
            const response = await dynamodb.deleteProof({ order_id, data: { line_items } })
            if(response.success) {
                for(let i=0;i<original_line_items.length;i++) {
                    let artworkURL = original_line_items[i].artworkURL
                    let imageKey = artworkURL.replace("https://dwjt46l68k2gz.cloudfront.net/","")
                    deleteImages({ key: imageKey })
                }
                res.status(200).json(response)
            } else {
                res.status(400).json(response)
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
    server.get('/', (req, res) => app.render(req, res, '/'))

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
        const response = await dynamodb.getOrder({ order_id })
        if(response.success) {
            res.status(200).json(response)
        } else {
            res.status(400).json(response)
        }
    })

    server.post("/api/approveorder", jsonParser, async (req, res) => {
        const { order_id } = req.query
        const { selectedBackgroundArray } = req.body 
        const response = await dynamodb.approveOrder({ order_id, data: { selectedBackgroundArray } })
        console.log(response)
        if(response.success) {
            res.status(200).json(response)
        } else {
            res.status(400).json(response)
        }
    })

    server.get('/admin/api/getorders', async (req, res) => {
        const ordersResponse = await dynamodb.getOrders()
        res.status(200).json(ordersResponse)
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
        const orderProofsResponse = await dynamodb.getOrders()
        const ordersProofsArray = orderProofsResponse.items
        const relevantShopifyOrdersArray = shopifyOrdersArray.orders.map(function(element) {
            const filteredLineItemsArray = element.line_items.map(function(element) {
                const product_name = element.name.replace(/ *\([^)]*\) */g, "")
                const customerImages = element.properties.map(function(e) {
                    const shopifyCDN = e.value
                    const parsedURL = queryString.parseUrl(shopifyCDN)
                    const imageKey = parsedURL.query.uu
                    return `https://cdn.getuploadkit.com/${imageKey}/`
                })
                return {
                    variant_id: element.variant_id, product_name, 
                    quantity: element.quantity, sku: element.sku, 
                    artworkURL: "temp", customerImages}
            })
            return {
                proof_created: false, email: element.email, order_number: element.order_number, 
                order_id: element.id, order_status_url: element.order_status_url, 
                line_items: filteredLineItemsArray, created_at: element.created_at, 
                updated_at: element.updated_at
            }
        })
        const dynamodbIDArrays = new Set(ordersProofsArray.map(({order_id}) => order_id))
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
                // iterate through shopify orders (4 items) check if each other items exist in dynamodb already (5 items)
                if(!dynamodbIDArrays.has(order_id)) {
                    const orderData = {
                        order_id, fulfilled: false, proof_created: element.proof_created, 
                        email: element.email, order_number: element.order_number, 
                        order_status_url: element.order_status_url, line_items: element.line_items, 
                        created_at: element.created_at, updated_at: element.updated_at}
                    const response = await dynamodb.createOrder({ orderData })
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

        res.status(200).json({success: true, successCount, alreadyInDBCount, errCount, updateResponse})
    })

    server.post("/admin/api/image-upload", function (req, res) {
        proofUpload(req, res, async function (err) {
            if (err) {
                return res.status(422).send({ success: false, errors: [{ title: 'File Upload Error', detail: err.message }] });
            }
            const imageKey = req.file.key
            const imageURL = `${cloudFront}${imageKey}`
            const order_id = req.body.order_id
            const imageIndex = parseInt(req.body.index)
            const response = await dynamodb.getOrder({ order_id })
            if(response.success) {
                const line_items = response.items.line_items
                line_items[imageIndex].artworkURL = imageURL
                const updateResponse = await dynamodb.addImagesToFixture({ order_id, line_items })
                if(updateResponse.success) {
                    res.status(200).json(updateResponse)
                } else {
                    deleteImages({ key: imageKey })
                    res.status(400).json(updateResponse)
                }
            } else {
                res.status(400).json(response)
            }
        })
    })

    server.delete('/admin/api/deleteorder/:id', async (req, res) => {
        console.log("triggered")
        const order_id = req.params.id
        if(!(order_id && order_id.length > 0)) {
            res.status(400).json({success: false, message: `Order ID ${order_id} failed to delete`})
        }
        const response = await dynamodb.deleteOrder({ order_id, deleted: true })
        if(response.success) {
            res.status(200).json({success: true, message: `Order ID ${order_id} successfully deleted.`, data: response.data})
        } else {
            res.status(200).json({success: false, message: `Order ID ${order_id} failed to delete`})
        }
    })

    server.put('/admin/api/archiveorder/:id', async (req, res) => {
        const order_id = req.params.id
        const shopifyResponse = await axios.get(
            `https://${SHOPIFYAPIKEY}:${SHOPIFYPASSWORD}@kawaiipetprints.myshopify.com/admin/api/2019-10/orders/${order_id}.json`
            )
        const fulfilled = (shopifyResponse.data.order.fulfillment_status === "fulfilled") ? true : false
        const response = await dynamodb.archiveOrder({ order_id, data: { fulfilled }})
        if(response.success) {
            res.status(200).json(response)
        } else {
            res.status(400).json(response)
        }
    })

    server.put('/admin/api/deleteproof/:id', jsonParser, async (req, res) => {
        const order_id = req.params.id
        const line_items = JSON.parse(JSON.stringify(req.body.line_items))
        const original_line_items = JSON.parse(JSON.stringify(req.body.line_items))
        const index = req.body.index
        line_items[index].artworkURL = "temp"
        const response = await dynamodb.deleteProof({ order_id, data: { line_items } })
        if(response.success) {
            for(let i=0;i<original_line_items.length;i++) {
                let artworkURL = original_line_items[i].artworkURL
                let imageKey = artworkURL.replace("https://dwjt46l68k2gz.cloudfront.net/","")
                deleteImages({ key: imageKey })
            }
            res.status(200).json(response)
        } else {
            res.status(400).json(response)
        }
    })

    server.get('*', (req, res) => handle(req, res))

    module.exports = server
}

