const Order = require('../models/order');
const nodemailer = require('nodemailer');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const {
      name,
      email,
      projectDetails,
      projectType,
      techStack,
      numberOfPages,
      basePrice,
      techMultiplier,
      totalPrice
    } = req.body;

    // Validation
    if (!name || !email || !projectDetails || !projectType || !techStack || !numberOfPages || !totalPrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      name,
      email,
      projectDetails,
      projectType,
      techStack,
      numberOfPages,
      basePrice,
      techMultiplier,
      totalPrice,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      message: 'Order created successfully'
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Get User Orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get Single Order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order belongs to user or user is admin
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ message: 'Error fetching order' });
  }
};

// Update Payment Status (after payment verification)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId, paymentId, razorpayOrderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'completed';
    order.paymentId = paymentId;
    order.orderId = razorpayOrderId;
    await order.save();

    // Send emails
    await sendAdminEmail(order);
    await sendUserEmail(order);

    res.json({ success: true, message: 'Payment confirmed', order });
  } catch (err) {
    console.error('Update payment error:', err);
    res.status(500).json({ message: 'Error updating payment status' });
  }
};

// Send Email to Admin
async function sendAdminEmail(order) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 New Order Received!</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333;">Order Details</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Order ID:</td>
            <td style="padding: 10px;">${order._id}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Customer Name:</td>
            <td style="padding: 10px;">${order.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Email:</td>
            <td style="padding: 10px;">${order.email}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Project Type:</td>
            <td style="padding: 10px;">${order.projectType}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Tech Stack:</td>
            <td style="padding: 10px;">${order.techStack}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Number of Pages:</td>
            <td style="padding: 10px;">${order.numberOfPages}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Total Amount:</td>
            <td style="padding: 10px; color: #4ade80; font-size: 20px; font-weight: bold;">₹${order.totalPrice}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Payment Status:</td>
            <td style="padding: 10px;"><span style="background: #4ade80; color: white; padding: 5px 10px; border-radius: 5px;">PAID</span></td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px; font-weight: bold;">Payment ID:</td>
            <td style="padding: 10px;">${order.paymentId}</td>
          </tr>
        </table>

        <h3 style="color: #333; margin-top: 20px;">Project Details:</h3>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 8px; color: #555;">${order.projectDetails}</p>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #888; font-size: 14px;">Order received at: ${new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
        <p>Developer Studio - Admin Notification</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `🎉 New Order #${order._id.toString().slice(-6)} - ₹${order.totalPrice}`,
    html: emailContent
  });
}

// Send Email to User
async function sendUserEmail(order) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">✅ Order Confirmed!</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333;">Hi <strong>${order.name}</strong>,</p>
        <p style="color: #555;">Thank you for your order! We've received your payment and will start working on your project shortly.</p>

        <div style="background: #f0f9ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #667eea;">Order Summary</h3>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
          <p style="margin: 5px 0;"><strong>Project Type:</strong> ${order.projectType}</p>
          <p style="margin: 5px 0;"><strong>Tech Stack:</strong> ${order.techStack}</p>
          <p style="margin: 5px 0;"><strong>Number of Pages:</strong> ${order.numberOfPages}</p>
        </div>

        <h3 style="color: #333; margin-top: 25px;">Payment Details</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <tr style="background: #f9f9f9;">
            <td style="padding: 12px; border: 1px solid #eee;">Base Price</td>
            <td style="padding: 12px; border: 1px solid #eee; text-align: right;">₹${order.basePrice}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #eee;">Tech Multiplier (${order.techMultiplier}x)</td>
            <td style="padding: 12px; border: 1px solid #eee; text-align: right;">₹${order.basePrice * (order.techMultiplier - 1)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; border: 1px solid #eee;">Pages (${order.numberOfPages})</td>
            <td style="padding: 12px; border: 1px solid #eee; text-align: right;">×${order.numberOfPages}</td>
          </tr>
          <tr style="background: #f0fdf4; font-weight: bold; font-size: 18px;">
            <td style="padding: 15px; border: 1px solid #4ade80; color: #16a34a;">Total Paid</td>
            <td style="padding: 15px; border: 1px solid #4ade80; text-align: right; color: #16a34a;">₹${order.totalPrice}</td>
          </tr>
        </table>

        <p style="color: #888; font-size: 13px; margin-top: 10px;">Payment ID: ${order.paymentId}</p>

        <h3 style="color: #333; margin-top: 25px;">Your Project Details:</h3>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 8px; color: #555; line-height: 1.6;">${order.projectDetails}</p>

        <div style="background: #fffbeb; border-left: 4px solid #fbbf24; padding: 15px; margin: 25px 0;">
          <h4 style="margin: 0 0 10px 0; color: #f59e0b;">📋 What's Next?</h4>
          <ul style="margin: 0; padding-left: 20px; color: #666;">
            <li>Our team will review your requirements within 24 hours</li>
            <li>You'll receive a project timeline and milestones</li>
            <li>We'll keep you updated throughout the development process</li>
            <li>Expected delivery: 5-15 business days (depending on complexity)</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #555;">Need help? Reply to this email or contact us:</p>
          <p style="color: #667eea; font-size: 16px; font-weight: bold;">support@developersstudio.com</p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
        <p>Developer Studio | Building Your Digital Future</p>
        <p>Order Date: ${new Date(order.createdAt).toLocaleString()}</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: order.email,
    subject: `✅ Order Confirmed #${order._id.toString().slice(-6)} - Developer Studio`,
    html: emailContent
  });
}

// Get All Orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    // Check if user is admin (you'll need to add isAdmin field to User model)
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Get all orders error:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Update Order Status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status, deliveryDate, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status) order.orderStatus = status;
    if (deliveryDate) order.deliveryDate = deliveryDate;
    if (notes) order.notes = notes;

    await order.save();

    res.json({ success: true, message: 'Order updated', order });
  } catch (err) {
    console.error('Update order error:', err);
    res.status(500).json({ message: 'Error updating order' });
  }
};