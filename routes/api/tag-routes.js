const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

//http://localhost:3001/api/tags == TAG ENDPOINT

// find all tags including its associated Product data
//http://localhost:3001/api/tags
router.get("/", async (req, res) => {
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(tagData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// find a single tag by its `id` including its associated Product data
//http://localhost:3001/api/tags/:id
router.get("/:id", async (req, res) => {
  try {
    const tagData = await Tag.findByPk({
      include: [{ model: Product }],
    });
    if (!tagData) {
      res.status(404).json({ message: "No tag found with that ID!" });
      return;
    }
    res.status(200).json(tagData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//create new tag
//http://localhost:3001/api/tags
router.post("/", async (req, res) => {
  try {
    const tagData = await Tag.create(req.body);
    res.status(200).json(tagData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// update a tag's name by its `id` value
//http://localhost:3001/api/tags/:id
router.put("/:id", async (req, res) => {
  try {
    const tag = await Tag.update(
      {
        tag_name: req.body.tag_name,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json(tag);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// delete on tag by its `id` value
//http://localhost:3001/api/tags/:id
router.delete("/:id", async (req, res) => {
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!tagData) {
      res.status(404).json({message: "There is no tag with this ID."})
      return;
    }
  }
  catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
