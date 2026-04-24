/**
 * MH COLLECTION - ULTIMATE LUXURY ENGINE
 * Features: Firebase Sync, Auto-Discount, Smooth Rendering
 */

const firebaseConfig = {
    apiKey: "AIzaSyCsk2F8LAFD1vstABol0CuH_6wQ18MNo9U",
    authDomain: "mh-collection-75017.firebaseapp.com",
    projectId: "mh-collection-75017",
    storageBucket: "mh-collection-75017.appspot.com",
    messagingSenderId: "586581414643",
    appId: "1:586581414643:web:91aaf351193aacd433dd86",
    measurementId: "G-1WTQS4XH28"
};

// Initialize Firebase with Safety Check
document.addEventListener("DOMContentLoaded", function() {
    if (typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.firestore();
        console.log("🚀 MH Luxury Engine: Online");
        loadLuxuryProducts(db);
    } else {
        document.getElementById('productList').innerHTML = "<p style='color:red; text-align:center;'>Connection Error! Refresh Page.</p>";
    }
});

function loadLuxuryProducts(db) {
    const list = document.getElementById('productList');

    // Real-time listener: Jab bhi admin panel se add karenge, yahan khud dikhega
    db.collection("products").onSnapshot((snapshot) => {
        list.innerHTML = ""; // Pehle purana saaf karo
        
        if (snapshot.empty) {
            list.innerHTML = "<p style='text-align:center; width:100%;'>No Products Found.</p>";
            return;
        }

        snapshot.forEach((doc) => {
            const p = doc.data();
            renderPremiumCard(p, list);
        });
    }, (error) => {
        console.error("Firebase Error:", error);
    });
}

function renderPremiumCard(p, container) {
    // Logic: Agar oldPrice nahi hai to khud se 40% barha kar dikhao
    const oldP = p.oldPrice || Math.floor(p.price * 1.4);

    const cardHTML = `
        <div class="product-card">
            <div class="luxury-badge">SALE</div>
            <div class="img-wrapper">
                <img src="${p.image || 'https://via.placeholder.com/300'}" alt="Luxury Item">
            </div>
            <div class="info-box">
                <p class="brand-name">MH EXCLUSIVE</p>
                <h3>${p.name || 'New Design'}</h3>
                <div class="price-row">
                    <span class="old-price">Rs.${oldP}</span>
                    <span class="new-price">Rs.${p.price}</span>
                </div>
            </div>
            <button class="order-btn" onclick="openWhatsApp('${p.name}', '${p.price}')">
                <i class="fas fa-shopping-bag"></i> ORDER NOW
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', cardHTML);
}

function openWhatsApp(name, price) {
    const phone = "923XXXXXXXXX"; // Apna number yahan likhein
    const text = `Assalam-o-Alaikum MH Collection,\nI want to buy: *${name}*\nPrice: *Rs.${price}*`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
}
