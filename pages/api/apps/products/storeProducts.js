import withMiddleware from "@/utils/middleware/withMiddleware.js";
import prisma from "@/utils/prisma";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    //GET, POST, PUT, DELETE
    console.log("Serve this only if the request method is POST");
    return res.status(401).send({ error: true });
  }

  try {
    const products = req.body;
    console.log("InsideAPI - Products: ", products);

    // first delete all products, then insert new products. Only if I get a product from the request.
    if (products.length > 0) {
      const deleteAllProducts = await prisma.products.deleteMany();
      console.log("InsideAPI - DeleteAllProducts: ", deleteAllProducts);
    }
    const result = await prisma.products.createMany({
      data: products,
      skipDuplicates: true,
    });

    return res.status(200).send({
      text: "Successfully stored products to the DB using Prisma." + result,
    });
  } catch (e) {
    console.error("InsideAPI - Error: " + e);
    return res.status(401).send({ error: true });
  }
};

export default withMiddleware("verifyRequest")(handler);
