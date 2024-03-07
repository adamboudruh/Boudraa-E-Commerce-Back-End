const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => { //DONE
  // find all products
  // be sure to include its associated Category and Tag data
  console.log('Retrieving all products');
  try{
    const productData = await Product.findAll({
      include: [
        { model: Category },
        {
          model: Tag,
          through: ProductTag
        }
      ]
    });
    res.status(200).json(productData);
  } catch (err) {res.status(500).json({ error: `Error retrieving products: ${err}`})};
});

// get one product
router.get('/:id', async (req, res) => { //DONE
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  console.log('Retrieving product');
  try{
    const productID = req.params.id;
    const productData = await Product.findByPk(productID, {
      include: [
        { 
          model: Category 
        },
        {
          model: Tag,
          through: ProductTag
        }
      ]
    });
    if (productData) res.status(200).json({productData});
    else res.status(404).json({message: 'Product not found'})
  } catch (err) {res.status(500).json({ error: `Error retrieving product: ${err}`});}
});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  console.log('Updating product');
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
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

// update product
router.put('/:id', async (req, res) => {
  // update product data
  console.log('Updating product');
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
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

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => { //DONE
  // delete one product by its `id` value
  console.log('Deleting product');
  try{
    const deleteID = req.params.id;
    if (await Product.findByPk(deleteID)) {
      const deleteProduct = await Product.destroy({
        where: {
          id: deleteID
        }
      });
      res.status(200).json({ message: `Product deleted successfully`});
    } else res.status(404).json({message: 'Product not found'})
  } catch (err) {res.status(500).json({ error: `Error deleting product: ${err}`});}
});

module.exports = router;
