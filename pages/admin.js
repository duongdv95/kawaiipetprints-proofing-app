import React from "react";
import Modal from "react-modal";
import Header from "../components/header.js";
import axios from "axios";
var moment = require("moment");
moment().format();
Modal.setAppElement("#__next");

const meta = { title: "Admin Dashboard", description: "Admin Dashboard" };

const customStyles = {
  content: {
    top: "40%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

function OrdersTable(props) {
  const { orderData, archiveOrder, openModal } = props;
  const orderMap = orderData.map((element) => {
    const proofStatus = element.proof_created ? (
      <div className="item uploaded-art">Art Uploaded!</div>
    ) : (
      <div className="item awaiting-art">Awaiting Art Upload</div>
    );
    const approvedStatus = element.approved ? (
      <div className="item approved-art">True</div>
    ) : (
      <div className="item unapproved-art">False</div>
    );
    const created_at = moment(element.created_at).format(
      "dddd, MMMM Do YYYY, h:mm a"
    );
    return (
      <React.Fragment key={element.order_number}>
        {proofStatus}
        {approvedStatus}
        <div className="item">
          <button onClick={() => openModal(element.order_id)}>Upload</button>
        </div>
        <div className="item">
          <a href={`/customer?order_id=${element.order_id}`} target="_blank">
            {element.order_number}
          </a>
        </div>
        <div className="item">{created_at}</div>
        <div className="item">
          <button
            onClick={() =>
              archiveOrder({
                order_id: element.order_id,
                isFulfilled: !element.fulfilled,
              })
            }
          >
            {element.fulfilled ? "Unarchive" : "Archive"}
          </button>
        </div>
      </React.Fragment>
    );
  });

  return (
    <div id="order-table">
      <div className="item header">Proof Status</div>
      <div className="item header">Approved</div>
      <div className="item header">Upload Art</div>
      <div className="item header">Order Number</div>
      <div className="item header">Date</div>
      <div className="item header">Action</div>
      {orderMap}
    </div>
  );
}

const ImageUpload = (props) => {
  const {
    currentOrderID,
    deleteProof,
    orderData,
    archivedOrderData,
    closeModal,
    handleChange,
    submitProof,
  } = props;
  if (!currentOrderID) return null;
  const selectedOrder = [...orderData, ...archivedOrderData].filter(
    (element) => element.order_id === currentOrderID
  )[0];
  const line_items = selectedOrder.line_items;

  const artUpload = line_items.map(function (element, index) {
    let uploadOption = (function () {
      if (element.artworkURL === "temp") {
        return (
          <form
            data-orderid={currentOrderID}
            data-index={index}
            data-ordernumber={selectedOrder.order_number}
            data-variantid={element.variant_id}
            onSubmit={submitProof}
            line_items={line_items}
          >
            <div>{element.product_name}</div>
            <input
              onChange={handleChange}
              name="select-image"
              type="file"
              accept="image/png, image/jpeg"
            />
            <button type="submit">Submit</button>
          </form>
        );
      } else {
        return (
          <div style={{ display: "grid" }}>
            <div>{element.product_name}</div>
            <a href={element.artworkURL} target="_blank">
              Image
            </a>
            <button
              onClick={() =>
                deleteProof({ order_id: currentOrderID, index, line_items })
              }
            >
              Delete Image
            </button>
          </div>
        );
      }
    })();

    return (
      <div key={index}>
        <div style={{ fontWeight: "bold" }}>
          Item - {index + 1}/{line_items.length} | Quantity - {element.quantity}
        </div>
        {uploadOption}
      </div>
    );
  });
  return (
    <div className="image-upload">
      <h2>Order {selectedOrder.order_number}</h2>
      <div>
        <span style={{ fontWeight: "bold" }}>Email</span> {selectedOrder.email}
      </div>
      <div>
        <span style={{ fontWeight: "bold" }}>Order Status</span>{" "}
        <a href={selectedOrder.order_status_url}>View Order</a>
      </div>
      {artUpload}
      <div style={{ display: "grid" }}>
        <button style={{ marginLeft: "auto" }} onClick={closeModal}>
          close
        </button>
      </div>
    </div>
  );
};

class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      orderData: [],
      archivedOrderData: [],
      modalIsOpen: false,
      currentOrderID: "",
      primaryImage: null,
    };

    this.handleChange = this.handleChange.bind(this);
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.archiveOrder = this.archiveOrder.bind(this);
    this.deleteProof = this.deleteProof.bind(this);
    this.submitProof = this.submitProof.bind(this);
    // this.fetchData = this.fetchData.bind(this)
  }
  async componentDidMount() {
    await this.getOrders();
  }

  // async getLatestOrders() {
  //   const { data } = await axios.get('/admin/api/pushlatest')
  //   if(data.success) {
  //     this.getOrders()
  //   }
  // }

  async getOrders() {
    const { data } = await axios.get(`/admin/api/getorders`);
    const allOrdersArray = [
      ...data.items.map((element) => {
        return {
          created_at: element.created_at,
          email: element.email,
          fulfilled: element.fulfilled,
          line_items: element.line_items,
          order_id: element.order_id,
          order_number: element.order_number,
          order_status_url: element.order_status_url,
          proof_created: element.proof_created,
          updated_at: element.updated_at,
          deleted: element.deleted,
          approved: element.approved,
        };
      }),
    ];
    allOrdersArray.sort(function (a, b) {
      return (
        moment(b.created_at).format("X") - moment(a.created_at).format("X")
      );
    });
    const orderData = allOrdersArray.filter((element) => {
      return element.fulfilled === false;
    });
    const archivedOrderData = allOrdersArray.filter((element) => {
      return element.fulfilled === true;
    });
    this.setState({ orderData, archivedOrderData });
  }

  openModal(order_id) {
    this.setState({ currentOrderID: order_id, modalIsOpen: true });
  }

  afterOpenModal() {}

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  async submitProof(event) {
    event.preventDefault();
    const {
      orderid,
      index,
      ordernumber,
      variantid,
      line_items,
    } = event.target.dataset;
    const formData = new FormData();
    const primaryImage = this.state.primaryImage;
    if (primaryImage) {
      formData.append("order_id", orderid);
      formData.append("order_number", ordernumber);
      formData.append("variant_id", variantid);
      formData.append("index", index);
      formData.append("line_item", line_items);
      formData.append("image", primaryImage[0]);
      try {
        let uploadResponse = await axios.post(
          "/admin/api/image-upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (uploadResponse.data.success) {
          this.setState({
            uploadMessage: "Upload success! Image(s) saved to S3",
          });
          this.getOrders();
        } else {
          this.setState({ uploadMessage: uploadResponse.data.message });
        }
      } catch (err) {
        this.setState({
          uploadMessage: `Unauthorized. ${err.response.data.message}`,
        });
      }
    } else {
      this.setState({ uploadMessage: "Primary image required!" });
    }
  }

  async deleteProof({ order_id, index, line_items }) {
    console.log(line_items);
    // const temp = line_items
    // let original_line_items = [...line_items]
    // temp[index].artworkURL = "temp"
    const { data } = await axios.put(`/admin/api/deleteproof/${order_id}`, {
      line_items,
      index,
    });
    if (data.success) {
      this.getOrders();
    }
  }

  async deleteOrder(order_number) {
    const { data } = await axios.delete(
      `/admin/api/deleteorder/${order_number}`
    );
    if (data.success) {
      this.getOrders();
    }
  }

  async archiveOrder({ order_id, isFulfilled }) {
    const { data } = await axios.put(
      `/admin/api/archiveorder/${order_id}?isfulfilled=${isFulfilled}`
    );
    console.log(data);
    if (data.success) {
      this.getOrders();
    }
  }

  handleChange(event) {
    event.preventDefault();
    const eventType = event.target.name;
    switch (eventType) {
      case "select-image":
        const primaryImage = event.target.files;
        this.setState({ primaryImage });
        break;

      default:
        console.log("error");
    }
  }

  render() {
    return (
      <div>
        <Header meta={meta}></Header>
        <div id="admin">
          <img src="/static/logo.png" alt="" width="200px" />
          <h1>Orders</h1>
          <OrdersTable
            orderData={this.state.orderData}
            openModal={this.openModal}
            archiveOrder={this.archiveOrder}
          />
          <h1>Archived Orders</h1>
          <OrdersTable
            orderData={this.state.archivedOrderData}
            openModal={this.openModal}
            archiveOrder={this.archiveOrder}
          />
          <Modal
            isOpen={this.state.modalIsOpen}
            onAfterOpen={this.afterOpenModal}
            onRequestClose={this.closeModal}
            style={customStyles}
          >
            <ImageUpload
              currentOrderID={this.state.currentOrderID}
              deleteProof={this.deleteProof}
              orderData={this.state.orderData}
              archivedOrderData={this.state.archivedOrderData}
              closeModal={this.closeModal}
              handleChange={this.handleChange}
              submitProof={this.submitProof}
            />
          </Modal>
        </div>
      </div>
    );
  }
}

export default Admin;
