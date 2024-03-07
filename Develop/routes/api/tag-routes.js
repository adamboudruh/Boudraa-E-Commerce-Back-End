const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {  //DONE
  // find all tags
  // be sure to include its associated Product data
  console.log('Retrieving all tags');
  try{
    const tagData = await Tag.findAll({
      include: Product
    });
    res.status(200).json(tagData);
  } catch (err) {res.status(500).json({ error: `Error retrieving tags: ${err}`})};
});

router.get('/:id', async (req, res) => { //DONE
  // find a single tag by its `id`
  // be sure to include its associated Product data
  console.log('Retrieving tag');
  try{
    const tagID = req.params.id;
    const tagData = await Tag.findByPk(tagID, {
      include: Product
    });
    if (tagData) res.status(200).json(tagData);
    else res.status(404).json({message: 'Tag not found'})
  } catch (err) {res.status(500).json({ error: `Error retrieving tag: ${err}`});}
});

router.post('/', async (req, res) => { //DONE
  // create a new tag
  console.log('Creating tag');
  try{
    if (req.body.tag_name){
      const tagName = req.body.tag_name;
      const newTag = await Tag.create({
        tag_name: tagName,
      });
      if (newTag) res.status(200).json(newTag);
    } else res.status(400).json({ error: `Please enter a name for the tag`});
  } catch (err) {res.status(500).json({ error: `Error creating tag: ${err}`})}
});

router.put('/:id', async (req, res) => { //DONE
  // update a tag's name by its `id` value
  console.log('Updating tag');
  try{
    const tagID = req.params.id;
    const newTagName = req.body.tag_name;
    if (await Tag.findByPk(tagID) !== null) {
      const updatedTag = await Tag.update({tag_name:newTagName}, {
        where: {id:tagID}, returning:true, plain:true
      });
      res.status(200).json({message: `Tag updated successfully`});
    }
    else res.status(404).json({message: 'Tag not found'})
  } catch (err) {res.status(500).json({ error: `Error updating tag: ${err}`});}
});

router.delete('/:id', async (req, res) => { //DONE
  // delete on tag by its `id` value
  console.log('Deleting tag');
  try{
    const deleteID = req.params.id;
    if (await Tag.findByPk(deleteID)) {
      const deleteTag = await Tag.destroy({
        where: {
          id: deleteID
        }
      });
      res.status(200).json({ message: `Tag deleted successfully`});
    } else res.status(404).json({message: 'Tag not found'})
  } catch (err) {res.status(500).json({ error: `Error deleting tag: ${err}`});}
});

module.exports = router;
