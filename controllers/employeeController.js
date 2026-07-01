// const employees = require("../data/employees");


// // GET ALL EMPLOYEES

// const getAllEmployees = (req, res) => {

//   res.status(200).json(employees);

// };


// // GET SINGLE EMPLOYEE

// const getEmployeeById = (req, res) => {

//   const id = Number(req.params.id);

//   const employee = employees.find(
//     emp => emp.id === id
//   );

//   if (!employee) {
//     return res.status(404).json({
//       message: "Employee Not Found"
//     });
//   }

//   res.status(200).json(employee);

// };


// // ADD EMPLOYEE

// const addEmployee = (req, res) => {

//   const { name, department, salary } = req.body;

//   const newEmployee = {
//     id: employees.length + 1,
//     name,
//     department,
//     salary
//   };

//   employees.push(newEmployee);

//   res.status(201).json({
//     message: "Employee Added Successfully",
//     employee: newEmployee
//   });

// };


// // UPDATE EMPLOYEE

// const updateEmployee = (req, res) => {

//   const id = Number(req.params.id);

//   const employee = employees.find(
//     emp => emp.id === id
//   );

//   if (!employee) {
//     return res.status(404).json({
//       message: "Employee Not Found"
//     });
//   }

//   employee.name =
//     req.body.name || employee.name;

//   employee.department =
//     req.body.department || employee.department;

//   employee.salary =
//     req.body.salary || employee.salary;

//   res.status(200).json({
//     message: "Employee Updated Successfully",
//     employee
//   });

// };


// // DELETE EMPLOYEE

// const deleteEmployee = (req, res) => {

//   const id = Number(req.params.id);

//   const index = employees.findIndex(
//     emp => emp.id === id
//   );

//   if (index === -1) {
//     return res.status(404).json({
//       message: "Employee Not Found"
//     });
//   }

//   employees.splice(index, 1);

//   res.status(200).json({
//     message: "Employee Deleted Successfully"
//   });

// };


// module.exports = {
//   getAllEmployees,
//   getEmployeeById,
//   addEmployee,
//   updateEmployee,
//   deleteEmployee
// };


const Employee = require("../model/employeeSchema");

const assignMissingIds = async () => {
  const maxEmployee = await Employee.findOne({ id: { $exists: true } }).sort({ id: -1 }).select('id').lean();
  let nextId = maxEmployee ? maxEmployee.id + 1 : 1;

  const legacyEmployees = await Employee.find({ id: { $exists: false } }).sort({ _id: 1 }).select('_id').lean();
  for (const emp of legacyEmployees) {
    await Employee.updateOne({ _id: emp._id }, { $set: { id: nextId++ } });
  }
};

// GET ALL EMPLOYEES

const getAllEmployees = async (req, res) => {
  await assignMissingIds();
  const employees = await Employee.find().sort({ id: 1 });
  res.status(200).json(employees);
};


// GET SINGLE EMPLOYEE

const getEmployeeById = async (req, res) => {

  const id = Number(req.params.id);

  const employee = await Employee.findOne({ id });

  if (!employee) {
    return res.status(404).json({
      message: "Employee Not Found"
    });
  }

  res.status(200).json(employee);

};


// ADD EMPLOYEE


const addEmployee = async (req, res) => {

  const { name, department, salary } = req.body;

  const lastEmployee = await Employee.findOne().sort({ id: -1 }).select('id').lean();
  const nextId = lastEmployee ? lastEmployee.id + 1 : 1;

  const newEmployee = new Employee({
    id: nextId,
    name,
    department,
    salary
  });

  await newEmployee.save();

  res.status(201).json({
    message: "Employee Added Successfully",
    employee: newEmployee
  });

};


// UPDATE EMPLOYEE

const updateEmployee = async (req, res) => {

  const id = Number(req.params.id);

  const employee = await Employee.findOne({ id });

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

  await employee.save();

  res.status(200).json({
    message: "Employee Updated Successfully",
    employee
  });

};


// DELETE EMPLOYEE

const deleteEmployee = async (req, res) => {

  const id = Number(req.params.id);

  const employee = await Employee.findOne({ id });

  if (!employee) {
    return res.status(404).json({
      message: "Employee Not Found"
    });
  }

  await Employee.findOneAndDelete({ id });
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