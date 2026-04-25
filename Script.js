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

let cropper;
let croppedBlob = null;

// Toggle Admin Panel
function toggleAdmin() {
    const panel = document.getElementById('admin-panel');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
}

// Image Selection and Crop Setup
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.getElementById('image-to-crop');
            img.src = event.target.result;
            document.getElementById('crop-container').style.display = 'block';
            
            if (cropper) cropper.destroy();
            cropper = new Cropper(img, {
                aspectRatio: 1, // Square crop for products
                viewMode: 1
            });
        };
        reader.readAsDataURL(file);
    }
});

function applyCrop() {
    cropper.getCroppedCanvas().toBlob((blob) => {
        croppedBlob = blob;
        alert("Photo Cropped! Ab aap Upload kar sakte hain.");
        document.getElementById('crop-container').style.display = 'none';
    });
}

// Upload Data to Firebase
async function uploadProduct() {
    const name = document.getElementById('prodName').value;
    const price = document.getElementById('prodPrice').value;
    const btn = document.getElementById('uploadBtn');

    if (!name || !price || !croppedBlob) {
        alert("Please fill name, price and CROP the photo first!");
        return;
    }

    btn.innerText = "Uploading...";
    btn.disabled = true;

    try {
        const fileName = Date.now() + ".jpg";
        const storageRef = storage.ref('products/' + fileName);
        await storageRef.put(croppedBlob);
        const imgUrl = await storageRef.getDownloadURL();

        await db.collection("products").add({
            name: name,
            price: price,
            image: imgUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("Product Successfully Added!");
        location.reload();
    } catch (error) {
        console.error(error);
        alert("Error uploading!");
    }
}

// Load Products
db.collection("products").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
    const list = document.getElementById('productList');
    list.innerHTML = "";
    snapshot.forEach((doc) => {
        const p = doc.data();
        const id = doc.id;
        list.insertAdjacentHTML('beforeend', `
            <div class="product-card">
                <button class="delete-btn" onclick="deleteProduct('${id}', '${p.image}')"><i class="fas fa-trash"></i></button>
                <div class="img-wrapper"><img src="${p.image}"></div>
                <div class="info-box">
                    <h3>${p.name}</h3>
                    <p class="new-price">Rs.${p.price}</p>
                    <button class="order-btn" onclick="window.open('https://wa.me/923XXXXXXXXX?text=I want to buy ${p.name}')">ORDER</button>
                </div>
            </div>
        `);
    });
});

// Delete Function
async function deleteProduct(id, imgUrl) {
    if (confirm("Kya aap yeh photo delete karna chahte hain?")) {
        await db.collection("products").doc(id).delete();
        // Storage se bhi delete karne ke liye (optional but good)
        try { await storage.refFromURL(imgUrl).delete(); } catch(e){}
        alert("Deleted!");
    }
}
