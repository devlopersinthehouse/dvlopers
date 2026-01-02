document.addEventListener("DOMContentLoaded", async () => {
  const authSection = document.getElementById("authSection");
  const personalSection = document.getElementById("personalSection");

  // Premium section
  if (!document.getElementById("premiumSection")) {
    const premiumDiv = document.createElement("div");
    premiumDiv.id = "premiumSection";
    premiumDiv.style.marginTop = "50px";
    personalSection.before(premiumDiv);
  }
  const premiumSection = document.getElementById("premiumSection");

  try {
    const res = await fetch("/api/auth/profile", {
      credentials: "include",
    });

    if (res.ok) {
      const userData = await res.json();
      const firstLetter = userData.name.charAt(0).toUpperCase();

      authSection.innerHTML = `
        <div class="profile-circle" id="profileCircle">${firstLetter}</div>
        <div class="profile-dropdown" id="profileDropdown">
          <p>Hello, ${userData.name}!</p>
          ${
            userData.role === "admin"
              ? '<p><a href="/admin.html" style="color:white;">Admin Panel</a></p>'
              : ""
          }
          <button class="logout-btn" onclick="logout()">Logout</button>
        </div>
      `;

      // Admin ho to admin panel link dikhao, normal user ko personal section
      if (userData.role === "admin") {
        personalSection.style.display = "none";
        premiumSection.style.display = "none";
        // Admin panel link already dropdown mein hai
      } else {
        personalSection.style.display = "block";
        loadNotes();

        // Premium check
        if (userData.isPremium) {
          premiumSection.innerHTML =
            '<h2 style="color:gold; text-align:center;">⭐ You are a Premium Member! Enjoy all features ⭐</h2>';
        } else {
          premiumSection.innerHTML = `
            <div style="text-align:center; padding:40px; background:rgba(255,255,255,0.1); border-radius:20px;">
              <h2>Unlock Premium Features</h2>
              <p>Get unlimited notes, dark mode, and more!</p>
              <p style="font-size:24px; margin:20px 0;">One-time payment: <strong>₹499</strong></p>
              <button class="submit-btn" style="padding:15px 40px; font-size:18px;" onclick="startPayment()">Go Premium Now</button>
              <div id="paymentMessage" style="margin-top:20px;"></div>
            </div>
          `;
        }
      }

      document.getElementById("profileCircle").addEventListener("click", () => {
        document.getElementById("profileDropdown").classList.toggle("show");
      });

      if (userData.role !== "admin") {
        document.getElementById("saveBtn").addEventListener("click", saveNote);
      }
    } else {
      authSection.innerHTML = `<button class="login-btn" onclick="window.location.href='/login.html'">Login / Register</button>`;
      premiumSection.style.display = "none";
    }
  } catch (err) {
    authSection.innerHTML = `<button class="login-btn" onclick="window.location.href='/login.html'">Login / Register</button>`;
    premiumSection.style.display = "none";
  }
});

// baaki functions same rahenge (logout, startPayment, saveNote, loadNotes)
async function logout() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {}
  location.reload();
}
async function startPayment() {
  const paymentMessage = document.getElementById("paymentMessage");
  paymentMessage.innerHTML = '<p style="color:yellow;">Processing...</p>';

  try {
    // Create order on backend
    const orderRes = await fetch("/api/payment/create-order", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 49900 }), // ₹499 in paise
    });

    if (!orderRes.ok) {
      paymentMessage.innerHTML =
        '<p style="color:red;">Error creating order</p>';
      return;
    }

    const order = await orderRes.json();

    const options = {
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_YourKeyIDHere", // Test key daalo yahan (dashboard se)
      amount: order.amount,
      currency: "INR",
      order_id: order.id,
      name: "My Premium App",
      description: "Premium Membership - One Time",
      image: "https://yourlogo.com/logo.png", // Optional
      handler: async function (response) {
        // Verify payment on backend
        const verifyRes = await fetch("/api/payment/verify-payment", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const verifyData = await verifyRes.json();

        if (verifyRes.ok) {
          paymentMessage.innerHTML = `<p style="color:green;">${verifyData.message}</p>`;
          setTimeout(() => location.reload(), 2000);
        } else {
          paymentMessage.innerHTML =
            '<p style="color:red;">Payment failed or verification error</p>';
        }
      },
      prefill: {
        name: "User Name",
        email: "user@example.com",
      },
      theme: {
        color: "#764ba2",
      },
    };

    const rzp = new Razorpay(options);
    rzp.on("payment.failed", function (response) {
      paymentMessage.innerHTML = `<p style="color:red;">Payment failed: ${response.error.description}</p>`;
    });
    rzp.open();
  } catch (err) {
    paymentMessage.innerHTML = '<p style="color:red;">Network error</p>';
  }
}

async function saveNote() {
  const note = document.getElementById("noteInput").value.trim();
  if (!note) return;

  try {
    const res = await fetch("/api/todos", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: note }),
    });

    if (res.ok) {
      document.getElementById("noteInput").value = "";
      loadNotes();
    } else {
      alert("Error saving note");
    }
  } catch (err) {
    alert("Network error");
  }
}

async function loadNotes() {
  try {
    const res = await fetch("/api/todos", { credentials: "include" });
    if (res.ok) {
      const todos = await res.json();
      const list = document.getElementById("notesList");
      list.innerHTML = todos
        .map(
          (todo) => `
        <div class="note-item">${todo.text}</div>
      `
        )
        .join("");
    }
  } catch (err) {
    console.error("Error loading notes");
  }
}
