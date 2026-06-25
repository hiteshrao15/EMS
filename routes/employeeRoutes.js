const express = require("express");

const router = express.Router();

const {
  getAllEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeeController");


// GET ALL

router.get("/", getAllEmployees);


// GET BY ID

router.get("/:id", getEmployeeById);


// CREATE

router.post("/", addEmployee);


// UPDATE

router.put("/:id", updateEmployee);


// DELETE

router.delete("/:id", deleteEmployee);

module.exports = router;