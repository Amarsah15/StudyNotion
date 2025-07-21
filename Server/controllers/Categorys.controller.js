import Category from "../models/Category";

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res
        .status(400)
        .json({ sucess: false, message: "All fields are required" });
    }

    const category = await Category.create({ name, description });

    res
      .status(201)
      .json({
        sucess: true,
        category,
        message: "Category created successfully",
      });
  } catch (error) {
    res.status(500).json({ sucess: false, message: error.message });
  }
};

// get all Categorys
export const showAllCategorys = async (req, res) => {
  try {
    const allCategorys = await Category.find(
      {},
      { name: true, description: true }
    );
    res
      .status(200)
      .json({
        sucess: true,
        message: "Categorys fetched successfully",
        allCategorys,
      });
  } catch (error) {
    res.status(500).json({ sucess: false, message: error.message });
  }
};
