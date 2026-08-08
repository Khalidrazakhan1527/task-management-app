const express = require("express");

const Task = require("../models/Task");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =================================
// CREATE TASK
// =================================

router.post("/", authMiddleware, async (req, res) => {

    try {

        const task = await Task.create({

            userId: req.userId,

            title: req.body.title,

            description: req.body.description,

            status: req.body.status,

            priority: req.body.priority,

            dueDate: req.body.dueDate
        });


        res.status(201).json({

            success: true,

            message: "Task created successfully",

            task
        });


    } catch (error) {

        res.status(400).json({

            success: false,

            message: "Failed to create task",

            error: error.message
        });
    }
});


// =================================
// GET ALL USER TASKS
// =================================

router.get("/", authMiddleware, async (req, res) => {

    try {

        const tasks =
            await Task.find({
                userId: req.userId
            }).sort({
                createdAt: -1
            });


        res.status(200).json({

            success: true,

            count: tasks.length,

            tasks
        });


    } catch (error) {

        res.status(500).json({

            success: false,

            message: "Failed to fetch tasks",

            error: error.message
        });
    }
});


// =================================
// GET SINGLE TASK
// =================================

router.get("/:id", authMiddleware, async (req, res) => {

    try {

        const task =
            await Task.findOne({
                _id: req.params.id,

                userId: req.userId
            });


        if (!task) {

            return res.status(404).json({

                success: false,

                message: "Task not found"
            });
        }


        res.status(200).json({

            success: true,

            task
        });


    } catch (error) {

        res.status(500).json({

            success: false,

            message: "Failed to fetch task",

            error: error.message
        });
    }
});


// =================================
// UPDATE TASK
// =================================

router.put("/:id", authMiddleware, async (req, res) => {

    try {

        const task =
            await Task.findOneAndUpdate(

                {
                    _id: req.params.id,

                    userId: req.userId
                },

                {
                    $set: {

                        title: req.body.title,

                        description:
                            req.body.description,

                        status: req.body.status,

                        priority: req.body.priority,

                        dueDate:
                            req.body.dueDate
                    }
                },

                {
                    new: true,

                    runValidators: true
                }
            );


        if (!task) {

            return res.status(404).json({

                success: false,

                message: "Task not found"
            });
        }


        res.status(200).json({

            success: true,

            message: "Task updated successfully",

            task
        });


    } catch (error) {

        res.status(400).json({

            success: false,

            message: "Failed to update task",

            error: error.message
        });
    }
});


// =================================
// DELETE TASK
// =================================

router.delete("/:id", authMiddleware, async (req, res) => {

    try {

        const task =
            await Task.findOneAndDelete({

                _id: req.params.id,

                userId: req.userId
            });


        if (!task) {

            return res.status(404).json({

                success: false,

                message: "Task not found"
            });
        }


        res.status(200).json({

            success: true,

            message: "Task deleted successfully",

            task
        });


    } catch (error) {

        res.status(500).json({

            success: false,

            message: "Failed to delete task",

            error: error.message
        });
    }
});


module.exports = router;
