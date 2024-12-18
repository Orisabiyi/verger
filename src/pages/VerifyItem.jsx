import React, { useState, useEffect } from "react";
import {
  handleGetProductById,
  handleUpdateProduct,
} from "../firebase/firestone";

import { useParams } from "react-router-dom";
import { StacksTestnet } from "@stacks/network";
import { openContractCall } from "@stacks/connect";
import { principalCV, uintCV } from "@stacks/transactions";
import { useTransactionStatus } from "../hooks/useTransactionStatus";
import { Link } from "react-router-dom";
import { chain } from "../variable";
import { searchProvider } from "../context/searchContext";
import { cvToJSON, hexToCV } from "@stacks/transactions";

function VerifyItem() {
  const { id } = useParams();
  const [licensee, setLicensee] = useState("");
  const [transferCode, setTransferCode] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenTransfer, setIsOpenTransfer] = useState(false);
  const [detail, setDetail] = useState(false);
  const [pId, setPID] = useState("");
  const { trackTransaction, status, hex } = useTransactionStatus();

  const [error, setError] = useState("");

  // search
  const [search, setSearch] = useState("");
  const {
    product,
    setProduct,
    isSearching,
    searchErr,
    setSearchErr,
    handleSearch,
  } = searchProvider();

  // get entire product detail
  useEffect(
    function () {
      async function getProductById() {
        setError("");

        try {
          const data = await handleGetProductById(Number(id));
          const productData = data.docs.map((doc) => doc.data());
          data.forEach((doc) => setPID(doc.id));
          setProduct(productData);
        } catch (error) {
          setError(error.message);
        }
      }

      getProductById();
    },
    [id]
  );

  // check if licensee transaction is a success
  useEffect(
    function () {
      if ((!pId && status === "pending") || transferCode) return;

      async function updateStatus() {
        setError("");

        try {
          await handleUpdateProduct(pId, {
            isLicense: status,
          });
        } catch (error) {
          setError("error updating the product status: ", error.message);
        }
      }

      updateStatus();
    },
    [status]
  );

  // check if transfer is successful
  useEffect(
    function () {
      if (!transferCode || status === "pending") return;

      // convert the blockchainresponse to json
      if (!hex) return setError("Product not created");

      const blockchainResponse = cvToJSON(hexToCV(hex));

      if (!blockchainResponse.success)
        return setError(blockchainResponse.value.value.message.value);

      async function updateStatus() {
        setError("");

        try {
          await handleUpdateProduct(pId, {
            transferHistory: [
              ...(product[0].transferHistory || ""),
              {
                isTransfer: status,
                sender: product[0].productOwner,
                receiver: licensee,
                transferId: blockchainResponse.value.value,
              },
            ],
          });
        } catch (error) {
          setError("error updating the product status: ", error.message);
        }
      }

      updateStatus();
    },
    [status]
  );

  const handleLicenseProduct = async function () {
    const functionArgs = [uintCV(product[0].productId), principalCV(licensee)];

    const options = {
      network: new StacksTestnet(),
      contractAddress: "ST3DRW5EAHRNFXYAW9ZXT1Q6BQ0GXMDEX0ARXDCMA",
      contractName: "authentify-v4",
      functionName: "license-product",
      functionArgs,
      appDetails: {
        name: "Verdger",
        icon: window.location.origin + "/src/assets/verger-logo.svg",
      },
      onFinish: async function (data) {
        setError("");
        trackTransaction(data.txId);

        try {
          await handleUpdateProduct(pId, {
            productOwner: licensee,
            ownerHistory: [
              ...(product[0].ownerHistory || ""),
              {
                sender: product[0].productOwner,
                receiver: licensee,
                blockchainId: data.txId,
                transferType: "license",
                createdAt: new Date().toISOString(),
              },
            ],
          });
        } catch (error) {
          setError(error.message);
        }
      },
    };

    await openContractCall(options);
  };

  const handleProductTransfer = async function () {
    const functionArgs = [
      uintCV(product[0].productId),
      principalCV(licensee),
      uintCV(Number(transferCode)),
    ];

    const options = {
      contractAddress: "ST3DRW5EAHRNFXYAW9ZXT1Q6BQ0GXMDEX0ARXDCMA",
      contractName: "authentify-v4",
      functionName: "initiate-transfer",
      functionArgs,
      appDetails: {
        name: "Verdger",
        icon: window.location.origin + "/assets/verger-logo.svg",
      },
      onFinish: async function (data) {
        trackTransaction(data.txId);

        try {
          await handleUpdateProduct(pId, {
            ownerHistory: [
              ...(product[0].ownerHistory || ""),
              {
                sender: product[0].productOwner,
                receiver: licensee,
                blockchainId: data.txId,
                transferType: "initiate-transfer",
                createdAt: new Date().toISOString(),
              },
            ],
          });
        } catch (error) {
          setError(error.message);
        }
      },
    };

    await openContractCall(options);
  };

  const handleFormSearch = async function (e) {
    e.preventDefault();

    if (!search) return setSearchErr("There is no search value");

    try {
      const data = await handleSearch(search);
      if (data.docs.length === 0)
        throw new Error("There is no product that match your search results");

      data.forEach((docs) => setProduct(docs.data()));
    } catch (error) {
      setSearchErr(error.message);
    }
  };

  return (
    <section className="flex flex-col items-center flex-1 gap-2 px-10 py-20 bg-opacity-30 bg-primary min-h-screen overflow-y-auto">
      <h1 className="mb-20 font-semibold text-center text-28 text-cta">
        Product Verification
      </h1>
      <form
        action=""
        className="flex items-center w-3/4 gap-4"
        onSubmit={handleFormSearch}
      >
        <input
          type="search"
          placeholder="Type product ID"
          className="flex-1 p-4 border-2 outline-none text-16 rounded-xl"
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="w-64 px-10 py-4 text-white text-16 bg-cta rounded-xl">
          {!isSearching && "Verify"}
          {isSearching && "Searching"}
        </button>
      </form>
      <p className="-translate-x-32 text-12">
        Type your product/item ID in the input field above to verify the
        authenticity of your item
      </p>
      {/* {hex && } */}
      {searchErr && (
        <p className="text-center text-16 text-red-800">{searchErr}</p>
      )}
      {error && (
        <p className="text-center text-16 text-red-800 font-semibold">
          {error}
        </p>
      )}

      {product && !Array.isArray(product) && (
        <React.Fragment>
          <h2 className="self-start mt-32 font-semibold text-28">
            Product Details
          </h2>
          <article className="flex items-stretch gap-8 self-start w-full mt-8 text-16 pr-48">
            <figure className="w-4/12 bg-white h-19 rounded-2xl overflow-hidden">
              <img
                src={product.productImage}
                alt=""
                className="rounded-2xl w-full h-full object-cover"
              />
            </figure>

            <ul className="grid grid-cols-2 gap-2 flex-1">
              <li>
                <span className="font-medium">Date Created:</span>{" "}
                {new Date(product.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </li>
              <li>
                <span className="font-medium">Registered By:</span>{" "}
                {product.productOwner.slice(0, 16) + "...."}
              </li>
              <li>
                <Link
                  to={`https://explorer.hiro.so/txid/${product.blockchainId}?chain=${chain}`}
                  target="_blank"
                  className="underline underline-offset-1 hover:underline-offset-4"
                >
                  <span className="font-medium">View on blockchain:</span>{" "}
                  {product.blockchainId.slice(0, 16) + "...."}
                </Link>
              </li>
              <li>
                <span className="font-medium">Ownership:</span> Transferred
              </li>
              <li>
                <span className="font-medium">Product Name:</span>{" "}
                {product.productName}
              </li>
              <li>
                <span className="font-medium">Status:</span>{" "}
                {product.status === "abort_by_response" && "Transaction Failed"}
                {product.status === "success" && "Transaction Succeed"}
              </li>

              <li>
                <span className="font-medium">Product ID:</span>{" "}
                {product && product.productId}
              </li>

              {detail && (
                <li className="col-span-2">
                  <span className="font-medium">Description: </span>
                  {product.productDes}
                </li>
              )}

              {isOpen && (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    className="outline-none rounded-2xl mt-2 p-4"
                    placeholder="Enter Licensee Address"
                    onChange={(e) => setLicensee(e.target.value)}
                  />
                  {licensee.length === 41 && (
                    <button
                      className="bg-cta px-10 py-3 text-white rounded-2xl"
                      onClick={handleLicenseProduct}
                    >
                      License
                    </button>
                  )}
                </div>
              )}

              {isOpenTransfer && (
                <div className="col-span-2 flex items-center gap-4">
                  <input
                    type="number"
                    placeholder="Enter a four digit transfer code"
                    className="outline-none w-1/3 px-4 py-3 rounded-xl"
                    onChange={(e) => setTransferCode(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Enter a owner address"
                    className="outline-none w-1/3 px-4 py-3 rounded-xl"
                    onChange={(e) => setLicensee(e.target.value)}
                  />

                  <button
                    className="bg-cta-1 px-4 py-3 rounded-xl text-white"
                    onClick={handleProductTransfer}
                  >
                    Complete Transfer
                  </button>
                </div>
              )}

              {detail && (
                <div className="col-span-2 mt-8 font-semibold text-white flex items-start gap-3">
                  <button
                    className="bg-cta rounded-2xl px-10 py-4"
                    onClick={() =>
                      !isOpenTransfer && setIsOpen((bool) => !bool)
                    }
                  >
                    Initiate License Product
                  </button>
                  <button
                    className="bg-cta rounded-2xl px-10 py-4"
                    onClick={() =>
                      !isOpen && setIsOpenTransfer((item) => !item)
                    }
                  >
                    Transfer Product
                  </button>
                </div>
              )}

              {!detail && (
                <button
                  className="col-span-2 px-10 py-4 mt-8 font-semibold text-white bg-cta rounded-2xl"
                  onClick={() => setDetail((bool) => !bool)}
                >
                  More Details
                </button>
              )}
            </ul>
          </article>
        </React.Fragment>
      )}

      {product &&
        Array.isArray(product) &&
        product.map((item, i) => (
          <React.Fragment key={i}>
            <h2 className="self-start mt-32 font-semibold text-28">
              Product Details
            </h2>
            <article className="flex items-stretch gap-8 self-start w-full mt-8 text-16 pr-48">
              <figure className="w-4/12 bg-white h-19 rounded-2xl overflow-hidden">
                <img
                  src={item.productImage}
                  alt=""
                  className="rounded-2xl w-full h-full object-cover"
                />
              </figure>

              <ul className="grid grid-cols-2 gap-2 flex-1">
                <li>
                  <span className="font-medium">Date Created:</span>{" "}
                  {new Date(item.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </li>
                <li>
                  <span className="font-medium">Registered By:</span>{" "}
                  {item.productOwner.slice(0, 16) + "...."}
                </li>
                <li>
                  <Link
                    to={`https://explorer.hiro.so/txid/${item.blockchainId}?chain=${chain}`}
                    target="_blank"
                    className="underline underline-offset-1 hover:underline-offset-4"
                  >
                    <span className="font-medium">View on blockchain:</span>{" "}
                    {item.blockchainId.slice(0, 16) + "...."}
                  </Link>
                </li>
                <li>
                  <span className="font-medium">Ownership:</span> Transferred
                </li>
                <li>
                  <span className="font-medium">Product Name:</span>{" "}
                  {item.productName}
                </li>
                <li>
                  <span className="font-medium">Status:</span>{" "}
                  {item.status === "abort_by_response" && "Transaction Failed"}
                  {item.status === "success" && "Transaction Succeed"}
                </li>

                {detail && (
                  <li className="col-span-2">
                    <span className="font-medium">Description: </span>
                    {item.productDes}
                  </li>
                )}

                {isOpen && (
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      className="outline-none rounded-2xl mt-2 p-4"
                      placeholder="Enter Licensee Address"
                      onChange={(e) => setLicensee(e.target.value)}
                    />
                    {licensee.length === 41 && (
                      <button
                        className="bg-cta px-10 py-3 text-white rounded-2xl"
                        onClick={handleLicenseProduct}
                      >
                        License
                      </button>
                    )}
                  </div>
                )}

                {isOpenTransfer && (
                  <div className="col-span-2 flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="Enter a four digit transfer code"
                      className="outline-none w-1/3 px-4 py-3 rounded-xl"
                      onChange={(e) => setTransferCode(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Enter a owner address"
                      className="outline-none w-1/3 px-4 py-3 rounded-xl"
                      onChange={(e) => setLicensee(e.target.value)}
                    />

                    <button
                      className="bg-cta-1 px-4 py-3 rounded-xl text-white"
                      onClick={handleProductTransfer}
                    >
                      Complete Transfer
                    </button>
                  </div>
                )}

                {detail && (
                  <div className="col-span-2 mt-8 font-semibold text-white flex items-start gap-3">
                    <button
                      className="bg-cta rounded-2xl px-10 py-4"
                      onClick={() =>
                        !isOpenTransfer && setIsOpen((bool) => !bool)
                      }
                    >
                      Initiate License Product
                    </button>
                    <button
                      className="bg-cta rounded-2xl px-10 py-4"
                      onClick={() =>
                        !isOpen && setIsOpenTransfer((item) => !item)
                      }
                    >
                      Transfer Product
                    </button>
                  </div>
                )}

                {!detail && (
                  <button
                    className="col-span-2 px-10 py-4 mt-8 font-semibold text-white bg-cta rounded-2xl"
                    onClick={() => setDetail((bool) => !bool)}
                  >
                    More Details
                  </button>
                )}
              </ul>
            </article>
          </React.Fragment>
        ))}
    </section>
  );
}

export default VerifyItem;
