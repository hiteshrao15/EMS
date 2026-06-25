const employees = require("../data/employees");


// GET ALL EMPLOYEES

const getAllEmployees = (req, res) => {

  res.status(200).json(employees);

};


// GET SINGLE EMPLOYEE

const getEmployeeById = (req, res) => {

  const id = Number(req.params.id);

  const employee = employees.find(
    emp => emp.id === id
  );

  if (!employee) {
    return res.status(404).json({
      message: "Employee Not Found"
    });
  }

  res.status(200).json(employee);

};


// ADD EMPLOYEE

const addEmployee = (req, res) => {

  const { name, department, salary } = req.body;

  const newEmployee = {
    id: employees.length + 1,
    name,
    department,
    salary
  };

  employees.push(newEmployee);

  res.status(201).json({
    message: "Employee Added Successfully",
    employee: newEmployee
  });

};


// UPDATE EMPLOYEE

const updateEmployee = (req, res) => {

  const id = Number(req.params.id);

  const employee = employees.find(
    emp => emp.id === id
  );

  if (!employee) {
    return res.status(404).json({
      message: "Employee Not Found"
    });
  }

  employee.name =
    req.body.name || employee.name;

  employee.department =
    req.body.department || employee.department;

  employee.salary =
    req.body.salary || employee.salary;

  res.status(200).json({
    message: "Employee Updated Successfully",
    employee
  });

};


// DELETE EMPLOYEE

const deleteEmployee = (req, res) => {

  const id = Number(req.params.id);

  const index = employees.findIndex(
    emp => emp.id === id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Employee Not Found"
    });
  }

  employees.splice(index, 1);

  res.status(200).json({
    message: "Employee Deleted Successfully"
  });

};


module.exports = {
  getAllEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee
};