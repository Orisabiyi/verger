function VerifyItem() {
  return (
    <section className="flex flex-col items-center flex-1 gap-2 px-10 py-20 bg-opacity-30 bg-primary">
      <h1 className="mb-20 font-semibold text-center text-28 text-cta">
        Product Verification
      </h1>

      <form action="" className="flex items-center w-3/4 gap-4">
        <input
          type="search"
          placeholder="Type product ID"
          className="flex-1 p-4 border-2 outline-none text-16 rounded-xl"
        />
        <button className="w-64 px-10 py-4 text-white text-16 bg-cta rounded-xl">
          Verify
        </button>
      </form>
      <p className="-translate-x-32 text-12">
        Type your product/item ID in the input field above to verify the
        authenticity of your item
      </p>

      <h2 className="self-start mt-32 font-semibold text-28">
        Product Details
      </h2>

      <article className="flex items-center self-start w-full gap-8 mt-8 text-16">
        <figure className="w-4/12 bg-white h-19 rounded-2xl"></figure>
        <ul className="grid flex-1 grid-cols-2 gap-2">
          <li>
            <span className="inline-block w-4 h-4 mr-2 rounded-full bg-cta"></span>
            <b>Date Created: </b> 11th October, 2024
          </li>
          <li>
            <span className="inline-block w-4 h-4 mr-2 rounded-full bg-cta"></span>
            <b>Registered By: </b> Emmanuel Godfrey
          </li>
          <li>
            <span className="inline-block w-4 h-4 mr-2 rounded-full bg-cta"></span>
            <b>Quality check: </b> Certified Original
          </li>
          <li>
            <span className="inline-block w-4 h-4 mr-2 rounded-full bg-cta"></span>
            <b>Ownership: </b> Transferred
          </li>
          <li>
            <span className="inline-block w-4 h-4 mr-2 rounded-full bg-cta"></span>
            <b>Current Owner: </b> Leumas Okechukwu
          </li>
          <li>
            <span className="inline-block w-4 h-4 mr-2 rounded-full bg-cta"></span>
            <b>Dispute: </b> None
          </li>

          <button className="col-span-2 px-10 py-4 mt-8 font-semibold text-white bg-cta rounded-2xl">
            More Details
          </button>
        </ul>
      </article>
    </section>
  );
}

export default VerifyItem;
