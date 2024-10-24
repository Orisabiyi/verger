import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { app } from "./config";

// initialize database
const db = getFirestore(app);

// function for creating product details
export const handleProductUpload = async function (productObj) {
  const doc = await addDoc(collection(db, "products"), productObj);
  return doc.id;
};

// function for updating a product on firestore
export const handleUpdateProduct = async function (productId, updateValueObj) {
  const docRef = doc(db, "products", productId);
  const query = await updateDoc(docRef, updateValueObj);

  if (!query)
    throw new Error(
      "There is a problem with your internet or data doesn't exists"
    );
};

//function for getting data from firestore
export const handleGetProduct = async function (ownerAddress) {
  const firebaseQuery = query(
    collection(db, "products"),
    where("productOwner", "==", ownerAddress)
  );
  const getData = await getDocs(firebaseQuery);
  if (!getData)
    throw new Error(
      "There is a problem with your internet or data doesn't exist"
    );

  return getData;
};

// function to get data based on productId
export const handleGetProductById = async function (productId) {
  const firebaseQuery = query(
    collection(db, "products"),
    where("productId", "==", productId)
  );
  const getData = await getDocs(firebaseQuery);

  if (!getData)
    throw new Error(
      "There is a problem with your internet or data doesn't exist"
    );

  return getData;
};
