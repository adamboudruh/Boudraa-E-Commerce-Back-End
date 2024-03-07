const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => { //DONE
  // find all categories
  // be sure to include its associated Products
  console.log('Retrieving all categories');
  try{
    const catData = await Category.findAll({
      include: Product
    });
    res.status(200).json(catData);
  } catch (err) {res.status(500).json({ error: `Error retrieving categories: ${err}`})};
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  console.log('Retrieving category');
  try{
    const catID = req.params.id;
    const catData = await Category.findByPk(catID, {
      include: Product
    });
    if (catData) res.status(200).json(catData);
    else res.status(404).json({message: 'Category not found'})
  } catch (err) {res.status(500).json({ error: `Error retrieving category: ${err}`});}
});

router.post('/', async (req, res) => { //DONE
  // create a new category
  console.log('Creating category');
  try{
    if (req.body.category_name){
      const catName = req.body.category_name;
      const newCat = await Category.create({
        category_name: catName,
      });
      if (newCat) res.status(200).json(newCat);
    } else res.status(400).json({ error: `Please enter a name for the category`})
  } catch (err) {res.status(500).json({ error: `Error creating category: ${err}`})}
});

router.put('/:id', async (req, res) => { //DONE
  // update a category by its `id` value
  console.log('Updating category');
  try{
    const catID = req.params.id;
    const newCatName = req.body.category_name;
    if (await Category.findByPk(catID) !== null) {
      const updatedCategory = await Category.update({category_name:newCatName}, {
        where: {id:catID}, returning:true, plain:true
      });
      res.status(200).json({message: `Category updated successfully`});
    }
    else res.status(404).json({message: 'Category not found'})
  } catch (err) {res.status(500).json({ error: `Error updating Category: ${err}`});}
});

router.delete('/:id', async (req, res) => { //DONE
  // delete a category by its `id` value
  console.log('Deleting category');
  try{
    const deleteID = req.params.id;
    if (await Category.findByPk(deleteID)) {
      await Product.destroy({
        where: {
          category_id: deleteID
        }
      })
      await Category.destroy({
        where: {
          id: deleteID
        }
      });
      res.status(200).json({ message: `Category deleted successfully`});
    } else res.status(404).json({message: 'Category not found'})
  } catch (err) {res.status(500).json({ error: `Error deleting Category: ${err}`});}
});

module.exports = router;
