const { DataTypes, where } = require("sequelize");
const db = require('../config/db');
const sequelize = db.sequelize;
const categoryModel = require("../models/categoryModel")(sequelize, DataTypes);
const categoryHistoryModel = require('../models/categoryHistoryModel')(sequelize, DataTypes);

// Add Category
const AddCategory = async (req, res) => {
    try {
        const { category: categoryName, description } = req.body;
        const createdBy = req.user.username;
        const LastModifiedBy = req.user.username;
        const image = req.file ? req.file.path : null;

        // Create a new category record  
        const newCategory = await categoryModel.create({
            category: categoryName,
            image,
            description,
            createdBy,
            LastModifiedBy,
        });

        // Return success response
        return res.status(201).json({
            message: "Category added successfully!",
            data: newCategory,
        });
    } catch (error) {
        console.error("Error adding category:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

// Get All Category 
const GetByAll = async (req, res) => {
    try {

        const getdata = await categoryModel.findAll({ where: { IsDeleted: 0 } })
        if (!getdata) {
            return res.status(400).send({
                success: false,
                message: 'No More category..'
            })
        }

        return res.status(200).send({
            success: true,
            message: 'All Category View Successfully..',
            Data: getdata
        })

    } catch (error) {
        console.log(error);
        return res.send({
            success: false,
            message: error.message
        })
    }
}

// Get Category Data By Id
const GetByCategoryId = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await categoryModel.findOne({ where: { categoryID: id, IsDeleted: 0 } })
        if (!data) {
            return res.status(400).send({
                success: false,
                message: 'Category Not Found'
            })
        }

        return res.status(200).send({
            success: true,
            message: 'Category Found Successfully..',
            Data: data
        })

    } catch (error) {
        console.log(error);
        return res.status(200).send({
            success: false,
            message: error.message
        })
    }
}

// Category By Deleted 
const DeleteCategory = async (req, res) => {
    try {

        const id = req.params.id;

        const finddata = await categoryModel.findOne({ where: { categoryID: id, IsDeleted: 0 } })
        // return res.json(finddata)
        if (!finddata) {
            return res.status(400).send({
                success: false,
                message: 'Category Not Found'
            })
        }

        const historycategory = await categoryHistoryModel.create({
            categoryID: finddata.categoryID,
            category: finddata.category,
            image: finddata.image,
            description: finddata.description,
            BackupCreatedBy: finddata.createdBy,
            BackupCreatedOn: new Date()
        })

        const changedstatus = await db.categoryModel.update(
            { IsDeleted: 1 },
            { where: { categoryID: id } }
        )

        if (changedstatus[0] === 0) {
            return res.status(500).send({
                success: false,
                message: "Category Not Deleted."
            })
        }

        return res.status(200).send({
            message: "Customer Deleted Sucessfully.."
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

module.exports = ({ AddCategory, GetByAll, GetByCategoryId, DeleteCategory })