const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

//http://localhost:3001/api/products == PRODUCT ENDPOINT

// get all products including its associated Category and Tag data ✅
//http://localhost:3001/api/products
router.get("/", async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(productData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get a single product by it's 'id including its associated Category and Tag data ✅
//http://localhost:3001/api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });
    if (!productData) {
      res.status(404).json({ message: "No product found with that ID!" });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});



// Create new products and if there's product tags, we need to create pairings to bulk create in the ProductTag model
/* req.body should look like this...
  {
    product_name: "Basketball",
    price: 200.00,
    stock: 3,
    tagIds: [1, 2, 3, 4]
  }
*/
//http://localhost:3001/api/products ✅
router.post("/", async (req, res) => {
  Product.create(req.body)
    .then((product) => {
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product and product tags if they exists ✅
//http://localhost:3001/api/products/:id
router.put("/:id", (req, res) => {
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        ProductTag.findAll({
          where: { product_id: req.params.id },
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

    res.status(200).json({message: "This product has been updated."});
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// delete one product by its `id` value ✅
//http://localhost:3001/api/product
router.delete("/:id", async (req, res) => {
  try {
    const productDelete = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!productDelete) {
      res.status(404).json({ message: "No product found with that ID." });
      return;
    }
    res.status(200).json({message: "Product Deleted, taking dirt nap"});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
