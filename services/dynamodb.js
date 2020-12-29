const AWS = require("aws-sdk");
const awsconfig = require("../awsconfig");
AWS.config.update(awsconfig);
const docClient = new AWS.DynamoDB.DocumentClient();
const table = "kawaiipetprints";

async function getOrders() {
  const params = {
    TableName: table,
  };
  const response = await docClient.scan(params).promise();
  if (response.Items) {
    return { success: true, items: response.Items };
  } else {
    return { success: false, items: [], message: "Failed to retrieve orders" };
  }
}

async function getOrder({ order_id }) {
  if (order_id && order_id.length > 0) {
    const params = {
      TableName: table,
      Key: {
        order_id,
      },
    };
    const response = await docClient.get(params).promise();
    if (response.Item) {
      return { success: true, items: response.Item };
    } else {
      return {
        success: false,
        items: [],
        message: "Order ID not found or invalid",
      };
    }
  } else {
    return {
      success: false,
      items: [],
      message: "Order ID not found or invalid",
    };
  }
}

async function createOrder({ orderData }) {
  const {
    order_id,
    order_number,
    proof_created,
    email,
    order_status_url,
    line_items,
    fulfilled,
    created_at,
    updated_at,
    approved_by_customer,
    first_name,
  } = orderData;

  const params = {
    TableName: table,
    Item: {
      order_id,
      order_number,
      proof_created,
      first_name,
      email,
      order_status_url,
      line_items,
      approved_by_customer,
      fulfilled,
      deleted: false,
      approved: false,
      created_at,
      updated_at,
    },
  };
  let response;
  await docClient
    .put(params)
    .promise()
    .then(function (data) {
      response = { success: true, message: "", order_id };
    })
    .catch(function (err) {
      response = { success: false, message: "Error! Could not add order" };
    });
  return response;
}

async function addImagesToFixture({ order_id, line_items }) {
  const params = (function () {
    let paramsTemp = {
      TableName: table,
      Key: {
        order_id,
      },
      ExpressionAttributeValues: {},
      UpdateExpression: "",
      ReturnValues: "UPDATED_NEW",
    };

    if (line_items) {
      let proofQuantity = line_items.length;
      let proofsCompleted = 0;
      for (let i = 0; i < proofQuantity; i++) {
        if (line_items[i].artworkURL !== "temp") {
          proofsCompleted++;
        }
      }
      if (proofsCompleted === proofQuantity) {
        paramsTemp.ExpressionAttributeValues[":line_items"] = line_items;
        paramsTemp.ExpressionAttributeValues[":proof_created"] = true;
        paramsTemp.UpdateExpression =
          "SET line_items = :line_items, proof_created = :proof_created";
      } else {
        paramsTemp.ExpressionAttributeValues[":line_items"] = line_items;
        paramsTemp.ExpressionAttributeValues[":proof_created"] = false;
        paramsTemp.UpdateExpression =
          "SET line_items = :line_items, proof_created = :proof_created";
      }
    }
    return paramsTemp;
  })();

  const response = await docClient.update(params).promise();
  if (response.Attributes.line_items) {
    return {
      success: true,
      message: `Images added to database for Fixture: ${order_id}`,
    };
  } else {
    return {
      success: false,
      message: `Error. Images did not upload for Fixture: ${order_id}`,
    };
  }
}

async function approveOrder({ order_id, data }) {
  const { selectedBackgroundArray } = data;
  if (!(selectedBackgroundArray && selectedBackgroundArray.length > 0)) {
    return { success: false, message: "Invalid POST data" };
  }
  const params = {
    TableName: table,
    Key: {
      order_id,
    },
    ExpressionAttributeValues: {
      ":approved": true,
      ":selectedBackgroundArray": selectedBackgroundArray,
    },
    UpdateExpression:
      "SET approved = :approved, selectedBackgroundArray = :selectedBackgroundArray",
    ReturnValues: "ALL_NEW",
  };
  const response = await docClient.update(params).promise();
  if (response.Attributes) {
    return {
      success: true,
      message: `Order ID ${order_id} art approved.`,
      selectedBackgroundArray,
    };
  } else {
    return {
      success: false,
      message: `Error. Order ID ${order_id} could not be approved.`,
    };
  }
}

async function archiveOrder({ order_id, data }) {
  const { fulfilled } = data;
  const params = (function () {
    let paramsTemp = {
      TableName: table,
      Key: {
        order_id,
      },
      ExpressionAttributeValues: {},
      UpdateExpression: "",
      ReturnValues: "ALL_NEW",
    };
    paramsTemp.ExpressionAttributeValues[":fulfilled"] = fulfilled;
    paramsTemp.UpdateExpression = "SET fulfilled = :fulfilled";
    return paramsTemp;
  })();

  if (fulfilled && typeof fulfilled !== "boolean") {
    return {
      success: false,
      message: `Couldn't update the order item - fulfilled must be true or false.`,
    };
  }

  const response = await docClient.update(params).promise();
  if (response.Attributes) {
    return {
      success: true,
      message: `Fixture: ${order_id} archived.`,
      order_id,
    };
  } else {
    return {
      success: false,
      message: `Error. Order: ${order_id} couldn't archive.`,
    };
  }
}

async function deleteProof({ order_id, data }) {
  const { line_items } = data;
  const params = (function () {
    let paramsTemp = {
      TableName: table,
      Key: {
        order_id,
      },
      ExpressionAttributeValues: {},
      UpdateExpression: "",
      ReturnValues: "ALL_NEW",
    };
    if (line_items) {
      let proofQuantity = line_items.length;
      let proofsCompleted = 0;
      for (let i = 0; i < proofQuantity; i++) {
        if (line_items[i].artworkURL !== "temp") {
          proofsCompleted++;
        }
      }
      if (proofsCompleted === proofQuantity) {
        paramsTemp.ExpressionAttributeValues[":line_items"] = line_items;
        paramsTemp.ExpressionAttributeValues[":proof_created"] = true;
        paramsTemp.UpdateExpression =
          "SET line_items = :line_items, proof_created = :proof_created";
      } else {
        paramsTemp.ExpressionAttributeValues[":line_items"] = line_items;
        paramsTemp.ExpressionAttributeValues[":proof_created"] = false;
        paramsTemp.UpdateExpression =
          "SET line_items = :line_items, proof_created = :proof_created";
      }
    }
    return paramsTemp;
  })();

  const response = await docClient.update(params).promise();
  if (response.Attributes) {
    return {
      success: true,
      message: `Fixture: ${order_id} - proof deleted.`,
      order_id,
    };
  } else {
    return {
      success: false,
      message: `Error. Order: ${order_id} - proof not deleted.`,
    };
  }
}

async function deleteOrder({ order_id, deleted }) {
  let params = {
    TableName: table,
    Key: {
      order_id,
    },
    ExpressionAttributeValues: { ":deleted": true },
    UpdateExpression: "SET deleted = :deleted",
    ReturnValues: "ALL_NEW",
  };
  const response = await docClient.update(params).promise();
  console.log(response);
  if (response.Attributes) {
    return { success: true, message: `Fixture: ${order_id} deleted`, order_id };
  } else {
    return {
      success: false,
      message: `Error. Fixture: ${order_id} not deleted`,
    };
  }
}

module.exports = {
  getOrder,
  getOrders,
  createOrder,
  addImagesToFixture,
  deleteOrder,
  deleteProof,
  archiveOrder,
  approveOrder,
};
