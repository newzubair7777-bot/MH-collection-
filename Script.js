// Firebase Config (Aapka existing config)
const firebaseConfig = {
    apiKey: "AIzaSyCsk2F8LAFD1vstABol0CuH_6wQ18MNo9U",
    authDomain: "mh-collection-75017.firebaseapp.com",
    projectId: "mh-collection-75017",
    storageBucket: "mh-collection-75017.appspot.com",
    messagingSenderId: "586581414643",
    appId: "1:586581414643:web:91aaf351193aacd433dd86"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// 1. Load Products (Sirf Products dikhayega)
function loadProducts(cat = 'all') {
    db.collection("products").onSnapshot((snapshot) => {
        const list = document.getElementById('productList');
        list.innerHTML = "";
        
        if (snapshot.empty) {
            list.innerHTML = "<p style='text-align:center; width:100%;'>No items available.</p>";
            return;
        }

        snapshot.forEach((doc) => {
            const p = doc.data();
            // Category Filter Check
            if(cat === 'all' || p.category === cat) {
                list.insertAdjacentHTML('beforeend', `
                    <div class="product-card">
                        <button class="del-btn" onclick="deleteProd('${doc.id}', '${p.image}')">&times;</button>
                        <img src="${p.image || 'https://via.placeholder.com/300'}">
                        <div style="padding:10px; text-align:center;">
                            <h4 style="margin:5px 0;">${p.name}</h4>
                            <p style="color:green; font-weight:bold;">Rs. ${p.price}</p>
                            <button onclick="sendOrder('${p.name}', '${p.price}')" style="width:100%; background:black; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">
                                <i class="fas fa-shopping-cart"></i> Order Now
                            </button>
                        </div>
                    </div>
                `);
            }
        });
    });
}

// 2. WhatsApp Order Function
function sendOrder(name, price) {
    const phone = "923001234567"; // Yahan client ka number aayega
    const msg = `Assalam-o-Alaikum,\nI want to order:\n*Item:* ${name}\n*Price:* Rs. ${price}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}

// 3. Admin Upload (Jo sirf Admin Modal se chalega)
async function uploadProduct() {
    const name = document.getElementById('prodName').value;
    const price = document.getElementById('prodPrice').value;
    const cat = document.getElementById('prodCat').value;
    const file = document.getElementById('fileInput').files[0];
    const btn = document.getElementById('uploadBtn');

    if(!name || !price || !file) {
        alert("Please fill all details and select a photo!");
        return;
    }

    btn.innerText = "Uploading...";
    btn.disabled = true;

    try {
        // Image upload to Firebase Storage
        const storageRef = storage.ref('products/' + Date.now() + "_" + file.name);
        await storageRef.put(file);
        const url = await storageRef.getDownloadURL();

        // Save to Firestore
        await db.collection("products").add({
            name: name,
            price: price,
            category: cat,
            image: url,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Product Added Successfully!");
        document.getElementById('prodName').value = "";
        document.getElementById('prodPrice').value = "";
        closeModals();
    } catch (error) {
        console.error(error);
        alert("Upload failed! Check Firebase Storage Rules.");
    } finally {
        btn.innerText = "Upload";
        btn.disabled = false;
    }
}

// 4. Delete Function
async function deleteProd(id, imgUrl) {
    if(confirm("Are you sure you want to delete this product?")) {
        try {
            await db.collection("products").doc(id).delete();
            alert("Product Deleted!");
        } catch (e) {
            alert("Error deleting!");
        }
    }
}

// Initial Load
loadProducts();
